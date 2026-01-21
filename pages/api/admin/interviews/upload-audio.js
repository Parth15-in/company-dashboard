// pages/api/interview/upload-audio.js
import multer from "multer";
import path from "path";
import fs from "fs";
import dbConnect from "../../../../lib/db";
import InterviewSession from "../../../../models/InterviewSession";

const uploadDir = path.join(process.cwd(), "/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

const upload = multer({ storage });

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("audio"));
    await dbConnect();

    const { sessionId, section, questionIndex } = req.body;
    const transcript = req.body?.transcript || "";

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Audio file missing" });
    }
    if (!["technical", "softskill"].includes(section)) {
      return res.status(400).json({ ok: false, error: "Invalid section" });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Prevent uploads after completion
    if (session.status === "completed") {
      return res.status(400).json({
        ok: false,
        error: "Session already completed. Cannot upload audio.",
      });
    }

    const audioPath = `/uploads/${req.file.filename}`;

    // -----------------------------------------
    // Remove any previous answer for same question
    // -----------------------------------------
    session.answers = session.answers.filter(
      (a) =>
        !(
          a.section === section &&
          Number(a.questionIndex) === Number(questionIndex)
        )
    );

    // -----------------------------------------
    // Save new answer
    // -----------------------------------------
    session.answers.push({
      section,
      questionIndex: Number(questionIndex),
      audioPath,
      response: transcript,
      createdAt: new Date(),
    });

    await session.save();

    return res.status(201).json({
      ok: true,
      audioPath,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Audio upload failed",
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
