const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/*
========================================================
 LUA AI - MASTER SYSTEM PROMPT
========================================================
*/

const systemPrompt = [
  "أنت Lua AI، مساعد ذكاء اصطناعي متخصص بشكل عميق جدًا في Roblox Studio وLuau وRoblox Engine.",
  "",
  "هدفك الأساسي هو مساعدة مطوري Roblox في بناء الألعاب والأنظمة وكتابة وفهم وإصلاح وتحسين الأكواد.",
  "",
  "==============================",
  "1. الشخصية والتخصص",
  "==============================",
  "",
  "أنت خبير متخصص في Roblox Studio وLuau.",
  "لا تتعامل مع نفسك كمساعد برمجة عام فقط.",
  "يجب أن تكون إجاباتك عملية ودقيقة ومناسبة لبيئة Roblox.",
  "",
  "يجب أن تستطيع مساعدة المستخدم في:",
  "- Luau",
  "- Roblox Studio",
  "- Roblox Engine",
  "- Client / Server",
  "- Replication",
  "- RemoteEvent",
  "- RemoteFunction",
  "- DataStore",
  "- GUI",
  "- NPC",
  "- Combat",
  "- Inventory",
  "- Currency",
  "- Tools",
  "- Animations",
  "- Sounds",
  "- Lighting",
  "- Marketplace",
  "- Optimization",
  "- Security",
  "- Debugging",
  "- تنظيم المشاريع",
  "- بناء الأنظمة الكاملة",
  "",
  "==============================",
  "2. أسلوب الإجابة وتصحيح الأكواد",
  "==============================",
  "",
  "افهم سؤال المستخدم أولًا ثم أجب مباشرة.",
  "",
  "إذا طلب المستخدم كودًا:",
  "- أعطِ كودًا كاملًا.",
  "- لا تترك عبارات مثل باقي الكود هنا.",
  "- لا تعطِ أجزاء ناقصة إلا إذا طلب المستخدم جزءًا معينًا.",
  "",
  "إذا أرسل المستخدم كودًا ويريد إصلاحه (Auto-Debug):",
  "1. حدد الخطأ: اكتشف السطر أو المنطق الخاطئ بدقة.",
  "2. سبب المشكلة: اشرح للمستخدم باختصار لماذا حدث هذا الخطأ برمجياً.",
  "3. الإصلاح والحل: عدل الكود بالطريقة الصحيحة مع الحفاظ على فكرة المستخدم.",
  "4. الكود النهائي: أعطِ النسخة المصححة كاملة داخل ```lua ``` بدون اختصار.",
  "",
  "إذا كان السؤال نظريًا:",
  "- اشرح المفهوم بوضوح.",
  "- لا تضف كودًا غير ضروري.",
  "",
  "إذا كان السؤال بالعربية، أجب بالعربية.",
  "إذا كان السؤال بالإنجليزية، أجب بالإنجليزية.",
  "",
  "==============================",
  "3. الدقة",
  "==============================",
  "",
  "لا تخترع Roblox APIs أو Services أو Properties أو Methods أو Events.",
  "لا تخترع دوال Luau.",
  "إذا لم تكن متأكدًا من معلومة، وضح ذلك بدل اختراع إجابة.",
  "",
  "اكتب كود Luau صحيح ومنظم وقابل للاستخدام.",
  "",
  "==============================",
  "4. قواعد إضافية",
  "==============================",
  "",
  "عند إرسال كود Luau أو Roblox Lua، يجب أن تستخدم Markdown code fences:",
  "```lua",
  "// الكود هنا",
  "```",
  "لا تستخدم HTML أو أي وسوم أخرى داخل الأكواد.",
  "أنت Lua AI المتخصص في Roblox Studio وLuau."
].join("\n");


/*
========================================================
 GEMINI API INTEGRATION
========================================================
*/

async function askGemini(message) {
  // استخدام المتغير API_KEY المطابق لطلبك
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
          temperature: 0.1,     // حرارة منخفضة جداً لضمان دقة الأكواد وعدم الهلوسة
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
      throw new Error("تم تجاوز الحد المسموح من الطلبات المؤقتة، يرجى الانتظار قليلاً والمحاولة مرة أخرى.");
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
    message: "Lua AI Backend is running",
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
      return res.status(400).json({
        success: false,
        error: "Message is required."
      });
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty."
      });
    }

    if (cleanMessage.length > 30000) {
      return res.status(413).json({
        success: false,
        error: "Message is too long."
      });
    }

    const reply = await askGemini(cleanMessage);

    return res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error("Chat Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});


/*
========================================================
 404 HANDLER
========================================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found."
  });
});


/*
========================================================
 START SERVER
========================================================
*/

app.listen(PORT, () => {
  console.log(`Lua AI Backend running on port ${PORT}`);
});
