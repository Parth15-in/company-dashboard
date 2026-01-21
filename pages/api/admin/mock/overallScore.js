import Report from '../../../../models/OverallScore';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  /* ================= STORE SCORE ================= */
  if (req.method === 'POST') {
    const { role, email, overallScore } = req.body;

    if (!role || !email || overallScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newReport = new Report({
        role,
        email,
        overallScore,
        collageName: "N/A", // ✅ Flow B default
      });

      await newReport.save();

      return res.status(201).json({
        message: 'Score stored successfully',
        report: newReport,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to store score' });
    }
  }

  /* ================= GET REPORTS BY EMAIL ================= */
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const reports = await Report.find({ email });

      if (!reports.length) {
        return res.status(404).json({ error: 'No reports found' });
      }

      return res.status(200).json({ reports });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve reports' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
