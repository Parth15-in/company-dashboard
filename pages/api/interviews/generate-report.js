// pages/api/interviews/generate-report.js
import dbConnect from "../../../lib/db";
import InterviewSession from "../../../models/InterviewSession";
import jwt from "jsonwebtoken";

export const config = {
  runtime: "nodejs",
  maxDuration: 300,
};

export default async function handler(req, res) {
  await dbConnect();

  // -----------------------------
  // 🔐 Extract Token from Cookies
  // -----------------------------
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader
    .split(";")
    .map(s => s.trim())
    .find(s => s.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }

  const companyId = decoded.companyId;

  // ==============================
  //       GET REPORT
  // ==============================
  if (req.method === "GET") {
    const { sessionId } = req.query;

    try {
      const session = await InterviewSession.findById(sessionId).populate("jobInfo");

      if (!session) {
        return res.status(404).json({ ok: false, error: "Session not found" });
      }

      // 🚨 SECURITY: Ensure session belongs to this company
      if (String(session.companyId) !== String(companyId)) {
        return res.status(403).json({ ok: false, error: "Access denied" });
      }

      // Calculate scores
      const scores = calculateScores(session);

      // Role fit analysis
      const roleAnalysis = analyzeRoleFit(session, scores);

      // AI report generation
      const aiReport = await generateCompanyAnalysisReport(session, scores, roleAnalysis);

      return res.status(200).json({
        ok: true,
        report: {
          candidateName: session.candidate.name,
          candidateEmail: session.candidate.email,
          jobRole: session.jobInfo?.jobRole || "N/A",
          submittedAt: session.updatedAt,
          scores,
          roleAnalysis,
          aiReport,
          recommendation: generateRecommendation(scores, roleAnalysis),
        },
      });
    } catch (error) {
      console.error("Error generating report:", error);
      return res.status(500).json({ ok: false, error: "Failed to generate report" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ ok: false, error: `Method ${req.method} Not Allowed` });
}
