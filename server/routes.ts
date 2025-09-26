import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService, type ChatMessage, type ChatContext } from "./geminiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, currentPage, conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const context: ChatContext = {
        currentPage: currentPage || 'home',
        conversationHistory: conversationHistory as ChatMessage[]
      };

      const response = await geminiService.generateResponse(message, context);
      
      // Check if response is structured data
      let responseData;
      try {
        responseData = JSON.parse(response);
        // If parsing succeeds, it's structured data
        res.json({
          success: true,
          response: responseData.content,
          structuredData: responseData.structuredData
        });
      } catch {
        // If parsing fails, it's plain text
        res.json({
          success: true,
          response: response
        });
      }

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        message: 'Our AI assistant is temporarily unavailable. Please try again in a moment.'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
