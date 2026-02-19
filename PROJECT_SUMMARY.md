# VeriScore AI - Project Summary

## Project Overview
An intelligent AI-proctored skill assessment platform demonstrating Edge AI, automated grading, and real-time violation tracking for academic evaluation.

## Architecture

### Backend (Node.js + Express)
- **Modular Structure**: Following "Chai aur Code" style
- **Authentication**: JWT-based with role-based access control
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini / OpenAI for automated grading
- **API Design**: RESTful with standardized responses

### Frontend (React + Vite)
- **UI Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS (dark theme)
- **Edge AI**: face-api.js for local facial detection
- **Visualization**: Recharts for analytics
- **State Management**: Context API for authentication

## Key Features Implemented

### 1. Anti-Cheat Engine ✅
- **Tab Switch Detection**: Page Visibility API monitoring
- **Fullscreen Lockdown**: Automatic fullscreen enforcement
- **Edge AI Proctoring**: 
  - No face detection
  - Multiple faces detection
  - Real-time monitoring (2-second intervals)

### 2. AI Evaluation System ✅
- **Automated Grading**: LLM-powered answer evaluation
- **Skill Gap Analysis**: Identifies missing knowledge areas
- **Qualitative Feedback**: Detailed summaries and recommendations
- **Multi-Question Support**: Evaluates all questions in an exam

### 3. Trust Score Calculation ✅
- **Dynamic Scoring**: `100 - (Tab_Switches × 10) - (AI_Violations × 15)`
- **Real-time Updates**: Score adjusts as violations occur
- **Visual Indicators**: Color-coded trust levels

### 4. Admin Dashboard ✅
- **Statistics Overview**: Total candidates, submissions, average scores
- **Integrity Charts**: Bar charts showing trust scores vs violations
- **Skill Radar Map**: Visual representation of knowledge gaps
- **Detailed Reports**: Individual candidate analysis with violation logs

## File Structure

```
VeriC/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/      # Business logic
│   │   ├── middlewares/      # Auth & error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # AI grading service
│   │   ├── scripts/          # Database seeding
│   │   └── utils/            # Utilities
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # Auth context
│   │   ├── pages/            # Page components
│   │   └── utils/            # API utilities
│   ├── public/
│   │   └── models/           # face-api.js models
│   └── package.json
└── Documentation files
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Exam
- `GET /api/v1/exam/questions` - Fetch exam questions
- `POST /api/v1/exam/submit` - Submit exam answers

### Proctoring
- `POST /api/v1/proctor/log-violation` - Log violation event

### Admin
- `GET /api/v1/admin/candidate-report/:id` - Get candidate report
- `GET /api/v1/admin/submissions` - Get all submissions
- `GET /api/v1/admin/dashboard-stats` - Get dashboard statistics

## Database Models

### User
- Authentication fields (username, email, password)
- Role-based access (Admin/Candidate)
- JWT token generation

### Exam
- Question bank with multiple question types
- Scoring configuration
- Duration and passing criteria

### Submission
- Candidate answers
- AI grading results
- Violation logs
- Trust score calculation

## Security Features

1. **Edge Processing**: Video never leaves the browser
2. **JWT Authentication**: Secure token-based auth
3. **Role-Based Access**: Admin/Candidate separation
4. **Violation Logging**: Comprehensive audit trail

## Technology Highlights

- **Edge AI**: face-api.js runs entirely in browser
- **Real-time Monitoring**: Continuous violation detection
- **Automated Evaluation**: LLM-powered grading
- **Modern UI**: Dark theme with Tailwind CSS
- **Responsive Design**: Works on various screen sizes

## Academic Demonstration Points

1. **Edge AI Implementation**: Shows local processing capabilities
2. **Explainable AI**: Clear violation reasons and scoring logic
3. **Real-time Updates**: Live violation tracking and alerts
4. **Comprehensive Analytics**: Visual data representation
5. **Modular Architecture**: Professional code organization

## Future Enhancements (Not Implemented)

- Gaze tracking refinement
- Voice detection
- Screen recording
- Advanced ML models
- Multi-language support
- Mobile app version

## Notes for Faculty

- This is a demonstration project, not production-ready
- Focus is on visible logic and explainability
- Edge AI models must be downloaded separately
- Requires API keys for AI services
- MongoDB Atlas recommended for cloud deployment

## Contact & Support

For setup assistance, refer to:
- `QUICKSTART.md` - Fast setup guide
- `SETUP.md` - Detailed configuration
- `README.md` - Full documentation
