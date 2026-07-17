import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Landmark, LoaderCircle, UserPlus, UserRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; token?: string; error?: string } | undefined>;

  onSignup: (
    userData: { username: string; email: string; password: string; name: string }
  ) => Promise<{ success: boolean; error?: string } | undefined>;

  onOAuthSuccess?: (token: string, user: any) => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup, onOAuthSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [flow, setFlow] = useState<'login-signup' | 'forgot-request' | 'forgot-verify' | 'forgot-reset'>('login-signup');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [simulatedOtpBanner, setSimulatedOtpBanner] = useState<string | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSimulatedOtpBanner(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSimulatedOtpBanner(data.simulatedOTP);
        setFlow('forgot-verify');
      } else {
        setError(data.error || 'Failed to request password reset');
      }
    } catch (err) {
      console.error(err);
      setError('Network or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFlow('forgot-reset');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      console.error(err);
      setError('Network or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(resetPasswordData.password)) {
      setError('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.');
      setIsLoading(false);
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: resetPasswordData.password
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFlow('login-signup');
        setResetEmail('');
        setResetOtp('');
        setResetPasswordData({ password: '', confirmPassword: '' });
        setSimulatedOtpBanner(null);
        setError('');
        alert('Password reset successfully. You can now login with your new password.');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      setError('Network or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError('');
    try {
      const email = provider === 'google' ? 'google.user@bhalchandrafinance.com' : 'apple.user@bhalchandrafinance.com';
      const name = provider === 'google' ? 'Google User' : 'Apple User';

      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        if (onOAuthSuccess) {
          onOAuthSuccess(data.token, data.user);
        } else {
          window.location.reload();
        }
      } else {
        setError(data.error || `Failed to sign in with ${provider}`);
      }
    } catch (err) {
      console.error(err);
      setError('Network error during social sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await onLogin(loginEmail, loginPassword);

      if (result?.success) {
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        setLoginEmail('');
        setLoginPassword('');
        onClose();
      } else {
        // result could be undefined or an object without error
        setError(result?.error ?? 'Login failed. Please check credentials or try again.');
      }
    } catch (err) {
      console.error('login error:', err);
      setError('Network or server error while logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signupData.username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(signupData.password)) {
      setError('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.');
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onSignup({
        name: signupData.name,
        username: signupData.username,
        email: signupData.email,
        password: signupData.password
      });

      if (result?.success) {
        setSignupData({
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        onClose();
      } else {
        setError(result?.error ?? 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('signup error:', err);
      setError('Network or server error while signing up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-5 max-h-[calc(100vh-2rem)] overflow-y-auto border-white/70 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-7">
        {flow === 'login-signup' && (
          <>
            <DialogHeader className="pr-8 text-left flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-md shadow-blue-500/25">
                  <Landmark className="h-5 w-5" />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Welcome to Bhalchandra Finance</DialogTitle>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                {activeTab === 'signup' ? 'Create your account and begin managing your finances.' : 'Sign in securely to access your finance dashboard.'}
              </p>
            </DialogHeader>

            <Tabs defaultValue="login" className="w-full" onValueChange={(value) => { setActiveTab(value); setError(''); setShowPassword(false); setShowConfirmPassword(false); }}>
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="login" className="gap-1.5 rounded-lg text-xs font-semibold text-slate-500 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:text-sm"><UserRound className="h-3.5 w-3.5" />Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="gap-1.5 rounded-lg text-xs font-semibold text-slate-500 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:text-sm"><UserPlus className="h-3.5 w-3.5" />Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-5">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email" className="text-sm font-semibold text-slate-700">Email address</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 transition-all focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => { setFlow('forgot-request'); setError(''); }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold shadow-lg shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-cyan-600 hover:shadow-xl active:translate-y-0" disabled={isLoading}>
                    {isLoading ? <><LoaderCircle className="animate-spin" />Signing in…</> : <>Sign in <ArrowRight /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-5">
                <form onSubmit={handleSignup} className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">Full name</Label>
                  <Input
                    value={signupData.name}
                    onChange={(e) => setSignupData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    autoComplete="name"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                    required
                  />

                  <Label className="text-sm font-semibold text-slate-700">Username</Label>
                  <Input
                    value={signupData.username}
                    onChange={(e) => setSignupData((p) => ({ ...p, username: e.target.value }))}
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                    required
                  />

                  <Label className="text-sm font-semibold text-slate-700">Email address</Label>
                  <Input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                    required
                  />

                  <Label className="text-sm font-semibold text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Password must be at least 8 characters long, with 1 uppercase letter, 1 lowercase letter, and 1 number.
                  </p>

                  <Label className="text-sm font-semibold text-slate-700">Confirm password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold shadow-lg shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-cyan-600 hover:shadow-xl active:translate-y-0" disabled={isLoading}>
                    {isLoading ? <><LoaderCircle className="animate-spin" />Creating account…</> : <>Create account <ArrowRight /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}

        {flow === 'forgot-request' && (
          <div className="space-y-4">
            <DialogHeader className="pr-8 text-left flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setFlow('login-signup'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Back to login"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Reset Password</DialogTitle>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Enter your email address and we'll send you a 6-digit OTP code to verify your identity.
              </p>
            </DialogHeader>

            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-semibold text-slate-700">Email address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold shadow-lg shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-cyan-600 hover:shadow-xl active:translate-y-0" disabled={isLoading}>
                {isLoading ? <><LoaderCircle className="animate-spin" />Sending OTP…</> : <>Send OTP Code <ArrowRight /></>}
              </Button>
            </form>
          </div>
        )}

        {flow === 'forgot-verify' && (
          <div className="space-y-4">
            <DialogHeader className="pr-8 text-left flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setFlow('forgot-request'); setError(''); setSimulatedOtpBanner(null); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Back to email request"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Verify Code</DialogTitle>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                We've sent a 6-digit verification code to <span className="font-semibold text-slate-900">{resetEmail}</span>.
              </p>
            </DialogHeader>

            {simulatedOtpBanner && (
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-900 flex flex-col gap-1 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-blue-800"><Landmark className="h-3.5 w-3.5" /> Simulated OTP Code (Local Testing)</span>
                <span>Enter code <strong className="text-sm text-blue-700 font-extrabold">{simulatedOtpBanner}</strong> below to verify your password reset.</span>
              </div>
            )}

            <form onSubmit={handleForgotVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-otp" className="text-sm font-semibold text-slate-700">6-Digit Code</Label>
                <Input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="h-12 text-center text-xl font-bold tracking-[0.5em] rounded-xl border-slate-200 bg-slate-50/70 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold shadow-lg shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-cyan-600 hover:shadow-xl active:translate-y-0" disabled={isLoading}>
                {isLoading ? <><LoaderCircle className="animate-spin" />Verifying…</> : <>Verify Code <ArrowRight /></>}
              </Button>
            </form>
          </div>
        )}

        {flow === 'forgot-reset' && (
          <div className="space-y-4">
            <DialogHeader className="pr-8 text-left flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setFlow('forgot-verify'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Back to OTP verification"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Set New Password</DialogTitle>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Please enter a secure new password for your Bhalchandra account.
              </p>
            </DialogHeader>

            <form onSubmit={handleForgotReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={resetPasswordData.password}
                    onChange={(e) => setResetPasswordData(p => ({ ...p, password: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-blue-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  Password must be at least 8 characters long, with 1 uppercase letter, 1 lowercase letter, and 1 number.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-sm font-semibold text-slate-700">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-blue-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold shadow-lg shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-cyan-600 hover:shadow-xl active:translate-y-0" disabled={isLoading}>
                {isLoading ? <><LoaderCircle className="animate-spin" />Resetting password…</> : <>Reset Password <ArrowRight /></>}
              </Button>
            </form>
          </div>
        )}

        {flow === 'login-signup' && (
          <div className="mt-2 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.545 6.727l3.72 3.038z"
                  />
                  <path
                    fill="#4285F4"
                    d="M16.04 15.345c-1.077.737-2.43 1.173-4.04 1.173a7.077 7.077 0 0 1-6.734-4.855L1.545 14.7c1.828 3.99 5.81 6.727 10.455 6.727 3.109 0 5.927-1.027 8.082-2.79l-4.041-3.29z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 11.663a7.03 7.03 0 0 1 0-2.316l-3.72-2.62a12.012 12.012 0 0 0 0 7.556l3.72-2.62z"
                  />
                  <path
                    fill="#34A853"
                    d="M20.082 11.663c.273 0 .546-.027.818-.082v-3.727h-8.9v3.81h5.082a4.42 4.42 0 0 1-1.927 2.89l4.04 3.29c2.373-2.18 3.886-5.4 3.886-9.182z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('apple')}
                className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <svg className="h-4.5 w-4.5 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.02 0-1.4-.62-2.58-.62-1.18 0-1.6.6-2.58.64-1.02.03-2.2-1-3.18-1.95-2-1.96-3.52-5.54-3.52-8.87 0-5.28 3.44-8.08 6.82-8.08 1.07 0 2.07.67 2.73.67.67 0 1.9-.8 3.2-.67.54.02 2.07.2 3.05 1.63-.08.05-1.82 1.05-1.82 3.16 0 2.5 2.07 3.4 2.1 3.43-.02.08-.33 1.15-1.1 2.26zM15.42 4.42c.86-1.06 1.44-2.5 1.44-3.95 0-.2-.03-.4-.06-.59-1.34.05-2.96.88-3.92 2.01-.8.95-1.5 2.4-1.5 3.85 0 .2.03.43.08.6 1.47 0 3.02-.85 3.96-1.92z" />
                </svg>
                Apple
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
