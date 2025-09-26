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
  ArrowRight
} from "lucide-react";

interface ServicesPageProps {
  onNavigateToCalculator: (type: 'emi' | 'gold') => void;
  onGetStarted: () => void;
}

export function ServicesPage({ onNavigateToCalculator, onGetStarted }: ServicesPageProps) {
  const services = [
    {
      id: 'emi-calculator',
      title: 'EMI Calculator',
      description: 'Calculate your Equated Monthly Installments for various types of loans with our advanced calculator.',
      icon: Calculator,
      features: ['Home Loans', 'Car Loans', 'Personal Loans', 'Business Loans'],
      rate: 'Starting from 8.5% p.a.',
      color: 'primary',
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
      color: 'secondary',
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
      color: 'accent',
      cta: 'Apply Now',
      ctaAction: onGetStarted
    },
    {
      id: 'car-loans',
      title: 'Car Loans',
      description: 'Drive your dream car home with our competitive car loan rates and quick approval process.',
      icon: Car,
      features: ['Up to 85% financing', 'Flexible tenure options', 'New & used cars', 'Quick processing'],
      rate: 'Starting from 9% p.a.',
      color: 'primary',
      cta: 'Get Quote',
      ctaAction: onGetStarted
    },
    {
      id: 'personal-loans',
      title: 'Personal Loans',
      description: 'Meet your personal financial needs with our unsecured personal loans with minimal documentation.',
      icon: CreditCard,
      features: ['Up to ₹50 Lakh', 'No collateral required', 'Flexible repayment', 'Digital process'],
      rate: 'Starting from 10.5% p.a.',
      color: 'secondary',
      cta: 'Check Eligibility',
      ctaAction: onGetStarted
    },
    {
      id: 'investment-planning',
      title: 'Investment Planning',
      description: 'Grow your wealth with our expert investment advisory and personalized portfolio management.',
      icon: TrendingUp,
      features: ['Mutual funds', 'SIP planning', 'Tax-saving investments', 'Goal-based planning'],
      rate: 'Expert advisory',
      color: 'accent',
      cta: 'Start Planning',
      ctaAction: onGetStarted
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-level security and regulatory compliance for all your transactions.'
    },
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Fast approval process with minimal documentation requirements.'
    },
    {
      icon: CheckCircle,
      title: 'Transparent Terms',
      description: 'No hidden charges, clear terms and conditions for all our services.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Our Financial Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive financial solutions designed to meet all your monetary needs. 
          From loans to investments, we've got you covered with competitive rates and expert guidance.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card 
              key={service.id} 
              className="hover-elevate cursor-pointer transition-all duration-300"
              data-testid={`card-service-${service.id}`}
            >
              <CardHeader className="space-y-4">
                <div className={`p-3 rounded-lg w-fit ${
                  service.color === 'primary' ? 'bg-primary/10' :
                  service.color === 'secondary' ? 'bg-secondary/10' : 'bg-accent/10'
                }`}>
                  <Icon className={`h-8 w-8 ${
                    service.color === 'primary' ? 'text-primary' :
                    service.color === 'secondary' ? 'text-secondary' : 'text-accent'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {service.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rate Badge */}
                <Badge 
                  variant="outline" 
                  className={`${
                    service.color === 'primary' ? 'border-primary/20 text-primary' :
                    service.color === 'secondary' ? 'border-secondary/20 text-secondary' : 'border-accent/20 text-accent'
                  }`}
                >
                  {service.rate}
                </Badge>

                {/* Features List */}
                <div className="space-y-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => {
                    service.ctaAction();
                    console.log('Service CTA clicked:', service.title);
                  }}
                  className="w-full flex items-center gap-2"
                  variant={service.color === 'primary' ? 'default' : 'outline'}
                  data-testid={`button-${service.id}-cta`}
                >
                  {service.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/30 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Why Choose Bhalchandra Finance?
          </h2>
          <p className="text-muted-foreground">
            We are committed to providing the best financial services with transparency and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center space-y-4" data-testid={`benefit-${index}`}>
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground mt-2">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6 bg-gradient-to-r from-primary/5 to-secondary/5 p-12 rounded-lg">
        <h2 className="text-3xl font-bold text-foreground">
          Ready to Get Started?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Let our financial experts help you choose the right service for your needs. 
          Contact us today for a personalized consultation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => {
              onGetStarted();
              console.log('Services CTA - Get Started clicked');
            }}
            data-testid="button-services-get-started"
            className="flex items-center gap-2"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('Services CTA - Contact Us clicked')}
            data-testid="button-services-contact"
          >
            Contact Our Experts
          </Button>
        </div>
      </div>
    </div>
  );
}