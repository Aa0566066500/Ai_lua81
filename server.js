// المحرك الأقوى والأشمل للتحليل والفحص البرمجي العميق (The Ultimate Code Inspector)
runEditorCheckBtn.onclick = async () => {
    const code = editorCodeInput.value.trim();
    if (!code) {
        editorOutputBox.innerHTML = '<span style="color:#f85149;">[خطأ نظام]: الرجاء كتابة أو لصق كود Luau لبدء التشريح والفحص الشامل.</span>';
        return;
    }

    editorOutputBox.innerHTML = '';
    userScrolledUpOutput = false;

    // رسالة بدء التشريح الكامل
    editorOutputBox.textContent = "[SYSTEM DEEP SCAN]: جاري قراءة كل سطر ومتغير ودالة في المحرر...\n[ANALYZING]: فحص النطاقات (Scopes)، الـ Nil references، الأمان، والمنطق البرمجي...\n\n";
    scrollToBottomOutput();

    try {
        const promptText = `أنت أعلى خبير هندسة برمجيات، ومحلل أكواد متقدم جداً في لغة Luau وبيئة Roblox. المطلوب منك **فحص وتدقيق وتحليل كل كلمة، سطر، متغير، دالة، وحلقة تكرار** موجودة في هذا الكود بدقة متناهية لا تترك شاردة ولا واردة.

        قم بإعداد تقرير هندسي وتقني شامل يتضمن الآتي:
        1. **تحليل هيكلي تفصيلي (Line-by-Line & Architectural Breakdown):** اشرح بوضوح ماذا يفعل كل جزء وكل سطر رئيسي في الكود، وحدد الغرض من كل متغير ودالة ومكون روبلوكس يتم التعامل معه.
        2. **التدقيق الشامل للأخطاء المنطقية والـ Nil والـ Scope:** افحص كل متغير لتتأكد من عدم وجود تضارب في النطاق أو قراءة قيم مفقودة (Nil references) أو تسريب للذاكرة.
        3. **الفحص الأمني والأداء (Security & Performance Audit):** كشف أي ثغرات في الـ Remotes، الحلقات اللانهائية التي تسبب تعليق السيرفر (Crashes)، أو العمليات الثقيلة داخل أحداث الـ RenderStepped.
        4. **التصحيح الشامل والجذري (The Ultimate Corrected Script):** قدم الكود كاملاً، محسناً، مؤمناً، وخالياً من أي أخطاء بنسبة 100%، مع إضافة تعليقات واضحة داخل الكود (Inline Comments) توضح التعديلات التي تم إجراؤها ولماذا.

        إليك الكود المراد تحليله وفحصه بالكامل:\n\n\`\`\`lua\n${code}\n\`\`\``;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: promptText })
        });
        const data = await response.json();

        editorOutputBox.innerHTML = ''; // مسح رسالة التشغيل

        if (data.success) {
            const auditReport = data.reply;
            // طباعة التقرير الكامل حرفاً بحرف بسرعة فائقة وانيميشن سلس
            for (let i = 0; i < auditReport.length; i++) {
                editorOutputBox.textContent += auditReport[i];
                scrollToBottomOutput();
                await new Promise(r => setTimeout(r, 3)); // سرعة فائقة جداً ودقة رعاية كاملة
            }
        } else {
            editorOutputBox.textContent = "[فشل الفحص]: " + (data.error || "حدث خطأ غير متوقع أثناء عملية التشريح.");
        }
    } catch (err) {
        editorOutputBox.textContent = "[خطأ اتصال]: تعذر الاتصال بمحرك التحليل العميق. تحقق من الإنترنت وحاول مرة أخرى.";
    }
};
