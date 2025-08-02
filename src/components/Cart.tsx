import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    const orderDetails = cartItems.map(item => 
      `${item.item_name} x${item.quantity} - ₹${(item.item_price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🍔 *BURGER ROX Order* 🍔\n\n` +
      `👤 *Customer:* ${profile?.name || 'Customer'}\n` +
      `📱 *WhatsApp:* ${profile?.whatsapp_number || 'Not provided'}\n` +
      `📍 *Area:* ${profile?.area || 'Not provided'}\n\n` +
      `📋 *Order Details:*\n${orderDetails}\n\n` +
      `💰 *Total Amount:* ₹${totalAmount.toFixed(2)}\n\n` +
      `🚚 *Delivery Required* - Please confirm delivery time!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919970078688?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>
              Please login to view your cart
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart {profile?.name && `- ${profile.name}`}</SheetTitle>
          <SheetDescription>
            {cartItems.length === 0 ? 'Your cart is empty' : `${itemCount} item(s) in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 flex-1">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.item_name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">₹{item.item_price.toFixed(2)} each</p>
                        <p className="font-semibold">₹{(item.item_price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleWhatsAppOrder} 
                    className="w-full" 
                    size="lg"
                    disabled={cartItems.length === 0}
                  >
                    Order on WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearCart} 
                    className="w-full"
                    disabled={cartItems.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}