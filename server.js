const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, image, systemInstruction } = req.body;
        
        let modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash'];
        let responseText = null;
        let lastError = null;

        for (const m of modelsToTry) {
            try {
                let contents = [{ text: message }];
                if (image && image.data) {
                    contents.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
                }

                const config = { tools: [{ googleSearch: {} }] };
                if (systemInstruction) {
                    config.systemInstruction = systemInstruction;
                }

                const response = await ai.models.generateContent({
                    model: m,
                    contents: contents,
                    config: config
                });

                responseText = response.text;
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (!responseText) {
            throw new Error(lastError?.message || "عذراً، حدث خطأ أثناء المعالجة.");
        }
        res.json({ success: true, reply: responseText });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
