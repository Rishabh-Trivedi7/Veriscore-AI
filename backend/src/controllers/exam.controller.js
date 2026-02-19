import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Exam } from '../models/exam.model.js';
import { Submission } from '../models/submission.model.js';
import AIService from '../services/ai.service.js';

export const getExamQuestions = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ isActive: true });

  if (!exam) {
    throw new ApiError(404, "No active exam found");
  }

  // Check if candidate has already submitted this exam
  const submission = await Submission.findOne({
    candidateId: req.user?._id,
    examId: exam._id,
  });

  if (submission) {
    throw new ApiError(400, "You have already attempted this exam.");
  }

  // Return questions without correct answers
  const questionsForCandidate = exam.questions.map((q, index) => ({
    index,
    questionText: q.questionText,
    questionType: q.questionType,
    options: q.options,
    points: q.points,
  }));

  const examData = exam.toObject();
  examData.questions = questionsForCandidate;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { exam: examData }, "Exam questions fetched successfully")
    );
});

export const listExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ isActive: true }).select("-questions.correctAnswer");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { exams }, "Exams fetched successfully")
    );
});

export const getExamById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exam = await Exam.findById(id);

  if (!exam || !exam.isActive) {
    throw new ApiError(404, "Exam not found or inactive");
  }

  // Return questions without correct answers
  const questionsForCandidate = exam.questions.map((q, index) => ({
    index,
    questionText: q.questionText,
    questionType: q.questionType,
    options: q.options,
    points: q.points,
  }));

  const examData = exam.toObject();
  examData.questions = questionsForCandidate;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { exam: examData }, "Exam questions fetched successfully")
    );
});

export const submitExam = asyncHandler(async (req, res) => {
  const { answers, examId, timeSpent } = req.body;
  const candidateId = req.user._id;

  if (!answers || !examId) {
    throw new ApiError(400, "Answers and examId are required");
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  // Check if submission already exists
  let submission = await Submission.findOne({ candidateId, examId });

  if (submission) {
    throw new ApiError(400, "Exam already submitted");
  }

  // Convert answers to Map format
  const answersMap = new Map();
  Object.entries(answers).forEach(([key, value]) => {
    answersMap.set(key, value);
  });

  // Get violation counts from request (sent by frontend)
  const { tabSwitches = 0, aiViolations = 0, violationLogs = [] } = req.body;

  // Create submission with initial data
  submission = await Submission.create({
    candidateId,
    examId,
    answers: answersMap,
    tabSwitches,
    aiViolations,
    violationLogs,
    timeSpent,
  });

  // Perform AI grading
  try {
    const aiGrading = await AIService.gradeMultipleAnswers(answersMap, exam);

    submission.aiGrading = aiGrading;
    await submission.save();
  } catch (error) {
    console.error("AI Grading Error:", error);
    // Continue even if AI grading fails
  }

  // Recalculate trust score
  submission.trustScore = Math.max(0, 100 - submission.tabSwitches * 10 - submission.aiViolations * 15);
  await submission.save();

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('candidateId', 'username email fullName')
    .populate('examId', 'title');

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submission: populatedSubmission }, "Exam submitted successfully")
    );
});
