import dbConnect from "../../../../lib/db";
import InterviewReports from "../../../../models/InterviewReport";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) {
    return res.status(401).json({ ok: false });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false });
  }

  const { email, role } = req.query;

  try {
    const report = await InterviewReports.findOne({
      email,
      role,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ ok: false });
    }

    return res.status(200).json({ ok: true, report });

  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}
