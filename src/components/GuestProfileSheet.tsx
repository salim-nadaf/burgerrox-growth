import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import { loadGuestInfo, saveGuestInfo } from "./CheckoutInfoForm";

const isAllSameDigits = (num: string) => /^(.)\1{9}$/.test(num);

const GuestProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const saved = loadGuestInfo();
      const savedAddr = localStorage.getItem("brx_guest_address") || "";
      setFormData({
        name: saved?.name || "",
        whatsapp: saved?.whatsapp || "",
        address: savedAddr,
      });
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (formData.whatsapp) {
      if (!/^\d{10}$/.test(formData.whatsapp)) {
        newErrors.whatsapp = "Must be exactly 10 digits";
      } else if (!/^[6-9]/.test(formData.whatsapp)) {
        newErrors.whatsapp = "Must start with 6, 7, 8, or 9";
      } else if (isAllSameDigits(formData.whatsapp)) {
        newErrors.whatsapp = "Please enter a valid WhatsApp number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveGuestInfo({ name: formData.name.trim(), whatsapp: formData.whatsapp });
    if (formData.address.trim()) {
      localStorage.setItem("brx_guest_address", formData.address.trim());
    }
    toast.success("Profile saved! Your details will be prefilled at checkout.");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="My profile">
          <User className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="font-bebas text-2xl tracking-wider">
            MY PROFILE
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <p className="font-montserrat text-sm text-muted-foreground">
            Save your details for faster checkout.
          </p>

          <div className="space-y-2">
            <Label htmlFor="guest-name" className="font-montserrat text-sm font-medium">
              Name
            </Label>
            <Input
              id="guest-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-whatsapp" className="font-montserrat text-sm font-medium">
              WhatsApp Number
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <Input
                id="guest-whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, whatsapp: value });
                }}
                placeholder="Enter active WhatsApp number"
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
            {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
            <p className="text-xs text-muted-foreground font-montserrat">
              We'll send order updates on this WhatsApp number.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-address" className="font-montserrat text-sm font-medium">
              Delivery Address (optional)
            </Label>
            <Input
              id="guest-address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., Urban Forest, Mamurdi"
            />
          </div>

          <Button onClick={handleSave} className="w-full" variant="brand">
            <Save className="mr-2 h-4 w-4" />
            Save Profile
          </Button>

          {(formData.name || formData.whatsapp) && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Saved info (prefilled at checkout):</p>
              <div className="space-y-1 text-sm font-montserrat">
                <p><span className="text-muted-foreground">Name:</span> {formData.name || "Not set"}</p>
                <p><span className="text-muted-foreground">WhatsApp:</span> {formData.whatsapp ? `+91 ${formData.whatsapp}` : "Not set"}</p>
                <p><span className="text-muted-foreground">Address:</span> {formData.address || "Not set"}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GuestProfileSheet;
