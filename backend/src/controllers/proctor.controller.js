import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Submission } from '../models/submission.model.js';

export const logViolation = asyncHandler(async (req, res) => {
  const { examId, violationType, description } = req.body;
  const candidateId = req.user._id;

  if (!examId || !violationType) {
    throw new ApiError(400, "examId and violationType are required");
  }

  // Find or create submission
  let submission = await Submission.findOne({ candidateId, examId });

  if (!submission) {
    // Create a preliminary submission if it doesn't exist
    submission = await Submission.create({
      candidateId,
      examId,
      answers: new Map(),
    });
  }

  // Add violation log
  submission.violationLogs.push({
    type: violationType,
    description: description || `${violationType} detected`,
    timestamp: new Date(),
  });

  // Update violation counts
  if (violationType === 'tab-switch' || violationType === 'fullscreen-exit') {
    submission.tabSwitches += 1;
  } else if (violationType === 'copy-paste') {
    submission.aiViolations += 1; // Count as AI/Manual violation for now
  } else {
    submission.aiViolations += 1;
  }

  // Recalculate trust score
  submission.trustScore = Math.max(0, 100 - submission.tabSwitches * 10 - submission.aiViolations * 15);

  await submission.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submission }, "Violation logged successfully")
    );
});
