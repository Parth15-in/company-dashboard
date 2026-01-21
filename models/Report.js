const mongoose = require("mongoose");

const ReportsSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },

    email: { type: String, required: true },

    collegeName: { type: String },   // fixed spelling

    reportAnalysis: { type: Object, required: true },

    shortlisted: { type: Boolean, default: false },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Report || mongoose.model("Report", ReportsSchema);
