// pages/api/job-by-slug/[slug].js
import dbConnect from "../../../lib/db";
import JobInfo from "../../../models/JobInfo";

export default async function handler(req, res) {
  await dbConnect();
  const { slug } = req.query;
  const job = await JobInfo.findOne({ slug }).lean();
  if (!job) return res.status(404).json({ ok: false, error: "Not found" });
  res.status(200).json({ ok: true, job });
}
