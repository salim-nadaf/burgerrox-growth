import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { loadGuestInfo } from "./CheckoutInfoForm";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const isAllSameDigits = (num: string) => /^(.)\1{9}$/.test(num);

const LoginModal = ({ open, onOpenChange, onSuccess }: LoginModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill phone from guest info
  const handleOpen = () => {
    const saved = loadGuestInfo();
    if (saved?.whatsapp) setPhone(saved.whatsapp);
    if (saved?.name) setName(saved.name);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!phone || !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    } else if (!/^[6-9]/.test(phone)) {
      newErrors.phone = "Number must start with 6, 7, 8, or 9";
    } else if (isAllSameDigits(phone)) {
      newErrors.phone = "Enter a valid mobile number";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (mode === "signup" && (!name.trim() || name.trim().length < 2)) {
      newErrors.name = "Name must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fakeEmail = `${phone}@burgerrox.app`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        // Try signup
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              whatsapp_number: phone,
              area: localStorage.getItem("brx_guest_address") || "",
            },
          },
        });

        if (error) {
          // If user already exists, suggest login
          if (error.message?.includes("already registered") || error.message?.includes("already been registered")) {
            setErrors({ phone: "This number is already registered. Please log in." });
            setMode("login");
          } else {
            setErrors({ phone: error.message });
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Link guest data to profile
          await linkGuestData(data.user.id);
          toast({ title: "Account created!", description: "You're now logged in." });
          onSuccess();
          onOpenChange(false);
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });

        if (error) {
          if (error.message?.includes("Invalid login")) {
            setErrors({ password: "Wrong password or number not registered" });
          } else {
            setErrors({ password: error.message });
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          await linkGuestData(data.user.id);
          toast({ title: "Welcome back!", description: "Continuing with your order." });
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (err: any) {
      setErrors({ phone: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const linkGuestData = async (userId: string) => {
    try {
      const guestInfo = loadGuestInfo();
      const guestAddr = localStorage.getItem("brx_guest_address") || "";

      if (guestInfo?.name || guestInfo?.whatsapp) {
        // Update profile with guest data
        await (supabase as any)
          .from("profiles")
          .update({
            name: guestInfo.name || name.trim(),
            whatsapp_number: guestInfo.whatsapp || phone,
            area: guestAddr || null,
          })
          .eq("user_id", userId);
      }

      // Also upsert customer record
      await supabase.functions.invoke("save-customer", {
        body: {
          name: guestInfo?.name || name.trim(),
          whatsapp: guestInfo?.whatsapp || phone,
          address: guestAddr || null,
        },
      });
    } catch (err) {
      console.error("Error linking guest data:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bebas text-2xl tracking-wider text-center">
            {mode === "login" ? "LOG IN TO ORDER" : "CREATE ACCOUNT"}
          </DialogTitle>
          <DialogDescription className="text-center font-montserrat text-sm text-muted-foreground">
            Verify your mobile to confirm order.
            <br />
            <span className="text-xs">We'll send order updates on WhatsApp.</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="login-name" className="font-montserrat text-sm font-medium">
                Your Name *
              </Label>
              <Input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-phone" className="font-montserrat text-sm font-medium">
              Mobile Number *
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <Input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter WhatsApp number"
                className="rounded-l-none"
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="font-montserrat text-sm font-medium">
              Password *
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" variant="brand" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : mode === "login" ? (
              "Log In & Place Order"
            ) : (
              "Create Account & Order"
            )}
          </Button>

          <div className="text-center">
            {mode === "login" ? (
              <button
                type="button"
                className="font-montserrat text-xs text-primary hover:underline"
                onClick={() => { setMode("signup"); setErrors({}); }}
              >
                New here? Create an account
              </button>
            ) : (
              <button
                type="button"
                className="font-montserrat text-xs text-primary hover:underline"
                onClick={() => { setMode("login"); setErrors({}); }}
              >
                Already have an account? Log in
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-montserrat">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Your data is securely stored</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
