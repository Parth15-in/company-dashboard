// pages/api/admin/candidates.js
import dbConnect from "../../../lib/db";
import InterviewSession from "../../../models/InterviewSession";
import Report from "../../../models/Report"; // FIXED MODEL

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Fetch all interview attempts
    const sessions = await InterviewSession.find({})
      .populate("jobInfo")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch all stored AI reports
    const reports = await Report.find({}).lean();

    // Merge based on candidate email
    const combined = sessions.map((s) => {
      const rep = reports.find((r) => r.email === s.candidate.email);

      const totalQuestions =
        (s.generatedQuestions?.aptitude?.length || 0) +
        (s.generatedQuestions?.technical?.length || 0) +
        (s.generatedQuestions?.softskill?.length || 0);

      return {
        sessionId: s._id,
        candidate: {
          name: s.candidate?.name || "Unknown",
          email: s.candidate?.email || "Unknown",
          collegeName: s.candidate?.collegeName || "Unknown",
        },
        role: s.jobInfo?.jobRole || "Unknown Role",
        slug: s.slug,
        createdAt: s.createdAt,
        completedAt: s.completedAt || null,
        answeredCount: s.answers.length,
        totalQuestions,
        report: rep?.reportAnalysis || null, // AI JSON report
      };
    });

    return res.status(200).json({ ok: true, data: combined });

  } catch (err) {
    console.error("CANDIDATE API ERROR:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
