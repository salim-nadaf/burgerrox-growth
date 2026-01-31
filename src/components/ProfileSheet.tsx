import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileSheet = () => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_number: "",
    area: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        whatsapp_number: profile.whatsapp_number || "",
        area: profile.area || "",
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.whatsapp_number || !/^\d{10}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = "WhatsApp number must be exactly 10 digits";
    }

    if (!formData.area.trim() || formData.area.trim().length < 4) {
      newErrors.area = "Area must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name.trim(),
          whatsapp_number: formData.whatsapp_number,
          area: formData.area.trim(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      setOpen(false);
      
      // Reload the page to refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit profile">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="font-bebas text-2xl tracking-wider">
            MY PROFILE
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-montserrat text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-montserrat text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="font-montserrat text-sm font-medium">
              WhatsApp Number
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                +91
              </span>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, whatsapp_number: value });
                }}
                placeholder="10-digit number"
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
            {errors.whatsapp_number && (
              <p className="text-xs text-destructive">{errors.whatsapp_number}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Make sure this number has WhatsApp for order updates
            </p>
          </div>

          {/* Delivery Area */}
          <div className="space-y-2">
            <Label htmlFor="area" className="font-montserrat text-sm font-medium">
              Delivery Area
            </Label>
            <Input
              id="area"
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g., Mamurdi, Ravet"
            />
            {errors.area && (
              <p className="text-xs text-destructive">{errors.area}</p>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full"
            variant="brand"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>

          {/* Current Profile Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Current saved info:</p>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {profile?.name || 'Not set'}</p>
              <p><span className="text-muted-foreground">WhatsApp:</span> {profile?.whatsapp_number ? `+91 ${profile.whatsapp_number}` : 'Not set'}</p>
              <p><span className="text-muted-foreground">Area:</span> {profile?.area || 'Not set'}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
