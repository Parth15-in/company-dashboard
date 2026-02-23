import mongoose from "mongoose";

const QAItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    audioUrl: { type: String, default: "" }, // optional for future
  },
  { _id: false }
);

const CompanyCultureInterviewSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

    interviewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // interviewerRole: {
    //   type: String,
    //   enum: ["hr", "hod", "LEADER", "EMPLOYEE"],
    //   default: "EMPLOYEE",
    // },
 interviewerRole: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,   // keeps roles consistent (manager, admin, etc.)
    },
    // promptUsed: { type: String, default: "" }, // store prompt for audit/debug

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED"],
      default: "DRAFT",
    },

    qa: { type: [QAItemSchema], default: [] }, // questions + answers

    summary: { type: String, default: "" }, // later can store final company culture summary
  },
  { timestamps: true }
);

export default mongoose.models.CompanyCultureInterview ||
  mongoose.model("CompanyCultureInterview", CompanyCultureInterviewSchema);
