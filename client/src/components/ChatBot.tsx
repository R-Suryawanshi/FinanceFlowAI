import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  currentPage: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatBot({ currentPage, isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "👋 Hello! I'm your AI assistant. I can help with loans, EMI, gold loans, branch info and more. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages]);

  // =======================
  // SEND MESSAGE
  // =======================
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("authToken"); // FIXED TOKEN

      if (!token) {
        throw new Error("Unauthorized: No token found");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.content
          })),
          currentPage
        })
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "⚠️ I am having trouble responding.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "⚠️ Unable to connect to the server. Please try again later.",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Floating button
  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        size="icon"
        className="fixed bottom-6 left-6 md:left-12 h-16 w-16 rounded-full border border-primary/30 shadow-xl bg-background text-primary hover:bg-primary/10 z-[9999]"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    );
  }

  // Chat window
  return (
    <div className="fixed bottom-6 left-6 md:left-12 z-[9999]">
      <Card
        className={`shadow-2xl transition-all duration-300 border rounded-2xl ${
          isMinimized ? "h-16 w-80" : "h-[32rem] w-96"
        } bg-background`}
      >
        <CardHeader className="pb-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Context: {currentPage.toUpperCase()}
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-hidden p-3">
              <div className="h-80 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-full ${
                        msg.isUser ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      {msg.isUser ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] text-sm p-3 rounded-lg ${
                        msg.isUser
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {msg.content}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI is typing...
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
                  placeholder="Ask about loans, EMI, gold loans..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  Powered by OpenAI • Context-aware
                </Badge>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}