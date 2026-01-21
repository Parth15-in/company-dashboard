// pages/api/admin/interviews/submit-mcq.js
import dbConnect from "../../../../lib/db";
import InterviewSession from "../../../../models/InterviewSession";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  const {
    sessionId,
    answers = [],          // MCQ
    writtenAnswers = [],   // Written
    section = "apti",
    isComplete,
  } = req.body;

  if (!sessionId) {
    return res.status(400).json({ ok: false, error: "Missing sessionId" });
  }

  if (!["apti", "technical"].includes(section)) {
    return res.status(400).json({ ok: false, error: "Invalid section" });
  }

  const session = await InterviewSession.findById(sessionId);

  if (!session) {
    return res.status(404).json({ ok: false, error: "Session not found" });
  }

  if (session.status === "completed") {
    return res.status(400).json({
      ok: false,
      error: "Session already completed. Cannot submit answers.",
    });
  }

  /* ===== Remove old answers of this section ===== */
  session.answers = session.answers.filter(
    (a) => a.section !== section
  );

  /* ===== MCQ Answers ===== */
  answers.forEach((a) => {
    if (
      typeof a.questionIndex === "number" &&
      typeof a.selectedOptionIndex === "number"
    ) {
      session.answers.push({
        section,
        questionIndex: a.questionIndex,
        response: a.selectedOptionIndex,
      });
    }
  });

  /* ===== Written Answers (FIXED) ===== */
  writtenAnswers.forEach((a) => {
    if (
      typeof a.questionIndex === "number" &&
      typeof a.response === "string"
    ) {
      session.answers.push({
        section,
        questionIndex: a.questionIndex,
        response: a.response,
      });
    }
  });

  if (isComplete) {
    session.status = "completed";
    session.completedAt = new Date();
  }

  await session.save();

  return res.status(200).json({ ok: true, sessionId });
}
