import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "@/components/ui/use-toast";

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const { createOrder } = useOrders();

  useEffect(() => {
    const handleCartItemAdded = () => setIsOpen(true);
    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  const generateWhatsAppMessage = () => {
    const orderItems = cartItems
      .map((item) => `• ${item.item_name} x${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(2)}`)
      .join("\n");

    const customerName = profile?.name || "Guest";
    const customerWhatsApp = profile?.whatsapp_number || "N/A";
    const orderId = `BRX-${Date.now().toString(36).toUpperCase()}`;

    const message = `--- BURGER ROX ORDER ---

Order ID: ${orderId}
Order Type: PICKUP

Customer: ${customerName}
WhatsApp: ${customerWhatsApp}

${orderItems}

TOTAL: ₹${totalAmount.toFixed(2)}

Payment: Cash on Pickup

Pickup Location: Urban Forest, Mamurdi, Saint Tukaram Nagar Road, Kiwale, Taluka Haveli 412101

Please confirm preparation time.
Customer will arrive after confirmation.`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }

    // Create order in database
    await createOrder({
      items: cartItems.map((item) => ({
        item_name: item.item_name,
        item_price: item.item_price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethod: "cod",
      paymentStatus: "pending",
    });

    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/919321389985?text=${message}`, "_blank");
    await clearCart();
    setIsOpen(false);

    toast({
      title: "Order Sent!",
      description: "Your order has been sent via WhatsApp",
    });
  };

  return (
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
      <SheetContent className="w-full sm:max-w-md flex flex-col">
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
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mt-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-montserrat font-medium text-sm">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.item_price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 space-y-3">
              <Separator />
              <div className="flex justify-between items-center font-montserrat">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                variant="brand"
                size="lg"
                onClick={handleWhatsAppOrder}
              >
                <Send className="h-4 w-4 mr-2" />
                Order via WhatsApp
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
