import fetch from "node-fetch";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export class OpenAIService {
  async generateResponse(
    message: string,
    history: ChatHistoryMessage[],
    currentPage: string
  ): Promise<string> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a financial assistant for Bhalchandra Finance.
- Always use ₹
- Keep answers short, helpful and friendly
- Provide financial guidance only
- Current Page: ${currentPage}
If user asks about branches, no special JSON structure is required (Gemini format removed).`
            },

            // Chat history
            ...history.map((m) => ({
              role: m.role,
              content: m.content,
            })),

            // Latest user message
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!data?.choices || !data.choices[0]?.message?.content) {
        console.error("OpenAI unexpected response:", data);
        return "⚠️ AI response unavailable.";
      }

      return data.choices[0].message.content.trim();

    } catch (err) {
      console.error("❌ OpenAI Error:", err);
      return "⚠️ AI service unavailable. Please try later.";
    }
  }
}

export const openaiService = new OpenAIService();