const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// زيادة حد حجم البيانات لاستقبال الصور العالية الدقة
app.use(express.json({ limit: '25mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { message, image, model: requestedModel } = req.body;

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                success: false, 
                error: 'مفتاح API_KEY غير مضاف في Environment Variables داخل Render.' 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // تحديد النموذج المختار (3.5 Flash-Lite أو 3.6 Flash)
        const targetModel = (requestedModel === '3.5-lite') ? 'gemini-3.5-flash-lite' : 'gemini-3.6-flash';

        const model = genAI.getGenerativeModel({ 
            model: targetModel,
            systemInstruction: "أنت خبير أمن برمجيات وهندسة سيبرانية وتطوير في Roblox و Luau. قم بتحليل وتشريح الأكواد والصور والمرئيات المرسلة بدقة متناهية سطر بسطر، واكشف الأخطاء الإملائية والمنطقية، والثغرات الأمنية، وقدم السكربت أو الشرح المصحح بالكامل بشكل احترافي وباللغة العربية."
        });

        // إعداد مدخلات الذكاء الاصطناعي (نص + صورة إن وجدت)
        let promptContents = [];

        if (message) {
            promptContents.push(message);
        }

        if (image && image.data && image.mimeType) {
            promptContents.push({
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType
                }
            });
        }

        if (promptContents.length === 0) {
            return res.status(400).json({ success: false, error: 'لم يتم تقديم نص أو صورة للتحليل.' });
        }

        const result = await model.generateContent(promptContents);
        const responseText = result.response.text();

        res.json({ success: true, reply: responseText });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: "حدث خطأ أثناء معالجة الطلب: " + error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
