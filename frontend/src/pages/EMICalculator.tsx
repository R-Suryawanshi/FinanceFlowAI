import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Calendar, Percent } from "lucide-react";

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
}

interface EMICalculatorProps {
  onApply?: (loanType: 'home' | 'car' | 'personal' | 'gold', amount: number, tenure: number) => void;
}

export function EMICalculator({ onApply }: EMICalculatorProps) {
  const [selectedType, setSelectedType] = useState<'home' | 'car' | 'personal' | 'gold'>('personal');
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(11.5);
  const [tenure, setTenure] = useState(60); // months
  const [result, setResult] = useState<EMIResult | null>(null);

  const calculateEMI = () => {
    const P = principal;
    const r = rate / 100 / 12; // monthly interest rate
    const n = tenure;

    if (P && r && n) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emi * n;
      const totalInterest = totalAmount - P;

      const calculatedResult = {
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        principalAmount: P,
      };

      setResult(calculatedResult);
      console.log('EMI Calculated:', calculatedResult);
    }
  };

  useEffect(() => {
    calculateEMI();
  }, [principal, rate, tenure]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const years = Math.floor(tenure / 12);
  const months = tenure % 12;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">EMI Calculator</h2>
        <p className="text-muted-foreground">
          Calculate your Equated Monthly Installment (EMI) for home loans, car loans, and personal loans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Inputs */}
        <Card data-testid="card-emi-inputs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Loan Details
            </CardTitle>
            <CardDescription>
              Enter your loan amount, interest rate, and tenure to calculate EMI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loan Type Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Loan Type</Label>
              <div className="flex gap-2.5">
                {(['personal', 'home', 'car', 'gold'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => {
                      setSelectedType(type);
                      if (type === 'personal') {
                        setRate(11.5);
                        setPrincipal(300000);
                        setTenure(36);
                      } else if (type === 'home') {
                        setRate(8.5);
                        setPrincipal(2500000);
                        setTenure(180);
                      } else if (type === 'car') {
                        setRate(9.5);
                        setPrincipal(800000);
                        setTenure(60);
                      } else if (type === 'gold') {
                        setRate(10.0);
                        setPrincipal(200000);
                        setTenure(24);
                      }
                    }}
                    className="flex-1 capitalize py-1 text-xs font-semibold"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Principal Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="principal" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Loan Amount
                </Label>
                <span className="text-base font-bold text-secondary">{formatCurrency(principal)}</span>
              </div>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                data-testid="input-principal"
                className="text-lg"
              />
              <Slider
                value={[principal]}
                onValueChange={(value) => setPrincipal(value[0])}
                max={selectedType === 'home' ? 15000000 : 2500000}
                min={20000}
                step={10000}
                className="w-full"
                data-testid="slider-principal"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹20,000</span>
                <span>Max {formatCurrency(selectedType === 'home' ? 15000000 : 2500000)}</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="rate" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Interest Rate (Annual %)
                </Label>
                <span className="text-base font-bold text-secondary">{rate}%</span>
              </div>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                data-testid="input-rate"
                className="text-lg"
              />
              <Slider
                value={[rate]}
                onValueChange={(value) => setRate(value[0])}
                max={20}
                min={5}
                step={0.1}
                className="w-full"
                data-testid="slider-rate"
              />
            </div>

            {/* Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="tenure" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tenure (Months)
                </Label>
                <span className="text-base font-bold text-secondary">{tenure} Months</span>
              </div>
              <Input
                id="tenure"
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                data-testid="input-tenure"
                className="text-lg"
              />
              <Slider
                value={[tenure]}
                onValueChange={(value) => setTenure(value[0])}
                max={selectedType === 'home' ? 360 : 84}
                min={6}
                step={6}
                className="w-full"
                data-testid="slider-tenure"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 Months</span>
                <span>Max {selectedType === 'home' ? 30 : 7} Years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card data-testid="card-emi-results">
          <CardHeader>
            <CardTitle>Calculation Summary</CardTitle>
            <CardDescription>
              Detailed breakdown of your estimated loan schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <>
                <div className="text-center p-6 bg-primary/5 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Monthly EMI</div>
                  <div className="text-4xl font-bold text-primary" data-testid="text-emi-amount">
                    {formatCurrency(result.emi)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    for {years > 0 && `${years} years`} {months > 0 && `${months} months`}
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Principal Amount</div>
                    <div className="text-2xl font-semibold text-foreground" data-testid="text-principal">
                      {formatCurrency(result.principalAmount)}
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                    <div className="text-2xl font-semibold text-secondary" data-testid="text-interest">
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Amount Payable</div>
                  <div className="text-2xl font-semibold text-foreground" data-testid="text-total">
                    {formatCurrency(result.totalAmount)}
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Payment Breakdown</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Principal</span>
                      <span className="font-medium">
                        {((result.principalAmount / result.totalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(result.principalAmount / result.totalAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Interest</span>
                      <span className="font-medium">
                        {((result.totalInterest / result.totalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{
                          width: `${(result.totalInterest / result.totalAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                {onApply && (
                  <Button
                    className="w-full bg-primary text-primary-foreground font-bold py-3 text-base shadow hover:opacity-90 mt-4"
                    onClick={() => onApply(selectedType, principal, tenure)}
                  >
                    Apply for this {selectedType} Loan Now
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