//models/CompanyCultureProfile.js
import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    basicInfo: {
      name: String,
      industry: String,
      location: String,
      companyType: String,
      targetMarket: String,
    },

    cultureProfile: {
      summary: String,
      whatWeValue: [String],
      howWeWork: String,
      managerialStyle: String,
      employeeTraitsThatThriveHere: [String],
      whyJoinUs: String,
    },

    builtFromCultureInterviews: Number,
    lastUpdated: Date,
  },
  { timestamps: true }
);

export default mongoose.models.CompanyCultureProfile ||
  mongoose.model("CompanyCultureProfile", CompanyProfileSchema);
