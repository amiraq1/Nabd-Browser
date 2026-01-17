import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }

      const truncatedContent = content.slice(0, 50000);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `قم بتلخيص المحتوى التالي باللغة العربية بشكل واضح ومختصر:\n\n${truncatedContent}`,
          },
        ],
      });

      const textContent = message.content[0];
      const summary = textContent.type === "text" ? textContent.text : "";
      
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing:", error);
      res.status(500).json({ error: "Failed to summarize content" });
    }
  });

  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const { selectedText } = req.body;
      
      if (!selectedText || typeof selectedText !== "string") {
        return res.status(400).json({ error: "Selected text is required" });
      }

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `اشرح النص التالي بالتفصيل باللغة العربية:\n\n"${selectedText}"`,
          },
        ],
      });

      const textContent = message.content[0];
      const explanation = textContent.type === "text" ? textContent.text : "";
      
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining:", error);
      res.status(500).json({ error: "Failed to explain text" });
    }
  });

  app.post("/api/ai/ask", async (req: Request, res: Response) => {
    try {
      const { question, pageContent } = req.body;
      
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const truncatedContent = pageContent ? pageContent.slice(0, 30000) : "";

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: truncatedContent 
              ? `بناءً على محتوى الصفحة التالي:\n\n${truncatedContent}\n\nأجب عن السؤال التالي باللغة العربية:\n${question}`
              : `أجب عن السؤال التالي باللغة العربية:\n${question}`,
          },
        ],
      });

      const textContent = message.content[0];
      const answer = textContent.type === "text" ? textContent.text : "";
      
      res.json({ answer });
    } catch (error) {
      console.error("Error answering:", error);
      res.status(500).json({ error: "Failed to answer question" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
