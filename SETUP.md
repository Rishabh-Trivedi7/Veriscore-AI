# Detailed Setup Guide

## Step-by-Step Installation

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Seed database with sample exam
node src/scripts/seedExam.js

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Download face-api.js models (see frontend/public/models/README.md)
# Or use the quick download commands

# Start development server
npm run dev
```

### 3. Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/veriscore?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-api-key
AI_SERVICE=gemini
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local) - Optional
```env
VITE_API_URL=http://localhost:5000
```

### 4. MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist your IP address
5. Get connection string and add to `.env`

### 5. AI Service Setup

#### Option A: Google Gemini (Recommended)
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env` as `GEMINI_API_KEY`
4. Set `AI_SERVICE=gemini`

#### Option B: OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create API key
3. Add to `.env` as `OPENAI_API_KEY`
4. Set `AI_SERVICE=openai`

### 6. Testing the Application

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Register Admin**: 
   - Go to http://localhost:3000/register
   - Create account with role "Admin"
4. **Register Candidate**:
   - Create another account with role "Candidate"
5. **Take Exam**:
   - Login as candidate
   - Grant webcam permissions
   - Answer questions
6. **View Dashboard**:
   - Login as admin
   - View submissions and reports

## Troubleshooting

### Face Detection Not Working
- Ensure models are downloaded to `frontend/public/models/`
- Check browser console for errors
- Verify webcam permissions are granted

### API Connection Errors
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in backend `.env`
- Ensure backend is running on port 5000

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### AI Grading Fails
- Verify API key is correct
- Check API service quota/limits
- Review backend logs for error messages
