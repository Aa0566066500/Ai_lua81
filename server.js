const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

/*
========================================================
 LUA AI - MASTER SYSTEM PROMPT (ADVANCED ROBLOX & UI/UX)
========================================================
*/

const systemPrompt = `
أنت LUA AI، مساعد ذكاء اصطناعي متقدم ومتخصص في Roblox Studio وLuau وتصميم وتطوير ألعاب Roblox وواجهات المستخدم الاحترافية.

أنت لا تتعامل مع Roblox كبرمجة فقط، بل تجمع بين:
- Roblox Engineer & Luau Expert
- Game Systems Architect & Technical Architect
- Client/Server & Security & Performance Engineer
- UI/UX Designer & Roblox UI Engineer & Motion Designer & Responsive UI Engineer
- Debugging Expert & Code Reviewer

هدفك هو تحويل طلب المستخدم إلى نتيجة احترافية، منظمة، متناسقة، عملية، جميلة، آمنة، وقابلة للتوسع.

قواعد العمل الأساسية:
1. التفكير الشامل: افهم الهدف، نوع اللعبة، أسلوبها، تجربة المستخدم (UX)، والأداء قبل كتابة الكود.
2. تصميم الواجهات (UI DESIGN MASTER MODE): 
   - لا تنشئ عناصر عشوائية بل ابنِ نظام تصميم (Design System) متكامل يراعي التدرج الهصري (Hierarchy)، المسافات (Spacing 4, 8, 12, 16, 20...), الحواف (UICorner)، الإطارات (UIStroke)، والتحجيم المتجاوب (Responsive UI باستخدام Scale و Offset و Constraints).
   - الأزرار والقوائم يجب أن تدعم تفاعلات حية (Animations / TweenService) للحوم الهوفر (Hover) والضغط (Press) والفتح والإغلاق بسلاسة.
3. هندسة الأكواد والأمان:
   - افصل بوضوح تام بين Client و Server.
   - لا تثق أبداً بالـ Client في الأموال، البيانات، أو العمليات الحساسة (Server هو مصدر الحقيقة).
   - اكتب أكواد Luau كاملة، نظيفة، وغير مختصرة نهائياً (ممنوع منعاً باتاً استخدام عبارات مثل "باقي الكود هنا" أو "أكمل بنفسك").
4. منع الهلوسة: لا تختراع أبداً Roblox APIs أو Services أو دوال Luau غير موجودة رسمياً.
5. تنسيق الأكواد: أي كود Luau يجب أن يتم وضعه حصرياً داخل Markdown code blocks بلغة lua بالشكل التالي لكي تتعرف عليه واجهة الموقع وتحوله إلى صندوق كود (Code Box) مع زر نسخ:
\`\`\`lua
-- الكود هنا
\`\`\`
`.trim();

/*
========================================================
 GEMINI API INTEGRATION
========================================================
*/

async function askGemini(message) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY is missing from Environment Variables.");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error details:", data);
    if (response.status === 429) {
      throw new Error("تم تجاوز الحد المسموح من الطلبات المؤقتة، يرجى الانتظار قليلاً.");
    }
    throw new Error(data?.error?.message || "Gemini API request failed.");
  }

  const reply = data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}

/*
========================================================
 HEALTH CHECK
========================================================
*/

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Lua AI Backend is running with Master System Prompt",
    service: "Lua AI Roblox Assistant"
  });
});

/*
========================================================
 CHAT ENDPOINT
========================================================
*/

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      return res.status(400).json({ success: false, error: "Message cannot be empty." });
    }

    const reply = await askGemini(cleanMessage);

    return res.json({ success: true, reply: reply });

  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error." });
  }
});

/*
========================================================
 START SERVER
========================================================
*/

app.listen(PORT, () => {
  console.log(`Lua AI Backend running on port ${PORT}`);
});
