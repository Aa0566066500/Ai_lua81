const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة محرك الذكاء الاصطناعي الحقيقي
const ai = new GoogleGenAI();

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'الرسالة فارغة' });
        }

        // الاتصال بنموذج الذكاء الاصطناعي لتحليل الكود أو الرد على الدردشة بشكل حقيقي
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: "أنت خبير أمن برمجيات وهندسة سيبرانية وتطوير في Roblox و Luau. عندما يرسل المستخدم كوداً للفحص أو للدردشة، قم بتحليله وتشريحه بدقة متناهية سطر بسطر، واكشف الأخطاء والثغرات الأمنية ومشاكل السيرفر، وقدم السكربت المصحح والمؤمن بالكامل بشكل احترافي."
            }
        });

        const reply = response.text || "لم يتم استلام رد من نموذج التحليل.";
        res.json({ success: true, reply });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
