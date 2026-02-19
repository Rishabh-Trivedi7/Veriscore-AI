@echo off
REM Batch script to download face-api.js models
REM Run this script from the frontend/public/models directory

echo 📥 Downloading face-api.js models...
echo.

set BASE_URL=https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights

echo ⬇️  Downloading tiny_face_detector_model-weights_manifest.json...
curl -L -o tiny_face_detector_model-weights_manifest.json %BASE_URL%/tiny_face_detector_model-weights_manifest.json

echo ⬇️  Downloading tiny_face_detector_model-shard1...
curl -L -o tiny_face_detector_model-shard1 %BASE_URL%/tiny_face_detector_model-shard1

echo ⬇️  Downloading face_landmark_68_model-weights_manifest.json...
curl -L -o face_landmark_68_model-weights_manifest.json %BASE_URL%/face_landmark_68_model-weights_manifest.json

echo ⬇️  Downloading face_landmark_68_model-shard1...
curl -L -o face_landmark_68_model-shard1 %BASE_URL%/face_landmark_68_model-shard1

echo ⬇️  Downloading face_recognition_model-weights_manifest.json...
curl -L -o face_recognition_model-weights_manifest.json %BASE_URL%/face_recognition_model-weights_manifest.json

echo ⬇️  Downloading face_recognition_model-shard1...
curl -L -o face_recognition_model-shard1 %BASE_URL%/face_recognition_model-shard1

echo.
echo ✅ Download complete!
echo 📁 Models saved to: %CD%
pause
