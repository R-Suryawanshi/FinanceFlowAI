import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Coins, 
  Home, 
  Car, 
  CreditCard, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface ServicesPageProps {
  onNavigateToCalculator: (type: 'emi' | 'gold' | 'fd') => void;
  onGetStarted: () => void;
  onPageChange?: (page: string) => void;
  onBack?: () => void;
}

export function ServicesPage({ onNavigateToCalculator, onGetStarted, onPageChange, onBack }: ServicesPageProps) {
  const services = [
    {
      id: 'emi-calculator',
      title: 'EMI Calculator',
      description: 'Calculate your Equated Monthly Installments for various types of loans with our advanced calculator.',
      icon: Calculator,
      features: ['Home Loans', 'Car Loans', 'Personal Loans', 'Business Loans'],
      rate: 'Starting from 8.5% p.a.',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-955/10',
      iconColor: 'text-indigo-400 bg-indigo-900/20',
      borderColor: 'border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500/55 hover:shadow-indigo-500/5',
      badgeColor: 'border-indigo-900/40 text-indigo-400 bg-indigo-950/20',
      cta: 'Calculate EMI',
      ctaAction: () => onNavigateToCalculator('emi')
    },
    {
      id: 'gold-loans',
      title: 'Gold Loans',
      description: 'Get instant loans against your gold jewelry with competitive interest rates and minimal documentation.',
      icon: Coins,
      features: ['Up to 75% of gold value', 'Minimal documentation', 'Quick approval', 'Secure gold storage'],
      rate: 'Starting from 12% p.a.',
      bgColor: 'bg-amber-50/50 dark:bg-amber-955/10',
      iconColor: 'text-amber-400 bg-amber-900/20',
      borderColor: 'border-amber-100 dark:border-amber-900/30 hover:border-amber-500/55 hover:shadow-amber-500/5',
      badgeColor: 'border-amber-200 text-amber-700 bg-amber-50/50 dark:border-amber-900/40 dark:text-amber-450 dark:bg-amber-955/20',
      cta: 'Check Eligibility',
      ctaAction: () => onNavigateToCalculator('gold')
    },
    {
      id: 'home-loans',
      title: 'Home Loans',
      description: 'Fulfill your dream of owning a home with our flexible home loan options and attractive interest rates.',
      icon: Home,
      features: ['Up to ₹5 Crore loan amount', 'Tenure up to 30 years', 'Balance transfer facility', 'Part prepayment option'],
      rate: 'Starting from 8.5% p.a.',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-955/10',
      iconColor: 'text-emerald-400 bg-emerald-900/20',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500/55 hover:shadow-emerald-500/5',
      badgeColor: 'border-emerald-900/40 text-emerald-400 bg-emerald-950/20',
      cta: 'Apply Now',
      ctaAction: () => onPageChange && onPageChange('loan-application-home')
    },
    {
      id: 'car-loans',
      title: 'Car Loans',
      description: 'Drive your dream car home with our competitive car loan rates and quick approval process.',
      icon: Car,
      features: ['Up to 85% financing', 'Flexible tenure options', 'New & used cars', 'Quick processing'],
      rate: 'Starting from 9.5% p.a.',
      bgColor: 'bg-orange-50/50 dark:bg-orange-955/10',
      iconColor: 'text-orange-400 bg-orange-900/20',
      borderColor: 'border-orange-100 dark:border-orange-900/30 hover:border-orange-500/55 hover:shadow-orange-500/5',
      badgeColor: 'border-orange-900/40 text-orange-400 bg-orange-950/20',
      cta: 'Apply Now',
      ctaAction: () => onPageChange && onPageChange('loan-application-car')
    },
    {
      id: 'personal-loans',
      title: 'Personal Loans',
      description: 'Meet your personal financial needs with our unsecured personal loans with minimal documentation.',
      icon: CreditCard,
      features: ['Up to ₹50 Lakh', 'No collateral required', 'Flexible repayment', 'Digital process'],
      rate: 'Starting from 11% p.a.',
      bgColor: 'bg-primary/5 dark:bg-primary/10',
      iconColor: 'text-primary bg-primary/20',
      borderColor: 'border-primary/20 dark:border-primary/30 hover:border-primary/50 hover:shadow-primary/5',
      badgeColor: 'border-primary/40 text-primary bg-primary/20',
      cta: 'Apply Now',
      ctaAction: () => onPageChange && onPageChange('loan-application-personal')
    },
    {
      id: 'fixed-deposit',
      title: 'Fixed Deposits (FD)',
      description: 'Invest and earn high returns with our secure Fixed Deposit schemes, offering quarterly compounding interest.',
      icon: TrendingUp,
      features: ['Up to 8.50% p.a. returns', 'Compounded quarterly', '0.50% extra for seniors', 'Flexible tenure 12-60 mo'],
      rate: 'Interest up to 9.0% p.a.',
      bgColor: 'bg-pink-50/50 dark:bg-pink-955/10',
      iconColor: 'text-pink-400 bg-pink-900/20',
      borderColor: 'border-pink-100 dark:border-pink-900/30 hover:border-pink-500/55 hover:shadow-pink-500/5',
      badgeColor: 'border-pink-900/40 text-pink-400 bg-pink-950/20',
      cta: 'Calculate Returns',
      ctaAction: () => onNavigateToCalculator('fd')
    },
    {
      id: 'investment-planning',
      title: 'Investment Planning',
      description: 'Grow your wealth with our expert investment advisory and personalized portfolio management.',
      icon: TrendingUp,
      features: ['Mutual funds', 'SIP planning', 'Tax-saving investments', 'Goal-based planning'],
      rate: 'Expert advisory',
      bgColor: 'bg-violet-50/50 dark:bg-violet-955/10',
      iconColor: 'text-violet-400 bg-violet-900/20',
      borderColor: 'border-violet-100 dark:border-violet-900/30 hover:border-violet-500/55 hover:shadow-violet-500/5',
      badgeColor: 'border-violet-900/40 text-violet-400 bg-violet-955/20',
      cta: 'Start Planning',
      ctaAction: () => onGetStarted && onGetStarted()
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-level 256-bit encryption and regulatory compliance for all your assets.',
      color: 'text-emerald-400 bg-emerald-950/20'
    },
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Fast approval process with fully digital documentation and paperless flow.',
      color: 'text-primary bg-primary/20'
    },
    {
      icon: CheckCircle,
      title: 'Transparent Terms',
      description: 'Zero hidden charges, clear schedules, and straightforward repayment guidelines.',
      color: 'text-purple-400 bg-purple-955/20'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="flex items-start gap-5 border-b border-slate-100 dark:border-slate-800 pb-8">
        {onBack && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            data-testid="page-back-button"
            className="h-10 w-10 rounded-lg border border-border bg-card text-primary hover:bg-muted transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-2 flex-1 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Our Financial Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Comprehensive financial solutions designed to meet all your monetary needs. 
            From loans to investments, we've got you covered with competitive rates and expert guidance.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card 
              key={service.id} 
              className={`hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-border/70 dark:border-slate-800 bg-card flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg ${service.borderColor}`}
              data-testid={`card-service-${service.id}`}
            >
              <CardHeader className="space-y-4">
                <div className={`p-3.5 rounded-xl w-fit ${service.iconColor} shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left space-y-1.5">
                  <CardTitle className="text-xl font-bold text-foreground">{service.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-normal min-h-[40px]">
                    {service.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-0">
                <div className="space-y-4 text-left">
                  {/* Rate Badge */}
                  <Badge 
                    variant="outline" 
                    className={`font-semibold text-xs py-1 px-2.5 rounded-full border ${service.badgeColor}`}
                  >
                    {service.rate}
                  </Badge>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2.5 text-xs">
                        <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-450 shrink-0" />
                        <span className="text-muted-foreground font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Button
                    onClick={() => {
                      if (typeof service.ctaAction === 'function') {
                        service.ctaAction();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 font-bold text-xs py-5 rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] group"
                    variant={service.id.includes('loan') ? 'default' : 'outline'}
                    data-testid={`button-${service.id}-cta`}
                  >
                    {service.cta}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-3xl p-10 border border-border shadow-inner">
        <div className="text-center mb-10 max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Why Choose Bhalchandra Finance?
          </h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            We are committed to providing the best financial services with transparency and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center space-y-4" data-testid={`benefit-${index}`}>
                <div className={`p-4 rounded-full w-fit mx-auto shadow-sm border border-slate-100/50 dark:border-slate-800/50 ${benefit.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-normal">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-purple-850 dark:from-primary dark:to-purple-950 text-white rounded-3xl p-12 shadow-xl text-center space-y-6">
        {/* Glow/blur details */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/25 blur-3xl" />

        <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-sm text-purple-100/80 leading-relaxed font-medium">
            Let our financial experts help you choose the right service for your needs. 
            Contact us today for a personalized consultation.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button 
            size="lg"
            onClick={() => {
              onGetStarted();
            }}
            data-testid="button-services-get-started"
            className="flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold px-8 py-6 rounded-full shadow-lg"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('Services CTA - Contact Our Experts clicked')}
            data-testid="button-services-contact"
            className="border-white/30 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full bg-transparent"
          >
            Contact Our Experts
          </Button>
        </div>
      </div>
    </div>
  );
}