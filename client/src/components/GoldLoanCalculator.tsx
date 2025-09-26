import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Weight, Percent, Calculator, DollarSign } from "lucide-react";

interface GoldLoanResult {
  loanAmount: number;
  eligibleAmount: number;
  goldValue: number;
  ltvRatio: number;
}

export function GoldLoanCalculator() {
  const [goldWeight, setGoldWeight] = useState(50); // in grams
  const [goldPurity, setGoldPurity] = useState("22K");
  const [loanTenure, setLoanTenure] = useState(12); // months
  const [interestRate, setInterestRate] = useState(12);
  const [result, setResult] = useState<GoldLoanResult | null>(null);

  // Current gold rates (mock data)
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Gold Loan Calculator</h2>
        <p className="text-muted-foreground">
          Calculate how much loan you can get against your gold jewelry with instant valuation
        </p>
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
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Gold Weight (grams)
              </Label>
              <Input
                id="weight"
                type="number"
                value={goldWeight}
                onChange={(e) => setGoldWeight(Number(e.target.value))}
                data-testid="input-gold-weight"
                className="text-lg"
              />
              <Slider
                value={[goldWeight]}
                onValueChange={(value) => setGoldWeight(value[0])}
                max={500}
                min={5}
                step={5}
                className="w-full"
                data-testid="slider-gold-weight"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>5g</span>
                <span className="font-medium">{goldWeight}g</span>
                <span>500g</span>
              </div>
            </div>

            {/* Gold Purity */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Gold Purity
              </Label>
              <Select value={goldPurity} onValueChange={setGoldPurity}>
                <SelectTrigger data-testid="select-gold-purity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24K">24K - ₹{goldRates["24K"]}/g</SelectItem>
                  <SelectItem value="22K">22K - ₹{goldRates["22K"]}/g</SelectItem>
                  <SelectItem value="18K">18K - ₹{goldRates["18K"]}/g</SelectItem>
                  <SelectItem value="14K">14K - ₹{goldRates["14K"]}/g</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interest Rate */}
            <div className="space-y-3">
              <Label htmlFor="interest" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Interest Rate (Annual %)
              </Label>
              <Input
                id="interest"
                type="number"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                data-testid="input-interest-rate"
                className="text-lg"
              />
              <Slider
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(value[0])}
                max={24}
                min={8}
                step={0.5}
                className="w-full"
                data-testid="slider-interest-rate"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>8%</span>
                <span className="font-medium">{interestRate}%</span>
                <span>24%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div className="space-y-3">
              <Label htmlFor="tenure" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Loan Tenure (months)
              </Label>
              <Input
                id="tenure"
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                data-testid="input-loan-tenure"
                className="text-lg"
              />
              <Slider
                value={[loanTenure]}
                onValueChange={(value) => setLoanTenure(value[0])}
                max={36}
                min={6}
                step={6}
                className="w-full"
                data-testid="slider-loan-tenure"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>6 months</span>
                <span className="font-medium">{loanTenure} months</span>
                <span>36 months</span>
              </div>
            </div>

            <Button
              onClick={calculateLoan}
              className="w-full"
              size="lg"
              data-testid="button-calculate-gold-loan"
            >
              Calculate Gold Loan
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card data-testid="card-gold-results">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Loan Assessment
            </CardTitle>
            <CardDescription>
              Your gold valuation and eligible loan amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <>
                {/* Loan Amount */}
                <div className="text-center p-6 bg-secondary/5 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Eligible Loan Amount</div>
                  <div className="text-4xl font-bold text-secondary" data-testid="text-loan-amount">
                    {formatCurrency(result.loanAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Against {goldWeight}g of {goldPurity} gold
                  </div>
                </div>

                {/* EMI Information */}
                <div className="p-4 bg-primary/5 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Monthly EMI</div>
                  <div className="text-2xl font-semibold text-primary" data-testid="text-gold-emi">
                    {formatCurrency(calculateEMI())}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    for {loanTenure} months at {interestRate}% annual interest
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Gold Value</div>
                    <div className="text-xl font-semibold text-foreground" data-testid="text-gold-value">
                      {formatCurrency(result.goldValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @₹{goldRates[goldPurity as keyof typeof goldRates]}/g
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">LTV Ratio</div>
                    <div className="text-xl font-semibold text-secondary" data-testid="text-ltv-ratio">
                      {result.ltvRatio}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Loan to Value
                    </div>
                  </div>
                </div>

                {/* Gold Rate Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Current Gold Rates</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(goldRates).map(([purity, rate]) => (
                      <div key={purity} className="flex justify-between">
                        <span className={purity === goldPurity ? "font-medium text-primary" : ""}>
                          {purity}:
                        </span>
                        <span className={purity === goldPurity ? "font-medium text-primary" : ""}>
                          ₹{rate}/g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">Why Choose Gold Loans?</h4>
                  <ul className="space-y-1">
                    <li>• Minimal documentation required</li>
                    <li>• Quick approval within hours</li>
                    <li>• No income proof needed</li>
                    <li>• Competitive interest rates</li>
                    <li>• Gold remains safe in our vault</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}