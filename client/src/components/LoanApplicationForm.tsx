
import { useState } from "react";
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
  Calendar
} from "lucide-react";

interface LoanApplicationProps {
  loanType: 'home' | 'car' | 'personal' | 'gold';
  onSubmit?: (applicationData: any) => void;
}

export function LoanApplicationForm({ loanType, onSubmit }: LoanApplicationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    maritalStatus: '',
    
    // Employment Information
    employmentType: '',
    companyName: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    otherIncome: '',
    
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

  const totalSteps = 5;
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

  const submitApplication = () => {
    if (onSubmit) {
      onSubmit(applicationData);
    }
    // Handle form submission
    console.log('Application submitted:', applicationData);
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

      <div>
        <Label htmlFor="maritalStatus">Marital Status</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div><strong>Email:</strong> {applicationData.email}</div>
            <div><strong>Phone:</strong> {applicationData.phone}</div>
            <div><strong>Address:</strong> {applicationData.address}, {applicationData.city}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Employment:</strong> {applicationData.employmentType}</div>
            <div><strong>Company:</strong> {applicationData.companyName}</div>
            <div><strong>Monthly Income:</strong> ₹{applicationData.monthlyIncome}</div>
            <div><strong>Experience:</strong> {applicationData.workExperience} years</div>
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
    'Loan Requirements',
    'Document Upload',
    'Review & Submit'
  ];

  const stepContent = [
    renderPersonalInfo,
    renderEmploymentInfo,
    renderLoanDetails,
    renderDocuments,
    renderReview
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{loanTypes[loanType]} Application</h1>
        <p className="text-muted-foreground">Complete your loan application in simple steps</p>
      </div>

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
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                index + 1 <= currentStep ? 'bg-white text-black' : ''
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
              disabled={!applicationData.agreeToTerms || !applicationData.agreeToCredit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
