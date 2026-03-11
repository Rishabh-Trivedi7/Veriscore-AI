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
  // Get all exams the user has already attempted
  const submissions = await Submission.find({ candidateId: req.user._id }).select('examId');
  const attemptedExamIds = submissions.map(s => s.examId);

  // Filter out already-attempted exams
  const exams = await Exam.find({
    isActive: true,
    _id: { $nin: attemptedExamIds }
  }).select("-questions.correctAnswer");

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

  // Check if submission already exists for this candidate and exam
  let submission = await Submission.findOne({ candidateId, examId });

  // If a fully-graded submission already exists, block re-submission
  if (submission && submission.aiGrading) {
    throw new ApiError(400, "Exam already submitted");
  }

  // Normalize answers to a Map
  const answersMap = new Map();
  Object.entries(answers).forEach(([key, value]) => {
    answersMap.set(key, value);
  });

  // Get violation counts from request (sent by frontend) — parse safely
  const tabSwitches = parseInt(req.body.tabSwitches, 10) || 0;
  const aiViolations = parseInt(req.body.aiViolations, 10) || 0;
  const violationLogs = Array.isArray(req.body.violationLogs) ? req.body.violationLogs : [];

  // Create or update submission with final data
  try {
    if (!submission) {
      submission = await Submission.create({
        candidateId,
        examId,
        answers: new Map(Object.entries(answers)),
        tabSwitches,
        aiViolations,
        violationLogs,
        timeSpent: parseInt(timeSpent, 10) || 0, // seconds
      });
    } else {
      // Upgrade preliminary/proctor-created submission to final
      submission.answers = new Map(Object.entries(answers));
      submission.tabSwitches = tabSwitches;
      submission.aiViolations = aiViolations;
      submission.violationLogs = violationLogs;
      submission.timeSpent = parseInt(timeSpent, 10) || 0;
      await submission.save();
    }
  } catch (error) {
    console.error("Submission Creation Error:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      throw new ApiError(400, `Validation Failed: ${messages.join(', ')}`);
    }
    throw new ApiError(500, "Failed to initialize submission. Please try again.");
  }

  // Perform AI grading
  try {
    const aiGrading = await AIService.gradeMultipleAnswers(submission.answers, exam);

    submission.aiGrading = aiGrading;
    submission.score = (aiGrading.score || 0) * 10; // Convert 0-10 to percentage
    await submission.save();
  } catch (error) {
    console.error("AI Grading Error:", error);
    // Continue even if AI grading fails
  }

  // Recalculate trust score - handled by pre-save hook in model, 
  // but explicitly saving here to ensure AI grading is persisted.
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
