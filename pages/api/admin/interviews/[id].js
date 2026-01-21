// pages/api/admin/interviews/[id].js

import dbConnect from "../../../../lib/db";
import JobInfo from "../../../../models/JobInfo";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  // -----------------------------------
  // 🔐 Extract token from cookies
  // -----------------------------------
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
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }

  const companyId = decoded.companyId;

  // Invalid ID guard
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid job ID" });
  }

  // ============================
  //        PATCH (update active status)
  // ============================
  if (req.method === "PATCH") {
    const { isActive } = req.body;

    // Ensure job belongs to logged-in company
    const job = await JobInfo.findOneAndUpdate(
      { _id: id, companyId }, // ✨ company-based isolation
      { isActive },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found or access denied" });
    }

    return res.status(200).json({ ok: true, job });
  }

  // ============================
  //        GET job details
  // ============================
  if (req.method === "GET") {
    const job = await JobInfo.findOne({ _id: id, companyId });

    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found or access denied" });
    }

    return res.status(200).json({ ok: true, job });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  res.status(405).json({ ok: false, error: `Method ${req.method} Not Allowed` });
}
