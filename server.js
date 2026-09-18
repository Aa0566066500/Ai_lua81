const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة مفتاح الـ API من متغيرات البيئة في Render
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, model, image } = req.body;
        
        // قائمة الموديلات بالترتيب مع تجربة البدائل تلقائياً في حال الضغط أو الخطأ 503
        let modelsToTry = [];
        if (model === '3.5-lite') {
            modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        } else {
            modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
        }

        let responseText = null;
        let lastError = null;

        // تجربة الموديلات بالترتيب حتى ينجح أحدهم
        for (const m of modelsToTry) {
            try {
                let contents = [{ text: message }];
                
                // إذا تم إرفاق صورة
                if (image && image.data) {
                    contents.push({
                        inlineData: {
                            data: image.data,
                            mimeType: image.mimeType
                        }
                    });
                }

                const response = await ai.models.generateContent({
                    model: m,
                    contents: contents,
                });

                responseText = response.text;
                if (responseText) break;
            } catch (err) {
                console.log(`Model ${m} encountered an issue, trying next...`, err.message);
                lastError = err;
            }
        }

        if (!responseText) {
            throw lastError || new Error("عذراً، جميع الموديلات مشغولة حالياً. يرجى المحاولة بعد قليل.");
        }

        res.json({ success: true, reply: responseText });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
