# Face-API.js Models

This directory should contain the face-api.js model files for Edge AI proctoring.

## Download Instructions

1. Visit: https://github.com/justadudewhohacks/face-api.js-models
2. Download or clone the repository
3. Copy the following files to this directory (`frontend/public/models/`):

### Required Files:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`

### Quick Download Options:

#### Option 1: Using PowerShell Script (Windows - Recommended)
```powershell
cd frontend/public/models
.\download-models.ps1
```

#### Option 2: Using Batch Script (Windows)
```cmd
cd frontend/public/models
download-models.bat
```

#### Option 3: Using PowerShell Commands (Windows)
```powershell
cd frontend/public/models

# Tiny Face Detector
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector_model-weights_manifest.json" -OutFile "tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector_model-shard1" -OutFile "tiny_face_detector_model-shard1"

# Face Landmark 68
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-weights_manifest.json" -OutFile "face_landmark_68_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-shard1" -OutFile "face_landmark_68_model-shard1"

# Face Recognition
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_recognition_model-weights_manifest.json" -OutFile "face_recognition_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_recognition_model-shard1" -OutFile "face_recognition_model-shard1"
```

#### Option 4: Using curl (Windows/Linux/Mac)
```bash
cd frontend/public/models

# Tiny Face Detector
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector_model-shard1

# Face Landmark 68
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-shard1

# Face Recognition
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_recognition_model-shard1
```

**Note**: These files are large (~5-10 MB total) and are excluded from git via `.gitignore`.
