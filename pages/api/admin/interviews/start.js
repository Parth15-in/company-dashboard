

//pages/api/admin/intrviews/start.js

import dbConnect from "../../../../lib/db";
import JobInfo from "../../../../models/JobInfo";
import InterviewSession from "../../../../models/InterviewSession";
import CompanyOnboarding from "../../../../models/CompanyOnboarding";
/* ================= MAIN HANDLER ================= */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, detail: "Only POST allowed" });
  }

  const { slug, candidate } = req.body;
  if (!slug || !candidate) {
    return res.status(400).json({ ok: false, detail: "Missing data" });
  }

  try {
    /* 1️⃣ FIND JOB */
    

    const job = await JobInfo.findOne({ slug, isActive: true });
    if (!job) {
      return res.status(404).json({ ok: false, detail: "Interview not found" });
    }

    if (!job.companyId) {
      return res.status(500).json({
        ok: false,
        detail: "Job missing companyId",
      });
    }
    const companyOnboarding = await CompanyOnboarding.findOne({
      companyId: job.companyId,
      $or: [
    { isCompleted: true }, // ✅ old records
    { isActive: true },    // ✅ new records
  ],
    });

    if (!companyOnboarding) {
      throw new Error("Company onboarding data not found");
    }

    /* 2️⃣ CREATE EMPTY SESSION */
    const session = await InterviewSession.create({
      companyId: job.companyId,
      jobInfo: job._id,
      slug: job.slug,
      candidate,
      generatedQuestions: {
        aptitude: [],
        technical: {
          mcq: [],
          written: [],
        },
      },

      status: "in-progress",
      questionStatus: "generating",
    });

    /* 3️⃣ RESPOND IMMEDIATELY */
    const instructionsUrl = `/interview/${job.slug}/instructions?sessionId=${session._id}`;

    res.status(201).json({
      ok: true,
      sessionId: session._id,
      instructionsUrl,
      msg: "Interview started. Questions generating.",
    });

    /* 4️⃣ BACKGROUND QUESTION GENERATION */
    generateQuestionsInBackground(job, session._id, companyOnboarding)
      .then(async () => {
        await InterviewSession.findByIdAndUpdate(session._id, {
          questionStatus: "done",
        });
      })
      .catch(async (err) => {
        console.error("❌ Question generation failed:", err);
        await InterviewSession.findByIdAndUpdate(session._id, {
          questionStatus: "failed",
          questionError: err.message || "Question generation failed",
        });
      });

  } catch (err) {
    console.error("START API ERROR:", err);
    return res.status(500).json({
      ok: false,
      detail: err.message || "Internal Server Error",
    });
  }
}

/* ================= BACKGROUND JOB ================= */

async function generateQuestionsInBackground(job, sessionId, companyOnboarding) {
  const aptitude = await generateAptitude(job, companyOnboarding);
  const technical = await generateTechnical(job, companyOnboarding);
  // const softskill = await generateSoftskill(job);



  await InterviewSession.findByIdAndUpdate(sessionId, {
    generatedQuestions: {
      aptitude,
      technical: {
        mcq: technical.mcq,
        written: technical.written,
      },
    },
  });

}

/* ================= APTITUDE ================= */

async function generateAptitude(job, companyOnboarding) {
  const aptiCount =
    job.questions.aptitude ||
    Math.ceil(job.questions.totalQuestions * 0.33);

  const prompt = `You are an interview question generator designed to simulate realistic hiring assessments for Indian workplace contexts.
Generate ${aptiCount} aptitude questions.
You must output ONLY valid JSON in the following exact structure:
Return ONLY valid JSON:
{
  "aptitude": [
    {
      "prompt": "",
      "options": ["A","B","C","D"],
      "correctOptionIndex": 0,
      "type": "numerical" | "logical" | "personality" | "attitude"
    }
  ]
}

Context:

- Criteria (Experience + Level): ${job.criteria}  ← e.g., "3–5 years, mid-level"
- Industry: ${companyOnboarding.industry} ← e.g., Fintech, IT Services, EdTech
- Company Type: ${companyOnboarding.companyType} ← e.g., startup, MNC, PSU, family business
- Location: ${job.location} ← e.g., Bangalore, Tier 2 city
- Target Market: ${companyOnboarding.targetMarket} ← e.g., B2B SaaS, public sector, SME clients
- Sample Clients: ${companyOnboarding.sampleClients} ← e.g., ["HDFC", "Flipkart", "Indian Railways"]

#### Assessment (Merged Aptitude + Psychometric):
- Each item must include:
  - "prompt": the question text
  - "options": 4 choices
  - "correctOptionIndex": integer from 0–3
  - "type": one of:
    - "numerical" → salary math, budget estimation, KM–INR conversion
    - "logical" → pattern, deduction, conditionals
    - "personality" → no correct answer; tests preferences or traits
    - "attitude" → judgment, ethics, time pressure, dealing with failure or conflict
- Questions must reflect **India-based work situations**, adjusted by:
  - Experience level
  - Industry and client type
  - Region/city and local workplace behaviors
- Use culturally accurate names, places, and examples:
  - ₹5,000 bonus, Swiggy launch, train delay, Diwali deadline, Noida office
`;

  const raw = await callOpenAI(prompt);
  const parsed = JSON.parse(extractJson(raw));

  if (!parsed?.aptitude) {
    throw new Error("Invalid aptitude output");
  }

  return parsed.aptitude;
}

/* ================= TECHNICAL ================= */

/* ================= TECHNICAL ================= */

async function generateTechnical(job, companyOnboarding) {
  const technicalCount = job.questions.technical || 30;

  const prompt = `
You are generating professional technical interview questions for Indian companies.

Return ONLY valid JSON (no markdown, no explanations).

STRICT JSON FORMAT:
{
  "technicalMcq": [
    {
      "prompt": "",
      "options": ["A","B","C","D"],
      "correctOptionIndex": 0
    }
  ],
  "technicalWritten": [
    {
      "prompt": "",
      "hint": ""
    }
  ]
}

REQUIREMENTS:
- Generate EXACTLY 15 MCQ questions
- Generate EXACTLY 15 written questions
- MCQ must have 4 options and 1 correct answer
- Written answers are short (2–5 lines expected)

CONTEXT:
- Job Role: ${job.jobRole}
- Experience Level: ${job.criteria}
- Industry: ${companyOnboarding.industry}
IMPORTANT ROLE DETECTION RULE (STRICT):
If the Job Role is related to IT / Software / Development
(e.g. Frontend Developer, Backend Developer, Full Stack Developer,
React Developer, Node.js Developer, Java Developer, Python Developer, etc.):

THEN:
- At least 5 out of 15 written questions MUST be code-based
- Code-based questions MUST include:
  - small code snippets
  - debugging scenarios
  - "what will be the output" questions
  - "how would you fix this" questions
  - short pseudo-code or real code (JavaScript / relevant language)
- Code snippets MUST be short (5–10 lines max)
- Focus on practical, production-style code (not academic)

If the Job Role is NOT IT-related:
- Written questions should be conceptual, scenario-based, or decision-oriented
- DO NOT include code snippets.

QUESTION QUALITY RULES:
- Focus on real-world work scenarios
- Avoid academic or trick questions
- Match difficulty to experience level
- Use practical terminology (API failure, state bug, production issue)
- Prefer applied knowledge over definitions

MCQ TOPICS:
- Core concepts relevant to the role
- Practical usage and debugging
- Common mistakes and best practices

WRITTEN QUESTION GOAL:
- Test job Role skills
- Test explanation ability
- Test problem-solving thinking
- Test design or decision reasoning

`;

  const raw = await callOpenAI(prompt);
  const parsed = JSON.parse(extractJson(raw));

  if (
    !Array.isArray(parsed?.technicalMcq) ||
    !Array.isArray(parsed?.technicalWritten)
  ) {
    throw new Error("Invalid technical output format");
  }

  return {
    mcq: parsed.technicalMcq,
    written: parsed.technicalWritten,
  };
}


/* ================= OPENAI CALL ================= */

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OpenAI API key");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("OpenAI RAW ERROR:", text);
    throw new Error("OpenAI request failed");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("OpenAI NON-JSON RESPONSE:", text);
    throw new Error("Invalid OpenAI JSON");
  }

  return data.choices?.[0]?.message?.content || "";
}

/* ================= JSON EXTRACT ================= */

function extractJson(str) {
  if (!str) return "";

  let s = str.trim();

  if (s.includes("```json")) {
    return s.split("```json")[1].split("```")[0].trim();
  }

  if (s.includes("```")) {
    return s.split("```")[1].split("```")[0].trim();
  }

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");

  return start !== -1 && end !== -1
    ? s.substring(start, end + 1)
    : s;
}
