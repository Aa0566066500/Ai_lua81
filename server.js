const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

// اسم مفتاح Gemini الموجود في Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// السماح بالطلبات
app.use(cors());
app.use(express.json());

// فحص السيرفر
app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Lua AI Backend is running"
    });
});

// API الدردشة
app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "الرسالة غير موجودة"
            });

        }

        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                error: "GEMINI_API_KEY غير موجود في Render"
            });

        }


        const systemPrompt = `
أنت Lua AI، مساعد متخصص في برمجة Roblox Studio.

مهمتك مساعدة المستخدم في:

- Luau / Lua
- Roblox Studio
- Scripts
- LocalScripts
- ModuleScripts
- RemoteEvents
- RemoteFunctions
- DataStore
- GUI
- Players
- ReplicatedStorage
- ServerScriptService
- Workspace
- TweenService
- إصلاح الأخطاء
- شرح الأكواد
- إنشاء أنظمة Roblox

عندما يطلب المستخدم كوداً:
1. اكتب الكود بلغة Luau.
2. استخدم code block بهذا الشكل:

\`\`\`lua
ضع الكود هنا
\`\`\`

3. اشرح باختصار أين يضع المستخدم الكود.
4. لا تستخدم كوداً خطيراً أو ضاراً.
5. إذا كان السؤال غير متعلق بـ Roblox أو البرمجة، أجب باختصار ووجّه المستخدم إلى موضوع Roblox/Luau.

كن واضحاً ومختصراً.
`;


        const prompt = `${systemPrompt}

رسالة المستخدم:

${message}`;


        // استدعاء Gemini API
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 4096
                    }
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            console.error("Gemini Error:", data);

            return res.status(500).json({
                error: "حدث خطأ من Gemini API"
            });

        }


        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!reply) {

            return res.status(500).json({
                error: "لم يصل رد من Gemini"
            });

        }


        res.json({
            reply: reply
        });


    } catch (error) {

        console.error("Server Error:", error);

        res.status(500).json({
            error: "حدث خطأ في السيرفر"
        });

    }

});


app.listen(PORT, () => {

    console.log(`Lua AI server running on port ${PORT}`);

});