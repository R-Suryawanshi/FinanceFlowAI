import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Shield,
  TrendingUp,
  CheckCircle,
  Calendar,
  MapPin
} from "lucide-react";

export function AboutPage() {
  const stats = [
    { label: 'Years of Experience', value: '11+', icon: Calendar },
    { label: 'Happy Customers', value: '2,000+', icon: Users },
    { label: 'Loans Processed', value: '₹2+ Cr', icon: TrendingUp },
    { label: 'Main Branch Location', value: '1', icon: MapPin },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency in all our dealings, ensuring our customers understand every aspect of their financial journey.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Every decision we make is centered around our customers\' needs, providing personalized solutions that truly add value.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every service we provide, continuously improving to exceed customer expectations.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We embrace technology and innovation to make financial services more accessible, efficient, and user-friendly.'
    }
  ];

  const team = [
    {
      name: 'Mr.Mukund Bhalchandra Kherdekar',
      position: 'Honourable General President'
      
    },
    {
      name: 'Mr.Prasad M. Kherdekar',
      position: 'Founder & General Director',
      experience: '10+ years in banking',
      specialization: 'Economist'
    },
    {
      name: 'Mr.Vaibhav Deshpande',
      position: 'Financial Advisor',
      experience: '10+ years in finance',
      specialization: 'Financial Recovery Head'
    },
    {
      name: 'Shruti P. Kherdekar ',
      position: 'Co-Founder',
      
    }
  ];

  const milestones = [
    { year: '2013', event: 'Founded Bhalchandra Finance with a vision to democratize financial services' },
    { year: '2022', event: 'Crossed 1,500 satisfied customers, introduced gold loan services' },
    { year: '2023', event: 'Reached ₹2 Crore in loan disbursements' },
    { year: '2026', event: 'Launched digital platform, introduced online EMI calculator' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          About Bhalchandra Finance
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          For over 15 years, we have been dedicated to providing comprehensive financial solutions 
          that empower individuals and businesses to achieve their financial goals. Our commitment to 
          excellence, transparency, and customer satisfaction has made us a trusted name in the industry.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center" data-testid={`stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card data-testid="card-mission">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To democratize financial services by providing accessible, transparent, and innovative 
              solutions that empower our customers to make informed financial decisions. We strive to 
              bridge the gap between traditional banking and modern financial needs through technology 
              and personalized service.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-vision">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-secondary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To become the leading fintech platform in India, known for our customer-centric approach, 
              innovative solutions, and unwavering commitment to financial inclusion. We envision a future 
              where every individual has access to the financial tools and guidance they need to prosper.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Our Core Values</h2>
          <p className="text-muted-foreground">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="text-center hover-elevate" data-testid={`value-card-${index}`}>
                <CardContent className="p-6">
                  <div className="p-3 bg-secondary/10 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Leadership Team</h2>
          <p className="text-muted-foreground">Experienced professionals leading our mission</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="hover-elevate" data-testid={`team-member-${index}`}>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1" data-testid={`member-name-${index}`}>
                  {member.name}
                </h3>
                <p className="text-sm text-primary mb-2">{member.position}</p>
                <Badge variant="outline" className="mb-2 text-xs">
                  {member.experience}
                </Badge>
                <p className="text-xs text-muted-foreground">{member.specialization}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Our Journey</h2>
          <p className="text-muted-foreground">Key milestones in our growth story</p>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start gap-4" data-testid={`milestone-${index}`}>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="font-medium">
                    {milestone.year}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Recognition */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5" data-testid="card-awards">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Awards & Recognition</CardTitle>
          <CardDescription>Industry recognition for our commitment to excellence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Award className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold">Best Financial Supporter 2023</h3>
              <p className="text-sm text-muted-foreground">FinTech Awards India</p>
            </div>
            <div className="space-y-2">
              <Building2 className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="font-semibold">Customer Excellence Award</h3>
              <p className="text-sm text-muted-foreground">Banking & Finance Excellence Awards</p>
            </div>
            <div className="space-y-2">
              <TrendingUp className="h-12 w-12 text-accent mx-auto" />
              <h3 className="font-semibold">Fastest Growing NBFC</h3>
              <p className="text-sm text-muted-foreground">Indian Business Awards 2022</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}