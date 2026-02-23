// import dbConnect from "@/lib/db";
// import CompanyCultureInterview from "../../../../../models/CompanyCultureInterview";
// import Admin from "../../../../../models/admin";
// import jwt from "jsonwebtoken";

// const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch {
//     return null;
//   }
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ ok: false });

//   try {
//     // Verify token
//     const token = req.cookies.token;
//     const decoded = verifyToken(token);
//     if (!decoded || !decoded.adminId) {
//       return res.status(401).json({ ok: false, error: "Unauthorized" });
//     }

//     await dbConnect();

//     const { interviewId, interviewerUserId } = req.body;
//     if (!interviewId) return res.status(400).json({ ok: false });

//     const interview = await CompanyCultureInterview.findById(interviewId);
//     if (!interview) return res.status(404).json({ ok: false });

//     interview.status = "SUBMITTED";
//     await interview.save();

//     // Mark employee's culture interview as completed
//     if (interviewerUserId) {
//       await Admin.findByIdAndUpdate(interviewerUserId, { cultureInterviewCompleted: true });
//     }

//     return res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ ok: false });
//   }
// }

import dbConnect from "@/lib/db";
import CompanyCultureInterview from "../../../../../models/CompanyCultureInterview";
import CompanyProfile from "../../../../../models/CompanyCultureProfile";
import Company from "../../../../../models/company";
import CompanyOnboarding from "../../../../../models/CompanyOnboarding";
import Admin from "../../../../../models/admin";
import jwt from "jsonwebtoken";
import { OpenAI } from "openai";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

function extractJson(raw) {
  if (!raw) return null;

  let text = raw.trim();

  // Remove markdown ```json blocks if present
  if (text.includes("```")) {
    const parts = text.split("```");
    text = parts[1] || text;
    text = text.replace("json", "").trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("JSON PARSE FAILED:", text);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false });

  try {
    const token = req.cookies.token;
    const decoded = verifyToken(token);

    if (!decoded || !decoded.adminId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
    }

    await dbConnect();

    const { interviewId, interviewerUserId } = req.body;

    if (!interviewId)
      return res.status(400).json({ ok: false });

    const interview = await CompanyCultureInterview.findById(interviewId);

    if (!interview)
      return res.status(404).json({ ok: false });

    // 1️⃣ Mark as submitted
    interview.status = "SUBMITTED";
    await interview.save();

    // 2️⃣ Mark employee as completed
    if (interviewerUserId) {
      await Admin.findByIdAndUpdate(interviewerUserId, {
        cultureInterviewCompleted: true,
      });
    }

    // 3️⃣ Check if profile already exists
    const existingProfile = await CompanyProfile.findOne({
      companyId: interview.companyId,
    });

    if (existingProfile) {
      console.log("Company profile already exists. Skipping creation.");
      return res.status(200).json({ ok: true });
    }

    // 4️⃣ Extract meaningful answers
    const insights = interview.qa
      .filter(
        (q) =>
          q.answer &&
          q.answer !== "No Answer Recorded" &&
          q.answer.trim().length > 8
      )
      .map((q) => q.answer.trim());

    console.log("INSIGHTS:", insights);

    if (insights.length === 0) {
      console.log("No valid insights found. Profile not created.");
      return res.status(200).json({ ok: true });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a company intelligence builder.

Using the following employee culture insights, generate a structured company culture profile.

Insights:
${insights.join("\n")}

Return ONLY valid JSON:

{
  "cultureProfile": {
    "summary": "",
    "whatWeValue": [],
    "howWeWork": "",
    "managerialStyle": "",
    "employeeTraitsThatThriveHere": [],
    "whyJoinUs": ""
  }
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const rawResponse =
      completion.choices?.[0]?.message?.content || "{}";

    console.log("OPENAI RAW RESPONSE:", rawResponse);

    const parsed = extractJson(rawResponse);

    if (!parsed?.cultureProfile) {
      console.error("Culture profile missing in parsed response.");
      return res.status(200).json({ ok: true });
    }

    const company = await Company.findById(interview.companyId);
    const onboarding = await CompanyOnboarding.findOne({
      companyId: interview.companyId,
    });

    await CompanyProfile.create({
      companyId: interview.companyId,

      basicInfo: {
        name: onboarding?.companyName || company?.name,
        industry: onboarding?.industry || "Unknown",
        location: onboarding?.location || "Unknown",
        companyType: onboarding?.companyType || "Unknown",
        targetMarket: onboarding?.targetMarket || "Unknown",
      },

      cultureProfile: parsed.cultureProfile,

      builtFromCultureInterviews: 1,
      lastUpdated: new Date(),
    });

    console.log("Company profile created successfully.");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    return res.status(500).json({ ok: false });
  }
}
