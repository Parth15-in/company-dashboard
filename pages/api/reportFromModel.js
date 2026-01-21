export const config = {
  runtime: "nodejs",
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Missing data' });

  try {
    const report = await getApiResponseReport(data);
    if (!report) return res.status(500).json({ error: 'Failed to generate report' });
    return res.status(200).json({ report });
  } catch (err) {
    console.error('reportFromModel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getApiResponseReport(data) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const prompt = `Generate a comprehensive interview report scoring (0-10) technical proficiency, communication, decision-making, confidence, language fluency and overall (0-50). Analyze: ${JSON.stringify(data, null, 2)}. Provide detailed feedback with improvement areas and recommendations.`;

  const payload = {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  };

  try {
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    const responseData = await response.json();
    if (response.ok && responseData?.choices?.[0]?.message?.content) {
      return responseData.choices[0].message.content;
    } else {
      console.error('LLM error:', responseData);
      return null;
    }
  } catch (error) {
    console.error('Error calling LLM:', error);
    return null;
  }
}