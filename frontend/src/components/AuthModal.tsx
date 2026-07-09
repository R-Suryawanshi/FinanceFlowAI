import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';

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
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to FinanceHub</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full" onValueChange={() => { setError(''); setShowPassword(false); setShowConfirmPassword(false); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">User Login</TabsTrigger>
            <TabsTrigger value="admin-login">Admin Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <Label>Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in…' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="admin-login">
            <form onSubmit={handleLogin} className="space-y-4">
              <Label>Admin Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Logging in…' : 'Admin Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <Label>Full Name</Label>
              <Input
                value={signupData.name}
                onChange={(e) => setSignupData((p) => ({ ...p, name: e.target.value }))}
                required
              />

              <Label>Username</Label>
              <Input
                value={signupData.username}
                onChange={(e) => setSignupData((p) => ({ ...p, username: e.target.value }))}
                required
              />

              <Label>Email</Label>
              <Input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
                required
              />

              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Password must be at least 8 characters long, with 1 uppercase letter, 1 lowercase letter, and 1 number.
              </p>

              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account…' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}