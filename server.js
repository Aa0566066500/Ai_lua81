const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// نقطة النهاية للدردشة والتحليل (API)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'الرسالة فارغة' });
        }

        // هنا يتم معالجة الطلب أو ربطه بمحرك الذكاء الاصطناعي
        // رد تجريبي احترافي للتأكد من عمل السيرفر بنجاح
        const reply = `تم استلام طلبك وتحليله بنجاح بواسطة محرك Lua AI Pro الخارق:\n\n\`\`\`lua\n-- السكربت المصحح والمطور\nlocal function OnServerEvent(player)\n    print("تم تنفيذ الطلب بنجاح وبأمان تام لأجل: " .. player.Name)\nend\n\`\`\``;

        res.json({ success: true, reply });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
