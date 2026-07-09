import fetch from "node-fetch";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

function generateMockResponse(message: string, currentPage: string): string {
  const msg = message.toLowerCase();
  
  // Hindi & Marathi Devanagari script detection and response logic
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  if (hasDevanagari) {
    if (msg.includes("कर्ज") || msg.includes("लोन") || msg.includes("ऋण")) {
      if (msg.includes("सोने") || msg.includes("गोल्ड")) {
        return "नक्कीच! भालचंद्र फायनान्स ९.५% व्याजदराने गोल्ड लोन (सोने तारण कर्ज) प्रदान करते. आपण आमच्या गोल्ड लोन कॅल्क्युलेटरचा वापर करू शकता.";
      }
      if (msg.includes("घर") || msg.includes("गृह")) {
        return "आम्ही ८.७५% व्याजदराने गृह कर्ज (Home Loan) उपलब्ध करून देतो. आपण पोर्टलवरून थेट अर्ज करू शकता.";
      }
      return "भालचंद्र फायनान्समध्ये आपल्याला गृह कर्ज (Home Loan), सोने कर्ज (Gold Loan) आणि वैयक्तिक कर्ज (Personal Loan) मिळतील. अधिक माहितीसाठी आपल्या डॅशबोर्डला भेट द्या!";
    }
    
    if (msg.includes("पत्ता") || msg.includes("शाखा") || msg.includes("पत्ता") || msg.includes("संपर्क")) {
      return "आमचे मुख्य कार्यालय कसबा पेठ जिंतूर, परभणी, महाराष्ट्र ४३१४०२ येथे आहे. आपण आमच्याशी +९१ २२ १२३४ ५६७८ वर संपर्क साधू शकता.";
    }
    
    if (msg.includes("नमस्ते") || msg.includes("नमस्कार") || msg.includes("हॅलो")) {
      return "नमस्कार! मी आपला भालचंद्र फायनान्स सहाय्यक आहे. मी आपली काय मदत करू?";
    }
    
    return "मी आपला भालचंद्र फायनान्स सहाय्यक आहे. मी आपल्याला कर्ज, गोल्ड लोन, व्याजदर आणि इतर योजनांची माहिती मराठी किंवा हिंदीमध्ये देऊ शकतो. आपली काय विचारणा आहे?";
  }

  if (msg.includes("loan") || msg.includes("apply")) {
    if (msg.includes("gold")) {
      return "Sure! Bhalchandra Finance offers Gold Loans starting at 9.5% interest. You can check your eligibility using our Gold Loan Calculator and click 'Apply Now' to submit your application.";
    }
    if (msg.includes("home")) {
      return "We offer Home Loans with attractive interest rates starting at 8.75% per annum. You can apply directly on our portal by going to the Services menu.";
    }
    if (msg.includes("car")) {
      return "Looking for a new ride? Our Car Loans offer up to 90% financing on road price with tenures up to 7 years.";
    }
    return "Bhalchandra Finance offers multiple loan options: Home Loans, Gold Loans, Personal Loans, and Car Loans. Go to the Services tab or click 'Apply for Loan' on your Dashboard to get started!";
  }
  
  if (msg.includes("emi") || msg.includes("calculator") || msg.includes("pay")) {
    return "You can use our EMI Calculator to calculate your monthly installments. If you have an active loan, you can pay your monthly EMI directly from the Overview tab of your Dashboard using UPI, Card, or NetBanking.";
  }
  
  if (msg.includes("fd") || msg.includes("fixed deposit") || msg.includes("invest")) {
    return "Our Fixed Deposits (FD) offer high returns up to 7.8% interest. You can book an FD instantly from the FD Calculator page, and your investments will display on your Admin/User dashboard.";
  }
  
  if (msg.includes("kyc") || msg.includes("document") || msg.includes("vault")) {
    return "You can upload and track your Aadhaar, PAN, and salary slips inside the 'KYC & Document Vault' tab on your User Dashboard. Once submitted, our team reviews them within 2 hours.";
  }
  
  if (msg.includes("branch") || msg.includes("address") || msg.includes("contact") || msg.includes("where")) {
    return "Our main office is located at Kasba Peth Jintur, Parbhani, Maharashtra 431402. You can contact us at +91 22 1234 5678 or email info@bhalchandrafinance.com.";
  }
  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! How can I help you with your Bhalchandra Finance accounts, loans, or fixed deposits today?";
  }
  
  return "I'm your Bhalchandra Finance assistant. I can guide you through our Gold Loans, Home Loans, EMI Calculator, and Fixed Deposits. Let me know what you'd like to explore!";
}

export class OpenAIService {
  async generateResponse(
    message: string,
    history: ChatHistoryMessage[],
    currentPage: string
  ): Promise<string> {
    // If no API key is configured, fallback to rule-based mock responses with simulated delay
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "undefined" || process.env.OPENAI_API_KEY === "") {
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockResponse(message, currentPage);
    }

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
- Answer in the same language the user addresses you in (English, Hindi/Hinglish, or Marathi).
- Current Page: ${currentPage}`
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
        console.error("OpenAI unexpected response, using fallback:", data);
        return generateMockResponse(message, currentPage);
      }

      return data.choices[0].message.content.trim();

    } catch (err) {
      console.error("❌ OpenAI Error, using fallback:", err);
      return generateMockResponse(message, currentPage);
    }
  }
}

export const openaiService = new OpenAIService();