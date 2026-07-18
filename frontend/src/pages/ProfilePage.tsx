import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  CreditCard, ArrowLeft, Save, ShieldCheck, DollarSign, Loader2, Sparkles, Building2,
  Lock, Eye, EyeOff, Bell, Trash2, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProfilePageProps {
  user: UserType;
  onBack: () => void;
}

interface ProfileData {
  phone_number: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  company_name: string;
  monthly_income: string;
  credit_score: number;
  pan_number: string;
  aadhar_number: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  account_type: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export default function ProfilePage({ user, onBack }: ProfilePageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    phone_number: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    occupation: "",
    company_name: "",
    monthly_income: "",
    credit_score: 750,
    pan_number: "",
    aadhar_number: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    account_type: "",
    email_notifications: true,
    sms_notifications: true,
  });

  // Active settings tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Change password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Deactivation states
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }
    
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setPasswordError(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Network error while updating password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      const response = await fetch("/api/auth/deactivate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Account Deactivated",
          description: "Your Bhalchandra Finance account has been deactivated.",
        });
        localStorage.removeItem("authToken");
        window.location.href = "/";
      } else {
        const data = await response.json();
        toast({
          title: "Deactivation Failed",
          description: data.error || "Could not deactivate account. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Network Error",
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    } finally {
      setDeactivateLoading(false);
      setDeactivateOpen(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            const p = data.profile;
            // Format date of birth for input element
            let dob = "";
            if (p.date_of_birth) {
              dob = new Date(p.date_of_birth).toISOString().split("T")[0];
            }
            
            setProfile({
              phone_number: p.phone_number || "",
              date_of_birth: dob,
              gender: p.gender || "",
              marital_status: p.marital_status || "",
              address: p.address || "",
              city: p.city || "",
              state: p.state || "",
              pincode: p.pincode || "",
              occupation: p.occupation || "",
              company_name: p.company_name || "",
              monthly_income: p.monthly_income ? String(p.monthly_income) : "",
              credit_score: p.credit_score || 750,
              pan_number: p.pan_number || "",
              aadhar_number: p.aadhar_number || "",
              bank_name: p.bank_name || "",
              account_number: p.account_number || "",
              ifsc_code: p.ifsc_code || "",
              account_holder_name: p.account_holder_name || "",
              account_type: p.account_type || "",
              email_notifications: p.email_notifications !== undefined ? !!p.email_notifications : true,
              sms_notifications: p.sms_notifications !== undefined ? !!p.sms_notifications : true,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const submitData = {
        ...profile,
        // Send date_of_birth as string or null
        dateOfBirth: profile.date_of_birth || null,
        monthlyIncome: profile.monthly_income ? parseFloat(profile.monthly_income) : null,
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
          });
        } else {
          throw new Error(data.error || "Update failed");
        }
      } else {
        throw new Error("HTTP error " + response.status);
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Get credit score styling and comments
  const getCreditScoreText = (score: number) => {
    if (score >= 800) return { label: "Excellent", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-955/30" };
    if (score >= 700) return { label: "Very Good", color: "text-primary", bg: "bg-primary/10" };
    if (score >= 650) return { label: "Good", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-955/30" };
    return { label: "Needs Review", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-955/30" };
  };

  const scoreMeta = getCreditScoreText(profile.credit_score);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 px-4 md:px-8 pt-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-8 flex items-start gap-5">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          data-testid="page-back-button"
          className="h-10 w-10 rounded-lg border border-border/50 dark:border-border bg-card dark:bg-slate-900 text-primary hover:bg-muted/30 dark:hover:bg-slate-955 transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1 flex-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
            My Account Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            View, edit, and keep your Bhalchandra Finance account information up-to-date.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Summary Card & Credit Rating */}
        <div className="lg:col-span-4 space-y-6">
          {/* User overview card */}
          <Card className="border-border/60 dark:border-border shadow-md">
            <CardHeader className="pb-4 border-b border-border dark:border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white leading-tight">{user.name}</h2>
                  <p className="text-xs text-muted-foreground leading-snug">{user.email}</p>
                  <span className="inline-block px-2.5 py-0.5 mt-1.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {user.role === "admin" ? "Administrator" : "Bank Member"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Account ID</span>
                <span className="text-muted-foreground dark:text-slate-300 font-mono text-[10px]">{user.id.substring(0, 18)}...</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Security Status</span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Credit Score visual gauge card */}
          <Card className="border-border/60 dark:border-border shadow-md relative overflow-hidden bg-gradient-to-br from-card to-primary/5">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground dark:text-slate-350">Credit Rating Gauge</CardTitle>
              <CardDescription className="text-xs">Based on financial history & calculations</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center">
              {/* Score visual circle */}
              <div className="relative flex items-center justify-center h-28 w-28 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-primary transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(profile.credit_score, 900) / 900)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-foreground dark:text-white leading-tight">{profile.credit_score}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">Max 900</span>
                </div>
              </div>
              
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${scoreMeta.bg} ${scoreMeta.color} border border-primary/20`}>
                Rating: {scoreMeta.label}
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3 max-w-[200px]">
                A higher score helps secure lower interest rates and faster loan approvals.
              </p>
            </CardContent>
          </Card>

          {/* Navigation Card */}
          <Card className="border-border/60 dark:border-border shadow-md">
            <CardContent className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-muted-foreground hover:bg-slate-105/50 dark:text-muted-foreground dark:hover:bg-slate-900'
                }`}
              >
                <User className="h-4 w-4" />
                Profile Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-muted-foreground hover:bg-slate-105/50 dark:text-muted-foreground dark:hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Account & Security
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Edit Forms */}
        <div className="lg:col-span-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Details */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-xs">Primary contact details and personal status.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-bold">Full Name (From Account)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="fullName" 
                          value={user.name} 
                          disabled 
                          className="pl-9 bg-muted/60 text-muted-foreground dark:bg-slate-900/50" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold">Email Address (From Account)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          value={user.email} 
                          disabled 
                          className="pl-9 bg-muted/60 text-muted-foreground dark:bg-slate-900/50" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone_number" className="text-xs font-bold">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone_number" 
                          name="phone_number"
                          placeholder="+91 XXXXX XXXXX" 
                          value={profile.phone_number} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="date_of_birth" className="text-xs font-bold">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="date_of_birth" 
                          name="date_of_birth"
                          type="date" 
                          value={profile.date_of_birth} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-xs font-bold">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
                      >
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="marital_status" className="text-xs font-bold">Marital Status</Label>
                      <select
                        id="marital_status"
                        name="marital_status"
                        value={profile.marital_status}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
                      >
                        <option value="" disabled>Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional & Financial Information */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Professional & Financial Details
                  </CardTitle>
                  <CardDescription className="text-xs">Income data and identity verification criteria.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="occupation" className="text-xs font-bold">Occupation</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="occupation" 
                          name="occupation"
                          placeholder="e.g. Software Engineer" 
                          value={profile.occupation} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company_name" className="text-xs font-bold">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="company_name" 
                          name="company_name"
                          placeholder="e.g. Tata Consultancy Services" 
                          value={profile.company_name} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="monthly_income" className="text-xs font-bold">Monthly Income (₹)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="monthly_income" 
                          name="monthly_income"
                          placeholder="e.g. 75000" 
                          type="number"
                          value={profile.monthly_income} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pan_number" className="text-xs font-bold">PAN Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="pan_number" 
                          name="pan_number"
                          placeholder="e.g. ABCDE1234F" 
                          value={profile.pan_number} 
                          onChange={handleChange}
                          className="pl-9 uppercase" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="aadhar_number" className="text-xs font-bold">Aadhaar Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="aadhar_number" 
                          name="aadhar_number"
                          placeholder="e.g. 1234 5678 9012" 
                          value={profile.aadhar_number} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Details */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <MapPin className="h-5 w-5 text-primary" />
                    Resident Address Details
                  </CardTitle>
                  <CardDescription className="text-xs">Physical address for documentation and KYC.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-bold">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="address" 
                        name="address"
                        placeholder="Flat, Building name, Street address" 
                        value={profile.address} 
                        onChange={handleChange}
                        className="pl-9" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-bold">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        placeholder="e.g. Parbhani" 
                        value={profile.city} 
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-bold">State</Label>
                      <Input 
                        id="state" 
                        name="state"
                        placeholder="e.g. Maharashtra" 
                        value={profile.state} 
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-bold">Pincode</Label>
                      <Input 
                        id="pincode" 
                        name="pincode"
                        placeholder="e.g. 431402" 
                        value={profile.pincode} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account Details */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <Building2 className="h-5 w-5 text-primary" />
                    Bank Account Details
                  </CardTitle>
                  <CardDescription className="text-xs">Configure your payout bank account for loan disbursements and auto-repayments.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bank_name" className="text-xs font-bold">Bank Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="bank_name" 
                          name="bank_name"
                          placeholder="e.g. State Bank of India" 
                          value={profile.bank_name} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="account_holder_name" className="text-xs font-bold">Account Holder Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="account_holder_name" 
                          name="account_holder_name"
                          placeholder="e.g. Ritesh Suryawanshi" 
                          value={profile.account_holder_name} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="account_number" className="text-xs font-bold">Account Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="account_number" 
                          name="account_number"
                          placeholder="e.g. 30123456789" 
                          value={profile.account_number} 
                          onChange={handleChange}
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ifsc_code" className="text-xs font-bold">IFSC Code</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="ifsc_code" 
                          name="ifsc_code"
                          placeholder="e.g. SBIN0001234" 
                          value={profile.ifsc_code} 
                          onChange={handleChange}
                          className="pl-9 uppercase" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="account_type" className="text-xs font-bold">Account Type</Label>
                      <select
                        id="account_type"
                        name="account_type"
                        value={profile.account_type}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
                      >
                        <option value="" disabled>Select Account Type</option>
                        <option value="Savings">Savings Account</option>
                        <option value="Current">Current Account</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  disabled={saving}
                  className="rounded-full px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 flex items-center gap-2 border border-transparent shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-xs">Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword" className="text-xs font-bold block text-left">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword" className="text-xs font-bold block text-left">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-left">
                        Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-bold block text-left">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                          aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-250 rounded-lg text-left">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 flex items-center gap-2 border border-transparent shadow-md"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Notification Preferences Card */}
              <Card className="border-border/60 dark:border-border shadow-md">
                <CardHeader className="pb-4 border-b border-border dark:border-border">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-xs">Manage how you receive alerts and communications.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between py-2 border-b border-border dark:border-border">
                    <div className="space-y-0.5 text-left">
                      <Label className="text-sm font-semibold text-foreground dark:text-white">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive loan approval letters, receipts, and account statements via email.</p>
                    </div>
                    <Switch
                      checked={profile.email_notifications}
                      onCheckedChange={(checked) => setProfile(p => ({ ...p, email_notifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border dark:border-border">
                    <div className="space-y-0.5 text-left">
                      <Label className="text-sm font-semibold text-foreground dark:text-white">SMS & Phone Alerts</Label>
                      <p className="text-xs text-muted-foreground">Receive SMS verification codes and urgent due date reminders on your phone.</p>
                    </div>
                    <Switch
                      checked={profile.sms_notifications}
                      onCheckedChange={(checked) => setProfile(p => ({ ...p, sms_notifications: checked }))}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 flex items-center gap-2 border border-transparent shadow-md"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone Card */}
              <Card className="border-red-200 dark:border-red-900 shadow-md bg-red-50/20 dark:bg-red-950/10">
                <CardHeader className="pb-4 border-b border-red-100 dark:border-red-900/40">
                  <CardTitle className="text-md font-bold flex items-center gap-2 text-red-750 dark:text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-xs text-red-650 dark:text-red-300">Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-sm font-bold text-foreground dark:text-white">Deactivate Account</h3>
                    <p className="text-xs text-muted-foreground">Permanently deactivate your Bhalchandra Finance account. This action cannot be undone.</p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeactivateOpen(true)}
                    className="rounded-full px-6 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>

              {/* Deactivation Confirmation Dialog */}
              <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                <DialogContent className="max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
                  <DialogHeader className="text-left flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                      This action will permanently deactivate your account. You will be logged out instantly and will no longer be able to sign in or access your loan history.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeactivateOpen(false)}
                      disabled={deactivateLoading}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeactivate}
                      disabled={deactivateLoading}
                      className="rounded-full flex items-center gap-2"
                    >
                      {deactivateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deactivating...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Yes, Deactivate Account
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}