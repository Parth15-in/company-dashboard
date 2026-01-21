import Report from "../models/Report";
import CompanyOnboarding from "../models/CompanyOnboarding";
/* ================= AI CALL ================= */

async function getAIReport(analysisData, job,companyOnboarding) {
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const prompt = `
You are an expert interview evaluator for modern Indian workplace hiring.

Assessment structure:
- Aptitude (MCQ)
- Technical (MCQ + written descriptive answers)
You are also given deep company context to evaluate cultural and operational alignment more accurately:
- Industry
- Company Type (startup, MNC, PSU, etc.)
- Office Location
- Target Market
- Sample Clients

Your task is to generate a clear, structured, and explainable evaluation of the candidate’s overall suitability for the role — technically, behaviorally, and culturally.
--------------------------------------------------
CRITICAL COMPLETENESS DATA:
- answeredCount: ${analysisData.answeredCount}
- totalQuestions: ${analysisData.totalQuestions}

completionRatio = answeredCount / totalQuestions
--------------------------------------------------

RETURN STRICT JSON ONLY in this structure:

{
  "scores": {
    "technicalProficiency": <0-10>,
    "communication": <0-10>,
    "decisionMaking": <0-10>,
    "confidence": <0-10>,
    "languageFluency": <0-10>,
    "culturalFit": <0-10>
  },
  "overallScore": <0-60>,
  "personalityType": {
    "label": "",
    "description": ""
  },
  "culturalFit": {
    "summary": "",
    "alignment": "High" | "Moderate" | "Low"
  },
  "roleFit": {
    "match": "High" | "Medium" | "Low",
    "explanation": ""
  },
  "evaluationText": {
    "technicalProficiency": "",
    "communication": "",
    "decisionMaking": "",
    "confidence": "",
    "languageFluency": "",
    "culturalFit": "",
    "overallSummary": ""
  },
  "improvementResources": {
    "technicalProficiency": [],
    "communication": [],
    "decisionMaking": [],
    "confidence": [],
    "languageFluency": [],
    "culturalFit": []
  },
  "recommendation": "Proceed" | "Borderline" | "Cannot Proceed"
}

--------------------------------------------------
SCORING RULES:
- Scores must be integers 0–10
- overallScore = sum of all 6 scores (max 60)
IMPORTANT:
If completionRatio < 0.5, recommendation CANNOT be "Proceed" regardless of score.

Recommendation Logic:
- overallScore ≥ 40 → "Proceed"
- 25–39 → "Borderline"
- < 25 → "Cannot Proceed"
--------------------------------------------------
SECTION RULES:
- technicalProficiency → technical MCQ + written answers
- communication/confidence/languageFluency → inferred from written answers
- decisionMaking → aptitude accuracy + reasoning
- culturalFit → overall behavior & reasoning
Evaluation Rules:
- Align evaluation strictly to:
  - Job Role
  - Job Description
  - Qualification
  - Experience Level
  - Industry expectations (e.g., fintech = compliance, IT = clarity)
  - Company type and working style (startup = fast, MNC = structured, PSU = process-heavy)
  - Location (e.g., Tier 2 cities may expect multitasking, metros expect speed)
  - Target market (enterprise, public sector, SME, consumer)
  - Client behavior expectations (e.g., HDFC = structure, Flipkart = agility)

- Judge technical depth relative to experience (entry / mid / senior)
- Infer personality type from psychometric + behavioral patterns (non-clinical)
- Cultural fit must reflect Indian workplace realities:  
  hierarchy, jugaad, ownership, manager style, deadline pressures
- If information is missing or weak, assign a lower score and explain why
- Be factual, professional, and hiring-focused
--------------------------------------------------
JOB CONTEXT:
- Role: ${job.jobRole}
- JD: ${job.jd}
- Criteria: ${job.criteria}
- Industry: ${companyOnboarding.industry}
- Location: ${job.location}
- Company Type: ${companyOnboarding.companyType}
- Target Market: ${companyOnboarding.targetMarket}
- Sample Clients: ${companyOnboarding.sampleClients?.join(", ") || "N/A"}

--------------------------------------------------
INTERVIEW DATA:
${JSON.stringify(analysisData, null, 2)}

Output VALID JSON only.
`;

  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "{}";

  try {
    const report = JSON.parse(text);

    for (const k in report.scores) {
      report.scores[k] = Number(report.scores[k] || 0);
    }
    report.overallScore = Number(report.overallScore || 0);

    return report;
  } catch (err) {
    console.error("AI JSON parse failed:", text);
    return null;
  }
}

/* ================= MAIN REPORT GENERATOR ================= */

export async function generateAndSaveReport(session, candidate) {
  try {
    const job = session.jobInfo;
    if (!job) throw new Error("Job context missing");
   const companyOnboarding = await CompanyOnboarding.findOne({
  companyId: session.companyId,
  $or: [
    { isCompleted: true }, // old onboarding records
    { isActive: true },    // new onboarding records
  ],
}).lean();

if (!companyOnboarding) {
  throw new Error("Company onboarding data missing");
}
    const analysisData = {
      jobRole: job.jobRole,
      criteria: job.criteria,
      industry: companyOnboarding.industry,
      companyType: companyOnboarding.companyType,
      location: job.location,
      targetMarket: companyOnboarding.targetMarket,
      candidate: {
        name: candidate?.name,
        email: candidate?.email,
      },
      answers: {},
    };

    /* ========= FIX 1: Correct total questions ========= */
    const totalQuestions =
      (session.generatedQuestions?.aptitude?.length || 0) +
      (session.generatedQuestions?.technical?.mcq?.length || 0) +
      (session.generatedQuestions?.technical?.written?.length || 0);

    const answeredCount = session.answers.length;

    analysisData.totalQuestions = totalQuestions;
    analysisData.answeredCount = answeredCount;

    /* ========= FIX 2: Correct answer mapping ========= */
    for (const ans of session.answers) {
      let q = {};
      let answerText = "";

      if (ans.section === "apti") {
        q = session.generatedQuestions.aptitude?.[ans.questionIndex];
        answerText = q?.options?.[ans.response] || "(no answer)";
      }

      if (ans.section === "technical") {
        // MCQ
        if (typeof ans.response === "number") {
          q =
            session.generatedQuestions.technical.mcq?.[
              ans.questionIndex
            ];
          answerText = q?.options?.[ans.response] || "(no answer)";
        }

        // WRITTEN
        if (typeof ans.response === "string") {
          q =
            session.generatedQuestions.technical.written?.[
              ans.questionIndex
            ];
          answerText = ans.response;
        }
      }

      analysisData.answers[`${ans.section}_${ans.questionIndex}`] = {
        question: q?.prompt || "",
        answer: answerText,
      };
    }

    /* ========= AI REPORT ========= */
    const report = await getAIReport(analysisData, job,companyOnboarding);
    if (!report) throw new Error("AI report generation failed");

    /* ========= SAVE REPORT ========= */
    await Report.create({
      companyId: session.companyId,
      role: job.jobRole,
      email: candidate?.email,
      reportAnalysis: report,
      sessionId: session._id,
    });

    session.report = report;
    session.reportGenerated = true;
    await session.save();

    return { ok: true, report };
  } catch (err) {
    console.error("generateAndSaveReport error:", err);
    return { ok: false, error: err.message };
  }
}
