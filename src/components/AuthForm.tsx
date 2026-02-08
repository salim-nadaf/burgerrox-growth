import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onClose: () => void;
  /** Called after successful login or sign-up (before onClose). Use to e.g. add pending cart item. */
  onSuccess?: () => void;
}

export default function AuthForm({ onClose, onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    whatsapp: '',
    area: ''
  });

  const { signIn, signUp, resetPassword } = useAuth();

  const validateForm = () => {
    // Email validation - allow .com, .in, .edu
    const allowedExtensions = ['.com', '.in', '.edu'];
    if (!allowedExtensions.some(ext => formData.email.endsWith(ext))) {
      toast({
        title: "Invalid Email",
        description: "Email must end with .com, .in, or .edu",
        variant: "destructive"
      });
      return false;
    }

    // For login, skip password validation since we're checking credentials against database
    if (!isLogin) {
      // Password validation - 8 chars, uppercase, lowercase, special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast({
          title: "Invalid Password",
          description: "Password must be 8+ characters with uppercase, lowercase, and special character",
          variant: "destructive"
        });
        return false;
      }
    }

    if (!isLogin) {
      // Phone validation - exactly 10 digits
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.whatsapp)) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be exactly 10 digits",
          variant: "destructive"
        });
        return false;
      }

      // Area validation - at least 4 letters
      if (formData.area.length < 4) {
        toast({
          title: "Invalid Area",
          description: "Area must be at least 4 characters long",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Login error:', error);
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Login successful');
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in",
          });
          onSuccess?.();
          onClose();
        }
      } else {
        if (!formData.name || !formData.whatsapp || !formData.area) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log('Attempting signup with:', formData.email, formData.name);
        const { error, needsConfirmation, message } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.whatsapp,
          formData.area
        );

        if (error) {
          console.error('Signup error:', error);
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive"
          });
        } else if (needsConfirmation) {
          console.log('Signup successful - confirmation needed');
          toast({
            title: "Account Created!",
            description: message || "Please check your email to confirm your account before logging in.",
          });
          // Switch to login mode after successful signup
          setIsLogin(true);
          // Clear form data except email
          setFormData(prev => ({
            email: prev.email,
            password: '',
            name: '',
            whatsapp: '',
            area: ''
          }));
        } else {
          console.log('Signup successful - logged in immediately');
          toast({
            title: "Welcome to Burger Rox!",
            description: "Your account has been created and you're now logged in.",
          });
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!resetEmail.endsWith('.com')) {
      toast({
        title: "Invalid Email",
        description: "Email must end with .com",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    setLoading(false);

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <p className="text-muted-foreground mt-2">
          {isLogin 
            ? 'Enter your credentials to access your account' 
            : 'Create your account to start ordering delicious burgers'
          }
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
              pattern=".*(\.com|\.in|\.edu)$"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                minLength={isLogin ? 1 : 8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Your WhatsApp number"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Your location"
                  required
                  minLength={4}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </Button>

          <div className="text-center mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline block w-full"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"
              }
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:underline block w-full"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleForgotPassword} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}