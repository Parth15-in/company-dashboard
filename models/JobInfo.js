import mongoose from "mongoose";
import { nanoid } from "nanoid";

const JobInfoSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      default: () => nanoid(10),
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    jd: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    criteria: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 NEW CONTEXT FIELDS (AI quality depends on this)
    industry: {
      type: String,
      
    },

    companyType: {
      type: String,
      enum: ["Startup", "MNC", "PSU", "Family Business"],
     
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    targetMarket: {
      type: String,
      enum: ["B2B SaaS", "SME Clients", "Public Sector", "Enterprise"],
     
    },

    clients: {
      type: [String],
      default: [],
    },

    questions: {
      totalQuestions: {
        type: Number,
        default: 60,
        required: true,
      },
      aptitude: {
        type: Number,
        required: true,
      },
      technical: {
        type: Number,
        required: true,
      },
      // softskill: {
      //   type: Number,
      //   required: true,
      // },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobInfo ||
  mongoose.model("JobInfo", JobInfoSchema);
