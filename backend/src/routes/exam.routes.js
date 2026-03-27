import express from 'express';
import { getExamQuestions, submitExam, listExams, getExamById, getCandidateResults } from '../controllers/exam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/list").get(verifyJWT, listExams);
router.route("/questions").get(verifyJWT, getExamQuestions);
router.route("/submit").post(verifyJWT, submitExam);
router.route("/results").get(verifyJWT, getCandidateResults);
router.route("/:id").get(verifyJWT, getExamById);

export default router;
