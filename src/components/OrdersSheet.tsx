import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, CheckCircle, ChefHat, Truck, XCircle, ShoppingBag, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import OrderHistory from './OrderHistory';
import { RESTAURANT_ADDRESS } from './OrderTypeSelector';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface GuestOrder {
  id: string;
  order_number: string;
  items: { item_name: string; item_price: number; quantity: number }[];
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  customer_name?: string;
  customer_whatsapp?: string;
  customer_area?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'New', color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: <CheckCircle className="h-3 w-3" /> },
  preparing: { label: 'Preparing', color: 'bg-orange-500', icon: <ChefHat className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
};

const buildWhatsAppMessage = (order: GuestOrder) => {
  const itemsList = order.items
    .map((item) => `• ${item.item_name} x${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(2)}`)
    .join("\n");

  const isDelivery = !!(order.customer_area);
  const paymentLabel = order.payment_method === 'online' ? 'Paid Online' : isDelivery ? 'Pay on Delivery' : 'Pay on Pickup';

  let msg = `--- BURGER ROX ORDER ---

Order ID: ${order.order_number}
Order Type: ${isDelivery ? "DELIVERY" : "PICKUP"}

Customer: ${order.customer_name || "Customer"}
WhatsApp: ${order.customer_whatsapp || ""}

Items:
${itemsList}

TOTAL: ₹${order.total_amount.toFixed(2)}

Payment: ${paymentLabel}`;

  if (isDelivery && order.customer_area) {
    msg += `\n\nDelivery Address:\n${order.customer_area}\n\nPlease confirm order and expected time.`;
  } else {
    msg += `\n\nPickup Location: ${RESTAURANT_ADDRESS}\n\nPlease confirm order and expected time.`;
  }

  return msg;
};

export default function OrdersSheet() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const customerId = typeof window !== 'undefined' ? localStorage.getItem('brx_customer_id') : null;

  useEffect(() => {
    if (open && !user && customerId) {
      fetchGuestOrders(customerId);
    }
  }, [open, user, customerId]);

  const fetchGuestOrders = async (cid: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guest-orders?customer_id=${cid}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      if (data.orders) {
        setGuestOrders(
          data.orders.map((o: any) => ({
            ...o,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
          }))
        );
      }
    } catch (err) {
      console.error('[OrdersSheet] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendWhatsApp = (order: GuestOrder) => {
    const msg = buildWhatsAppMessage(order);
    window.open(`https://wa.me/919321389985?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Authenticated user → use existing OrderHistory component
  if (user) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="View orders">
            <ClipboardList className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>My Orders</SheetTitle>
            <SheetDescription>Track your order history and status</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <OrderHistory />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Guest user
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="View orders">
          <ClipboardList className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>My Orders</SheetTitle>
          <SheetDescription>Your recent orders</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {!customerId ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-montserrat text-sm text-muted-foreground">
                No orders yet — place your first order 🍔
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : guestOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-montserrat text-sm text-muted-foreground">
                No orders yet — place your first order 🍔
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-150px)]">
              <div className="space-y-3 pr-2">
                {guestOrders.map((order, index) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const isLatest = index === 0;
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
                        {/* Send to WhatsApp button — latest order only */}
                        {isLatest && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-xs"
                            onClick={() => handleResendWhatsApp(order)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send to WhatsApp
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
