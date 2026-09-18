const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'الرسالة فارغة' });
        }

        // قراءة المفتاح باسم API_KEY
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                success: false, 
                error: 'مفتاح API_KEY غير مضاف في Environment Variables داخل Render.' 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "أنت خبير أمن برمجيات وهندسة سيبرانية وتطوير في Roblox و Luau. قم بتحليل وتشريح الأكواد المرسلة بدقة متناهية سطر بسطر، واكشف الأخطاء الإملائية والمنطقية، والثغرات الأمنية، وقدم السكربت المصحح بالكامل بشكل احترافي وباللغة العربية."
        });

        const result = await model.generateContent(message);
        const responseText = result.response.text();

        res.json({ success: true, reply: responseText });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
