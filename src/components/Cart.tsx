import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
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

const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbwhTIw0hZ_WPwwwrAxv1wRDsUIVRLTIKquXbl0mW8zQ8flJpUqUPRp-Lzl1lpiyiH6zsQ/exec";

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

const Cart = () => {
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
  const ONLINE_DISCOUNT = 10;
  const onlineDiscount = paymentMethod === "online" ? ONLINE_DISCOUNT : 0;
  const grandTotal = totalAmount + deliveryCharge - onlineDiscount;

  const generateOrderId = async (): Promise<string> => {
    try {
      // Fetch last order number from database
      const { data, error } = await supabase
        .from("orders")
        .select("order_number")
        .order("created_at", { ascending: false })
        .limit(1);

      let lastNum = 0;
      if (!error && data && data.length > 0) {
        const match = data[0].order_number.match(/BRX-(\d+)/);
        if (match) lastNum = parseInt(match[1], 10);
      }
      // Also check localStorage in case DB is behind
      const localNum = parseInt(localStorage.getItem("brx_last_order") || "0", 10);
      const maxNum = Math.max(lastNum, localNum);
      const newNum = maxNum + 1;
      localStorage.setItem("brx_last_order", String(newNum));
      return `BRX-${String(newNum).padStart(3, "0")}`;
    } catch {
      // Fallback to localStorage only
      const lastNum = parseInt(localStorage.getItem("brx_last_order") || "0", 10);
      const newNum = lastNum + 1;
      localStorage.setItem("brx_last_order", String(newNum));
      return `BRX-${String(newNum).padStart(3, "0")}`;
    }
  };

  const getPaymentLabel = (pMethod: string) => {
    if (pMethod === "online") return "Paid Online";
    return orderType === "pickup" ? "Pay on Pickup" : "Pay on Delivery";
  };

  const generateWhatsAppMessage = (orderNumber: string) => {
    const itemsList = cartItems
      .map((item) => `• ${item.item_name} x${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(2)}`)
      .join("\n");

    const customerName = profile?.name || "Guest";
    const customerWhatsApp = profile?.whatsapp_number || "N/A";
    const paymentLabel = getPaymentLabel(paymentMethod);

    let msg = `--- BURGER ROX ORDER ---

Order ID: ${orderNumber}
Order Type: ${orderType === "pickup" ? "PICKUP" : "DELIVERY"}

Customer: ${customerName}
WhatsApp: ${customerWhatsApp}

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
    if (!user) return false;
    if (cartItems.length === 0) return false;
    if (orderType === "delivery") {
      if (!deliveryInfo) return false;
      if (!isAddressComplete(detailedAddress)) return false;
    }
    return true;
  };

  const COD_MINIMUM = 149;
  const isBelowDeliveryMinimum = orderType === "delivery" && grandTotal < COD_MINIMUM;

  const buildSheetPayload = (orderId: string, pMethod: string) => {
    const itemsSummary = cartItems
      .map((item) => `${item.item_name} x${item.quantity}`)
      .join(", ");
    const fullAddr = orderType === "delivery"
      ? formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress)
      : "";
    return {
      order_id: orderId,
      order_type: orderType === "pickup" ? "PICKUP" : "DELIVERY",
      name: profile?.name || "Guest",
      phone: profile?.whatsapp_number || "N/A",
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

  const prepareOrder = async (pMethod: "cod" | "online") => {
    const orderId = await generateOrderId();
    const whatsappMessage = generateWhatsAppMessage(orderId);
    const paymentLabel = getPaymentLabel(pMethod);

    return {
      orderId,
      whatsappMessage,
      orderType: orderType === "pickup" ? "PICKUP" : "DELIVERY",
      items: cartItems.map(i => ({ item_name: i.item_name, item_price: i.item_price, quantity: i.quantity })),
      subtotal: totalAmount,
      delivery: deliveryCharge,
      discount: pMethod === "online" ? onlineDiscount : 0,
      total: grandTotal,
      payment: paymentLabel,
    };
  };

  const handleCODOrder = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to place an order", variant: "destructive" });
      return;
    }
    if (!profile?.name || !profile?.whatsapp_number) {
      toast({ title: "Profile Incomplete", description: "Please complete your profile before placing an order.", variant: "destructive" });
      return;
    }
    if (!canPlaceOrder() || isBelowDeliveryMinimum) return;

    const prepared = await prepareOrder("cod");

    // Save order to database
    await createOrder({
      items: prepared.items,
      totalAmount: prepared.total,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderNumber: prepared.orderId,
    });

    // Send to Google Sheet (non-blocking)
    sendToGoogleSheet(buildSheetPayload(prepared.orderId, "cod"));

    setLastOrder({
      orderNumber: prepared.orderId,
      whatsappMessage: prepared.whatsappMessage,
      orderType: prepared.orderType,
      items: prepared.items,
      subtotal: prepared.subtotal,
      delivery: prepared.delivery,
      discount: prepared.discount,
      total: prepared.total,
      payment: prepared.payment,
    });

    // Clear cart
    clearCart();
    if (orderType === "delivery") clearDelivery();
    setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });
    setIsOpen(false);
    document.body.style.pointerEvents = "auto";
    setTimeout(() => setConfirmDialogOpen(true), 300);
  };

  const handleOnlinePayment = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to place an order", variant: "destructive" });
      return;
    }
    if (!profile?.name || !profile?.whatsapp_number) {
      toast({ title: "Profile Incomplete", description: "Please complete your profile before placing an order.", variant: "destructive" });
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
          // Create order in DB
          const prepared = await prepareOrder("online");

          const order = await createOrder({
            items: prepared.items,
            totalAmount: prepared.total,
            paymentMethod: "online",
            paymentStatus: "paid",
            paymentId: response.razorpay_payment_id,
            orderNumber: prepared.orderId,
          });

          if (!order) {
            toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
            setIsProcessing(false);
            return;
          }

          // Send to Google Sheet
          sendToGoogleSheet(buildSheetPayload(prepared.orderId, "online"));

          setLastOrder({
            orderNumber: prepared.orderId,
            whatsappMessage: prepared.whatsappMessage,
            orderType: prepared.orderType,
            items: prepared.items,
            subtotal: prepared.subtotal,
            delivery: prepared.delivery,
            discount: prepared.discount,
            total: prepared.total,
            payment: prepared.payment,
          });

          await clearCart();
          if (orderType === "delivery") clearDelivery();
          setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });

          setIsProcessing(false);
          setTimeout(() => setConfirmDialogOpen(true), 300);
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
                    Pay Online
                  </Button>
                </div>
                <p className="text-xs text-center text-green-600 font-montserrat">
                  Pay online and save ₹10 on your order.
                </p>
              </div>

              {/* Minimum order warning for delivery */}
              {isBelowDeliveryMinimum && (
                <p className="text-xs text-center text-destructive font-montserrat font-medium">
                  Minimum ₹149 required for delivery
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {paymentMethod === "cod" ? (
                  <>
                    <Button
                      className="w-full" variant="brand" size="lg"
                      onClick={handleCODOrder}
                      disabled={!canPlaceOrder() || isProcessing || isBelowDeliveryMinimum}
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      {orderType === "pickup" ? "Pay on Pickup" : "Pay on Delivery"}
                    </Button>
                    {!isBelowDeliveryMinimum && (
                      <p className="text-xs text-center text-muted-foreground font-montserrat">
                        Our team will confirm your order on WhatsApp before {orderType === "pickup" ? "preparation" : "delivery"}.
                      </p>
                    )}
                  </>
                ) : (
                  <Button
                    className="w-full" variant="default" size="lg"
                    onClick={handleOnlinePayment}
                    disabled={!canPlaceOrder() || isProcessing || isBelowDeliveryMinimum}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Online (UPI / Card) — Save ₹10
                  </Button>
                )}
              </div>

              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
