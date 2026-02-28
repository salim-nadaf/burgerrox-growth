import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Save, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadGuestInfo, saveGuestInfo } from "./CheckoutInfoForm";
import { supabase } from "@/integrations/supabase/client";

const isAllSameDigits = (num: string) => /^(.)\1{9}$/.test(num);

const GuestProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReturning, setIsReturning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setSaved(false);
      const saved = loadGuestInfo();
      const savedAddr = localStorage.getItem("brx_guest_address") || "";
      const customerId = localStorage.getItem("brx_customer_id");
      setIsReturning(!!customerId && !!(saved?.name));
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
    if (!formData.whatsapp || !/^\d{10}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "WhatsApp number is required (10 digits)";
    } else if (!/^[6-9]/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Must start with 6, 7, 8, or 9";
    } else if (isAllSameDigits(formData.whatsapp)) {
      newErrors.whatsapp = "Please enter a valid WhatsApp number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      // Save to cloud via edge function
      const { data, error } = await supabase.functions.invoke("save-customer", {
        method: "POST",
        body: {
          name: formData.name.trim(),
          whatsapp: formData.whatsapp,
          address: formData.address.trim() || null,
        },
      });

      if (error) throw error;

      const customer = data?.customer;
      const isNew = data?.is_new;

      // Save locally for session
      saveGuestInfo({ name: formData.name.trim(), whatsapp: formData.whatsapp });
      if (formData.address.trim()) {
        localStorage.setItem("brx_guest_address", formData.address.trim());
      }
      if (formData.name.trim()) {
        localStorage.setItem("brx_customer_name", formData.name.trim());
      }
      if (formData.whatsapp) {
        localStorage.setItem("brx_customer_whatsapp", formData.whatsapp);
      }
      if (customer?.id) {
        localStorage.setItem("brx_customer_id", customer.id);
      }

      setSaved(true);
      toast.success(
        isNew
          ? "Profile created! Your details are saved for faster checkout."
          : "Profile updated! Welcome back."
      );

      // Auto-close after short delay
      setTimeout(() => setOpen(false), 1500);
    } catch (err: any) {
      console.error("Profile save error:", err);
      // Fallback: save locally only
      saveGuestInfo({ name: formData.name.trim(), whatsapp: formData.whatsapp });
      if (formData.address.trim()) {
        localStorage.setItem("brx_guest_address", formData.address.trim());
      }
      toast.success("Profile saved locally! Details will be prefilled at checkout.");
      setTimeout(() => setOpen(false), 1000);
    } finally {
      setSaving(false);
    }
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

        <ScrollArea className="h-[calc(100vh-100px)] pr-2">
          {saved ? (
            <div className="mt-12 flex flex-col items-center text-center space-y-4 px-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bebas text-2xl tracking-wider text-foreground">
                {isReturning ? "PROFILE UPDATED!" : "PROFILE CREATED!"}
              </h3>
              <p className="font-montserrat text-sm text-muted-foreground">
                Welcome{isReturning ? " back" : ""}, {formData.name}! Your details are saved for faster checkout.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 w-full text-left space-y-1.5 font-montserrat text-sm">
                <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                <p><span className="text-muted-foreground">WhatsApp:</span> +91 {formData.whatsapp}</p>
                {formData.address && (
                  <p><span className="text-muted-foreground">Address:</span> {formData.address}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <p className="font-montserrat text-sm text-muted-foreground">
                {isReturning
                  ? `Welcome back, ${formData.name}! Update your details below.`
                  : "Save your details for faster checkout. No password needed!"}
              </p>

              <div className="space-y-2">
                <Label htmlFor="guest-name" className="font-montserrat text-sm font-medium">
                  Name *
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
                  WhatsApp Number *
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
                  This is your login. Order updates will be sent here.
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

              <Button
                onClick={handleSave}
                className="w-full"
                variant="brand"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isReturning ? "Update Profile" : "Create Profile"}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground font-montserrat">
                🔒 Your data is securely stored. No password needed.
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default GuestProfileSheet;
