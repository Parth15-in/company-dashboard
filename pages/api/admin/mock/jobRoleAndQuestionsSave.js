import mongoose from 'mongoose';
import JobRole from '../../../../models/JobRole'; // Assuming the JobRole model is stored in models/JobRole.js

const connectDb = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGO_URI);

}

export default async function handler(req, res) {
  try {
    await connectDb(); // Ensure we're connected to the database

    if (req.method === 'POST') {
      const { jobRole,email, level, questions } = req.body;

      // Validate the data before saving
      if (!jobRole ||!email || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
      }

      // Format questions (if necessary, here it's already an array of objects with questionText and answer)
      const formattedQuestions = questions.map(q => ({
        questionText: q.questionText,
        answer: q.answer || null,  // Default to null if no answer is provided
      }));

      const newInterviewJobRole = new JobRole({
        role: jobRole,
      email,
        level,
        questions: formattedQuestions,
      });

      const savedJobRole = await newInterviewJobRole.save();
      return res.status(200).json({ message: 'Job role data saved successfully', data: savedJobRole });
      
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error saving job role data:', error); // Log detailed error
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
