import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Trash2, Send, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useDelivery } from "@/hooks/useDelivery";
import { toast } from "@/components/ui/use-toast";
import { loadRazorpay } from "@/utils/loadRazorpay";
import { trackInitiateCheckout, trackPurchase } from "@/utils/metaPixel";
import OrderTypeSelector, { OrderType, RESTAURANT_ADDRESS } from "./OrderTypeSelector";
import DeliveryAddressInput from "./DeliveryAddressInput";
import { DetailedAddress, isAddressComplete, formatFullAddress } from "./DetailedAddressForm";
import CheckoutInfoForm from "./CheckoutInfoForm";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbxKYdD8h58iJRY5QKlVWLFwXwTwPYBGItMm1CewkMpjywV9L6ROnnXgLXA_coio5Rnxwg/exec";

export const sendToGoogleSheet = async (orderData: Record<string, unknown>) => {
  try {
    await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
  } catch (err) {
    console.error("Google Sheet webhook error:", err);
  }
};

// Helper: resolve customer info from auth profile, guestInfo param, or localStorage
const resolveCustomerInfo = (
  user: any,
  profile: any,
  guestInfoParam?: { name: string; whatsapp: string } | null
): { name: string; whatsapp: string } => {
  if (user && profile?.name && profile?.whatsapp_number) {
    return { name: profile.name, whatsapp: profile.whatsapp_number };
  }
  if (guestInfoParam?.name && guestInfoParam?.whatsapp) {
    return { name: guestInfoParam.name, whatsapp: guestInfoParam.whatsapp };
  }
  // Fallback: try localStorage
  try {
    const raw = localStorage.getItem("brx_guest_info");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.name && saved.whatsapp) return saved;
    }
  } catch {}
  return { name: "Guest", whatsapp: "" };
};

const Cart = () => {
  const [checkoutInfoOpen, setCheckoutInfoOpen] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<"cod" | "online">("cod");
  const [guestInfo, setGuestInfo] = useState<{ name: string; whatsapp: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: string;
    whatsappMessage: string;
    orderType: string;
    items: { item_name: string; item_price: number; quantity: number }[];
    subtotal: number;
    delivery: number;
    discount: number;
    total: number;
    payment: string;
  } | null>(null);
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress>({
    flatNo: "", building: "", area: "", pincode: ""
  });

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const { deliveryInfo, clearDelivery } = useDelivery();

  // Load guestInfo from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("brx_guest_info");
      if (raw) setGuestInfo(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const handleCartItemAdded = () => setIsOpen(true);
    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  // Track InitiateCheckout when cart opens with items
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      const contents = cartItems.map(i => ({ id: i.item_name, quantity: i.quantity }));
      trackInitiateCheckout(totalAmount, itemCount, contents);
    }
  }, [isOpen]);

  const deliveryCharge = orderType === "delivery" && deliveryInfo ? deliveryInfo.charge : 0;
  const ONLINE_DISCOUNT = 10;
  const onlineDiscount = paymentMethod === "online" ? ONLINE_DISCOUNT : 0;
  const grandTotal = totalAmount + deliveryCharge - onlineDiscount;

  const getPaymentLabel = (pMethod: string) => {
    if (pMethod === "online") return "Paid Online";
    return orderType === "pickup" ? "Pay on Pickup" : "Pay on Delivery";
  };

  const generateWhatsAppMessage = (orderNumber: string, custInfo: { name: string; whatsapp: string }) => {
    const itemsList = cartItems
      .map((item) => `• ${item.item_name} x${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(2)}`)
      .join("\n");

    const paymentLabel = getPaymentLabel(paymentMethod);

    let msg = `--- BURGER ROX ORDER ---

Order ID: ${orderNumber}
Order Type: ${orderType === "pickup" ? "PICKUP" : "DELIVERY"}

Customer: ${custInfo.name}
WhatsApp: ${custInfo.whatsapp}

Items:
${itemsList}

Subtotal: ₹${totalAmount.toFixed(2)}
Delivery: ${deliveryCharge === 0 ? "₹0" : `₹${deliveryCharge}`}
Discount: ${onlineDiscount > 0 ? `-₹${onlineDiscount}` : "₹0"}
TOTAL: ₹${grandTotal.toFixed(2)}

Payment: ${paymentLabel}`;

    if (orderType === "delivery") {
      const fullAddr = formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress);
      const mapsLink = deliveryInfo?.lat && deliveryInfo?.lng
        ? `https://www.google.com/maps?q=${deliveryInfo.lat},${deliveryInfo.lng}`
        : "";

      msg += `

Delivery Address:
${fullAddr}${mapsLink ? `\n\nGoogle Maps: ${mapsLink}` : ""}

Please confirm order and expected time.`;

      if (paymentLabel === "Pay on Delivery") {
        msg += `

Note:
Pay via UPI when rider arrives.
UPI details will be shared here before delivery.`;
      }
    } else {
      msg += `

Pickup Location: ${RESTAURANT_ADDRESS}

Please confirm order and expected time.`;
    }

    return msg;
  };

  const canPlaceOrder = () => {
    if (cartItems.length === 0) return false;
    if (orderType === "delivery") {
      if (!deliveryInfo) return false;
      if (!isAddressComplete(detailedAddress)) return false;
    }
    return true;
  };

  const COD_MINIMUM = 149;
  const isBelowDeliveryMinimum = orderType === "delivery" && grandTotal < COD_MINIMUM;

  const buildSheetPayload = (orderId: string, pMethod: string, custInfo: { name: string; whatsapp: string }) => {
    const itemsSummary = cartItems
      .map((item) => `${item.item_name} x${item.quantity}`)
      .join(", ");
    const fullAddr = orderType === "delivery"
      ? formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress)
      : "";
    return {
      order_id: orderId,
      order_type: orderType === "pickup" ? "PICKUP" : "DELIVERY",
      name: custInfo.name,
      phone: custInfo.whatsapp,
      address: fullAddr,
      items: itemsSummary,
      subtotal: totalAmount,
      delivery: deliveryCharge,
      discount: pMethod === "online" ? onlineDiscount : 0,
      total: grandTotal,
      payment: pMethod === "online" ? "Paid Online" : orderType === "pickup" ? "Pay on Pickup" : "Pay on Delivery",
      status: "NEW",
      cancel_reason: "",
    };
  };

  /** Place order via edge function (works for both guest and auth users) */
  const placeOrderViaAPI = async (
    pMethod: "cod" | "online",
    custInfo: { name: string; whatsapp: string },
    paymentId?: string
  ): Promise<{ orderNumber: string; customerId: string } | null> => {
    try {
      const fullAddr = orderType === "delivery"
        ? formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress)
        : "";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/place-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            customer_name: custInfo.name,
            customer_whatsapp: custInfo.whatsapp,
            customer_address: fullAddr,
            items: cartItems.map(i => ({ item_name: i.item_name, item_price: i.item_price, quantity: i.quantity })),
            total_amount: grandTotal,
            payment_method: pMethod === "online" ? "online" : "cod",
            payment_status: pMethod === "online" ? "paid" : "pending",
            payment_id: paymentId || null,
            user_id: user?.id || null,
          }),
        }
      );

      const data = await response.json();
      console.log("[Order] place-order response:", { status: response.status, data });

      if (!response.ok || !data.order_number) {
        toast({ title: "Order Error", description: data.error || "Could not place order", variant: "destructive" });
        return null;
      }

      // Save customer session to localStorage for returning user recognition
      if (data.customer_id) {
        localStorage.setItem("brx_customer_id", data.customer_id);
      }
      // Also persist name/whatsapp for session consistency
      localStorage.setItem("brx_customer_name", custInfo.name);
      localStorage.setItem("brx_customer_whatsapp", custInfo.whatsapp);

      return { orderNumber: data.order_number, customerId: data.customer_id };
    } catch (err) {
      console.error("[Order] placeOrderViaAPI error:", err);
      toast({ title: "Order Error", description: "Failed to place order. Please try again.", variant: "destructive" });
      return null;
    }
  };

  // Gate: if no customer info available, show checkout info form
  const handleCODOrder = () => {
    const info = resolveCustomerInfo(user, profile, guestInfo);
    if (!info.whatsapp) {
      setPendingPaymentMethod("cod");
      setIsOpen(false);
      document.body.style.pointerEvents = "auto";
      setTimeout(() => setCheckoutInfoOpen(true), 300);
      return;
    }
    proceedWithCODOrder(info);
  };

  const proceedWithCODOrder = async (custInfo?: { name: string; whatsapp: string }) => {
    if (!canPlaceOrder() || isBelowDeliveryMinimum || isProcessing) return;

    const info = custInfo || resolveCustomerInfo(user, profile, guestInfo);
    if (!info.whatsapp) return;

    setIsProcessing(true);

    const result = await placeOrderViaAPI("cod", info);
    if (!result) {
      setIsProcessing(false);
      return;
    }

    const whatsappMessage = generateWhatsAppMessage(result.orderNumber, info);

    // Send to Google Sheet (non-blocking)
    sendToGoogleSheet(buildSheetPayload(result.orderNumber, "cod", info));
    const purchaseContents = cartItems.map(i => ({ id: i.item_name, quantity: i.quantity }));
    trackPurchase(grandTotal, purchaseContents);

    setLastOrder({
      orderNumber: result.orderNumber,
      whatsappMessage,
      orderType: orderType === "pickup" ? "PICKUP" : "DELIVERY",
      items: cartItems.map(i => ({ item_name: i.item_name, item_price: i.item_price, quantity: i.quantity })),
      subtotal: totalAmount,
      delivery: deliveryCharge,
      discount: 0,
      total: grandTotal,
      payment: getPaymentLabel("cod"),
    });

    clearCart();
    if (orderType === "delivery") clearDelivery();
    setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });
    setIsOpen(false);
    setIsProcessing(false);
    document.body.style.pointerEvents = "auto";
    setTimeout(() => setConfirmDialogOpen(true), 300);
  };

  const handleOnlinePayment = () => {
    const info = resolveCustomerInfo(user, profile, guestInfo);
    if (!info.whatsapp) {
      setPendingPaymentMethod("online");
      setIsOpen(false);
      document.body.style.pointerEvents = "auto";
      setTimeout(() => setCheckoutInfoOpen(true), 300);
      return;
    }
    proceedWithOnlinePayment(info);
  };

  const proceedWithOnlinePayment = async (custInfo?: { name: string; whatsapp: string }) => {
    if (!canPlaceOrder() || isProcessing) return;

    const info = custInfo || resolveCustomerInfo(user, profile, guestInfo);
    if (!info.whatsapp) return;

    setIsProcessing(true);
    console.log('[Payment] Starting online payment, amount:', grandTotal);

    try {
      // Step 1: Load Razorpay SDK
      console.log('[Payment] Loading Razorpay SDK...');
      await loadRazorpay();
      console.log('[Payment] Razorpay SDK loaded, window.Razorpay:', !!window.Razorpay);

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK loaded but constructor not available');
      }

      // Step 2: Create Razorpay order via edge function
      console.log('[Payment] Creating Razorpay order...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ amount: grandTotal, currency: 'INR' }),
        }
      );

      const data = await response.json();
      console.log('[Payment] Edge function response:', { status: response.status, orderId: data?.orderId, error: data?.error });

      if (!response.ok || !data?.orderId) {
        toast({ title: "Payment Error", description: data?.error || "Could not initiate payment. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // Step 3: Close cart sheet before opening Razorpay modal
      setIsOpen(false);
      document.body.style.pointerEvents = "auto";

      // Step 4: Open Razorpay checkout
      // Capture cart state before Razorpay opens (cart may clear during handler)
      const capturedItems = cartItems.map(i => ({ item_name: i.item_name, item_price: i.item_price, quantity: i.quantity }));
      const capturedSubtotal = totalAmount;
      const capturedDelivery = deliveryCharge;
      const capturedDiscount = onlineDiscount;
      const capturedTotal = grandTotal;
      const capturedOrderType = orderType;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Burger Rox",
        description: "Food Order",
        order_id: data.orderId,
        handler: async (rzpResponse: any) => {
          console.log('[Payment] Payment successful, payment_id:', rzpResponse.razorpay_payment_id);

          // Place order with payment_id
          const result = await placeOrderViaAPI("online", info, rzpResponse.razorpay_payment_id);
          if (!result) {
            toast({ title: "Error", description: "Payment received but failed to save order. Please contact support.", variant: "destructive" });
            setIsProcessing(false);
            return;
          }

          const whatsappMessage = generateWhatsAppMessage(result.orderNumber, info);
          sendToGoogleSheet(buildSheetPayload(result.orderNumber, "online", info));
          const purchaseContents = capturedItems.map(i => ({ id: i.item_name, quantity: i.quantity }));
          trackPurchase(capturedTotal, purchaseContents);

          setLastOrder({
            orderNumber: result.orderNumber,
            whatsappMessage,
            orderType: capturedOrderType === "pickup" ? "PICKUP" : "DELIVERY",
            items: capturedItems,
            subtotal: capturedSubtotal,
            delivery: capturedDelivery,
            discount: capturedDiscount,
            total: capturedTotal,
            payment: "Paid Online",
          });

          await clearCart();
          if (capturedOrderType === "delivery") clearDelivery();
          setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });

          setIsProcessing(false);
          setTimeout(() => setConfirmDialogOpen(true), 300);
        },
        prefill: {
          name: info.name,
          contact: info.whatsapp ? `91${info.whatsapp}` : "",
        },
        theme: { color: "#FF5D05" },
        modal: {
          ondismiss: () => {
            console.log('[Payment] Modal dismissed by user');
            setIsProcessing(false);
            toast({ title: "Payment Cancelled", description: "You can try again anytime.", variant: "default" });
          },
        },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        config: {
          display: {
            blocks: { utib: { name: "Pay using UPI", instruments: [{ method: "upi", flows: ["intent", "collect", "qr"] }] } },
            sequence: ["block.utib"],
            preferences: { show_default_blocks: true },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (failResponse: any) => {
        console.error('[Payment] Payment failed:', failResponse.error);
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: failResponse.error?.description || "Payment was not successful. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (error) {
      console.error("[Payment] Razorpay error:", error);
      setIsProcessing(false);
      toast({ title: "Payment Error", description: "Could not open payment gateway. Please try again.", variant: "destructive" });
    }
  };

  const handleCheckoutInfoSubmit = (info: { name: string; whatsapp: string }) => {
    setGuestInfo(info);
    setCheckoutInfoOpen(false);
    toast({ title: "Details saved!", description: "Complete your order." });
    // Pass info directly to avoid React state timing issues
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => {
        if (pendingPaymentMethod === "online") {
          proceedWithOnlinePayment(info);
        } else {
          proceedWithCODOrder(info);
        }
      }, 300);
    }, 300);
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
                {paymentMethod === "online" && (
                  <div className="flex justify-between text-green-600">
                    <span>Online Payment Discount</span>
                    <span>-₹{ONLINE_DISCOUNT}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Payment method selector */}
              <div className="space-y-2">
                <p className="font-montserrat text-xs font-medium text-foreground">Payment Method:</p>
                <div className="flex gap-2">
                  <Button
                    variant={paymentMethod === "cod" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <Banknote className="h-4 w-4 mr-1" />
                    {orderType === "pickup" ? "Pay on Pickup" : "Pay on Delivery"}
                  </Button>
                  <Button
                    variant={paymentMethod === "online" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => setPaymentMethod("online")}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Pay Online {paymentMethod !== "online" && "(Save ₹10)"}
                  </Button>
                </div>
              </div>

              {/* Minimum order warning for delivery */}
              {isBelowDeliveryMinimum && (
                <p className="text-xs text-center text-destructive font-montserrat font-medium">
                  Minimum ₹149 required for delivery
                </p>
              )}

              {/* Primary CTA */}
              {paymentMethod === "cod" ? (
                <Button
                  className="w-full" variant="brand" size="lg"
                  onClick={handleCODOrder}
                  disabled={!canPlaceOrder() || isProcessing || isBelowDeliveryMinimum}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  {isProcessing ? "Placing Order..." : `Place Order — ₹${grandTotal.toFixed(0)}`}
                </Button>
              ) : (
                <Button
                  className="w-full" variant="default" size="lg"
                  onClick={handleOnlinePayment}
                  disabled={!canPlaceOrder() || isProcessing || isBelowDeliveryMinimum}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : `Pay ₹${grandTotal.toFixed(0)} Online`}
                </Button>
              )}

              {/* Single reassurance line */}
              <p className="text-[11px] text-center text-muted-foreground font-montserrat">
                📲 WhatsApp confirmation in minutes · 🔒 Secure
              </p>

              {/* Wedges upsell */}
              {!cartItems.some(i => i.item_name.toLowerCase().includes('wedges')) && (
                <div className="flex items-center justify-between p-2 border border-border/50 rounded-lg">
                  <p className="font-montserrat text-xs text-foreground">Add potato wedges — ₹69</p>
                  <Button size="sm" variant="outline" className="text-xs ml-2 flex-shrink-0 h-7" onClick={() => addToCart("Potato Wedges (Upsell)", 69)}>
                    + Add
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Info Dialog for guests */}
      <Dialog open={checkoutInfoOpen} onOpenChange={setCheckoutInfoOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Complete your order details</DialogTitle>
          <DialogDescription className="sr-only">Enter your name and WhatsApp number</DialogDescription>
          <CheckoutInfoForm onSubmit={handleCheckoutInfoSubmit} />
        </DialogContent>
      </Dialog>

      {/* Confirm Your Order Modal */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl tracking-wider text-center">Confirm Your Order</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Review your order details before sending on WhatsApp.
            </DialogDescription>
          </DialogHeader>

          {lastOrder && (
            <div className="space-y-3 text-sm font-montserrat">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold">{lastOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Type</span>
                <span>{lastOrder.orderType}</span>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Items:</span>
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.item_name} x{item.quantity}</span>
                    <span>₹{(item.item_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{lastOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{lastOrder.delivery}</span>
              </div>
              {lastOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{lastOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">₹{lastOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{lastOrder.payment}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <p className="text-xs text-center font-montserrat text-muted-foreground">
              📲 Our team will confirm shortly on WhatsApp
            </p>
            <Button className="w-full" variant="brand" size="lg" onClick={handleSendWhatsApp}>
              <Send className="h-4 w-4 mr-2" />
              Send to WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setConfirmDialogOpen(false); setLastOrder(null); }}>
              Edit Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
