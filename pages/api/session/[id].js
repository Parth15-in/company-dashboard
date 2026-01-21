// pages/api/session/[id].js
import dbConnect from "../../../lib/db";
import InterviewSession from "../../../models/InterviewSession";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const session = await InterviewSession.findById(id).lean();
  if (!session) return res.status(404).json({ ok: false, error: "Session not found" });
  res.status(200).json({ ok: true, session });
}
