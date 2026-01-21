import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String }, 
  onboardingCompleted:{type:Boolean,default:false},
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
