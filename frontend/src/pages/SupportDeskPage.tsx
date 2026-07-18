import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  LifeBuoy, 
  Send, 
  MessageSquare, 
  Loader2,
  Search,
  BookOpen,
  HelpCircle,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
}

interface SupportDeskPageProps {
  onBack: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  } | null;
}

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

export function SupportDeskPage({ onBack, user }: SupportDeskPageProps) {
  const { toast } = useToast();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, accordion, and dialog states
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);

  // Form states
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const faqs: FAQCategory[] = [
    {
      category: "Getting Started",
      items: [
        {
          q: "What is Bhalchandra Finance?",
          a: "Bhalchandra Finance is a digital financial platform offering secure loan options, online calculators (EMI, Gold, FD), and an interactive assistant to help you navigate your capital needs."
        },
        {
          q: "How do I submit a loan application?",
          a: "Browse our list of Services, evaluate your rates using our built-in calculators, and click the 'Apply Now' buttons. The digital form will ask you to review pre-filled rates and upload documents."
        },
        {
          q: "What documents are required for KYC?",
          a: "We require digital copies of your PAN card, Aadhaar card, and latest income proof (salary slips or statements). These can be uploaded in the KYC & Document Vault section of your dashboard."
        }
      ]
    },
    {
      category: "Account & Payments",
      items: [
        {
          q: "What are the interest rates for loans?",
          a: "Our home and EMI calculator loans start from 8.5% p.a., whereas our gold loans start from 12% p.a. Actual rates depend on your credit score and background verification."
        },
        {
          q: "How can I pay my monthly EMI dues?",
          a: "EMIs are auto-debited or can be repaid manually in your active loans panel using UPI, net banking, or debit card options."
        },
        {
          q: "Is my personal data securely stored?",
          a: "Yes. All uploads are encrypted using 256-bit bank-level secure servers and follow regulatory compliance to ensure absolute security and user privacy."
        }
      ]
    }
  ];

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing authentication token");
      }

      const response = await fetch("/api/support-tickets", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch support tickets");
      }

      const data = await response.json();
      setSupportTickets(data.tickets || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setTicketSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDescription,
          category: ticketCategory,
          priority: ticketPriority
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Ticket Raised Successfully",
          description: `Your ticket has been raised with ticket number: ${data.ticket.ticketNumber}.`,
        });
        setTicketSubject("");
        setTicketDescription("");
        setTicketCategory("general");
        setTicketPriority("medium");
        setIsRaiseTicketOpen(false);
        fetchTickets();
      } else {
        toast({
          title: "Submission Failed",
          description: data.error || "Failed to raise support ticket.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Could not connect to the support backend.",
        variant: "destructive"
      });
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Filter FAQs based on search input
  const filteredFaqs = faqs.map(cat => ({
    category: cat.category,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const toggleFAQ = (question: string) => {
    if (expandedFAQ === question) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(question);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-16 relative">
      {/* Decorative ambient color blobs */}
      <div className="absolute top-0 right-10 -z-10 w-[550px] h-[550px] bg-primary/5 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-96 left-5 -z-10 w-[450px] h-[450px] bg-purple-500/5 rounded-full filter blur-3xl opacity-40 pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-4 border-b border-border/40">
        <div className="flex items-start gap-5">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            data-testid="page-back-button"
            className="h-10 w-10 rounded-lg border border-border bg-card text-primary hover:bg-muted transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-3 flex-1 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Support Desk
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Bhalchandra Finance HelpCenter and ticketing support platform.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsRaiseTicketOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 rounded-xl flex items-center gap-2 self-start sm:self-center shrink-0 shadow-md hover:shadow-primary/20 transition-all duration-300"
        >
          <LifeBuoy className="h-5 w-5" />
          Raise a Ticket
        </Button>
      </div>

      {/* 1. HERO SEARCH SECTION */}
      <div className="text-center py-12 w-full max-w-4xl mx-auto space-y-6">
        <h2 className="text-5xl font-extrabold tracking-tight text-foreground leading-tight sm:text-6xl lg:text-7xl">
          How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 border-b-[4px] border-primary/80 pb-1.5">help you?</span>
        </h2>
        <div className="relative mt-8 w-full max-w-2xl mx-auto group">
          <Search className="absolute left-5 top-4.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Start typing your search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-full border border-border bg-card/65 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/45 text-sm sm:text-base text-foreground shadow-md transition-all duration-300"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Or <span className="font-semibold text-primary">choose an option</span> below to find immediate troubleshooting guides and instructions.
        </p>
      </div>

      {/* 2. CATEGORY CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="bg-gradient-to-br from-card to-primary/5 border border-border/50 rounded-2xl p-8 text-center space-y-5 hover:border-primary/50 hover:shadow-[0_0_40px_-5px_rgba(116,71,255,0.12)] hover:-translate-y-1 transition duration-300 shadow-sm flex flex-col items-center group cursor-pointer">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Guides</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Detailed manuals and step-by-step walkthroughs to configure applications and calculate EMIs.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-primary/5 border border-border/50 rounded-2xl p-8 text-center space-y-5 hover:border-primary/50 hover:shadow-[0_0_40px_-5px_rgba(116,71,255,0.12)] hover:-translate-y-1 transition duration-300 shadow-sm flex flex-col items-center group cursor-pointer">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">FAQ</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Quick answers to frequently asked questions regarding loan approvals, documents, and terms.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-primary/5 border border-border/50 rounded-2xl p-8 text-center space-y-5 hover:border-primary/50 hover:shadow-[0_0_40px_-5px_rgba(116,71,255,0.12)] hover:-translate-y-1 transition duration-300 shadow-sm flex flex-col items-center group cursor-pointer">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Community</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Interact with our finance officers and view public announcements regarding upcoming services.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FAQ ACCORDIONS */}
      <div className="w-full space-y-12 pt-4 text-left">
        {filteredFaqs.map((cat, idx) => (
          <div key={idx} className="space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-3xl font-bold text-foreground">{cat.category}</h3>
              <p className="text-sm text-muted-foreground">Most popular inquiries related to {cat.category.toLowerCase()}</p>
            </div>
            
            <div className="space-y-4">
              {cat.items.map((item, fIdx) => {
                const isExpanded = expandedFAQ === item.q;
                return (
                  <div 
                    key={fIdx}
                    className="border border-border/40 rounded-xl overflow-hidden bg-card/45 backdrop-blur-md hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_-3px_rgba(116,71,255,0.06)]"
                  >
                    <button
                      onClick={() => toggleFAQ(item.q)}
                      className="w-full flex items-center justify-between p-5 text-sm sm:text-base font-bold text-foreground hover:bg-muted/10 transition-colors text-left"
                    >
                      <span className="pr-4">{item.q}</span>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-primary shrink-0 animate-in fade-in" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-border/10 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/5 animate-in slide-in-from-top-2 duration-300">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No FAQ articles match your search query. Try another term or raise a ticket below.
          </div>
        )}
      </div>

      {/* 4. TICKET HISTORY - FULL WIDTH */}
      <div className="border-t border-border/40 pt-12 w-full">
        {loading && supportTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">Loading support tickets...</p>
          </div>
        ) : (
          <Card className="border-border/60 dark:border-border shadow-md bg-card/65 backdrop-blur-md dark:bg-slate-900/80 text-left">
            <CardHeader className="p-6">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Your Support Tickets
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track the progress and updates for your raised service requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {supportTickets.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="p-4 bg-muted/30 dark:bg-slate-800/50 text-muted-foreground rounded-full">
                    <MessageSquare className="h-10 w-10" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground text-sm sm:text-base">No support tickets found</p>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      Click the "Raise a Ticket" button above to submit a support request. Our administration team will attend to it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supportTickets.map((t) => (
                    <div 
                      key={t.id} 
                      className="p-5 rounded-xl border border-border/60 dark:border-border bg-card dark:bg-slate-900/60 hover:bg-muted/15 transition-all duration-300 space-y-3.5 shadow-inner"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs sm:text-sm font-bold text-primary">{t.ticketNumber}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">• {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-foreground">{t.subject}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <Badge 
                            className={`border-none text-[10px] sm:text-xs font-bold py-0.5 px-2.5 uppercase tracking-wide hover:opacity-90 ${
                              t.status === "open"
                                ? "bg-primary/15 text-primary hover:bg-primary/15"
                                : t.status === "in_progress"
                                ? "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/15"
                                : t.status === "resolved"
                                ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </Badge>
                          <Badge 
                            className={`border-none text-[10px] sm:text-xs font-bold py-0.5 px-2.5 uppercase tracking-wide hover:opacity-90 ${
                              t.priority === "urgent"
                                ? "bg-rose-500/15 text-rose-500 hover:bg-rose-500/15"
                                : t.priority === "high"
                                ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/15"
                                : t.priority === "medium"
                                ? "bg-primary/15 text-primary hover:bg-primary/15"
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/30"
                            }`}
                          >
                            {t.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-normal">{t.description}</p>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground font-semibold pt-1 border-t border-border dark:border-border/60">
                        <span>Category: <span className="capitalize">{t.category.replace("_", " ")}</span></span>
                        {t.status === "resolved" && (
                          <span className="text-emerald-500">Resolved • Ready to close</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 5. RAISE TICKET DIALOG POP-UP */}
      <Dialog open={isRaiseTicketOpen} onOpenChange={setIsRaiseTicketOpen}>
        <DialogContent className="max-w-lg border-border/60 bg-card/95 backdrop-blur-md dark:bg-slate-900/90 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <LifeBuoy className="h-6 w-6 text-primary animate-pulse" />
              Raise Support Ticket
            </DialogTitle>
            <DialogDescription className="text-sm">
              Create a direct service request with our support desk. Our administration team will address it as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSupportTicketSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Ticket Category</Label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full h-11 border border-border dark:border-border rounded-lg p-2.5 text-xs sm:text-sm font-semibold bg-card dark:bg-slate-955 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="general">General Query / Inquiry</option>
                <option value="loan">Loan Account & EMIs</option>
                <option value="fixed_deposit">Fixed Deposit Investments</option>
                <option value="kyc">KYC & Document Verification</option>
                <option value="payment">EMI Repayment & Transfers</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Urgency Priority</Label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full h-11 border border-border dark:border-border rounded-lg p-2.5 text-xs sm:text-sm font-semibold bg-card dark:bg-slate-955 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="low">Low - General Feedback</option>
                <option value="medium">Medium - Normal Queries</option>
                <option value="high">High - Transaction Issues</option>
                <option value="urgent">Urgent - Profile Security / Errors</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-subject" className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Subject Title</Label>
              <Input
                id="ticket-subject"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="h-11 text-xs sm:text-sm rounded-lg border-border dark:border-border focus:border-primary bg-card dark:bg-slate-955 text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-desc" className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Detailed Description</Label>
              <textarea
                id="ticket-desc"
                rows={4}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Please explain the details of the problem..."
                className="w-full border border-border dark:border-border rounded-lg p-2.5 text-xs sm:text-sm bg-card dark:bg-slate-955 focus:outline-none focus:border-primary text-foreground font-sans"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRaiseTicketOpen(false)}
                className="h-11 text-xs sm:text-sm font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={ticketSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 min-w-[140px]"
              >
                {ticketSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Raising...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
