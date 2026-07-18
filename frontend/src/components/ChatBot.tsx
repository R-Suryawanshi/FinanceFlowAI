import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Loader2,
  Volume2,
  VolumeX,
  Mic
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

  // Voice Chat States
  const [micLang, setMicLang] = useState<"en-IN" | "hi-IN" | "mr-IN">("en-IN");
  const [isListening, setIsListening] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages]);

  // Voice Speech synthesis (Text-to-Speech)
  const speakResponse = (text: string) => {
    if (!isSoundOn) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    // Remove emojis for cleaner voice reading
    const cleanText = text.replace(/[👋⚠️🤖🎙️💬🇮🇳🇺🇸]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect language script structure
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (hasDevanagari) {
      if (micLang === "mr-IN") {
        utterance.lang = "mr-IN";
      } else {
        utterance.lang = "hi-IN";
      }
    } else {
      utterance.lang = "en-IN";
    }

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when chat closes or minimizes
  useEffect(() => {
    if (!isOpen || isMinimized) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, isMinimized]);

  // Speech recognition listener hook (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputValue(text);
          // Auto send spoken query
          setTimeout(() => {
            handleSendMessageWithText(text);
          }, 350);
        }
      };
      
      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, [micLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = micLang;
      recognitionRef.current.start();
    }
  };

  // =======================
  // SEND MESSAGE
  // =======================
  const handleSendMessage = () => {
    handleSendMessageWithText(inputValue);
  };

  const handleSendMessageWithText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("authToken");

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
          conversationHistory: messages.concat(userMessage).map((msg) => ({
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
      
      // Speak the response if enabled
      speakResponse(botMessage.content);
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

  // Intercom-style chat overlay portal
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed z-[9999] flex flex-col items-end gap-4 pointer-events-none" style={{ bottom: "24px", right: "24px" }}>
      {/* Floating Chat Panel */}
      <Card
        className={`shadow-2xl border rounded-2xl flex flex-col bg-background/90 backdrop-blur-md border-white/10 transition-all duration-300 origin-bottom-right pointer-events-auto ${
          isMinimized 
            ? "h-16 w-80" 
            : "h-[32rem] max-h-[calc(100vh-120px)] w-[calc(100vw-48px)] sm:w-96"
        } ${
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0 w-0 overflow-hidden border-none shadow-none"
        }`}
      >
        <div className="p-4 border-b border-border flex flex-row justify-between items-center shrink-0 bg-muted/20 rounded-t-2xl">
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
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
              onClick={() => {
                const nextSound = !isSoundOn;
                setIsSoundOn(nextSound);
                if (!nextSound && typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={isSoundOn ? "Mute Voice Response" : "Unmute Voice Response"}
            >
              {isSoundOn ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground/60" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg" 
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] text-xs p-3 rounded-2xl shadow-xs leading-relaxed ${
                      msg.isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                        : "bg-muted/65 text-foreground rounded-tl-none font-medium"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[9px] opacity-60 mt-1 text-right">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  AI is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-3 border-t shrink-0">
              {/* Mic Language selector options pill row */}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Voice Language</span>
                <div className="flex gap-1">
                  {(["en-IN", "hi-IN", "mr-IN"] as const).map((lang) => (
                    <Button
                      key={lang}
                      variant="ghost"
                      className={`h-5 px-1.5 text-[8px] font-bold rounded-md transition-all ${
                        micLang === lang 
                          ? "bg-primary text-primary-foreground hover:bg-primary shadow-2xs" 
                          : "bg-muted/30 text-muted-foreground border-border border hover:bg-muted"
                      }`}
                      onClick={() => setMicLang(lang)}
                    >
                      {lang === "en-IN" ? "ENG" : lang === "hi-IN" ? "हिंदी" : "मराठी"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Record Mic Trigger Button */}
                <Button
                  onClick={toggleListening}
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-xl shrink-0 transition-all ${
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-200" 
                      : "border-border hover:bg-muted text-muted-foreground hover:text-primary"
                  }`}
                  title={isListening ? "Stop listening" : "Start speaking"}
                >
                  <Mic className={`h-4 w-4 ${isListening ? "animate-bounce" : ""}`} />
                </Button>

                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isListening 
                      ? "Listening... Speak now..." 
                      : micLang === "en-IN" 
                      ? "Ask about loans, EMI..." 
                      : micLang === "hi-IN"
                      ? "ऋण, ब्याजदर या EMI बद्दल विचारा..."
                      : "कर्ज, व्याज किंवा EMI बद्दल विचारा..."
                  }
                  className="flex-1 bg-background/50 h-10 text-xs rounded-xl"
                  disabled={isTyping || isListening}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  disabled={!inputValue.trim() || isTyping || isListening}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="text-[10px] bg-muted/30 backdrop-blur-xs">
                  Powered by OpenAI • Context-aware
                </Badge>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Floating Action Button */}
      <Button
        onClick={onToggle}
        size="icon"
        className={`h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border-none flex items-center justify-center shrink-0 select-none pointer-events-auto ${
          isOpen ? "ring-4 ring-primary/10 shadow-primary/20" : "shadow-primary/20"
        }`}
      >
        <div className="relative h-6 w-6 flex items-center justify-center">
          <MessageCircle 
            className={`h-6 w-6 absolute transition-all duration-300 transform ${
              isOpen ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
            }`} 
          />
          <X 
            className={`h-6 w-6 absolute transition-all duration-300 transform ${
              isOpen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
            }`} 
          />
        </div>
      </Button>
    </div>,
    document.body
  );
}