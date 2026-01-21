import dbConnect from "../../../lib/db";
import JobInfo from "../../../models/JobInfo";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const jobs = await JobInfo.find().sort({ createdAt: -1 });

    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
}
