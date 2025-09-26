import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  Bot, 
  User,
  Loader2,
  MapPin,
  Phone,
  Clock
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  isStructured?: boolean;
  structuredData?: any;
}

interface ChatBotProps {
  currentPage: string;
  isOpen: boolean;
  onToggle: () => void;
}

// Todo: remove mock data and implement real Gemini API integration
const mockBankBranches = [
  {
    name: "Bhalchandra Finance - Mumbai Central",
    address: "123 Main Street, Mumbai Central, Mumbai - 400008",
    phone: "+91 22 1234 5678",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
  },
  {
    name: "Bhalchandra Finance - Andheri",
    address: "456 Business Park, Andheri East, Mumbai - 400069",
    phone: "+91 22 8765 4321",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
  },
  {
    name: "Bhalchandra Finance - Pune",
    address: "789 Commercial Complex, Pune - 411001",
    phone: "+91 20 1111 2222",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
  }
];

export function ChatBot({ currentPage, isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI financial assistant. I can help you with loan calculations, gold loan queries, and provide information about our services. How can I assist you today?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string | { content: string; structuredData: any }> => {
    try {
      // Prepare conversation history for API
      const conversationHistory = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'model' as const,
          content: msg.content
        }));

      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          message: userMessage,
          currentPage,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.structuredData) {
        return {
          content: data.response,
          structuredData: data.structuredData
        };
      }

      return data.response;

    } catch (error) {
      console.error('Error calling chat API:', error);

      // Fallback to context-aware responses if API fails
      const lowerMessage = userMessage.toLowerCase();

      if (currentPage === 'services' && lowerMessage.includes('service')) {
        return "I can see you're on our Services page! We offer EMI calculations, gold loans, personal loans, and investment planning. Which service would you like to know more about?";
      }

      if (lowerMessage.includes('branch') || lowerMessage.includes('office') || lowerMessage.includes('location')) {
        return {
          content: "Here are our branch locations where you can visit for personalized service:",
          structuredData: {
            type: 'branches',
            data: mockBankBranches
          }
        };
      }

      return "I'm experiencing some technical difficulties right now, but I'm here to help! Could you please try rephrasing your question, or feel free to contact our customer service at +91 22 1234 5678 for immediate assistance.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await getAIResponse(inputValue);

      let botMessage: Message;

      if (typeof response === 'string') {
        botMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          isUser: false,
          timestamp: new Date(),
        };
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          isUser: false,
          timestamp: new Date(),
          isStructured: true,
          structuredData: response.structuredData,
        };
      }

      setMessages(prev => [...prev, botMessage]);
      console.log('AI Response sent:', response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStructuredData = (data: any) => {
    if (data.type === 'branches') {
      return (
        <div className="space-y-3 mt-3">
          {data.data.map((branch: any, index: number) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">{branch.name}</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{branch.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[32rem]'
    }`} data-testid="card-chatbot">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Context: {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              data-testid="button-minimize-chat"
              className="h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              data-testid="button-close-chat"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-hidden p-3">
            <div className="h-80 overflow-y-auto space-y-4" data-testid="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    message.isUser ? 'bg-primary/10' : 'bg-muted/50'
                  }`}>
                    {message.isUser ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${
                    message.isUser ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`p-3 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted/50'
                    }`} data-testid={`message-${message.id}`}>
                      {message.content}
                      {message.isStructured && message.structuredData && (
                        renderStructuredData(message.structuredData)
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-full bg-muted/50">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about loans, rates, services..."
                className="flex-1"
                disabled={isTyping}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-xs">
                Powered by AI • Context-aware responses
              </Badge>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}