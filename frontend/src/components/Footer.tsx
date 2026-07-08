import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onPageChange: (page: string) => void;
}

export function Footer({ onPageChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // List of RBI guideline links
  const rbiGuidelines = [
    {
      title: "Master Direction – Know Your Customer (KYC)",
      url: "https://rbi.org.in/Scripts/BS_ViewMasCirculardetails.aspx?id=12070",
    },
    {
      title: "Digital Lending Guidelines (2023 Update)",
      url: "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12113",
    },
    {
      title: "NBFC – Fair Practices Code",
      url: "https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566",
    },
    {
      title: "Customer Grievance Redressal Framework",
      url: "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12411",
    },
    {
      title: "Fair Lending & Customer Rights",
      // This may reuse the same NBFC or another RBI circular
      url: "https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566",
    },
    {
      title: "Banking Supervision & Compliance",
      url: "https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566",
    },
  ];

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Bhalchandra Finance</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for comprehensive financial services.
              Expert guidance, competitive rates, and personalized solutions for all your financial needs.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {[
                { name: "Home", id: "home" },
                { name: "Services", id: "services" },
                { name: "About Us", id: "about" },
                { name: "Contact", id: "contact" },
              ].map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  onClick={() => onPageChange(link.id)}
                  className="w-full justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Button>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <nav className="space-y-2">
              {[
                "EMI Calculator",
                "Gold Loans",
                "Personal Loans",
                "Home Loans",
                "Investment Planning",
                "Financial Advisory",
              ].map((service) => (
                <Button
                  key={service}
                  variant="ghost"
                  onClick={() => onPageChange("services")}
                  className="w-full justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  {service}
                </Button>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Kasba Peth Jintur, Parbhani, Maharashtra 431402
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +91 22 1234 5678
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> info@bhalchandrafinance.com
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Business Hours</h4>
              <div className="text-sm text-muted-foreground">
                <div>Mon - Fri: 9:00 AM - 6:00 PM</div>
                <div>Saturday: 9:00 AM - 2:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>

          {/* RBI Guidelines Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">RBI Guidelines</h3>
            <nav className="space-y-2 text-sm">
              {rbiGuidelines.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline text-muted-foreground"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Bhalchandra Finance. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Button
                variant="ghost"
                onClick={() => console.log("Privacy Policy clicked")}
                className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                onClick={() => console.log("Terms of Service clicked")}
                className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Button>
              <Button
                variant="ghost"
                onClick={() => console.log("Cookie Policy clicked")}
                className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              >
                Cookie Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}