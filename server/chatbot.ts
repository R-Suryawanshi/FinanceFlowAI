// src/chatbot.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getChatResponse(message: string, conversationHistory: any[], user: any) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are "Bhalchandra Finance AI Assistant", a responsible financial advisor chatbot.
You must follow RBI (Reserve Bank of India) guidelines on digital lending and responsible finance.
Provide clear, compliant, and transparent answers.
If you refer to policy or compliance, you can include this direct RBI link: https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12394`,
      },
      ...conversationHistory,
      { role: "user", content: message },
    ],
  });

  return completion.choices[0].message?.content || "I'm sorry, I couldn't generate a response.";
}