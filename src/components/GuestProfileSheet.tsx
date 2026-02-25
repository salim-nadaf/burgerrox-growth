import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, Package, Clock, CheckCircle, Truck, XCircle, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { loadGuestInfo, saveGuestInfo } from "./CheckoutInfoForm";
import { format } from "date-fns";

const isAllSameDigits = (num: string) => /^(.)\1{9}$/.test(num);

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface GuestOrder {
  id: string;
  order_number: string;
  items: { item_name: string; item_price: number; quantity: number }[];
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'New', color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: <CheckCircle className="h-3 w-3" /> },
  preparing: { label: 'Preparing', color: 'bg-orange-500', icon: <ChefHat className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
};

const GuestProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [hasCustomerId, setHasCustomerId] = useState(false);

  useEffect(() => {
    if (open) {
      const saved = loadGuestInfo();
      const savedAddr = localStorage.getItem("brx_guest_address") || "";
      setFormData({
        name: saved?.name || "",
        whatsapp: saved?.whatsapp || "",
        address: savedAddr,
      });

      const customerId = localStorage.getItem("brx_customer_id");
      setHasCustomerId(!!customerId);
      if (customerId) {
        fetchGuestOrders(customerId);
      }
    }
  }, [open]);

  const fetchGuestOrders = async (customerId: string) => {
    setOrdersLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-orders?customer_id=${customerId}`,
        {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        }
      );
      const data = await response.json();
      if (data.orders) {
        const parsed = data.orders.map((o: any) => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
        }));
        setOrders(parsed);
      }
    } catch (err) {
      console.error("Error fetching guest orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

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
            {hasCustomerId ? "MY ACCOUNT" : "MY PROFILE"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Order History for returning customers */}
          {hasCustomerId && orders.length > 0 && (
            <>
              <div>
                <h3 className="font-montserrat text-sm font-semibold mb-3">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3 pr-2">
                      {orders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        return (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="py-2 px-3 bg-muted/50">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-mono">{order.order_number}</CardTitle>
                                <Badge className={`${status.color} text-white text-[10px] flex items-center gap-1 px-1.5 py-0.5`}>
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
                              </p>
                            </CardHeader>
                            <CardContent className="p-3">
                              <div className="space-y-1">
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <p key={idx} className="text-xs">
                                    {item.item_name} x{item.quantity}
                                  </p>
                                ))}
                                {order.items.length > 3 && (
                                  <p className="text-xs text-muted-foreground">+{order.items.length - 3} more</p>
                                )}
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-semibold text-primary">₹{order.total_amount.toFixed(2)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
              <Separator />
            </>
          )}

          {hasCustomerId && orders.length === 0 && !ordersLoading && (
            <div className="text-center py-4">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground font-montserrat">No orders yet</p>
            </div>
          )}

          {/* Profile Form */}
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
