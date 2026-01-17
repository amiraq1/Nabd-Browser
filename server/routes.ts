import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import Anthropic from "@anthropic-ai/sdk";

// إعداد العميل (سيعمل حتى لو كان المفتاح غير موجود)
const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
const anthropic = apiKey
  ? new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    })
  : null;

// دالة المحاكاة الذكية (للتجربة بدون مفتاح)
function getMockResponse(
  type: "summarize" | "explain" | "ask" | "translate",
  text: string,
): string {
  if (type === "summarize") {
    return (
      "✨ **تلخيص ذكي (V2.0 Demo):**\n\n" +
      "يستعرض هذا النص أفكاراً رئيسية حول الموضوع. في النسخة الكاملة، سيقوم الذكاء الاصطناعي بقراءة النص الفعلي وتحليله بدقة. \n\n" +
      "• النقاط الرئيسية تظهر هنا.\n" +
      "• الاستنتاجات تظهر هنا.\n\n" +
      "(تم تفعيل وضع المحاكاة لعدم العثور على مفتاح API)."
    );
  }
  if (type === "explain") {
    return (
      '💡 **شرح المصطلح:**\n\n"' +
      text.substring(0, 30) +
      '..."\n\n' +
      "هذا المفهوم يشير عادةً إلى [شرح افتراضي]. في الوضع المتصل، سيتم تحليل السياق بالكامل لتقديم شرح دقيق."
    );
  }
  if (type === "translate") {
    return (
      "🌍 **ترجمة:**\n\n" +
      '"' +
      text.substring(0, 50) +
      '..."\n\n' +
      "الترجمة الافتراضية تظهر هنا. (وضع المحاكاة)"
    );
  }
  return "🤖 هذا رد تجريبي من المساعد الذكي (V2.0) لأنك تعمل في وضع التجربة.";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. تلخيص
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      if (!anthropic) {
        await new Promise((r) => setTimeout(r, 1500)); // تأخير جمالي
        return res.json({ summary: getMockResponse("summarize", content) });
      }

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          { role: "user", content: `لخص بالعربية: ${content.slice(0, 50000)}` },
        ],
      });
      res.json({ summary: (message.content[0] as any).text });
    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // 2. شرح
  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const { selectedText } = req.body;
      if (!anthropic) {
        await new Promise((r) => setTimeout(r, 1000));
        return res.json({
          explanation: getMockResponse("explain", selectedText),
        });
      }
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: `اشرح بالعربية: ${selectedText}` }],
      });
      res.json({ explanation: (message.content[0] as any).text });
    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // 3. ترجمة
  app.post("/api/ai/translate", async (req: Request, res: Response) => {
    try {
      const { selectedText, targetLang } = req.body; // targetLang default 'ar'
      if (!anthropic) {
        await new Promise((r) => setTimeout(r, 1000));
        return res.json({
          translation: getMockResponse("translate", selectedText),
        });
      }

      const lang = targetLang === "en" ? "الإنجليزية" : "العربية";

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `ترجم النص التالي إلى ${lang} بدقة مع الحفاظ على التنسيق:\n\n${selectedText}`,
          },
        ],
      });
      res.json({ translation: (message.content[0] as any).text });
    } catch (error) {
      res.status(500).json({ error: "Translation Failed" });
    }
  });

  // 3. سؤال
  app.post("/api/ai/ask", async (req: Request, res: Response) => {
    try {
      const { question } = req.body;
      if (!anthropic) {
        await new Promise((r) => setTimeout(r, 1500));
        return res.json({ answer: getMockResponse("ask", question) });
      }
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [{ role: "user", content: `أجب بالعربية: ${question}` }],
      });
      res.json({ answer: (message.content[0] as any).text });
    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
