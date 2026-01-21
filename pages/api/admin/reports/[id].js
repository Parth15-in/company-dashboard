// pages/api/admin/reports/[id].js
import dbConnect from "../../../../lib/db";
import Report from "../../../../models/Report";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid report ID" });
  }

  // ---------------------------
  // 🔐 Extract token
  // ---------------------------
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

  // ---------------------------
  // PATCH — update shortlist
  // ---------------------------
  if (req.method === "PATCH") {
    try {
      const { shortlisted } = req.body;

      // Only update if report belongs to this company
      const updated = await Report.findOneAndUpdate(
        { _id: id, companyId }, // ⭐ Ensures multi-company isolation
        { shortlisted },
        { new: true }
      );

      if (!updated) {
        return res.status(403).json({
          ok: false,
          error: "Access denied — report does not belong to your company",
        });
      }

      return res.status(200).json({ ok: true, report: updated });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
