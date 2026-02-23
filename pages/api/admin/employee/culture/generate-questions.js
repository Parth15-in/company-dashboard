import dbConnect from "@/lib/db";
import Company from "../../../../../models/company";
import CompanyOnboarding from "../../../../../models/CompanyOnboarding";
import CompanyCultureInterview from "../../../../../models/CompanyCultureInterview";
import Admin from "../../../../../models/admin";
import { OpenAI } from "openai";
import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const token = req.cookies.token;
    const decoded = verifyToken(token);
    if (!decoded || !decoded.adminId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    await dbConnect();

    const { companyId, interviewerUserId } = req.body;

    if (!companyId || !interviewerUserId)
      return res
        .status(400)
        .json({ ok: false, error: "Missing companyId or interviewerUserId" });

    const employee = await Admin.findById(interviewerUserId);
    if (!employee)
      return res.status(404).json({ ok: false, error: "Employee not found" });

    if (employee.role === "admin") {
      return res.status(403).json({
        ok: false,
        error: "Only employees can take the culture interview",
      });
    }

    if (employee.cultureInterviewCompleted) {
      return res.status(400).json({
        ok: false,
        error: "Culture interview already completed",
      });
    }

    /* ================= IMPORTANT FIX ================= */
    // 🔎 Check if draft already exists
    const existingDraft = await CompanyCultureInterview.findOne({
      companyId,
      interviewerUserId,
      status: "DRAFT",
    });

    if (existingDraft) {
      return res.status(200).json({
        ok: true,
        interviewId: existingDraft._id,
        questions: existingDraft.qa.map((q) => q.question),
      });
    }
    /* ================================================= */

    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ ok: false, error: "Company not found" });

    const onboarding = await CompanyOnboarding.findOne({ companyId });

    const onboardingData = onboarding
      ? {
          companyName: onboarding.companyName,
          industry: onboarding.industry,
          hierarchyLevel: onboarding.hierarchyLevel,
          communicationStyle: onboarding.communicationStyle,
          collaborationStyle: onboarding.collaborationStyle,
          feedbackCulture: onboarding.feedbackCulture,
          workPressure: onboarding.workPressure,
          departments: onboarding.departments || [],
          location: onboarding.location,
        }
      : {
          companyName: company.name,
          industry: "Unknown",
          domain: company.domain || "Unknown",
        };

    const prompt = `
You are an HR culture interviewer assistant.
Generate 10 short voice-friendly questions to understand work culture, environment, and management style.

Rules:
- Questions must be simple and conversational
- Avoid yes/no questions
- Focus on real daily work environment
- Must be in JSON array format only

Company onboarding data:
${JSON.stringify(onboardingData, null, 2)}

Return format:
["Question 1", "Question 2", ...]
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content || "[]";

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      questions = [];
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(500)
        .json({ ok: false, error: "Failed to generate questions" });
    }

    const interviewerRole = employee.role;

    const interview = await CompanyCultureInterview.create({
      companyId,
      interviewerUserId,
      interviewerRole,
      qa: questions.map((q) => ({ question: q, answer: "" })),
      status: "DRAFT",
    });

    return res.status(200).json({
      ok: true,
      interviewId: interview._id,
      questions,
    });
  } catch (err) {
    console.error("GENERATE QUESTIONS ERROR:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
