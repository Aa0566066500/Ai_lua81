const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات السيرفر
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة محرك الذكاء الاصطناعي (سيأخذ مفتاح API من إعدادات Render تلقائياً)
const ai = new GoogleGenAI({});

// نقطة النهاية (API) لاستقبال الأكواد وفحصها
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'الرسالة فارغة' });
        }

        // الاتصال بنموذج Gemini لفحص الكود
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: "أنت خبير أمن برمجيات وهندسة سيبرانية وتطوير في Roblox و Luau. قم بتحليل وتشريح الأكواد المرسلة بدقة متناهية سطر بسطر، واكشف الأخطاء الإملائية والمنطقية، والثغرات الأمنية، وقدم السكربت المصحح بالكامل بشكل احترافي وباللغة العربية."
            }
        });

        const reply = response.text || "لم يتم استلام رد من نموذج التحليل.";
        res.json({ success: true, reply });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: "فشل الاتصال بالذكاء الاصطناعي. تأكد من إضافة GEMINI_API_KEY في منصة Render." });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
