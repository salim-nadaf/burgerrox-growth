import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutInfo {
  name: string;
  whatsapp: string;
}

interface CheckoutInfoFormProps {
  onSubmit: (info: CheckoutInfo) => void;
  loading?: boolean;
}

const GUEST_INFO_KEY = "brx_guest_info";

const isAllSameDigits = (num: string) => /^(.)\1{9}$/.test(num);

const isValidIndianMobile = (num: string): { valid: boolean; message?: string } => {
  if (!/^\d{10}$/.test(num)) {
    return { valid: false, message: "Please enter a valid 10-digit WhatsApp number" };
  }
  if (!/^[6-9]/.test(num)) {
    return { valid: false, message: "Number must start with 6, 7, 8, or 9" };
  }
  if (isAllSameDigits(num)) {
    return { valid: false, message: "Please enter a valid WhatsApp number for order confirmation" };
  }
  return { valid: true };
};

export const saveGuestInfo = (info: CheckoutInfo) => {
  try {
    localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(info));
  } catch {}
};

export const loadGuestInfo = (): CheckoutInfo | null => {
  try {
    const raw = localStorage.getItem(GUEST_INFO_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const CheckoutInfoForm = ({ onSubmit, loading }: CheckoutInfoFormProps) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});

  // Prefill from localStorage for returning users
  useEffect(() => {
    const saved = loadGuestInfo();
    if (saved) {
      setName(saved.name || "");
      setWhatsapp(saved.whatsapp || "");
    }
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Please enter your name (min 2 characters)";
    }
    const phoneCheck = isValidIndianMobile(whatsapp);
    if (!phoneCheck.valid) {
      newErrors.whatsapp = phoneCheck.message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const info = { name: name.trim(), whatsapp };
    saveGuestInfo(info);
    onSubmit(info);
  };

  return (
    <div className="space-y-5 p-4">
      <div className="text-center">
        <h2 className="font-bebas text-2xl tracking-wider">Complete Your Order</h2>
        <p className="font-montserrat text-sm text-muted-foreground mt-1">
          Enter your details to confirm your order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="checkout-name">Your Name *</Label>
          <Input
            id="checkout-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
          {errors.name && <p className="text-xs text-destructive font-montserrat">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-whatsapp">
            WhatsApp Number (order updates will be sent here) *
          </Label>
          <Input
            id="checkout-whatsapp"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter active WhatsApp number"
            autoComplete="tel"
            required
          />
          <p className="text-xs text-muted-foreground font-montserrat">
            We'll send order updates on this WhatsApp number.
          </p>
          {errors.whatsapp && <p className="text-xs text-destructive font-montserrat">{errors.whatsapp}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : "Proceed to Order"}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutInfoForm;
