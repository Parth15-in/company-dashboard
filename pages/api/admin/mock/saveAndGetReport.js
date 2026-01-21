import mongoose from "mongoose";
import InterviewReport from "../../../../models/InterviewReport";

export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // ================== SAVE REPORT ==================
  if (req.method === "POST") {
    const { role, email, reportAnalysis } = req.body;

    if (!role || !email || !reportAnalysis) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newReport = new InterviewReport({
        role,
        email,
        reportAnalysis,
      });

      await newReport.save();

      return res.status(201).json({
        message: "Report stored successfully",
        report: newReport,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to store report" });
    }
  }

  // ================== GET REPORT ==================
  if (req.method === "GET") {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const reports = await InterviewReport.find({ email }).sort({
        createdAt: -1,
      });

      if (!reports.length) {
        return res.status(404).json({ error: "No reports found" });
      }

      return res.status(200).json({ reports });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch reports" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
