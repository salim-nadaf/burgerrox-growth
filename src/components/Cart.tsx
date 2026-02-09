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
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Listen for cart-item-added event to open sheet
  useEffect(() => {
    const handleCartItemAdded = () => {
      setOpen(true);
    };
    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  const generateWhatsAppMessage = () => {
    if (cartItems.length === 0) return "";

    let message = "🍔 *New Order from Burger Rox Website*\n\n";
    message += "📋 *Order Details:*\n";

    cartItems.forEach((item) => {
      message += `• ${item.item_name} × ${item.quantity} — ₹${(item.item_price * item.quantity).toFixed(0)}\n`;
    });

    message += `\n💰 *Total: ₹${totalAmount.toFixed(0)}*\n`;
    message += "\nPlease confirm my order! 🙏";

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/919321389985?text=${message}`, "_blank");
  };

  return (
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
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
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
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mt-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border"
                >
                  <div className="flex-1">
                    <h4 className="font-montserrat font-medium text-sm">{item.item_name}</h4>
                    <p className="font-montserrat text-sm text-muted-foreground">
                      ₹{item.item_price} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
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
                      {item.quantity <= 1 ? (
                        <Trash2 className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
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
                  <div className="ml-3 text-right">
                    <span className="font-montserrat font-semibold text-sm">
                      ₹{(item.item_price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-montserrat font-semibold">Total</span>
                <span className="font-bebas text-2xl text-primary">₹{totalAmount.toFixed(0)}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handleWhatsAppOrder}>
                Order via WhatsApp
              </Button>

              <Button variant="outline" size="sm" className="w-full" onClick={clearCart}>
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
