import express from 'express';
import { getCandidateReport, getAllSubmissions, getDashboardStats, createExam, getAllExams, getSubmissionsByExam, updateSubmissionStatus } from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyJWT);
router.use(authorizeRoles('Admin'));

router.route("/candidate-report/:id").get(getCandidateReport);
router.route("/submissions").get(getAllSubmissions);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/exams").get(getAllExams).post(createExam);
router.route("/exams/create").post(createExam);
router.route("/exams/:examId/submissions").get(getSubmissionsByExam);
router.route("/exams/:examId/reports").get(getSubmissionsByExam);
router.route("/submissions/:id/status").patch(updateSubmissionStatus);

export default router;
