import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import api from '../utils/api';

const useProctor = (examId, isExamStarted, onViolation) => {
    const [violations, setViolations] = useState({
        tabSwitches: 0,
        faceViolations: 0,
        fullscreenExits: 0
    });
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const videoRef = useRef(null);
    const faceDetectionInterval = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Face models load error:", err);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!isExamStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const desc = 'User switched tabs or minimized window';
                logViolation('tab-switch', desc);
                setViolations(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
                if (onViolation) onViolation('tab-switch', desc);
            }
        };

        const handleResize = () => {
            if (!document.fullscreenElement) {
                const desc = 'User exited fullscreen mode';
                logViolation('fullscreen-exit', desc);
                setViolations(prev => ({ ...prev, fullscreenExits: prev.fullscreenExits + 1 }));
                if (onViolation) onViolation('fullscreen-exit', desc);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', handleResize);
        };
    }, [isExamStarted, examId]);

    useEffect(() => {
        if (isExamStarted && modelsLoaded && videoRef.current) {
            startFaceDetection();
        } else {
            stopFaceDetection();
        }
        return () => stopFaceDetection();
    }, [isExamStarted, modelsLoaded]);

    const startFaceDetection = () => {
        faceDetectionInterval.current = setInterval(async () => {
            if (!videoRef.current) return;

            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (detections.length === 0) {
                const desc = 'No face detected in the frame';
                logViolation('no-face', desc);
                setViolations(prev => ({ ...prev, faceViolations: prev.faceViolations + 1 }));
                if (onViolation) onViolation('no-face', desc);
            } else if (detections.length > 1) {
                const desc = 'Multiple faces detected in the frame';
                logViolation('multiple-faces', desc);
                setViolations(prev => ({ ...prev, faceViolations: prev.faceViolations + 1 }));
                if (onViolation) onViolation('multiple-faces', desc);
            }
        }, 5000); // Check every 5 seconds
    };

    const stopFaceDetection = () => {
        if (faceDetectionInterval.current) {
            clearInterval(faceDetectionInterval.current);
        }
    };

    const logViolation = async (type, description) => {
        try {
            await api.post('/api/v1/proctor/log-violation', {
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
        modelsLoaded
    };
};

export default useProctor;
