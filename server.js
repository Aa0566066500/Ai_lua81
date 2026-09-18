const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const systemPrompt = `أنت مساعد برمجة متخصص في Roblox Studio و Luau. مهمتك الوحيدة هي كتابة كود Luau نظيف، مرتب، ومحترف بناءً على طلب المستخدم.
قواعد صارمة جداً:
1. اكتب الكود البرمجي فقط لا غير داخل صندوق الكود \`\`\`lua ... \`\`\`.
2. ممنوع نهائياً كتابة أي شرح، كلام، مقدمات، أو خاتمة خارج صندوق الكود.
3. اكتب الكود كاملاً ومفصلاً وبدون أي اختصار أو عبارات مثل "أكمل بنفسك".`;

async function askGemini(message) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing from Environment Variables.");

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API request failed.");
  }

  const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
  if (!reply) throw new Error("Gemini returned an empty response.");
  return reply;
}

app.get("/", (req, res) => {
  res.json({ status: "online", message: "Lua AI Pro Backend is running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }
    const reply = await askGemini(message.trim());
    return res.json({ success: true, reply });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Lua AI Backend running on port ${PORT}`);
});
