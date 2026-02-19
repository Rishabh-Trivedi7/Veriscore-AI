import mongoose from 'mongoose';

const violationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["tab-switch", "no-face", "multiple-faces", "gaze-tracking", "fullscreen-exit"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
});

const aiGradingSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  summary: {
    type: String,
    required: true,
  },
  gaps: {
    type: [String],
    default: [],
  },
  detailedFeedback: {
    type: String,
  },
});

const submissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      required: true,
    },
    aiGrading: {
      type: aiGradingSchema,
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    violationLogs: {
      type: [violationLogSchema],
      default: [],
    },
    tabSwitches: {
      type: Number,
      default: 0,
    },
    aiViolations: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number, // in minutes
    },
  },
  {
    timestamps: true,
  }
);

// Calculate trust score before saving
submissionSchema.pre("save", function (next) {
  this.trustScore = Math.max(
    0,
    100 - this.tabSwitches * 10 - this.aiViolations * 15
  );
  next();
});

export const Submission = mongoose.model("Submission", submissionSchema);
