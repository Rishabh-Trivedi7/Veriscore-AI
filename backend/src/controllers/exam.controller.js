import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Exam } from '../models/exam.model.js';
import { Submission } from '../models/submission.model.js';
import AIGradingService from '../services/AIGradingFinal.services.js';

export const getExamQuestions = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ isActive: true });

  if (!exam) {
    throw new ApiError(404, "No active exam found");
  }

  const submission = await Submission.findOne({
    candidateId: req.user?._id,
    examId: exam._id,
  });

  if (submission) {
    throw new ApiError(400, "You have already attempted this exam.");
  }

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
  const submissions = await Submission.find({ candidateId: req.user._id }).select('examId');
  const attemptedExamIds = submissions.map(s => s.examId);

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

  if (!answers || !examId) throw new ApiError(400, "Answers and examId are required");

  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  let submission = await Submission.findOne({ candidateId, examId });
  if (submission && submission.aiGrading) throw new ApiError(400, "Exam already submitted");

  const answersMap = new Map(Object.entries(answers));
  const tabSwitches = parseInt(req.body.tabSwitches, 10) || 0;
  const aiViolations = parseInt(req.body.aiViolations, 10) || 0;
  const violationLogs = Array.isArray(req.body.violationLogs) ? req.body.violationLogs : [];

  try {
    if (!submission) {
      submission = await Submission.create({
        candidateId,
        examId,
        answers: answersMap,
        tabSwitches,
        aiViolations,
        violationLogs,
        timeSpent: parseInt(timeSpent, 10) || 0,
      });
    } else {
      submission.answers = answersMap;
      // We take the max of what frontend sends and what's already saved just in case,
      // but primarily we just don't want to reset violationLogs to [] if frontend didn't send them.
      submission.tabSwitches = Math.max(submission.tabSwitches, tabSwitches);
      submission.aiViolations = Math.max(submission.aiViolations, aiViolations);
      if (violationLogs && violationLogs.length > 0) {
        submission.violationLogs.push(...violationLogs);
      }
      submission.timeSpent = parseInt(timeSpent, 10) || 0;
      await submission.save();
    }

    // Perform AI grading
    const aiGrading = await AIGradingService.gradeMultipleAnswers(submission.answers, exam);
    
    // SAVE RESULTS: Convert 0-10 scale to 0-100%
    submission.aiGrading = aiGrading;
    console.log("aiGrading score", aiGrading.score);
    submission.score = Math.round((Number(aiGrading.score) || 0) * 10); 
    console.log("submission score", submission.score);
    await submission.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('candidateId', 'username email fullName')
      .populate('examId', 'title');

    return res.status(200).json(
      new ApiResponse(200, { submission: populatedSubmission }, "Exam submitted successfully")
    );
  } catch (error) {
    console.error("Submission Error:", error);
    throw new ApiError(500, error.message || "Submission failed");
  }
});

export const getCandidateResults = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ candidateId: req.user._id })
    .populate('examId', 'title description passingScore duration')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { results: submissions }, "Candidate results fetched successfully")
    );
});