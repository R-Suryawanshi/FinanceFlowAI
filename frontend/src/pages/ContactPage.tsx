import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Building2,
  Users,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  service: string;
  message: string;
}

export function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    service: '',
    message: ''
  });

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Todo: integrate with real API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        service: '',
        message: ''
      });

      console.log('Contact form submitted:', formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Head Office',
      details: [
        'KasbaPeth Jintoor,',
        'Business District, Parbhani',
        'Maharashtra 431402, India'
      ]
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        'Main: +91 9422547906 ',
        'Customer Care: +91 9422547906'
      ]
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: [
        'info@bhalchandrafinance.com',
        'support@bhalchandrafinance.com',
        'loans@bhalchandrafinance.com'
      ]
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 11:00 AM - 7:00 PM',
        'Saturday: 2:00 PM - 4:00 PM',
        'Sunday: 2:00 PM - 4:00 PM'
      ]
    }
  ];

  const branches = [
    {
      name: 'Jintoor Central Branch',
      address: 'KasbaPeth Jintoor,Parbhani',
      phone: '+91 9422547906',
      manager: 'Mr.Prasad Kherdekar'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Contact Us
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get in touch with our financial experts. We're here to help you with all your 
          financial needs and answer any questions you may have.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card data-testid="card-contact-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      data-testid="input-contact-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Interest</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger data-testid="select-contact-service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal-loan">Personal Loan</SelectItem>
                        <SelectItem value="home-loan">Home Loan</SelectItem>
                        <SelectItem value="car-loan">Car Loan</SelectItem>
                        <SelectItem value="gold-loan">Gold Loan</SelectItem>
                        <SelectItem value="investment">Investment Planning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief subject of your inquiry"
                    required
                    data-testid="input-contact-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please describe your inquiry in detail..."
                    rows={5}
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto flex items-center gap-2"
                  data-testid="button-contact-submit"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card key={index} data-testid={`contact-info-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Branch Locations */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Branch Locations</h2>
          <p className="text-muted-foreground">Visit our branches for personalized service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch, index) => (
            <Card key={index} className="hover-elevate" data-testid={`branch-card-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-secondary" />
                  {branch.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{branch.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{branch.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Manager: {branch.manager}</p>
                </div>
                <Button variant="outline" className="w-full mt-4" data-testid={`button-visit-branch-${index}`}>
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5" data-testid="card-faq">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">What documents do I need for a loan?</h4>
                  <p className="text-sm text-muted-foreground">
                    Typically, you'll need identity proof, address proof, income proof, and bank statements. 
                    Specific requirements vary by loan type.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">How quickly can I get loan approval?</h4>
                  <p className="text-sm text-muted-foreground">
                    Most loans are approved within 24-48 hours after document verification. 
                    Gold loans can be approved within 2-3 hours.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Can I prepay my loan?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can prepay your loan partially or fully at any time. 
                    Minimal or no prepayment charges apply based on loan type.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Is online application secure?</h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We use bank-level security with 256-bit SSL encryption 
                    to protect all your personal and financial information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}