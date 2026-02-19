import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["descriptive", "multiple-choice"],
    default: "descriptive",
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 10,
  },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
    passingScore: {
      type: Number,
      required: true,
      default: 60,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model("Exam", examSchema);
