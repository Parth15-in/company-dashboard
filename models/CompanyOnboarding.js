import mongoose from "mongoose";

const CompanyOnboardingSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true, // one onboarding per company
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },
   website:{
    type:String,
    required:true,
    trim:true,
   },
    companyType: {
      type: String,
      enum: ["Startup", "MNC", "PSU", "Family Business"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    employeeSize: {
      type: String, // "1–20", "50–200", etc.
      default: "",
    },
    hierarchyLevel: {
      type: String,
      enum: ["Flat", "Moderate", "Strict"],
      required: true,
    },

    communicationStyle: {
      type: String,
      enum: [
        "formal",
        "informal",
        "email-heavy",
        "chat-based",
        "meeting-driven",
      ],
      required: true,
    },

    collaborationStyle: {
      type: String,
      enum: ["cross-functional", "siloed", "top-down", "organic"],
      default: "",
    },

    feedbackCulture: {
      type: String,
      enum: ["frequent", "rare", "safe", "avoided", "hierarchical"],
      required: true,
    },
    targetMarket: {
      type: String,
      required: true,
      trim: true,
    },

    sampleClients: {
      type: [String],
      default: [],
    },

    workPressure: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    departments: {
      type: String,
      default: "",
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: true, // saved only after final step
    },
    isActive: {
  type: Boolean,
  default: true,
},

  },
  {
    timestamps: true,
  }
);
export default mongoose.models.CompanyOnboarding ||
  mongoose.model("CompanyOnboarding", CompanyOnboardingSchema);
