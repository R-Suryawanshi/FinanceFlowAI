import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, Calculator, Users } from "lucide-react";
import heroImage from "@assets/generated_images/Financial_services_hero_background_5341e9ca.png";

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export function Hero({ onGetStarted, onLearnMore }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Financial Growth and Security"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Your Financial
                <span className="text-primary block">Success Partner</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Expert financial services with AI-powered guidance. From EMI calculations to gold loans, 
                we provide comprehensive solutions tailored to your financial goals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => {
                  onGetStarted();
                  console.log('Get Started clicked');
                }}
                data-testid="button-get-started"
                className="flex items-center gap-2 text-lg px-8 py-3"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onLearnMore();
                  console.log('Learn More clicked');
                }}
                data-testid="button-learn-more"
                className="text-lg px-8 py-3 bg-background/80 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-secondary" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-secondary" />
                <span>10,000+ Happy Clients</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* EMI Calculator Card */}
            <Card className="hover-elevate cursor-pointer" data-testid="card-emi-calculator">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">EMI Calculator</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Calculate your monthly payments instantly with our advanced EMI calculator.
                </p>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  Try Calculator →
                </Button>
              </CardContent>
            </Card>

            {/* Gold Loans Card */}
            <Card className="hover-elevate cursor-pointer" data-testid="card-gold-loans">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg">Gold Loans</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Get instant loans against your gold with competitive interest rates.
                </p>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  Learn More →
                </Button>
              </CardContent>
            </Card>

            {/* Investment Planning Card */}
            <Card className="hover-elevate cursor-pointer sm:col-span-2" data-testid="card-investment">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg">AI Financial Assistant</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Get personalized financial advice with our intelligent chatbot powered by advanced AI.
                </p>
                <Button variant="secondary" className="w-full">
                  Chat with AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}