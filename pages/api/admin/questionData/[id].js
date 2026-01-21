import dbConnect from "../../../../lib/db";
import Report from "../../../../models/Report";
import InterviewSession from "../../../../models/InterviewSession";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false });
  }

  try {
    const { id } = req.query;

    // 1️⃣ Get report
    const report = await Report.findById(id).lean();
    if (!report) {
      return res.status(404).json({
        ok: false,
        error: "Report not found"
      });
    }

    // 2️⃣ Get interview session USING sessionId (✅ GUARANTEED)
    const session = await InterviewSession.findById(report.sessionId).lean();
    if (!session) {
      return res.status(404).json({
        ok: false,
        error: "Interview session not found"
      });
    }

    // 3️⃣ Return Q&A data
    return res.status(200).json({
      ok: true,
      session
    });

  } catch (err) {
    console.error("questionData error:", err);
    return res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
}
