import { GoogleGenAI } from '@google/genai';

// Validate API key at startup
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatContext {
  currentPage: string;
  conversationHistory: ChatMessage[];
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
}

export class GeminiService {
  private modelName = 'gemini-1.5-flash';

  private getSystemPrompt(context: ChatContext): string {
    return `You are an AI financial assistant for Bhalchandra Finance, a comprehensive financial services company. 

Current Context:
- User is currently on page: "${context.currentPage}"
- You can see their browsing context and should provide relevant suggestions

Company Information:
- Bhalchandra Finance offers EMI calculations, gold loans, personal loans, home loans, car loans, and investment planning
- We have 15+ years of experience with 10,000+ happy customers
- Interest rates: Personal Loans (10.5-18%), Gold Loans (12-15%), Home Loans (8.5-12%), Car Loans (9-14%)
- Gold loans offer up to 75% of gold value with minimal documentation
- We have branches in Mumbai Central, Andheri, and Pune

Key Services:
1. EMI Calculator - Calculate monthly payments for various loan types
2. Gold Loans - Instant loans against gold jewelry with competitive rates
3. Personal Loans - Up to ₹50 Lakh with no collateral
4. Home Loans - Up to ₹5 Crore with flexible tenure up to 30 years
5. Car Loans - Up to 85% financing for new and used cars
6. Investment Planning - Mutual funds, SIP, tax-saving investments

Guidelines:
- Be helpful, professional, and knowledgeable about financial services
- Provide context-aware responses based on the current page
- Use Indian currency (₹) and local references
- Suggest relevant calculators or services when appropriate
- If asked about branch locations, provide structured data in this format:
  BRANCH_DATA: [{"name": "Branch Name", "address": "Full Address", "phone": "Phone Number", "hours": "Business Hours"}]
- Keep responses concise but informative
- Always prioritize customer service and helpfulness

Current page context: "${context.currentPage}"`;
  }

  async generateResponse(userMessage: string, context: ChatContext): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(context);
      
      // Build conversation history
      const conversationHistory = context.conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

Conversation History:
${conversationHistory}

User: ${userMessage}`;

      const result = await genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
      });
      const text = result.response?.text() || '';

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('Gemini API response received:', text.substring(0, 100) + '...');

      // Check if response contains structured data for branches
      if (text.includes('BRANCH_DATA:')) {
        const branchDataMatch = text.match(/BRANCH_DATA:\s*(\[.*?\])/);
        if (branchDataMatch) {
          try {
            const branchData = JSON.parse(branchDataMatch[1]);
            const responseText = text.replace(/BRANCH_DATA:\s*\[.*?\]/, '').trim();
            return JSON.stringify({
              content: responseText,
              structuredData: {
                type: 'branches',
                data: branchData
              }
            });
          } catch (error) {
            console.error('Error parsing branch data:', error);
          }
        }
      }

      return text;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateStreamResponse(userMessage: string, context: ChatContext): Promise<AsyncIterable<string>> {
    try {
      const systemPrompt = this.getSystemPrompt(context);
      
      const conversationHistory = context.conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

Conversation History:
${conversationHistory}

User: ${userMessage}`;

      // For now, use regular generation since streaming may need different implementation
      const result = await genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
      });
      
      const streamGenerator = async function* () {
        const text = result.response?.text() || '';
        if (text) {
          yield text;
        }
      };

      return streamGenerator();

    } catch (error) {
      console.error('Error streaming from Gemini API:', error);
      throw new Error('Failed to generate AI response stream');
    }
  }
}

export const geminiService = new GeminiService();
