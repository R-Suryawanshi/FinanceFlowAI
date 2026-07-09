import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  CreditCard, ArrowLeft, Save, ShieldCheck, DollarSign, Loader2, Sparkles, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
    if (score >= 700) return { label: "Very Good", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
    if (score >= 650) return { label: "Good", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-955/30" };
    return { label: "Needs Review", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-955/30" };
  };

  const scoreMeta = getCreditScoreText(profile.credit_score);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
          <p className="text-sm font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 pb-16 px-4 md:px-8 pt-32 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors mb-2 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-8 w-8 text-blue-700" />
            My Account Profile
          </h1>
          <p className="text-sm text-slate-500">
            View, edit, and keep your Bhalchandra Finance account information up-to-date.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Summary Card & Credit Rating */}
        <div className="lg:col-span-4 space-y-6">
          {/* User overview card */}
          <Card className="border-slate-200/60 dark:border-slate-850 shadow-md">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                  <User className="h-7 w-7 text-blue-700 dark:text-blue-450" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h2>
                  <p className="text-xs text-slate-500 leading-snug">{user.email}</p>
                  <span className="inline-block px-2.5 py-0.5 mt-1.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/30">
                    {user.role === "admin" ? "Administrator" : "Bank Member"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Account ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">{user.id.substring(0, 18)}...</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Security Status</span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Credit Score visual gauge card */}
          <Card className="border-slate-200/60 dark:border-slate-850 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-slate-950/20">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="h-16 w-16 text-blue-700" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-350">Credit Rating Gauge</CardTitle>
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
                    className="stroke-blue-700 dark:stroke-blue-500 transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(profile.credit_score, 900) / 900)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{profile.credit_score}</span>
                  <span className="text-[10px] text-slate-500 font-bold">Max 900</span>
                </div>
              </div>
              
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${scoreMeta.bg} ${scoreMeta.color} border border-blue-200/20`}>
                Rating: {scoreMeta.label}
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-3 max-w-[200px]">
                A higher score helps secure lower interest rates and faster loan approvals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Edit Forms */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Details */}
            <Card className="border-slate-200/60 dark:border-slate-850 shadow-md">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-md font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <User className="h-5 w-5 text-blue-700" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs">Primary contact details and personal status.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold">Full Name (From Account)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="fullName" 
                        value={user.name} 
                        disabled 
                        className="pl-9 bg-slate-100/60 text-slate-500 dark:bg-slate-900/50" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold">Email Address (From Account)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email" 
                        value={user.email} 
                        disabled 
                        className="pl-9 bg-slate-100/60 text-slate-500 dark:bg-slate-900/50" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number" className="text-xs font-bold">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-slate-800"
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
                      className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-slate-800"
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
            <Card className="border-slate-200/60 dark:border-slate-850 shadow-md">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-md font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Briefcase className="h-5 w-5 text-blue-700" />
                  Professional & Financial Details
                </CardTitle>
                <CardDescription className="text-xs">Income data and identity verification criteria.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="occupation" className="text-xs font-bold">Occupation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
            <Card className="border-slate-200/60 dark:border-slate-850 shadow-md">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-md font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapPin className="h-5 w-5 text-blue-700" />
                  Resident Address Details
                </CardTitle>
                <CardDescription className="text-xs">Physical address for documentation and KYC.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold">Street Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-8 flex items-center gap-2 border border-transparent shadow-md"
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
        </div>
      </div>
    </div>
  );
}
