import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Upload,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";

interface LoanApplicationProps {
  loanType: 'home' | 'car' | 'personal' | 'gold';
  onSubmit?: (applicationData: any) => void;
  onPageChange?: (page: string) => void;
  defaultAmount?: string | number;
  defaultTenure?: string | number;
  onBack?: () => void;
  user?: any;
}

export function LoanApplicationForm({ loanType, onSubmit, onPageChange, defaultAmount, defaultTenure, onBack, user }: LoanApplicationProps) {
  const [applicationData, setApplicationData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    maritalStatus: '',
    aadharNumber: '',
    panNumber: '',
    
    // Employment Information
    employmentType: '',
    companyName: '',
    designation: '',
    occupation: '',
    workExperience: '',
    monthlyIncome: '',
    otherIncome: '',

    // Bank Account Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountType: '',
    
    // Loan Details
    loanAmount: '',
    tenure: '',
    purpose: '',
    
    // Additional Information
    hasExistingLoan: false,
    existingLoanDetails: '',
    hasCoApplicant: false,
    coApplicantDetails: '',
    
    // Documents
    documents: {
      identityProof: null,
      addressProof: null,
      incomeProof: null,
      bankStatements: null,
      propertyDocuments: null,
      vehicleDocuments: null
    },
    
    // Terms
    agreeToTerms: false,
    agreeToCredit: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [updateProfileOnSubmit, setUpdateProfileOnSubmit] = useState(false);

  useEffect(() => {
    if (defaultAmount) {
      setApplicationData(prev => ({ ...prev, loanAmount: defaultAmount.toString() }));
    }
    if (defaultTenure) {
      setApplicationData(prev => ({ ...prev, tenure: defaultTenure.toString() }));
    }
  }, [defaultAmount, defaultTenure]);

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("You must be logged in to apply for a loan.");
        }

        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to load user profile details.");
        }

        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          
          setApplicationData(prev => ({
            ...prev,
            fullName: prev.fullName || p.name || user?.name || "",
            email: prev.email || p.email || user?.email || "",
            gender: prev.gender || p.gender || "",
            dateOfBirth: prev.dateOfBirth || (p.date_of_birth ? new Date(p.date_of_birth).toISOString().split("T")[0] : ""),
            phone: prev.phone || p.phone_number || "",
            address: prev.address || p.address || "",
            city: prev.city || p.city || "",
            state: prev.state || p.state || "",
            pincode: prev.pincode || p.pincode || "",
            maritalStatus: prev.maritalStatus || p.marital_status || "",
            aadharNumber: prev.aadharNumber || p.aadhar_number || "",
            panNumber: prev.panNumber || p.pan_number || "",
            occupation: prev.occupation || p.occupation || "",
            companyName: prev.companyName || p.company_name || "",
            monthlyIncome: prev.monthlyIncome || (p.monthly_income ? String(p.monthly_income) : ""),
            bankName: prev.bankName || p.bank_name || "",
            accountNumber: prev.accountNumber || p.account_number || "",
            ifscCode: prev.ifscCode || p.ifsc_code || "",
            accountHolderName: prev.accountHolderName || p.account_holder_name || "",
            accountType: prev.accountType || p.account_type || ""
          }));

          // Determine missing fields
          const requiredList = [
            { key: 'fullName', label: 'Full Name' },
            { key: 'dateOfBirth', label: 'Date of Birth' },
            { key: 'gender', label: 'Gender' },
            { key: 'phone', label: 'Mobile Number' },
            { key: 'email', label: 'Email Address' },
            { key: 'address', label: 'Address' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'aadharNumber', label: 'Aadhaar Number' },
            { key: 'panNumber', label: 'PAN Number' },
            { key: 'employmentType', label: 'Employment Type' },
            { key: 'companyName', label: 'Company Name' },
            { key: 'monthlyIncome', label: 'Monthly Income' },
            { key: 'bankName', label: 'Bank Name' },
            { key: 'accountNumber', label: 'Account Number' },
            { key: 'ifscCode', label: 'IFSC Code' },
            { key: 'accountHolderName', label: 'Account Holder Name' },
            { key: 'accountType', label: 'Account Type' }
          ];

          const missing = requiredList
            .filter(item => {
              if (item.key === 'employmentType') {
                return !p.occupation;
              }
              const val = p[item.key] || p[item.key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)];
              return val === undefined || val === null || val === '';
            })
            .map(item => item.label);
          
          setMissingFields(missing);
        } else {
          // If no profile, prefill name and email from user context
          setApplicationData(prev => ({
            ...prev,
            fullName: prev.fullName || user?.name || "",
            email: prev.email || user?.email || ""
          }));
          
          setMissingFields([
            'Date of Birth', 'Gender', 'Mobile Number', 'Address', 'City', 'State',
            'Pincode', 'Aadhaar Number', 'PAN Number', 'Employment Type',
            'Company Name', 'Monthly Income', 'Bank Name', 'Account Number',
            'IFSC Code', 'Account Holder Name', 'Account Type'
          ]);
        }
      } catch (err: any) {
        console.error("Profile load error:", err);
        setProfileError(err.message || "Failed to retrieve saved account profile.");
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serviceTypeId, setServiceTypeId] = useState<string | null>(null);
  const [baseInterestRate, setBaseInterestRate] = useState<number>(10.0);

  useEffect(() => {
    async function fetchServiceTypes() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.services)) {
            const matchingName = `${loanType}-loan`;
            const matched = data.services.find((s: any) => s.name === matchingName);
            if (matched) {
              setServiceTypeId(matched.id);
              if (matched.baseInterestRate) {
                setBaseInterestRate(parseFloat(matched.baseInterestRate));
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching service types:", err);
      }
    }
    fetchServiceTypes();
  }, [loanType]);

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const loanTypes = {
    home: 'Home Loan',
    car: 'Car Loan', 
    personal: 'Personal Loan',
    gold: 'Gold Loan'
  };

  const handleInputChange = (field: string, value: any) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (docType: string, file: File) => {
    setApplicationData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateFields = () => {
    const {
      fullName, dateOfBirth, gender, email, phone, address, city, state, pincode,
      maritalStatus, aadharNumber, panNumber, employmentType, companyName,
      monthlyIncome, bankName, accountNumber, ifscCode, accountHolderName, accountType
    } = applicationData;

    if (!fullName.trim()) throw new Error("Full Name is required.");
    if (!dateOfBirth) throw new Error("Date of Birth is required.");
    if (!gender) throw new Error("Gender is required.");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Please enter a valid email address.");

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) throw new Error("Phone number must be at least 10 digits.");

    if (!address.trim()) throw new Error("Address is required.");
    if (!city.trim()) throw new Error("City is required.");
    if (!state) throw new Error("State is required.");

    const pincodeDigits = pincode.replace(/\D/g, "");
    if (pincodeDigits.length !== 6) throw new Error("Pincode must be exactly 6 digits.");

    if (!maritalStatus) throw new Error("Marital Status is required.");

    const aadharDigits = aadharNumber.replace(/\D/g, "");
    if (aadharDigits.length !== 12) throw new Error("Aadhaar Number must be exactly 12 digits.");

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panRegex.test(panNumber.trim())) throw new Error("PAN Number must be in standard format (e.g. ABCDE1234F).");

    if (!employmentType) throw new Error("Employment Type is required.");
    if (!companyName.trim()) throw new Error("Company Name is required.");
    
    const incomeVal = parseFloat(monthlyIncome);
    if (isNaN(incomeVal) || incomeVal <= 0) throw new Error("Monthly Income must be a positive number.");

    if (!bankName.trim()) throw new Error("Bank Name is required.");
    if (!accountNumber.trim()) throw new Error("Bank Account Number is required.");
    
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
    if (!ifscRegex.test(ifscCode.trim())) throw new Error("Please enter a valid 11-digit IFSC code (e.g. SBIN0001234).");

    if (!accountHolderName.trim()) throw new Error("Account Holder Name is required.");
    if (!accountType) throw new Error("Account Type is required.");
  };

  const submitApplication = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You must be logged in to submit a loan application.");
      }

      // Validate all fields before submission
      validateFields();

      // 1. Update/Save user profile ONLY if user explicitly checked the option
      if (updateProfileOnSubmit) {
        const profileResponse = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            phoneNumber: applicationData.phone,
            dateOfBirth: applicationData.dateOfBirth ? new Date(applicationData.dateOfBirth).toISOString() : null,
            gender: applicationData.gender,
            maritalStatus: applicationData.maritalStatus,
            address: applicationData.address,
            city: applicationData.city,
            state: applicationData.state,
            pincode: applicationData.pincode,
            occupation: applicationData.occupation,
            companyName: applicationData.companyName,
            monthlyIncome: applicationData.monthlyIncome || "0",
            panNumber: applicationData.panNumber,
            aadharNumber: applicationData.aadharNumber,
            bankName: applicationData.bankName,
            accountNumber: applicationData.accountNumber,
            ifscCode: applicationData.ifscCode,
            accountHolderName: applicationData.accountHolderName,
            accountType: applicationData.accountType,
            creditScore: 720
          })
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to update user profile.");
        }
      }

      // 2. Prepare document metadata to store in database as jsonb
      const documentsMetadata: Record<string, any> = {};
      for (const [key, val] of Object.entries(applicationData.documents)) {
        if (val) {
          const file = val as File;
          documentsMetadata[key] = {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
        }
      }

      // 3. Check if serviceTypeId was resolved
      if (!serviceTypeId) {
        throw new Error("Unable to resolve loan service type. Please try again.");
      }

      // Serialize form details and save inside the 'notes' column so that
      // we don't lose application-specific personal info.
      const applicationDetails = {
        fullName: applicationData.fullName,
        dateOfBirth: applicationData.dateOfBirth,
        gender: applicationData.gender,
        email: applicationData.email,
        phone: applicationData.phone,
        address: applicationData.address,
        city: applicationData.city,
        state: applicationData.state,
        pincode: applicationData.pincode,
        maritalStatus: applicationData.maritalStatus,
        aadharNumber: applicationData.aadharNumber,
        panNumber: applicationData.panNumber,
        occupation: applicationData.occupation,
        companyName: applicationData.companyName,
        monthlyIncome: applicationData.monthlyIncome,
        bankName: applicationData.bankName,
        accountNumber: applicationData.accountNumber,
        ifscCode: applicationData.ifscCode,
        accountHolderName: applicationData.accountHolderName,
        accountType: applicationData.accountType
      };

      // 4. Submit loan application
      const loanResponse = await fetch("/api/user-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceTypeId,
          amount: applicationData.loanAmount,
          tenure: parseInt(applicationData.tenure) || 12,
          interestRate: baseInterestRate.toString(),
          purpose: applicationData.purpose,
          documents: documentsMetadata,
          collateral: applicationData.hasExistingLoan ? applicationData.existingLoanDetails : null,
          guarantor: applicationData.hasCoApplicant ? applicationData.coApplicantDetails : null,
          notes: JSON.stringify(applicationDetails)
        })
      });

      const loanData = await loanResponse.json();

      if (!loanResponse.ok || !loanData.success) {
        throw new Error(loanData.error || "Failed to submit loan application.");
      }

      // Successful submission
      setApplicationNumber(loanData.service.applicationNumber || "N/A");
      setIsSubmitted(true);

      if (onSubmit) {
        onSubmit(applicationData);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={applicationData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={applicationData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={applicationData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={applicationData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={applicationData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your complete address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={applicationData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Select value={applicationData.state} onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="gujarat">Gujarat</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
              {/* Add more states */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={applicationData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="000000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={applicationData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <Select value={applicationData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="aadharNumber">Aadhaar Number *</Label>
          <Input
            id="aadharNumber"
            value={applicationData.aadharNumber}
            onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="12-digit Aadhaar number"
            maxLength={12}
            required
          />
        </div>
        <div>
          <Label htmlFor="panNumber">PAN Number *</Label>
          <Input
            id="panNumber"
            value={applicationData.panNumber}
            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase().slice(0, 10))}
            placeholder="10-digit PAN (e.g. ABCDE1234F)"
            maxLength={10}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderEmploymentInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employmentType">Employment Type *</Label>
          <Select value={applicationData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="self-employed">Self Employed</SelectItem>
              <SelectItem value="business">Business Owner</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="companyName">Company/Business Name *</Label>
          <Input
            id="companyName"
            value={applicationData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Company or business name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="occupation">Occupation *</Label>
          <Input
            id="occupation"
            value={applicationData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="e.g. Software Engineer"
            required
          />
        </div>
        <div>
          <Label htmlFor="designation">Designation/Role</Label>
          <Input
            id="designation"
            value={applicationData.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            placeholder="Your designation"
          />
        </div>
        <div>
          <Label htmlFor="workExperience">Work Experience (years) *</Label>
          <Input
            id="workExperience"
            type="number"
            value={applicationData.workExperience}
            onChange={(e) => handleInputChange('workExperience', e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyIncome">Monthly Income *</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={applicationData.monthlyIncome}
            onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            placeholder="Monthly income in ₹"
            required
          />
        </div>
        <div>
          <Label htmlFor="otherIncome">Other Income</Label>
          <Input
            id="otherIncome"
            type="number"
            value={applicationData.otherIncome}
            onChange={(e) => handleInputChange('otherIncome', e.target.value)}
            placeholder="Additional income in ₹"
          />
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value={applicationData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            placeholder="e.g. State Bank of India"
            required
          />
        </div>
        <div>
          <Label htmlFor="accountHolderName">Account Holder Name *</Label>
          <Input
            id="accountHolderName"
            value={applicationData.accountHolderName}
            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            placeholder="Name as in bank records"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            value={applicationData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ""))}
            placeholder="Enter Account Number"
            required
          />
        </div>
        <div>
          <Label htmlFor="ifscCode">IFSC Code *</Label>
          <Input
            id="ifscCode"
            value={applicationData.ifscCode}
            onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase().slice(0, 11))}
            placeholder="e.g. SBIN0001234"
            maxLength={11}
            required
          />
        </div>
        <div>
          <Label htmlFor="accountType">Account Type *</Label>
          <Select value={applicationData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Savings">Savings Account</SelectItem>
              <SelectItem value="Current">Current Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderLoanDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loanAmount">Loan Amount Required *</Label>
          <Input
            id="loanAmount"
            type="number"
            value={applicationData.loanAmount}
            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
            placeholder="Amount in ₹"
            required
          />
        </div>
        <div>
          <Label htmlFor="tenure">Loan Tenure (years) *</Label>
          <Select value={applicationData.tenure} onValueChange={(value) => handleInputChange('tenure', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tenure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Years</SelectItem>
              <SelectItem value="3">3 Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
              <SelectItem value="10">10 Years</SelectItem>
              <SelectItem value="15">15 Years</SelectItem>
              <SelectItem value="20">20 Years</SelectItem>
              <SelectItem value="25">25 Years</SelectItem>
              <SelectItem value="30">30 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose of Loan *</Label>
        <Textarea
          id="purpose"
          value={applicationData.purpose}
          onChange={(e) => handleInputChange('purpose', e.target.value)}
          placeholder="Describe the purpose of loan..."
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasExistingLoan"
            checked={applicationData.hasExistingLoan}
            onCheckedChange={(checked) => handleInputChange('hasExistingLoan', checked)}
          />
          <Label htmlFor="hasExistingLoan">Do you have any existing loans?</Label>
        </div>

        {applicationData.hasExistingLoan && (
          <div>
            <Label htmlFor="existingLoanDetails">Existing Loan Details</Label>
            <Textarea
              id="existingLoanDetails"
              value={applicationData.existingLoanDetails}
              onChange={(e) => handleInputChange('existingLoanDetails', e.target.value)}
              placeholder="Provide details about existing loans..."
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasCoApplicant"
            checked={applicationData.hasCoApplicant}
            onCheckedChange={(checked) => handleInputChange('hasCoApplicant', checked)}
          />
          <Label htmlFor="hasCoApplicant">Do you have a co-applicant?</Label>
        </div>

        {applicationData.hasCoApplicant && (
          <div>
            <Label htmlFor="coApplicantDetails">Co-applicant Details</Label>
            <Textarea
              id="coApplicantDetails"
              value={applicationData.coApplicantDetails}
              onChange={(e) => handleInputChange('coApplicantDetails', e.target.value)}
              placeholder="Provide co-applicant information..."
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Identity Proof *
            </CardTitle>
            <CardDescription>Aadhaar Card, PAN Card, Passport, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleDocumentUpload('identityProof', e.target.files[0])}
              />
              <Upload className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Proof *
            </CardTitle>
            <CardDescription>Utility bill, rental agreement, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleDocumentUpload('addressProof', e.target.files[0])}
              />
              <Upload className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Income Proof *
            </CardTitle>
            <CardDescription>Salary slips, ITR, business records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleDocumentUpload('incomeProof', e.target.files[0])}
              />
              <Upload className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Bank Statements *
            </CardTitle>
            <CardDescription>Last 6 months bank statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleDocumentUpload('bankStatements', e.target.files[0])}
              />
              <Upload className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property/Vehicle documents for specific loan types */}
      {(loanType === 'home' || loanType === 'car') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {loanType === 'home' ? 'Property Documents' : 'Vehicle Documents'}
            </CardTitle>
            <CardDescription>
              {loanType === 'home' 
                ? 'Sale agreement, title documents, NOC, etc.' 
                : 'Vehicle invoice, insurance, RC, etc.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleDocumentUpload(
                  loanType === 'home' ? 'propertyDocuments' : 'vehicleDocuments', 
                  e.target.files[0]
                )}
              />
              <Upload className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your application details carefully before submission.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Name:</strong> {applicationData.fullName}</div>
            <div><strong>Gender:</strong> {applicationData.gender}</div>
            <div><strong>DOB:</strong> {applicationData.dateOfBirth}</div>
            <div><strong>Email:</strong> {applicationData.email}</div>
            <div><strong>Phone:</strong> {applicationData.phone}</div>
            <div><strong>Aadhaar:</strong> {applicationData.aadharNumber}</div>
            <div><strong>PAN:</strong> {applicationData.panNumber}</div>
            <div><strong>Address:</strong> {applicationData.address}, {applicationData.city}, {applicationData.state} - {applicationData.pincode}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Employment:</strong> {applicationData.employmentType}</div>
            <div><strong>Occupation:</strong> {applicationData.occupation}</div>
            <div><strong>Company:</strong> {applicationData.companyName}</div>
            <div><strong>Designation:</strong> {applicationData.designation}</div>
            <div><strong>Monthly Income:</strong> ₹{applicationData.monthlyIncome}</div>
            <div><strong>Experience:</strong> {applicationData.workExperience} years</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Bank Name:</strong> {applicationData.bankName}</div>
            <div><strong>Account Holder:</strong> {applicationData.accountHolderName}</div>
            <div><strong>Account Number:</strong> {applicationData.accountNumber}</div>
            <div><strong>IFSC Code:</strong> {applicationData.ifscCode}</div>
            <div><strong>Account Type:</strong> {applicationData.accountType}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Loan Type:</strong> {loanTypes[loanType]}</div>
            <div><strong>Amount:</strong> ₹{applicationData.loanAmount}</div>
            <div><strong>Tenure:</strong> {applicationData.tenure} years</div>
            <div><strong>Purpose:</strong> {applicationData.purpose}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-border/40 pb-4">
          <Checkbox
            id="updateProfileOnSubmit"
            checked={updateProfileOnSubmit}
            onCheckedChange={(checked) => setUpdateProfileOnSubmit(!!checked)}
          />
          <Label htmlFor="updateProfileOnSubmit" className="font-semibold text-foreground cursor-pointer">
            Save and update my account profile with this information
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={applicationData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
          />
          <Label htmlFor="agreeToTerms">
            I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToCredit"
            checked={applicationData.agreeToCredit}
            onCheckedChange={(checked) => handleInputChange('agreeToCredit', checked)}
          />
          <Label htmlFor="agreeToCredit">
            I authorize the credit bureau check and verification of information provided
          </Label>
        </div>
      </div>
    </div>
  );

  const stepTitles = [
    'Personal Information',
    'Employment Details', 
    'Bank Details',
    'Loan Requirements',
    'Document Upload',
    'Review & Submit'
  ];

  const stepContent = [
    renderPersonalInfo,
    renderEmploymentInfo,
    renderBankDetails,
    renderLoanDetails,
    renderDocuments,
    renderReview
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-8 my-12">
        <Card className="border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20">
          <CardHeader className="space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Application Submitted!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your {loanTypes[loanType]} application has been successfully received and is under review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left border-t border-border/40 pt-6">
            <div>
              <span className="text-xs text-muted-foreground block uppercase font-semibold">
                Application Number
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {applicationNumber}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block uppercase font-semibold">
                Loan Amount Request
              </span>
              <span className="text-lg font-bold text-foreground">
                ₹{parseInt(applicationData.loanAmount || "0").toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block uppercase font-semibold">
                Interest Rate (Base)
              </span>
              <span className="text-lg font-bold text-foreground">
                {baseInterestRate}% p.a.
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          {onPageChange && (
            <Button onClick={() => onPageChange("user-dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onPageChange ? onPageChange("home") : window.location.reload()} 
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-16 relative">
      <div className="flex items-start gap-5">
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
        <div className="space-y-3 flex-1 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">{loanTypes[loanType]} Application</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">Complete your loan application in simple steps.</p>
        </div>
      </div>

      {profileLoading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-card border border-border rounded-2xl">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Retrieving secure account profile details...</p>
        </div>
      )}

      {profileError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading account profile: {profileError}. You can still fill the form manually.
          </AlertDescription>
        </Alert>
      )}

      {!profileLoading && (
        <>


          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                    index + 1 === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index + 1 < currentStep 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    index + 1 <= currentStep ? 'bg-background text-foreground' : ''
                  }`}>
                    {index + 1 < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="hidden md:block">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
              <CardDescription>
                Step {currentStep} of {totalSteps} - Fill in the required information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stepContent[currentStep - 1]()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={submitApplication}
                  disabled={!applicationData.agreeToTerms || !applicationData.agreeToCredit || submitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
