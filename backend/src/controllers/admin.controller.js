import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Submission } from '../models/submission.model.js';
import { Exam } from '../models/exam.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

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
  // Aggregate to fetch exams for passingScore comparison
  const submissions = await Submission.aggregate([
    {
      $lookup: {
        from: "exams",
        localField: "examId",
        foreignField: "_id",
        as: "exam"
      }
    },
    { $unwind: "$exam" },
    {
      $lookup: {
        from: "users",
        localField: "candidateId",
        foreignField: "_id",
        as: "candidate"
      }
    },
    { $unwind: "$candidate" },
    {
      $addFields: {
        isPassed: { $gte: ["$score", "$exam.passingScore"] },
        aiScore: { $ifNull: ["$aiGrading.score", 0] }
      }
    },
    {
      $sort: {
        isPassed: -1,      // Status: Passed first
        aiScore: -1,       // Merit: High AI score
        trustScore: -1,    // Integrity: High trust score
        timeSpent: 1       // Speed: Lower time spent
      }
    }
  ]);

  // Map to match the previous populated structure for frontend compatibility
  const formattedSubmissions = submissions.map(s => ({
    ...s,
    candidateId: {
      _id: s.candidate._id,
      username: s.candidate.username,
      email: s.candidate.email,
      fullName: s.candidate.fullName
    },
    examId: {
      _id: s.exam._id,
      title: s.exam.title,
      passingScore: s.exam.passingScore
    }
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submissions: formattedSubmissions }, "All submissions fetched successfully")
    );
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalCandidates = await User.countDocuments({ role: 'Candidate' });
  const totalExams = await Exam.countDocuments();

  // Aggregate over all submissions to compute:
  // - totalSubmissions: every candidate attempt
  // - passedCount: submissions where score >= exam.passingScore
  // - avgTrustScore: average trustScore across all attempts
  const submissionStats = await Submission.aggregate([
    {
      $lookup: {
        from: 'exams',
        localField: 'examId',
        foreignField: '_id',
        as: 'exam',
      },
    },
    { $unwind: '$exam' },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        passedCount: {
          $sum: {
            $cond: [{ $gte: ['$score', '$exam.passingScore'] }, 1, 0],
          },
        },
        avgTrustScore: { $avg: '$trustScore' },
        totalTabSwitches: { $sum: '$tabSwitches' },
        totalAIViolations: { $sum: '$aiViolations' },
      },
    },
  ]);

  const base = submissionStats[0] || {
    totalSubmissions: 0,
    passedCount: 0,
    avgTrustScore: 0,
    totalTabSwitches: 0,
    totalAIViolations: 0,
  };

  const passRate =
    base.totalSubmissions > 0
      ? Number(((base.passedCount / base.totalSubmissions) * 100).toFixed(2))
      : 0;

  const stats = {
    totalCandidates,
    totalSubmissions: base.totalSubmissions,
    totalExams,
    passRate,
    avgTrustScore: Number(base.avgTrustScore?.toFixed?.(2) || 0),
    totalTabSwitches: base.totalTabSwitches,
    totalAIViolations: base.totalAIViolations,
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
  const exams = await Exam.find({ createdBy: req.user._id })
    .populate('createdBy', 'username email fullName')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { exams }, "Exams fetched successfully")
    );
});

export const getSubmissionsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  // Fetch submissions for this exam and compute:
  // - manualScore: sum of points for each correct answer
  // - computedTrustScore: 100 - 33.33 for each violation (max 3 attempts)
  // - isPassed: manualScore >= passingScore
  const submissions = await Submission.find({ examId })
    .populate('candidateId', 'username email fullName profilePicture resume');

  const formattedSubmissions = submissions
    .map((submissionDoc) => {
      const submission = submissionDoc.toObject();

      // Safely normalize answers into a Map-like interface
      let answersMap;
      if (submissionDoc.answers instanceof Map) {
        answersMap = submissionDoc.answers;
      } else if (submission.answers && typeof submission.answers === 'object') {
        answersMap = new Map(Object.entries(submission.answers));
      } else {
        answersMap = new Map();
      }

      // Score calculation: 0 for incorrect, question.points for each correct
      let manualScore = 0;
      if (Array.isArray(exam.questions)) {
        exam.questions.forEach((question, index) => {
          const candidateAnswer = answersMap.get(index.toString()) || '';
          const correctAnswer = question.correctAnswer || '';
          if (
            typeof candidateAnswer === 'string' &&
            typeof correctAnswer === 'string' &&
            candidateAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
          ) {
            manualScore += question.points || 0;
          }
        });
      }

      // Trust score: 3 attempts → 33.33% per violation
      const totalViolations =
        (submission.tabSwitches || 0) + (submission.aiViolations || 0);
      const rawTrust =
        100 - (totalViolations * (100 / 3)); // ~33.33 per attempt
      const computedTrustScore = Math.max(0, Number(rawTrust.toFixed(2)));

      const isPassed = manualScore >= (exam.passingScore || 0);

      return {
        ...submission,
        manualScore,
        computedTrustScore,
        isPassed,
        candidateId: submission.candidateId,
        examId: {
          _id: exam._id,
          title: exam.title,
          passingScore: exam.passingScore,
        },
        violationLogs: submission.violationLogs || [],
      };
    })
    // Rankings: higher trust score first, then higher test score
    .sort((a, b) => {
      if (b.computedTrustScore !== a.computedTrustScore) {
        return b.computedTrustScore - a.computedTrustScore;
      }
      return (b.manualScore || 0) - (a.manualScore || 0);
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submissions: formattedSubmissions }, "Submissions fetched successfully")
    );
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "selected", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const submission = await Submission.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('candidateId', 'username email fullName profilePicture resume')
   .populate('examId', 'title passingScore');

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submission }, "Submission status updated successfully")
    );
});
