import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'prepaid'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const sendWhatsAppOrder = (paymentStatus: string) => {
    const orderDetails = cartItems.map(item => 
      `${item.item_name} x${item.quantity} - ₹${(item.item_price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🍔 *BURGER ROX Order* 🍔\n\n` +
      `👤 *Customer:* ${profile?.name || 'Guest Customer'}\n` +
      `📱 *WhatsApp:* ${profile?.whatsapp_number || 'Will provide'}\n` +
      `📍 *Area:* ${profile?.area || 'Will provide'}\n\n` +
      `📋 *Order Details:*\n${orderDetails}\n\n` +
      `💰 *Total Amount:* ₹${totalAmount.toFixed(2)}\n` +
      `💳 *Payment:* ${paymentStatus}\n\n` +
      `🚚 *Delivery Required* - Please confirm delivery time!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919321389985?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsOpen(false);
  };

  const handleCODOrder = () => {
    sendWhatsAppOrder('💵 Cash on Delivery');
    toast({
      title: "Order Placed!",
      description: "Your COD order has been sent to WhatsApp",
    });
  };

  const handlePrepaidOrder = async () => {
    if (!window.Razorpay) {
      toast({
        title: "Error",
        description: "Payment system not loaded. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: totalAmount,
          receipt: `order_guest_${Date.now()}`
        }
      });

      if (error || !data?.orderId) {
        throw new Error(error?.message || 'Failed to create payment order');
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Burger Rox',
        description: 'Order Payment',
        order_id: data.orderId,
        prefill: {
          name: profile?.name || '',
          contact: profile?.whatsapp_number || '',
        },
        theme: {
          color: '#FFD939'
        },
        handler: function(response: any) {
          // Payment successful
          sendWhatsAppOrder(`✅ Prepaid (Razorpay: ${response.razorpay_payment_id})`);
          toast({
            title: "Payment Successful!",
            description: "Your order has been sent to WhatsApp",
          });
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again or choose Cash on Delivery",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handlePrepaidOrder();
    }
  };

  // Login requirement temporarily disabled for testing
  // if (!user) {
  //   return (
  //     <Sheet open={isOpen} onOpenChange={setIsOpen}>
  //       <SheetTrigger asChild>
  //         <Button variant="outline" size="icon" className="relative">
  //           <ShoppingCart className="h-4 w-4" />
  //         </Button>
  //       </SheetTrigger>
  //       <SheetContent>
  //         <SheetHeader>
  //           <SheetTitle>Your Cart</SheetTitle>
  //           <SheetDescription>
  //             Please login to view your cart
  //           </SheetDescription>
  //         </SheetHeader>
  //       </SheetContent>
  //     </Sheet>
  //   );
  // }

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
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart {profile?.name ? `- ${profile.name}` : ''}</SheetTitle>
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

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <Separator />

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold">Choose Payment Method</h4>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'prepaid')}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center space-x-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="prepaid" id="prepaid" />
                    <Label htmlFor="prepaid" className="flex items-center space-x-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Pay Online</p>
                        <p className="text-sm text-muted-foreground">UPI, Card, Net Banking</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 pt-2">
                <Button 
                  onClick={handlePlaceOrder} 
                  className="w-full" 
                  size="lg"
                  disabled={cartItems.length === 0 || isProcessing}
                >
                  {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Order'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={clearCart} 
                  className="w-full"
                  disabled={cartItems.length === 0 || isProcessing}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
