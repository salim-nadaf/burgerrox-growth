import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

interface AuthFormProps {
  onClose?: () => void;
}

const AuthForm = ({ onClose }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email", description: "Password reset link has been sent to your email." });
          setIsForgotPassword(false);
        }
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "You have logged in successfully." });
          onClose?.();
        }
      } else {
        if (!name.trim()) {
          toast({ title: "Name Required", description: "Please enter your name.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, name, whatsapp, area);
        if (result.error) {
          toast({ title: "Signup Failed", description: result.error.message, variant: "destructive" });
        } else if (result.needsConfirmation) {
          toast({ title: "Check your email", description: result.message || "Please verify your email before logging in." });
          setIsLogin(true);
        } else {
          toast({ title: "Welcome!", description: "Account created successfully." });
          onClose?.();
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center">
          <h2 className="font-bebas text-3xl tracking-wider">Reset Password</h2>
          <p className="font-montserrat text-sm text-muted-foreground mt-1">
            Enter your email to receive a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
            Back to Login
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h2 className="font-bebas text-3xl tracking-wider">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="font-montserrat text-sm text-muted-foreground mt-1">
          {isLogin ? "Login to your Burger Rox account" : "Join the Burger Rox family"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area / Society</Label>
              <Input
                id="area"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Urban Forest, Mamurdi"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {isLogin && (
          <button
            type="button"
            className="text-sm text-primary hover:underline font-montserrat"
            onClick={() => setIsForgotPassword(true)}
          >
            Forgot password?
          </button>
        )}
        <p className="font-montserrat text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
