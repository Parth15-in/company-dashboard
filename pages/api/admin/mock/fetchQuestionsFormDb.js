import mongoose from "mongoose";
import JobRole from "../../../../models/JobRole";

const connectDb = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGO_URI);
};

export default async function handler(req, res) {
  await connectDb();

  const { email, _id } = req.query;

  if (!email || !_id) {
    return res.status(400).json({
      message: "email and interview _id are required",
    });
  }

  // ================================
  // GET → Fetch questions
  // ================================
  if (req.method === "GET") {
    try {
      const jobRole = await JobRole.findOne({
        _id,
        email,
      });

      if (!jobRole) {
        return res.status(404).json({
          message: "Interview not found",
        });
      }

      const questions = jobRole.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        answer: q.answer || "",
      }));

      return res.status(200).json(questions);
    } catch (err) {
      console.error("FETCH QUESTIONS ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch questions",
      });
    }
  }

  // ================================
  // PUT → Save answer
  // ================================
  if (req.method === "PUT") {
    const { questionId, answer } = req.body;

    if (!questionId) {
      return res.status(400).json({
        message: "questionId is required",
      });
    }

    try {
      const jobRole = await JobRole.findOne({
        _id,
        email,
      });

      if (!jobRole) {
        return res.status(404).json({
          message: "Interview not found",
        });
      }

      const question = jobRole.questions.id(questionId);

      if (!question) {
        return res.status(404).json({
          message: "Question not found",
        });
      }

      question.answer = answer || "";

      await jobRole.save();

      return res.status(200).json({
        message: "Answer saved successfully",
      });
    } catch (err) {
      console.error("SAVE ANSWER ERROR:", err);
      return res.status(500).json({
        message: "Failed to save answer",
      });
    }
  }

  return res.status(405).json({
    message: "Method not allowed",
  });
}
