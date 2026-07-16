import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Weight, Percent, Calendar, DollarSign, ArrowLeft } from "lucide-react";

interface GoldLoanResult {
  loanAmount: number;
  eligibleAmount: number;
  goldValue: number;
  ltvRatio: number;
}

interface GoldLoanCalculatorProps {
  onApply?: (loanType: 'home' | 'car' | 'personal' | 'gold', amount: number, tenure: number) => void;
  onBack?: () => void;
}

export function GoldLoanCalculator({ onApply, onBack }: GoldLoanCalculatorProps) {
  const [goldWeight, setGoldWeight] = useState(50); // in grams
  const [goldPurity, setGoldPurity] = useState("22K");
  const [loanTenure, setLoanTenure] = useState(12); // months
  const [interestRate, setInterestRate] = useState(10);
  const [result, setResult] = useState<GoldLoanResult | null>(null);

  // Current gold rates
  const goldRates = {
    "24K": 6500,
    "22K": 5950,
    "18K": 4875,
    "14K": 3790,
  };

  const calculateLoan = () => {
    const currentRate = goldRates[goldPurity as keyof typeof goldRates];
    const goldValue = goldWeight * currentRate;
    
    // LTV (Loan to Value) ratio - typically 75% for gold loans
    const ltvRatio = 75;
    const eligibleAmount = (goldValue * ltvRatio) / 100;
    
    const calculatedResult = {
      loanAmount: Math.round(eligibleAmount),
      eligibleAmount: Math.round(eligibleAmount),
      goldValue: Math.round(goldValue),
      ltvRatio,
    };

    setResult(calculatedResult);
    console.log('Gold Loan Calculated:', calculatedResult);
  };

  useEffect(() => {
    calculateLoan();
  }, [goldWeight, goldPurity, loanTenure, interestRate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateEMI = () => {
    if (!result) return 0;
    const P = result.loanAmount;
    const r = interestRate / 100 / 12;
    const n = loanTenure;
    
    if (P && r && n) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return Math.round(emi);
    }
    return 0;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start gap-5 mb-8">
        {onBack && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            data-testid="page-back-button"
            className="h-10 w-10 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-2 flex-1 text-left">
          <h2 className="text-3xl font-bold text-foreground">Gold Loan Calculator</h2>
          <p className="text-muted-foreground">
            Calculate how much loan you can get against your gold jewelry with instant valuation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Inputs */}
        <Card data-testid="card-gold-inputs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-secondary" />
              Gold Details
            </CardTitle>
            <CardDescription>
              Enter your gold weight, purity, and loan requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gold Weight */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Gold Weight (Grams)
                </Label>
                <span className="text-base font-bold text-secondary">{goldWeight} g</span>
              </div>
              <Input
                id="weight"
                type="number"
                value={goldWeight}
                onChange={(e) => setGoldWeight(Number(e.target.value))}
                className="text-lg"
              />
              <Slider
                value={[goldWeight]}
                onValueChange={(val) => setGoldWeight(val[0])}
                min={5}
                max={500}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 g</span>
                <span>Max 500 g</span>
              </div>
            </div>

            {/* Gold Purity */}
            <div className="space-y-2">
              <Label htmlFor="purity" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Gold Purity (Karat)
              </Label>
              <Select value={goldPurity} onValueChange={setGoldPurity}>
                <SelectTrigger id="purity" className="text-lg py-6">
                  <SelectValue placeholder="Select Purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24K">24 Karat (99.9% Pure)</SelectItem>
                  <SelectItem value="22K">22 Karat (91.6% Pure)</SelectItem>
                  <SelectItem value="18K">18 Karat (75.0% Pure)</SelectItem>
                  <SelectItem value="14K">14 Karat (58.5% Pure)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="tenure" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Loan Tenure (Months)
                </Label>
                <span className="text-base font-bold text-secondary">{loanTenure} Months</span>
              </div>
              <Slider
                value={[loanTenure]}
                onValueChange={(val) => setLoanTenure(val[0])}
                min={6}
                max={36}
                step={6}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 Months</span>
                <span>Max 3 Years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card data-testid="card-gold-results">
          <CardHeader>
            <CardTitle>Estimation Summary</CardTitle>
            <CardDescription>
              Based on standard 75% LTV (Loan-to-Value) market gold rate calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <>
                <div className="text-center p-6 bg-primary/5 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Eligible Loan Amount</div>
                  <div className="text-4xl font-bold text-primary" data-testid="text-eligible-amount">
                    {formatCurrency(result.eligibleAmount)}
                  </div>
                  <div className="text-sm mt-2 text-foreground font-semibold flex justify-center items-center gap-1.5">
                    Est. EMI: {formatCurrency(calculateEMI())}/mo
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    for {loanTenure} months at {interestRate}% annual interest
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Gold Market Value</div>
                    <div className="text-xl font-semibold text-foreground" data-testid="text-gold-value">
                      {formatCurrency(result.goldValue)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      @₹{goldRates[goldPurity as keyof typeof goldRates]}/g
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">LTV Ratio Allowed</div>
                    <div className="text-xl font-semibold text-secondary" data-testid="text-ltv-ratio">
                      {result.ltvRatio}%
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      RBI regulatory limit cap
                    </div>
                  </div>
                </div>

                {/* Gold Rate Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide mb-3">Current Gold Valuation Ledger</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(goldRates).map(([purity, rate]) => (
                      <div key={purity} className="flex justify-between">
                        <span className={purity === goldPurity ? "font-bold text-primary" : "text-muted-foreground"}>
                          {purity} Rate:
                        </span>
                        <span className={purity === goldPurity ? "font-bold text-primary" : "text-foreground"}>
                          ₹{rate}/g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <h4 className="font-semibold text-foreground">Gold Loan Schemes Highlights:</h4>
                  <ul className="space-y-0.5">
                    <li>• Minimal documentation required, direct vault storage</li>
                    <li>• Quick approval and disbursal within 2-3 hours</li>
                    <li>• No salary proof or high credit score thresholds needed</li>
                    <li>• Competitive processing fee from 0.5%</li>
                  </ul>
                </div>

                {/* Apply CTA Button */}
                {onApply && (
                  <Button
                    className="w-full bg-primary text-primary-foreground font-bold py-3 text-base shadow hover:opacity-90 mt-4"
                    onClick={() => onApply('gold', result.eligibleAmount, loanTenure)}
                  >
                    Apply for this Gold Loan Now
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}