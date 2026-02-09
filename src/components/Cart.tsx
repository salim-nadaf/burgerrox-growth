import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useDelivery } from "@/hooks/useDelivery";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import OrderTypeSelector, { RESTAURANT_ADDRESS } from "./OrderTypeSelector";
import type { OrderType } from "./OrderTypeSelector";
import DeliveryAddressInput from "./DeliveryAddressInput";
import { DetailedAddress, isAddressComplete, formatFullAddress } from "./DetailedAddressForm";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const { deliveryInfo, clearDelivery } = useDelivery();
  const { createOrder } = useOrders();
  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [landmark, setLandmark] = useState("");
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress>({
    flatNo: "",
    building: "",
    area: "",
    pincode: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    whatsappMessage: string;
  } | null>(null);

  // Listen for cart-item-added event to open sheet
  useEffect(() => {
    const handleCartItemAdded = () => setOpen(true);
    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  // Reset delivery state when switching order types
  useEffect(() => {
    if (orderType === "pickup") {
      clearDelivery();
      setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });
      setLandmark("");
    }
  }, [orderType]);

  const deliveryCharge = orderType === "delivery" && deliveryInfo ? deliveryInfo.charge : 0;
  const grandTotal = totalAmount + deliveryCharge;

  const canPlaceOrder = () => {
    if (cartItems.length === 0) return false;
    if (!user) return false;
    if (orderType === "delivery") {
      if (!deliveryInfo) return false;
      if (!isAddressComplete(detailedAddress)) return false;
    }
    return true;
  };

  const getMapsLink = () => {
    if (deliveryInfo?.lat && deliveryInfo?.lng) {
      return `https://www.google.com/maps?q=${deliveryInfo.lat},${deliveryInfo.lng}`;
    }
    return null;
  };

  const generatePickupMessage = (orderNumber: string): string => {
    const customerName = profile?.name || "Customer";
    const customerPhone = profile?.whatsapp_number || "N/A";

    let msg = "--- BURGER ROX ORDER ---\n\n";
    msg += `Order ID: ${orderNumber}\n`;
    msg += `Order Type: PICKUP\n\n`;
    msg += `Customer: ${customerName}\n`;
    msg += `WhatsApp: ${customerPhone}\n\n`;
    msg += "Items:\n";

    cartItems.forEach((item) => {
      const lineTotal = item.item_price * item.quantity;
      msg += `${item.item_name} x ${item.quantity} = ₹${lineTotal}\n`;
    });

    msg += `\nTOTAL: ₹${totalAmount}\n`;
    msg += `Payment: Cash on Pickup\n\n`;
    msg += `Pickup Location:\n${RESTAURANT_ADDRESS}\n\n`;
    msg += "Please confirm preparation time.\nCustomer will arrive after confirmation.";

    return msg;
  };

  const generateDeliveryMessage = (orderNumber: string): string => {
    const customerName = profile?.name || "Customer";
    const customerPhone = profile?.whatsapp_number || "N/A";
    const fullAddress = formatFullAddress(detailedAddress, deliveryInfo?.destinationAddress);
    const mapsLink = getMapsLink();
    const landmarkText = landmark.trim() || "N/A";

    let msg = "--- BURGER ROX ORDER ---\n\n";
    msg += `Order ID: ${orderNumber}\n`;
    msg += `Order Type: DELIVERY\n\n`;
    msg += `Customer: ${customerName}\n`;
    msg += `WhatsApp: ${customerPhone}\n\n`;
    msg += "Items:\n";

    cartItems.forEach((item) => {
      const lineTotal = item.item_price * item.quantity;
      msg += `${item.item_name} x ${item.quantity} = ₹${lineTotal}\n`;
    });

    msg += `\nSubtotal: ₹${totalAmount}\n`;
    msg += `Delivery Charge: ₹${deliveryCharge}${deliveryCharge === 0 ? " (FREE)" : ""}\n`;
    msg += `TOTAL: ₹${grandTotal}\n`;
    msg += `Payment: Cash on Delivery\n\n`;

    if (mapsLink) {
      msg += `Google Maps: ${mapsLink}\n`;
    }
    msg += `Address: ${fullAddress}\n`;
    msg += `Landmark: ${landmarkText}\n\n`;
    msg += "Please confirm delivery time.";

    return msg;
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) return;

    const order = await createOrder({
      items: cartItems.map((item) => ({
        item_name: item.item_name,
        item_price: item.item_price,
        quantity: item.quantity,
      })),
      totalAmount: grandTotal,
      paymentMethod: orderType === "pickup" ? "Cash on Pickup" : "Cash on Delivery",
      paymentStatus: "pending",
    });

    if (!order) {
      toast({
        title: "Order Failed",
        description: "Could not place order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const whatsappMessage =
      orderType === "pickup"
        ? generatePickupMessage(order.order_number)
        : generateDeliveryMessage(order.order_number);

    setConfirmedOrder({
      orderNumber: order.order_number,
      whatsappMessage,
    });
    setShowConfirmation(true);
    setOpen(false);
  };

  const handleSendWhatsApp = () => {
    if (!confirmedOrder) return;
    const encoded = encodeURIComponent(confirmedOrder.whatsappMessage);
    window.open(`https://wa.me/919321389985?text=${encoded}`, "_blank");

    // Cleanup after sending
    clearCart();
    clearDelivery();
    setDetailedAddress({ flatNo: "", building: "", area: "", pincode: "" });
    setLandmark("");
    setConfirmedOrder(null);
    setShowConfirmation(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative" aria-label="Open cart">
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-bebas text-2xl tracking-wider">Your Cart</SheetTitle>
            <SheetDescription>
              {itemCount > 0
                ? `${itemCount} item${itemCount > 1 ? "s" : ""} in your cart`
                : "Your cart is empty"}
            </SheetDescription>
          </SheetHeader>

          {!user ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-montserrat text-muted-foreground text-center">
                Please login to add items to your cart.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-montserrat text-muted-foreground">Your cart is empty</p>
                <p className="font-montserrat text-sm text-muted-foreground">
                  Browse our menu and add some delicious burgers!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4 mt-4">
              {/* Cart Items */}
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-montserrat font-medium text-sm truncate">{item.item_name}</h4>
                      <p className="font-montserrat text-xs text-muted-foreground">
                        ₹{item.item_price} each
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                      >
                        {item.quantity <= 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </Button>
                      <span className="font-montserrat text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-montserrat font-semibold text-sm ml-3 shrink-0">
                      ₹{(item.item_price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Type Selection */}
              <OrderTypeSelector value={orderType} onChange={setOrderType} />

              {/* Delivery Address (only for delivery) */}
              {orderType === "delivery" && (
                <div className="space-y-3">
                  <DeliveryAddressInput
                    detailedAddress={detailedAddress}
                    onDetailedAddressChange={setDetailedAddress}
                  />
                  {deliveryInfo && isAddressComplete(detailedAddress) && (
                    <div className="space-y-1">
                      <Label htmlFor="landmark" className="text-xs">
                        Landmark (optional)
                      </Label>
                      <Input
                        id="landmark"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g., Near D-Mart, Opposite Park"
                        className="h-9"
                      />
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 p-3 bg-card rounded-lg border">
                <div className="flex justify-between text-sm">
                  <span className="font-montserrat">Subtotal</span>
                  <span className="font-montserrat">₹{totalAmount.toFixed(0)}</span>
                </div>
                {orderType === "delivery" && deliveryInfo && (
                  <div className="flex justify-between text-sm">
                    <span className="font-montserrat">Delivery Charge</span>
                    <span className="font-montserrat">
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-montserrat font-semibold">Total</span>
                  <span className="font-bebas text-2xl text-primary">₹{grandTotal.toFixed(0)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Payment: {orderType === "pickup" ? "Cash on Pickup" : "Cash on Delivery"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pb-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl tracking-wider text-center">
              Order Placed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Order #{confirmedOrder?.orderNumber} has been saved. Send it to us on WhatsApp to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message Preview */}
            <div className="bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-montserrat">
                {confirmedOrder?.whatsappMessage}
              </pre>
            </div>

            <Button className="w-full" size="lg" onClick={handleSendWhatsApp}>
              <Send className="h-4 w-4 mr-2" />
              Send Order on WhatsApp
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Tap the button above to open WhatsApp with your order details pre-filled.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
