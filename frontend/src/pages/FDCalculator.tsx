import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PiggyBank, Percent, Calendar, CheckCircle } from "lucide-react";

export function FDCalculator() {
  const [depositAmount, setDepositAmount] = useState(50000); // INR
  const [tenureMonths, setTenureMonths] = useState(36); // months
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [interestRate, setInterestRate] = useState(8.25);
  const [maturityAmount, setMaturityAmount] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Shriram Finance typical FD interest rates schedule based on tenure
  const getBaseInterestRate = (months: number) => {
    if (months < 12) return 6.75;
    if (months < 24) return 7.50;
    if (months < 36) return 8.00;
    if (months < 48) return 8.25;
    return 8.50; // 48-60 months
  };

  useEffect(() => {
    let rate = getBaseInterestRate(tenureMonths);
    if (isSeniorCitizen) {
      rate += 0.50; // Senior Citizen bonus rate
    }
    setInterestRate(rate);
  }, [tenureMonths, isSeniorCitizen]);

  useEffect(() => {
    // A = P * (1 + r/n)^(nt)
    // For quarterly compounding (common in Indian bank FDs, n = 4)
    const P = depositAmount;
    const r = interestRate / 100;
    const t = tenureMonths / 12;
    const n = 4; // compounded quarterly

    const calculatedMaturity = P * Math.pow(1 + r / n, n * t);
    const calculatedInterest = calculatedMaturity - P;

    setMaturityAmount(Math.round(calculatedMaturity));
    setInterestEarned(Math.round(calculatedInterest));
  }, [depositAmount, interestRate, tenureMonths]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, [showApplyModal]);

  const handleBookFD = async () => {
    setBookingError(null);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoggedIn(false);
      setShowApplyModal(true);
      return;
    }

    try {
      setIsBooking(true);
      
      const servicesRes = await fetch("/api/services");
      if (!servicesRes.ok) {
        throw new Error("Failed to retrieve service catalog.");
      }
      const servicesData = await servicesRes.json();
      const fdService = servicesData.services?.find((s: any) => s.name === "fixed-deposit");
      
      if (!fdService) {
        throw new Error("Fixed Deposit scheme is currently not active in service registry.");
      }

      const bookRes = await fetch("/api/user-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceTypeId: fdService.id,
          amount: depositAmount.toString(),
          tenure: tenureMonths,
          interestRate: interestRate.toString(),
          purpose: "Fixed Deposit Investment",
          status: "active"
        })
      });

      if (!bookRes.ok) {
        const errData = await bookRes.json();
        throw new Error(errData.error || "Failed to book Fixed Deposit.");
      }

      const bookData = await bookRes.json();
      setBookingRef(bookData.service.applicationNumber);
      setBookingError(null);
      setIsLoggedIn(true);
      setShowApplyModal(true);
    } catch (err: any) {
      console.error("FD booking error:", err);
      setBookingError(err.message || "An unexpected error occurred during booking.");
      setShowApplyModal(true);
    } finally {
      setIsBooking(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMaturityDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + tenureMonths);
    return today.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Fixed Deposit (FD) Calculator</h2>
        <p className="text-muted-foreground">
          Grow your savings with secure high-yield returns. Plan your future returns instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <PiggyBank className="h-5 w-5 text-primary" />
              Investment Parameters
            </CardTitle>
            <CardDescription>Adjust sliders to match your investment target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Deposit Amount</Label>
                <span className="text-lg font-bold text-secondary">{formatCurrency(depositAmount)}</span>
              </div>
              <Slider
                value={[depositAmount]}
                onValueChange={(val) => setDepositAmount(val[0])}
                min={5000}
                max={1500000}
                step={5000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min ₹5,000</span>
                <span>Max ₹15 Lakhs</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Tenure (Months)</Label>
                <span className="text-lg font-bold text-secondary">{tenureMonths} Months</span>
              </div>
              <Slider
                value={[tenureMonths]}
                onValueChange={(val) => setTenureMonths(val[0])}
                min={12}
                max={60}
                step={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min 12 Mo</span>
                <span>Max 60 Mo</span>
              </div>
            </div>

            {/* Citizen Category */}
            <div className="pt-2 border-t space-y-3">
              <Label className="text-sm font-semibold">Investor Category</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={!isSeniorCitizen ? "default" : "outline"}
                  onClick={() => setIsSeniorCitizen(false)}
                  className="flex-1 font-medium"
                >
                  Regular Citizen
                </Button>
                <Button
                  type="button"
                  variant={isSeniorCitizen ? "default" : "outline"}
                  onClick={() => setIsSeniorCitizen(true)}
                  className="flex-1 font-medium"
                >
                  Senior Citizen (+0.5% Extra)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="bg-secondary/5 border-secondary-foreground/15">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-secondary">Maturity Returns Overview</CardTitle>
            <CardDescription>Est. returns based on current interest schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Total Card */}
            <div className="text-center p-6 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Maturity Amount</div>
              <div className="text-4xl font-extrabold text-secondary" data-testid="text-maturity-amount">
                {formatCurrency(maturityAmount)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Compound Frequency: Quarterly (Compounded 4 times a year)
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-card border rounded-lg">
                <div className="text-xs text-muted-foreground mb-0.5">Principal Invested</div>
                <div className="text-xl font-bold text-foreground">{formatCurrency(depositAmount)}</div>
              </div>
              <div className="p-4 bg-white dark:bg-card border rounded-lg">
                <div className="text-xs text-muted-foreground mb-0.5">Interest Earned</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(interestEarned)}</div>
              </div>
            </div>

            {/* Interest Rate & Maturity Date Info */}
            <div className="p-4 bg-white dark:bg-card border rounded-lg space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-primary" />
                  Interest Rate Applied:
                </span>
                <span className="font-bold text-secondary">{interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Maturity Date:
                </span>
                <span className="font-bold text-secondary">{getMaturityDate()}</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <Button
              className="w-full bg-primary text-primary-foreground font-bold py-3 text-base shadow hover:opacity-90"
              onClick={handleBookFD}
              disabled={isBooking}
            >
              {isBooking ? "Booking Investment Account..." : "Invest & Open FD Account Now"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          {!isLoggedIn ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-600 font-bold">Authentication Required</DialogTitle>
                <DialogDescription>
                  You must be logged in to book a high-yield Fixed Deposit investment account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Please log in or register a new customer account to access investment features.
                </p>
              </div>
              <Button onClick={() => setShowApplyModal(false)} className="w-full">
                Close
              </Button>
            </>
          ) : bookingError ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-600 font-bold">Investment Booking Failed</DialogTitle>
                <DialogDescription>
                  An error occurred while attempting to book your Fixed Deposit.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-red-600 font-medium">
                  Error: {bookingError}
                </p>
              </div>
              <Button onClick={() => setShowApplyModal(false)} className="w-full">
                Close
              </Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Fixed Deposit Activated!
                </DialogTitle>
                <DialogDescription>
                  Your high-yield Fixed Deposit investment of {formatCurrency(depositAmount)} for {tenureMonths} months is now active.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your funds are successfully deposited. You can view your investment details anytime inside the customer portal.
                </p>
                <div className="bg-muted p-3.5 rounded text-xs text-muted-foreground space-y-1 font-mono">
                  <p>📍 Ref Account: {bookingRef}</p>
                  <p>📈 Applied Rate: {interestRate}% p.a.</p>
                  <p>💰 Est. Maturity Value: {formatCurrency(maturityAmount)}</p>
                  <p>📅 Maturity Date: {getMaturityDate()}</p>
                </div>
              </div>
              <Button onClick={() => setShowApplyModal(false)} className="w-full">
                Done
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
