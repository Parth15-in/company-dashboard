// pages/api/admin/interviews/[id].js
import dbConnect from "../../../lib/db";
import JobInfo from "../../../models/JobInfo";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

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

  // Fetch jobInfo
  const job = await JobInfo.findById(id);

  if (!job) {
    return res.status(404).json({ ok: false, error: "Job not found" });
  }

  // 🚨 Prevent cross-company access
  if (String(job.companyId) !== String(companyId)) {
    return res.status(403).json({ ok: false, error: "Access denied" });
  }

  // -------------------------
  // UPDATE INTERVIEW (PATCH)
  // -------------------------
  if (req.method === "PATCH") {
    const { isActive } = req.body;

    const updated = await JobInfo.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    return res.status(200).json({ ok: true, job: updated });
  }

  // -------------------------
  // GET INTERVIEW (GET)
  // -------------------------
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, job });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ ok: false, error: `Method ${req.method} Not Allowed` });
}
