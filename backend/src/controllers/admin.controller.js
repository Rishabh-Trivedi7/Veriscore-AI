import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Submission } from '../models/submission.model.js';
import { Exam } from '../models/exam.model.js';
import { User } from '../models/user.model.js';

export const getCandidateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const submission = await Submission.findById(id)
    .populate('candidateId', 'username email fullName')
    .populate('examId', 'title questions passingScore');

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { report: submission }, "Candidate report fetched successfully")
    );
});

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find()
    .populate('candidateId', 'username email fullName')
    .populate('examId', 'title')
    .sort({ submittedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submissions }, "All submissions fetched successfully")
    );
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalCandidates = await User.countDocuments({ role: 'Candidate' });
  const totalSubmissions = await Submission.countDocuments();
  const totalExams = await Exam.countDocuments();

  const avgTrustScore = await Submission.aggregate([
    {
      $group: {
        _id: null,
        avgTrustScore: { $avg: '$trustScore' },
      },
    },
  ]);

  const violationStats = await Submission.aggregate([
    {
      $group: {
        _id: null,
        totalTabSwitches: { $sum: '$tabSwitches' },
        totalAIViolations: { $sum: '$aiViolations' },
      },
    },
  ]);

  const stats = {
    totalCandidates,
    totalSubmissions,
    totalExams,
    avgTrustScore: avgTrustScore[0]?.avgTrustScore || 0,
    totalTabSwitches: violationStats[0]?.totalTabSwitches || 0,
    totalAIViolations: violationStats[0]?.totalAIViolations || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, { stats }, "Dashboard stats fetched successfully")
    );
});

export const createExam = asyncHandler(async (req, res) => {
  const { title, description, questions, passingScore, duration, isActive } = req.body;
  const createdBy = req.user._id;

  if (!title || !questions || questions.length === 0) {
    throw new ApiError(400, "Title and at least one question are required");
  }

  // Validate questions
  for (const question of questions) {
    if (!question.questionText || !question.correctAnswer) {
      throw new ApiError(400, "Each question must have questionText and correctAnswer");
    }
  }

  const exam = await Exam.create({
    title,
    description,
    questions,
    passingScore: passingScore || 60,
    duration: duration || 60,
    isActive: isActive !== undefined ? isActive : true,
    createdBy,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { exam }, "Exam created successfully")
    );
});

export const getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find()
    .populate('createdBy', 'username email fullName')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { exams }, "Exams fetched successfully")
    );
});
