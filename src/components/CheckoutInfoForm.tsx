import { useState } from "react";
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

const CheckoutInfoForm = ({ onSubmit, loading }: CheckoutInfoFormProps) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Please enter your name (min 2 characters)";
    }
    if (!/^\d{10}$/.test(whatsapp)) {
      newErrors.whatsapp = "Please enter a valid 10-digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), whatsapp });
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
          <Label htmlFor="checkout-whatsapp">WhatsApp Number *</Label>
          <Input
            id="checkout-whatsapp"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter your WhatsApp number"
            autoComplete="tel"
            required
          />
          <p className="text-xs text-muted-foreground font-montserrat">
            We'll send order updates on WhatsApp.
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
