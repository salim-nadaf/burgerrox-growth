import { useOrders, OrderStatus } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Clock, CheckCircle, Truck, XCircle, ChefHat } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: <CheckCircle className="h-4 w-4" /> },
  preparing: { label: 'Preparing', color: 'bg-orange-500', icon: <ChefHat className="h-4 w-4" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> }
};

export default function OrderHistory() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-mono">{order.order_number}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                  <Badge className={`${status.color} text-white flex items-center gap-1`}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.item_name} x{item.quantity}</span>
                      <span className="font-medium">₹{(item.item_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payment: </span>
                    <span className="font-medium">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Prepaid'}
                    </span>
                    {order.payment_id && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({order.payment_id.substring(0, 12)}...)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
