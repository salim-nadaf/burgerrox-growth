import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Trash2, Send, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useDelivery } from "@/hooks/useDelivery";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import OrderTypeSelector, { OrderType, RESTAURANT_ADDRESS } from "./OrderTypeSelector";
import DeliveryAddressInput from "./DeliveryAddressInput";
import { DetailedAddress, isAddressComplete, formatFullAddress } from "./DetailedAddressForm";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; whatsappMessage: string } | null>(null);
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress>({
    flatNo: "", building: "", area: "", pincode: ""
  });

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const { createOrder } = useOrders();
  const { deliveryInfo, clearDelivery } = useDelivery();

  useEffect(() => {
    const handleCartItemAdded = () => setIsOpen(true);
    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  // Load Razorpay script
  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const deliveryCharge = orderType === "delivery" && deliveryInfo ? deliveryInfo.charge : 0;
  const grandTotal = totalAmount + deliveryCharge;

  const generateWhatsAppMessage = (orderNumber: string) => {
    const orderItems = cartItems
      .map((item) => `• ${item.item_name} x${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(2)}`)
      .join("\n");

    const customerName = profile?.name || "Guest";
    const customerWhatsApp = profile?.whatsapp_number || "N/A";
    const paymentLabel = paymentMethod === "online" ? "Paid Online" : orderType === "pickup" ? "Cash on Pickup" : "Cash on Delivery";

    if (orderType === "pickup") {
      return `--- BURGER ROX ORDER ---

Order ID: ${orderNumber}
Order Type: PICKUP

Customer: ${customerName}
WhatsApp: ${customerWhatsApp}

${orderItems}

TOTAL: ₹${totalAmount.toFixed(2)}

Payment: ${paymentLabel}

Pickup Location: ${RESTAURANT_ADDRESS}

Please confirm preparation time.
Customer will arrive after confirmation.`;
    } else {
      const subtotalLine = `Subtotal: ₹${totalAmount.toFixed(2)}`;
      const deliveryLine = `Delivery Charge: ${deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}`;
      const totalLine = `TOTAL: ₹${grandTotal.toFixed(2)}`;

      const fullAddr = formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress);
      const mapsLink = deliveryInfo?.lat && deliveryInfo?.lng
        ? `https://www.google.com/maps?q=${deliveryInfo.lat},${deliveryInfo.lng}`
        : "";
      const landmark = detailedAddress.building || "N/A";

      return `--- BURGER ROX ORDER ---

Order ID: ${orderNumber}
Order Type: DELIVERY

Customer: ${customerName}
WhatsApp: ${customerWhatsApp}

${orderItems}

${subtotalLine}
${deliveryLine}
${totalLine}

Payment: ${paymentLabel}
${mapsLink ? `\nGoogle Maps: ${mapsLink}` : ""}

Delivery Address:
${fullAddr}

Landmark: ${landmark}

Please confirm delivery time.`;
    }
  };

  const canPlaceOrder = () => {
    if (!user) return false;
    if (cartItems.length === 0) return false;
    if (orderType === "delivery") {
      if (!deliveryInfo) return false;
      if (!isAddressComplete(detailedAddress)) return false;
    }
    return true;
  };

  const placeOrder = async (pMethod: "cod" | "online", paymentId?: string, paymentStatus?: string) => {
    if (!user || !canPlaceOrder()) return;

    setIsProcessing(true);
    try {
      const order = await createOrder({
        items: cartItems.map((item) => ({
          item_name: item.item_name,
          item_price: item.item_price,
          quantity: item.quantity,
        })),
        totalAmount: grandTotal,
        paymentMethod: pMethod,
        paymentStatus: paymentStatus || (pMethod === "online" ? "paid" : "pending"),
        paymentId,
      });

      if (!order) {
        toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      const whatsappMessage = generateWhatsAppMessage(order.order_number);
      setLastOrder({ orderNumber: order.order_number, whatsappMessage });

      await clearCart();
      if (orderType === "delivery") clearDelivery();
      setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });

      // Close cart sheet, then show confirmation dialog
      setIsOpen(false);
      document.body.style.pointerEvents = "auto";
      setTimeout(() => setConfirmDialogOpen(true), 300);
    } catch (error) {
      console.error("Order error:", error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCODOrder = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to place an order", variant: "destructive" });
      return;
    }
    placeOrder("cod");
  };

  const handleOnlinePayment = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to place an order", variant: "destructive" });
      return;
    }
    if (!canPlaceOrder()) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: grandTotal, currency: "INR" },
      });

      if (error || !data?.orderId) {
        toast({ title: "Payment Error", description: "Could not initiate payment. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // Close cart sheet before opening Razorpay modal
      setIsOpen(false);
      document.body.style.pointerEvents = "auto";

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Burger Rox",
        description: "Food Order",
        order_id: data.orderId,
        handler: async (response: any) => {
          await placeOrder("online", response.razorpay_payment_id, "paid");
        },
        prefill: {
          name: profile?.name || "",
          contact: profile?.whatsapp_number ? `91${profile.whatsapp_number}` : "",
        },
        theme: { color: "#FF5D05" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({ title: "Payment Cancelled", description: "You can try again anytime.", variant: "default" });
          },
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        config: {
          display: {
            blocks: { utib: { name: "Pay using UPI", instruments: [{ method: "upi", flows: ["intent", "collect", "qr"] }] } },
            sequence: ["block.utib"],
            preferences: { show_default_blocks: true },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Payment was not successful. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      setIsProcessing(false);
      toast({ title: "Payment Error", description: "Could not open payment gateway. Please try again.", variant: "destructive" });
    }
  };

  const handleSendWhatsApp = () => {
    if (lastOrder) {
      window.open(`https://wa.me/919321389985?text=${encodeURIComponent(lastOrder.whatsappMessage)}`, "_blank");
    }
    setConfirmDialogOpen(false);
    setLastOrder(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-bebas text-2xl tracking-wider">Your Cart</SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-montserrat">Your cart is empty</p>
                <p className="text-sm mt-1">Add items from the menu</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-montserrat font-medium text-sm">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.item_price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}
                      >
                        {item.quantity <= 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Type */}
              <OrderTypeSelector value={orderType} onChange={setOrderType} />

              {/* Delivery Address */}
              {orderType === "delivery" && (
                <DeliveryAddressInput
                  detailedAddress={detailedAddress}
                  onDetailedAddressChange={setDetailedAddress}
                />
              )}

              <Separator />

              {/* Price Summary */}
              <div className="space-y-2 font-montserrat text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && deliveryInfo && (
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Wedges upsell */}
              {!cartItems.some(i => i.item_name.toLowerCase().includes('wedges')) && (
                <div className="flex items-center justify-between p-2 border border-primary/20 rounded-lg bg-primary/5">
                  <p className="font-montserrat text-xs text-foreground">Make it a combo: add crispy potato wedges for just ₹69</p>
                  <Button size="sm" variant="outline" className="text-xs ml-2 flex-shrink-0" onClick={() => addToCart("Potato Wedges (Upsell)", 69)}>
                    + Add
                  </Button>
                </div>
              )}

              {/* Urgency + USP messages */}
              <p className="text-xs text-center text-muted-foreground font-montserrat italic">
                Fresh batches made daily – limited evening slots.
              </p>
              <p className="text-xs text-center text-muted-foreground font-montserrat">
                Every burger made with our homemade signature sauce.
              </p>

              {/* Payment Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full" variant="brand" size="lg"
                  onClick={handleCODOrder}
                  disabled={!canPlaceOrder() || isProcessing}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  {orderType === "pickup" ? "Cash on Pickup" : "Cash on Delivery"}
                </Button>

                <Button
                  className="w-full" variant="default" size="lg"
                  onClick={handleOnlinePayment}
                  disabled={!canPlaceOrder() || isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Online (UPI / Card)
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Post-Order Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="font-bebas text-2xl tracking-wider text-center">Order Placed! 🎉</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Your order <span className="font-semibold text-foreground">{lastOrder?.orderNumber}</span> has been saved.
          </DialogDescription>
          <div className="space-y-3 pt-2">
            <Button className="w-full" variant="brand" size="lg" onClick={handleSendWhatsApp}>
              <Send className="h-4 w-4 mr-2" />
              Send Order on WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Send your order details to confirm preparation.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
