import { useEffect, useState, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import api from "../utils/api";

const useProctor = (examId, isExamStarted, onViolation) => {
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    faceViolations: 0,
    fullscreenExits: 0
  });

  // Kept for compatibility with the rest of the app (e.g. ExamConsole)
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRef = useRef(null);
  const faceDetectorRef = useRef(null);

  const lastFaceViolation = useRef(0);

  // Start Camera
  useEffect(() => {
    if (!isExamStarted) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isExamStarted]);

  // Tab switch + fullscreen detection
  useEffect(() => {
    if (!isExamStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const desc = "User switched tabs or minimized window";

        logViolation("tab-switch", desc);

        setViolations(prev => ({
          ...prev,
          tabSwitches: prev.tabSwitches + 1
        }));

        if (onViolation) onViolation("tab-switch", desc);
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        const desc = "User exited fullscreen mode";

        logViolation("fullscreen-exit", desc);

        setViolations(prev => ({
          ...prev,
          fullscreenExits: prev.fullscreenExits + 1
        }));

        if (onViolation) onViolation("fullscreen-exit", desc);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [isExamStarted, examId]);

  // MediaPipe Face Detection
  useEffect(() => {
    if (!isExamStarted || !videoRef.current) return;

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5
    });

    faceDetection.onResults((results) => {
      const faces = results.detections || [];
      const now = Date.now();

      console.log("[Proctor] Faces detected (MediaPipe):", faces.length);

      const cooldownPassed = now - lastFaceViolation.current >= 8000;

      if (faces.length === 0 && cooldownPassed) {
        lastFaceViolation.current = now;

        const desc = "No face detected";

        logViolation("no-face", desc);

        setViolations(prev => ({
          ...prev,
          faceViolations: prev.faceViolations + 1
        }));

        if (onViolation) onViolation("no-face", desc);
      }

      if (faces.length > 1 && cooldownPassed) {
        lastFaceViolation.current = now;

        const desc = "Multiple individuals detected";

        logViolation("multiple-faces", desc);

        setViolations(prev => ({
          ...prev,
          faceViolations: prev.faceViolations + 1
        }));

        if (onViolation) onViolation("multiple-faces", desc);
      }

      // Approximate "looking away" using face bounding box position when exactly one face is present
      if (faces.length === 1 && cooldownPassed) {
        const detection = faces[0];
        const locationData = detection.location_data;

        if (locationData && locationData.relative_bounding_box) {
          const box = locationData.relative_bounding_box;
          const centerX = box.xmin + box.width / 2;

          // Treat the user as "looking away" if the normalized face center is far from image center
          const LOOK_AWAY_MARGIN = 0.25;
          const isLookingAway =
            centerX < LOOK_AWAY_MARGIN || centerX > 1 - LOOK_AWAY_MARGIN;

          if (isLookingAway) {
            lastFaceViolation.current = now;

            const desc = "User appears to be looking away from the screen";

            logViolation("looking-away", desc);

            setViolations(prev => ({
              ...prev,
              faceViolations: prev.faceViolations + 1
            }));

            if (onViolation) onViolation("looking-away", desc);
          }
        }
      }
    });

    faceDetectorRef.current = faceDetection;

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceDetectorRef.current) {
          await faceDetectorRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    cameraRef.current.start();
    setModelsLoaded(true);

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
        faceDetectorRef.current = null;
      }
    };
  }, [isExamStarted]);

  const stopCamera = () => {
    if (cameraRef.current) cameraRef.current.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const logViolation = async (type, description) => {
    try {
      await api.post("/api/v1/proctor/log-violation", {
        examId,
        violationType: type,
        description
      });
    } catch (err) {
      console.error("Failed to log violation:", err);
    }
  };

  return {
    violations,
    videoRef,
    modelsLoaded,
    stopCamera
  };
};

export default useProctor;
