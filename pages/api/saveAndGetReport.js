import mongoose from "mongoose";
import Report from "../../models/Report";
import dbConnect from "../../lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  // Extract token from cookies
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("token="))
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

  // ---------------------------
  // CREATE REPORT (POST)
  // ---------------------------
  if (req.method === "POST") {
    const { role, email, collageName, reportAnalysis } = req.body;

    if (!role || !email || !collageName || !reportAnalysis) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newReport = new Report({
        role,
        email,
        collageName,
        reportAnalysis,
        companyId, // ⭐ IMPORTANT
      });

      await newReport.save();

      return res.status(201).json({
        ok: true,
        message: "Report stored successfully",
        report: newReport,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: "Failed to store report" });
    }
  }

  // ---------------------------
  // GET REPORTS BY EMAIL (GET)
  // ---------------------------
  if (req.method === "GET") {
    const { email } = req.query;

    try {
      if (email) {
        // Returns ONLY reports belonging to that company
        const reports = await Report.find({ email, companyId });

        if (reports.length === 0)
          return res.status(404).json({ error: "No reports found" });

        return res.status(200).json({ ok: true, reports });
      }

      // Default → return all reports for this company
      const reports = await Report.find({ companyId }).sort({ createdAt: -1 });

      return res.status(200).json({ ok: true, reports });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: "Failed to retrieve reports" });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
