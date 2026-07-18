import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Calculator, 
  Users, 
  Check, 
  Sparkles, 
  Wallet, 
  CreditCard,
  Building2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Download,
  ArrowUpRight,
  TrendingDown,
  Play,
  PhoneCall,
  UserCheck
} from "lucide-react";

// Mockup image imports
import heroPhoneMockups from "@assets/generated_images/hero_phone_mockups.png";
import featuresExpenseMockup from "@assets/generated_images/features_expense_mockup.png";
import featuresBudgetMockup from "@assets/generated_images/features_budget_mockup.png";
import featuresVirtualCard from "@assets/generated_images/features_virtual_card.png";
import footerHandMockup from "@assets/generated_images/footer_hand_mockup.png";

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export function Hero({ onGetStarted, onLearnMore }: HeroProps) {
  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // State for interactive Steps visualization
  const [activeStep, setActiveStep] = useState<number>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      q: "How do I calculate my monthly loan EMI?",
      a: "You can use our advanced interactive EMI Calculator on the Services page. Simply enter your desired loan amount, interest rate, and tenure in months or years to see your exact monthly payout and amortization schedule instantly."
    },
    {
      q: "What documentation is required for a secure Gold Loan?",
      a: "To obtain a gold loan, you only need to submit a basic identity proof (Aadhaar, Passport, or PAN card) and your gold jewelry. We conduct our gold purity valuation in a secure vault within 15 minutes to offer instant cash disbursal."
    },
    {
      q: "How does the AI Financial Assistant help me select the right plan?",
      a: "Our AI assistant is integrated with local calculators and eligibility guidelines. You can type in your monthly income and financial objectives, and the bot will recommend the best loan type, optimal EMI, and necessary preparation steps."
    },
    {
      q: "Is my personal and financial information secure?",
      a: "Absolutely. Bhalchandra Finance adheres to stringent bank-level encryption standards. We store all profile data securely and utilize read-only tokens for calculating metrics, ensuring your credentials are never exposed."
    },
    {
      q: "What is the maximum tenure available for Home and Personal loans?",
      a: "Home loans feature flexible tenures extending up to 30 years to ensure comfortable monthly repayments. Personal loans generally provide customizable repayment options ranging from 12 to 60 months."
    }
  ];

  const stepsData = [
    {
      title: "Calculate Loan EMI",
      desc: "Select your desired loan type, principal amount, interest rate, and tenure to compute your monthly EMI instantly."
    },
    {
      title: "Consult AI Assistant",
      desc: "Converse with our intelligent AI bot to analyze your budget constraints and request eligibility guidelines."
    },
    {
      title: "Apply & Get Approved",
      desc: "Fill out our digital loan application form online and receive rapid processing from our bank partners."
    }
  ];

  // Helper for rendering mockup phone screen content in Step-by-Step section
  const renderPhoneScreenContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="flex flex-col h-full bg-slate-950 text-white p-5 justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-primary">EMI Calculator</span>
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <div className="my-auto space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-450 block font-semibold">Home Loan Estimation</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Principal</span>
                    <span className="font-bold text-white">$25,000</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Rate (p.a.)</span>
                    <span className="font-bold text-white">8.5%</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Tenure</span>
                    <span className="font-bold text-white">5 Years</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/20 p-3 rounded-lg border border-primary/30 text-center space-y-0.5">
                <span className="text-[9px] text-primary font-semibold block uppercase">Estimated EMI</span>
                <span className="text-lg font-black text-white">$512.91</span>
                <span className="text-[8px] text-slate-400 block">per month</span>
              </div>
            </div>
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-[11px] h-8 rounded-lg text-white font-semibold">
              Apply Now
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col h-full bg-slate-950 text-white p-5 justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-primary">AI Assistant</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="my-auto space-y-3 flex-1 overflow-y-auto py-2">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-850 max-w-[85%] self-end">
                <p className="text-[9px] text-slate-350">Can I apply for a gold loan with soft gold bars?</p>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20 max-w-[85%] space-y-1">
                <p className="text-[9px] text-purple-100 font-medium">
                  Yes, we accept standard gold jewelry and bars. Disbursal takes 15 minutes. Current rate is 9.2%.
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 border-t border-slate-800 pt-2">
              <div className="flex-1 bg-slate-900 rounded-md border border-slate-800 px-2 py-1 text-[9px] text-slate-500">
                Type a message...
              </div>
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                ▲
              </div>
            </div>
          </div>
        );
      case 2:
      default:
        return (
          <div className="flex flex-col h-full bg-slate-950 text-white p-5 justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-primary">Loan Checklist</span>
              <UserCheck className="h-4 w-4 text-green-400" />
            </div>
            <div className="my-auto space-y-2">
              <div className="space-y-1">
                <h4 className="text-xs font-bold">Application Status</h4>
                <p className="text-[9px] text-slate-400">Pre-approved checks completed.</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-md border border-slate-800 text-[10px]">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>KYC Documents Verified</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-md border border-slate-800 text-[10px]">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Gold Value Assessment</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-md border border-slate-800 text-[10px]">
                  <span className="text-primary font-bold">●</span>
                  <span className="font-semibold text-slate-200 animate-pulse">Awaiting Bank Approval</span>
                </div>
              </div>
            </div>
            <span className="text-center text-[8px] text-slate-500">Updating live...</span>
          </div>
        );
    }
  };

  return (
    <div className="overflow-x-hidden bg-background text-foreground min-h-screen">
      
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/10 rounded-full filter blur-3xl" />
        <div className="absolute top-20 left-10 -z-10 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-900/10 rounded-full filter blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-primary/10 rounded-full text-xs font-semibold text-primary">
              <Shield className="h-3 w-3 text-primary" />
              <span>Bhalchandra Finance • Your Success Partner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-955 dark:text-white leading-tight">
              Take Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">Financial Future</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-655 dark:text-slate-350 max-w-xl">
              Expert financial services with AI-powered guidance. From EMI calculations to gold loans, we provide comprehensive solutions tailored to your financial goals.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/15 flex items-center gap-2 border border-transparent"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onLearnMore}
                className="border-border hover:bg-muted text-foreground rounded-full px-8 py-6 text-base font-semibold bg-transparent"
              >
                Learn More
              </Button>
            </div>

            {/* Trust partners */}
            <div className="pt-6 border-t border-border/60">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Bank-level Security</span>
              </div>
            </div>
          </div>

          {/* Right Column - Mockup image */}
          <div className="relative lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl filter blur-xl opacity-70" />
              <img 
                src={heroPhoneMockups} 
                alt="Bhalchandra Finance App Mockup" 
                className="w-full relative drop-shadow-2xl z-10 select-none animate-fade-in-up"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 border border-border bg-primary/10 rounded-full text-xs font-semibold text-primary">
              Simple, Smart, Financial Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Core Services to Take Control of Your Finances
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Calculate EMIs, secure quick loans, and plan your savings with personalized assistant support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: EMI Calculator */}
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-md flex flex-col group hover:shadow-lg transition duration-200">
              <div className="p-6 space-y-4 flex-1">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                  <Calculator className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">EMI Calculator</h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                  Calculate your monthly payments instantly with our advanced calculator for Home, Car, and Personal loans.
                </p>
              </div>
              <div className="px-6 pt-2 pb-6 overflow-hidden">
                <img 
                  src={featuresBudgetMockup} 
                  alt="EMI Calculator UI mockup" 
                  className="w-full object-cover rounded-xl shadow-md border border-slate-200/20 group-hover:scale-[1.02] transition duration-300" 
                />
              </div>
            </div>

            {/* Card 2: Gold Loans */}
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-md flex flex-col group hover:shadow-lg transition duration-200">
              <div className="p-6 space-y-4 flex-1">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gold Loans</h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                  Get instant loan approvals against your gold jewelry with competitive interest rates and secure vaults.
                </p>
              </div>
              <div className="px-6 pt-2 pb-6 overflow-hidden">
                <img 
                  src={featuresVirtualCard} 
                  alt="Gold Loans Virtual Card" 
                  className="w-full object-cover rounded-xl shadow-md border border-slate-200/20 group-hover:scale-[1.02] transition duration-300" 
                />
              </div>
            </div>

            {/* Card 3: AI Assistant */}
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-md flex flex-col group hover:shadow-lg transition duration-200">
              <div className="p-6 space-y-4 flex-1">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Financial Assistant</h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                  Receive personalized, automated advice regarding your loan planning, EMIs, and document requirements.
                </p>
              </div>
              <div className="px-6 pt-2 pb-6 overflow-hidden">
                <img 
                  src={featuresExpenseMockup} 
                  alt="AI Assistant conversation summary" 
                  className="w-full object-cover rounded-xl shadow-md border border-slate-200/20 group-hover:scale-[1.02] transition duration-300" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onLearnMore}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-5 font-semibold text-sm flex items-center gap-2 shadow-sm"
            >
              Explore Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900 dark:bg-slate-900/60 text-white rounded-3xl p-8 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-primary/15 rounded-full filter blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Interactive Mockup screen */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] h-[520px] rounded-[40px] border-[12px] border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-between">
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex justify-center items-center">
                  <div className="w-12 h-1 bg-slate-900 rounded-full" />
                </div>

                {/* Screen Content */}
                <div className="flex-1 pt-6 overflow-hidden">
                  {renderPhoneScreenContent()}
                </div>
              </div>
            </div>

            {/* Right side: Steps content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <span className="px-3 py-1 border border-slate-800 bg-primary/20 rounded-full text-xs font-semibold text-primary">
                  How it Works
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Get Your Loan Processed in 3 Simple Steps
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Connecting and securing your wealth planning takes only a few quick clicks. See how it works:
                </p>
              </div>

              <div className="space-y-4">
                {stepsData.map((step, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition duration-200 ${
                      activeStep === idx 
                        ? "bg-slate-850/80 border-primary/50 shadow-md shadow-primary/5" 
                        : "bg-slate-950/20 border-slate-800/60 hover:bg-slate-850/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                      activeStep === idx ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-base leading-tight">{step.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  onClick={onGetStarted}
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8 py-5 font-semibold text-sm flex items-center gap-2 shadow-md"
                >
                  Apply Online
                  <ArrowRight className="h-4 w-4 text-background" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="py-24 bg-muted/10 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 border border-border bg-primary/10 rounded-full text-xs font-semibold text-primary">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why Thousands Trust Bhalchandra Finance
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Experience a modern, automated financial platform built for simplicity, high security, and deep planning analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 mb-6">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Bank-level Security</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Access up-to-date reports and secure document uploads with absolute protection. We maintain complete data privacy.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 mb-6">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Expert Consultation</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with our certified experts to receive professional counseling on structural investments and loan layouts.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 mb-6">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Flexible Rates & Calculators</h3>
              <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 leading-relaxed">
                Leverage precise EMI, gold loan, and investment calculators. Get custom scenario results instantly with direct applying pathways.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onLearnMore}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-5 font-semibold text-sm flex items-center gap-2 shadow-sm"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 border border-border bg-primary/10 rounded-full text-xs font-semibold text-primary">
              FAQ
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Got questions? We've got answers to help you feel confident with Bhalchandra Finance.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div 
                key={index} 
                className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-foreground hover:bg-muted/50 transition"
                >
                  <span>{item.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                
                {openFaqIndex === index && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-muted-foreground border-t border-border leading-relaxed bg-muted/10">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SUBSCRIPTION BANNER */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-primary/30 text-white rounded-3xl p-8 lg:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-[350px] h-[350px] bg-teal-500/10 rounded-full filter blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side: Subscription Copy & Form */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Apply for a Loan with Confidence
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                Ready to take control of your wealth? Join over 10,000 happy clients who plan and succeed with Bhalchandra Finance. Enter your mobile number below to request a callback.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md">
                <input 
                  type="tel" 
                  placeholder="Enter your mobile number" 
                  className="bg-slate-800/60 border border-slate-700/60 text-white rounded-full px-5 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-primary flex-1 w-full"
                  required
                />
                <Button 
                  onClick={onGetStarted}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-3.5 text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 w-full sm:w-auto flex items-center gap-1.5 justify-center"
                >
                  <PhoneCall className="h-4 w-4" />
                  Request Callback
                </Button>
              </div>
            </div>

            {/* Right side: Mockup image of hand holding phone */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[340px]">
                <img 
                  src={footerHandMockup} 
                  alt="Hand holding phone displaying financial dashboard mockup" 
                  className="w-full relative z-10 drop-shadow-2xl select-none"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[240px] h-[240px] bg-primary/20 rounded-full filter blur-3xl opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}