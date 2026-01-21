import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function transcribeAudio(audioPath) {
  try {
    const fullPath = path.join(process.cwd(), audioPath);

    if (!fs.existsSync(fullPath)) {
      console.error("Audio file not found:", fullPath);
      return "";
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(fullPath));
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData,
    });

    const data = await response.json();

    return data.text || "";
  } catch (error) {
    console.error("Whisper transcription error:", error);
    return "";
  }
}
