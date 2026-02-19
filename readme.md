# VeriScore AI: Intelligent AI-Proctored Skill Assessment Platform

An academic mini-project demonstrating an AI-assisted decision support system for proctored online examinations with automated candidate evaluation.

## Features

- **Edge AI Proctoring**: Real-time facial detection and monitoring using face-api.js (runs locally in browser)
- **Anti-Cheat Engine**: Tab-switch detection, fullscreen lockdown, and AI-based violation tracking
- **Automated Grading**: LLM-powered evaluation of descriptive answers with skill-gap analysis
- **Trust Score Calculation**: Dynamic integrity scoring based on violations
- **Admin Dashboard**: Comprehensive analytics with integrity charts and skill radar visualization

## Technology Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas
- Google Gemini AI / OpenAI API
- JWT Authentication

### Frontend
- React.js
- Tailwind CSS
- face-api.js (Edge AI)
- Recharts (Data Visualization)

## Project Structure

```
VeriC/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Auth & error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── services/         # AI grading service
│   │   └── utils/            # Utilities (ApiResponse, ApiError, etc.)
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # Auth context
│   │   ├── pages/            # Page components
│   │   └── utils/            # API utilities
│   ├── public/
│   │   └── models/           # face-api.js models (download separately)
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key OR OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-api-key
# OR
OPENAI_API_KEY=your-openai-api-key
AI_SERVICE=gemini
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Download face-api.js models:
   - See `frontend/public/models/README.md` for detailed instructions
   - Or run the quick download commands from that file
   - Models must be placed in `frontend/public/models/` directory

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Exam
- `GET /api/v1/exam/questions` - Get exam questions
- `POST /api/v1/exam/submit` - Submit exam answers

### Proctoring
- `POST /api/v1/proctor/log-violation` - Log violation event

### Admin
- `GET /api/v1/admin/candidate-report/:id` - Get candidate report
- `GET /api/v1/admin/submissions` - Get all submissions
- `GET /api/v1/admin/dashboard-stats` - Get dashboard statistics

## Database Schema

### User
- username, email, password, role (Admin/Candidate), fullName

### Exam
- title, description, questions[], passingScore, duration, isActive

### Submission
- candidateId, examId, answers, aiGrading, trustScore, violationLogs[], tabSwitches, aiViolations

## Trust Score Calculation

```
Trust Score = 100 - (Tab_Switches × 10) - (AI_Violations × 15)
```

## Usage

1. **Register/Login**: Create an account (Admin or Candidate role)
2. **Take Exam** (Candidate):
   - Grant webcam permissions
   - Answer questions in fullscreen mode
   - System monitors for violations in real-time
3. **View Reports** (Admin):
   - Access dashboard with analytics
   - View individual candidate reports
   - Analyze skill gaps and trust scores

## Important Notes

- **Academic Project**: This is a demonstration project, not production-ready
- **Edge Processing**: Video feeds are processed locally; only violation logs are sent to backend
- **Model Files**: face-api.js models must be downloaded separately and placed in `frontend/public/models/`

## License

This project is created for academic purposes.
