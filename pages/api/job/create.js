import dbConnect from "../../../lib/db";
import JobInfo from "../../../models/JobInfo";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  try {
    await dbConnect();

    const {
      jd,
      jobRole,
      qualification,
      criteria,
      aptitude,
      technical,
      softskill,
      isActive,
    } = req.body;

    // Ensure total = 60
    const total = Number(aptitude) + Number(technical) + Number(softskill);
    if (total !== 60)
      return res.status(400).json({
        message: "Total questions must be exactly 60.",
      });

    const job = await JobInfo.create({
      jd,
      jobRole,
      qualification,
      criteria,
      questions: {
        totalQuestions: 60,
        aptitude,
        technical,
        softskill,
      },
      isActive,
    });

    return res.status(201).json({ message: "Job Created", job });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
}
