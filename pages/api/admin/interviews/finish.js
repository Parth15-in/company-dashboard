// pages/api/admin/interviews/finish.js
import dbConnect from "../../../../lib/db";
import InterviewSession from "../../../../models/InterviewSession";
import { generateAndSaveReport } from "../../../../utils/generateReport";
import "../../../../models/JobInfo";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // -------------------------
  // Extract token from cookies
  // -------------------------
  const token = req.headers.cookie
    ?.split(";")
    ?.find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }

  const adminCompanyId = decoded.companyId;
  const { sessionId } = req.body;

  try {
    const session = await InterviewSession.findById(sessionId).populate("jobInfo");

    if (!session) {
      return res.status(404).json({ ok: false, msg: "Session not found" });
    }

    // SECURITY: Ensure session belongs to logged-in company
    if (String(session.companyId) !== String(adminCompanyId)) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    // -------------------------
    // Prevent duplicate finish / report
    // -------------------------
    if (session.reportGenerated || session.reportStatus === "generating") {
      return res.status(200).json({
        ok: true,
        msg: "Interview already completed. Report already in progress or generated.",
      });
    }

    // -------------------------
    // Mark interview as completed
    // -------------------------
    session.status = "completed";
    session.completedAt = new Date();
    session.reportStatus = "generating";
    await session.save();

    // -------------------------
    // Respond immediately
    // -------------------------
    res.status(200).json({
      ok: true,
      msg: "Interview completed. Report generation started.",
    });

    // -------------------------
    // Background report generation
    // -------------------------
    generateAndSaveReport(session, session.candidate)
      .then(async () => {
        session.reportGenerated = true;
        session.reportStatus = "done";
        await session.save();
      })
      .catch(async (err) => {
        console.error("Background report generation failed:", err);
        session.reportStatus = "failed";
        session.reportError = err.message;
        await session.save();
      });

  } catch (err) {
    console.error("Finish interview error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
