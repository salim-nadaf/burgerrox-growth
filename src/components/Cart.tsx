import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Banknote, MessageCircle, CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, OrderItem } from '@/hooks/useOrders';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderConfirmation {
  orderNumber: string;
  paymentStatus: string;
  whatsappUrl: string;
  items: OrderItem[];
  totalAmount: number;
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const { user, profile } = useAuth();
  const { createOrder } = useOrders();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'prepaid'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  
  // Store items snapshot before payment
  const itemsSnapshotRef = useRef<OrderItem[]>([]);
  const totalAmountRef = useRef<number>(0);

  const generateWhatsAppUrl = (
    orderNumber: string, 
    paymentStatus: string, 
    items: OrderItem[], 
    total: number,
    customerName: string,
    customerWhatsapp: string,
    customerArea: string
  ) => {
    const orderDetails = items.map(item => 
      `${item.item_name} x${item.quantity} - ₹${(item.item_price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🍔 *BURGER ROX Order* 🍔\n\n` +
      `🔢 *Order #:* ${orderNumber}\n` +
      `👤 *Customer:* ${customerName}\n` +
      `📱 *WhatsApp:* ${customerWhatsapp}\n` +
      `📍 *Area:* ${customerArea}\n\n` +
      `📋 *Order Details:*\n${orderDetails}\n\n` +
      `💰 *Total Amount:* ₹${total.toFixed(2)}\n` +
      `💳 *Payment:* ${paymentStatus}\n\n` +
      `🚚 *Delivery Required* - Please confirm delivery time!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/919321389985?text=${encodedMessage}`;
  };

  const handleSendWhatsApp = () => {
    if (orderConfirmation) {
      window.open(orderConfirmation.whatsappUrl, '_blank');
    }
  };

  const closeConfirmation = () => {
    setOrderConfirmation(null);
  };

  const handleCODOrder = async () => {
    setIsProcessing(true);
    
    // Capture items snapshot before async operations
    const itemsSnapshot = cartItems.map(item => ({
      item_name: item.item_name,
      item_price: item.item_price,
      quantity: item.quantity
    }));
    const totalSnapshot = totalAmount;
    const customerName = profile?.name || 'Guest Customer';
    const customerWhatsapp = profile?.whatsapp_number || 'Not provided';
    const customerArea = profile?.area || 'Not provided';
    
    try {
      // Create order in database
      const order = await createOrder({
        items: itemsSnapshot,
        totalAmount: totalSnapshot,
        paymentMethod: 'cod',
        paymentStatus: 'pending'
      });

      if (order) {
        const paymentStatus = '💵 Cash on Delivery';
        const whatsappUrl = generateWhatsAppUrl(
          order.order_number, 
          paymentStatus, 
          itemsSnapshot, 
          totalSnapshot,
          customerName,
          customerWhatsapp,
          customerArea
        );
        
        // Show confirmation dialog with WhatsApp button
        setOrderConfirmation({
          orderNumber: order.order_number,
          paymentStatus,
          whatsappUrl,
          items: itemsSnapshot,
          totalAmount: totalSnapshot
        });
        
        clearCart();
        setIsOpen(false);
        
        toast({
          title: "Order Placed!",
          description: `Order ${order.order_number} created. Please send via WhatsApp.`,
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing COD order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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

    // Capture items snapshot BEFORE payment (critical for closure)
    const itemsSnapshot = cartItems.map(item => ({
      item_name: item.item_name,
      item_price: item.item_price,
      quantity: item.quantity
    }));
    const totalSnapshot = totalAmount;
    const customerName = profile?.name || 'Guest Customer';
    const customerWhatsapp = profile?.whatsapp_number || 'Not provided';
    const customerArea = profile?.area || 'Not provided';

    // Store in refs for Razorpay callback access
    itemsSnapshotRef.current = itemsSnapshot;
    totalAmountRef.current = totalSnapshot;

    try {
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: totalSnapshot,
          receipt: `order_${Date.now()}`
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
          name: customerName,
          contact: customerWhatsapp,
        },
        theme: {
          color: '#FFD939'
        },
        handler: async function(response: any) {
          // Payment successful - create order in database
          // Use refs to get snapshot data (avoids stale closure)
          const items = itemsSnapshotRef.current;
          const total = totalAmountRef.current;
          
          const order = await createOrder({
            items,
            totalAmount: total,
            paymentMethod: 'prepaid',
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id
          });

          if (order) {
            const paymentStatus = `✅ Prepaid (${response.razorpay_payment_id})`;
            const whatsappUrl = generateWhatsAppUrl(
              order.order_number, 
              paymentStatus, 
              items, 
              total,
              customerName,
              customerWhatsapp,
              customerArea
            );
            
            // Show confirmation dialog with WhatsApp button
            setOrderConfirmation({
              orderNumber: order.order_number,
              paymentStatus,
              whatsappUrl,
              items,
              totalAmount: total
            });
            
            clearCart();
            setIsOpen(false);
            
            toast({
              title: "Payment Successful!",
              description: `Order ${order.order_number} created. Please send via WhatsApp.`,
            });
          } else {
            toast({
              title: "Payment Received",
              description: "Payment was successful but order creation failed. Please contact support.",
              variant: "destructive"
            });
          }
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
    <>
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

    {/* Order Confirmation Dialog with WhatsApp Button */}
    <Dialog open={!!orderConfirmation} onOpenChange={(open) => !open && closeConfirmation()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Order Placed Successfully!
          </DialogTitle>
          <DialogDescription>
            Your order has been recorded. Please send it to WhatsApp to complete.
          </DialogDescription>
        </DialogHeader>
        
        {orderConfirmation && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Order #{orderConfirmation.orderNumber}</p>
              <div className="text-sm space-y-1">
                {orderConfirmation.items.map((item, idx) => (
                  <p key={idx}>
                    {item.item_name} x{item.quantity} - ₹{(item.item_price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>
              <Separator />
              <p className="font-semibold">Total: ₹{orderConfirmation.totalAmount.toFixed(2)}</p>
            </div>
            
            <div className="bg-accent border border-border p-3 rounded-lg">
              <p className="text-sm text-foreground">
                ⚠️ <strong>Important:</strong> Click the button below to send your order via WhatsApp. 
                Without this, the restaurant won't receive your order!
              </p>
            </div>
            
            <Button 
              onClick={handleSendWhatsApp} 
              variant="brand"
              size="lg"
              className="w-full"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Send Order on WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              onClick={closeConfirmation}
              className="w-full"
            >
              Close (I'll send later)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
