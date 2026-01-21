// import dbConnect from "../../../../lib/db";
// import Report from "../../../../models/Report";

// export default async function handler(req, res) {
//   await dbConnect();

//   if (req.method !== "GET") {
//     return res.status(405).json({ ok: false, error: "Method not allowed" });
//   }

//   try {
//     const reports = await Report.find().sort({ createdAt: -1 });
//     return res.status(200).json({ ok: true, reports });
//   } catch (err) {
//     console.error("Fetch Reports Error:", err);
//     return res.status(500).json({ ok: false, error: "Failed to fetch reports" });
//   }
// }

import dbConnect from "../../../../lib/db";
import Report from "../../../../models/Report";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Extract token from cookies
    const cookieHeader = req.headers.cookie || "";
    const token = cookieHeader
      .split(";")
      .map(s => s.trim())
      .find(s => s.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains adminId + companyId
    const companyId = decoded.companyId;

    // Fetch ONLY this company's reports
    const reports = await Report.find({ companyId }).sort({ createdAt: -1 });

    return res.status(200).json({ ok: true, reports });
  } catch (err) {
    console.error("Fetch Reports Error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch reports" });
  }
}
