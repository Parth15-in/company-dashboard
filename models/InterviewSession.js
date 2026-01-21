import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    section: String, // 'apti' | 'technical' 
    questionIndex: Number,
    response: mongoose.Schema.Types.Mixed,
    audioPath: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    // ⭐ Important for multi-company
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    jobInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobInfo",
      required: true,
    },

    slug: { type: String, required: true },

    candidate: {
      name: String,
      email: String,
      phone: String,
      appliedAt: { type: Date, default: Date.now },
    },

    generatedQuestions: {
      aptitude: [
        {
          prompt: String,
          options: [String],
          correctOptionIndex: Number,
        },
      ],
       technical: {
    mcq: [
      {
        prompt: String,
        options: [String],
        correctOptionIndex: Number,
      },
    ],
    written: [
      {
        prompt: String,
        hint: String,
      },
    ],
  },
      // technical: [
      //   {
      //     prompt: String,
      //     options: [String],
      //     correctOptionIndex: Number,
      //   },
      // ],
      // softskill: [
      //   {
      //     prompt: String,
      //   },
      // ],
    },

    answers: [AnswerSchema],

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    // =============================
    // ⭐ REPORT LIFECYCLE (NEW)
    // =============================
    reportGenerated: {
      type: Boolean,
      default: false,
    },

    reportStatus: {
      type: String,
      enum: ["pending", "generating", "done", "failed"],
      default: "pending",
    },

    reportError: {
      type: String,
    },
    questionStatus: {
      type: String,
      enum: ["pending", "generating", "done", "failed"],
      default: "pending",
    },

    questionError: {
      type: String,
    },


    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", InterviewSessionSchema);
