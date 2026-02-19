import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './src/config/database.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import path from 'path';
import fs from 'fs';

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import examRoutes from './src/routes/exam.routes.js';
import proctorRoutes from './src/routes/proctor.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (profile pictures, resumes)
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VeriScore AI Backend is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exam', examRoutes);
app.use('/api/v1/proctor', proctorRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
