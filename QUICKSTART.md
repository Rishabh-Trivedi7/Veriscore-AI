# Quick Start Guide

Get VeriScore AI running in 5 minutes!

## Prerequisites Check
- ✅ Node.js installed (v18+)
- ✅ MongoDB Atlas account (or local MongoDB)
- ✅ AI API key (Gemini or OpenAI)

## Quick Setup

### 1. Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and AI API key
npm run seed  # Creates admin user and sample exam
npm run dev   # Starts server on port 5000
```

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install

# Download face-api.js models (one-time setup)
cd public/models
# See README.md in this folder for download commands
# Or manually download from: https://github.com/justadudewhohacks/face-api.js-models

cd ../../..
npm run dev   # Starts app on port 3000
```

### 3. Test the Application

1. **Register Admin**:
   - Go to http://localhost:3000/register
   - Username: `admin`, Role: `Admin`
   - Or use the seeded admin: `admin@veriscore.ai` / `admin123`

2. **Register Candidate**:
   - Create new account with Role: `Candidate`

3. **Take Exam**:
   - Login as candidate
   - Allow webcam access
   - Answer questions
   - System monitors for violations

4. **View Dashboard**:
   - Login as admin
   - View submissions and analytics

## Default Credentials (After Seeding)

- **Admin**: 
  - Username: `admin`
  - Email: `admin@veriscore.ai`
  - Password: `admin123`

## Troubleshooting

**Backend won't start?**
- Check MongoDB connection string in `.env`
- Verify port 5000 is available

**Frontend won't start?**
- Check if backend is running
- Verify models are in `frontend/public/models/`

**Face detection not working?**
- Ensure models are downloaded
- Grant webcam permissions
- Check browser console for errors

**AI grading fails?**
- Verify API key in `.env`
- Check API service quota
- Review backend logs

## Next Steps

- See `SETUP.md` for detailed configuration
- See `README.md` for full documentation
