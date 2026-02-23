import dbConnect from "@/lib/db";
import CompanyCultureInterview from "../../../../../models/CompanyCultureInterview";
import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    // Verify token
    const token = req.cookies.token;
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    await dbConnect();

    const { interviewId, index, answer } = req.body;

    if (!interviewId || index === undefined)
      return res.status(400).json({ ok: false, error: "Missing interviewId or index" });

    const interview = await CompanyCultureInterview.findById(interviewId);
    if (!interview) return res.status(404).json({ ok: false, error: "Interview not found" });

    if (!interview.qa[index]) {
      return res.status(400).json({ ok: false, error: "Invalid question index" });
    }

    interview.qa[index].answer = answer || "";
    await interview.save();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
