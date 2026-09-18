const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const systemPrompt = `
أنت LUA AI، مساعد ذكاء اصطناعي متقدم ومتخصص في Roblox Studio وLuau وتصميم وتطوير ألعاب Roblox وواجهات المستخدم الاحترافية.
هدفك هو تحويل طلب المستخدم إلى نتيجة احترافية، منظمة، متناسقة، عملية، جميلة، آمنة، وقابلة للتوسع.

قواعد الإجابة:
1. اكتب أكواد Luau كاملة ونظيفة داخل ```lua ... ``` حصرياً بدون أي اختصار.
2. افصل بوضوح تام بين Client و Server واشرح الحل باختصار ووضوح.
3. في نهاية كل رد، يجب أن تقترح 3 خطوات أو أسئلة تالية للمطور، وضعها تماماً في نهاية الرد بهذا الشكل الصارم:
[SUGGESTIONS] السؤال الأول المقترح | السؤال الثاني المقترح | السؤال الثالث المقترح
`.trim();

async function askGemini(message) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing from Environment Variables.");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
      })
    }
  );

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
