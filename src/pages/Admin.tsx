import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendToGoogleSheet } from '@/components/Cart';
import { Lock, RefreshCw, Package, Clock, CheckCircle, Truck, XCircle, ChefHat } from 'lucide-react';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem {
  item_name: string;
  item_price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_id: string | null;
  status: OrderStatus;
  customer_name: string | null;
  customer_whatsapp: string | null;
  customer_area: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: <CheckCircle className="h-4 w-4" /> },
  preparing: { label: 'Preparing', color: 'bg-orange-500', icon: <ChefHat className="h-4 w-4" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> }
};

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin Dashboard - Burger Rox";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Burger Rox admin dashboard — internal order management. Authorized staff only."
    );
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
  }, []);

  const handleLogin = async () => {
    if (!token.trim()) {
      toast({ title: 'Error', description: 'Please enter admin token', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-order-status', {
        body: { action: 'list' },
        headers: { 'x-admin-token': token }
      });

      if (error) {
        throw error;
      }

      if (data?.orders) {
        const parsedOrders: Order[] = data.orders.map((order: any) => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
        setOrders(parsedOrders);
        setIsAuthenticated(true);
        // Store token in session for refresh
        sessionStorage.setItem('adminToken', token);
        toast({ title: 'Success', description: 'Logged in successfully' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ title: 'Error', description: error.message || 'Invalid token', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (!storedToken) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-order-status', {
        body: { action: 'list' },
        headers: { 'x-admin-token': storedToken }
      });

      if (error) throw error;

      if (data?.orders) {
        const parsedOrders: Order[] = data.orders.map((order: any) => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
        setOrders(parsedOrders);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (!storedToken) return;

    setUpdatingOrderId(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('update-order-status', {
        body: { action: 'update', orderId, status: newStatus },
        headers: { 'x-admin-token': storedToken }
      });

      if (error) throw error;

      if (data?.success) {
        // Find the order to get the order_number for Google Sheet sync
        const order = orders.find(o => o.id === orderId);
        const statusMap: Record<string, string> = {
          pending: "NEW",
          confirmed: "CONFIRMED",
          preparing: "PREPARING",
          out_for_delivery: "OUT FOR DELIVERY",
          delivered: "DELIVERED",
          cancelled: "CANCELLED",
        };

        // Sync status to Google Sheet
        if (order) {
          sendToGoogleSheet({
            order_id: order.order_number,
            status: statusMap[newStatus] || newStatus.toUpperCase(),
            cancel_reason: newStatus === "cancelled" ? "" : undefined,
          });
        }

        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        toast({ title: 'Success', description: `Order status updated to ${statusConfig[newStatus].label}` });
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Fetch orders on page load
      const init = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('update-order-status', {
            body: { action: 'list' },
            headers: { 'x-admin-token': storedToken }
          });

          if (error) throw error;

          if (data?.orders) {
            const parsedOrders: Order[] = data.orders.map((order: any) => ({
              ...order,
              items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            }));
            setOrders(parsedOrders);
          }
        } catch (error: any) {
          // Token invalid, clear it
          sessionStorage.removeItem('adminToken');
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      };
      init();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Admin Dashboard</CardTitle>
            <p className="text-muted-foreground text-sm">Enter your admin token to access the dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Admin Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter admin token..."
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-bebas text-2xl tracking-wider">BURGER ROX - Admin</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                sessionStorage.removeItem('adminToken');
                setIsAuthenticated(false);
                setOrders([]);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Order Management</h2>
          <p className="text-muted-foreground">Total orders: {orders.length}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <CardContent className="p-4 space-y-4">
                      {/* Customer Info */}
                      <div className="text-sm space-y-1">
                        <p><strong>Customer:</strong> {order.customer_name || 'N/A'}</p>
                        <p><strong>WhatsApp:</strong> {order.customer_whatsapp || 'N/A'}</p>
                        <p><strong>Area:</strong> {order.customer_area || 'N/A'}</p>
                      </div>

                      <Separator />

                      {/* Order Items */}
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.item_name} x{item.quantity}</span>
                            <span>Rs.{(item.item_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Payment & Total */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Payment: </span>
                          <span className="font-medium">
                            {order.payment_method === 'cod' ? 'COD' : 'Prepaid'}
                          </span>
                          {order.payment_status === 'completed' && (
                            <Badge variant="outline" className="ml-2 text-xs">Paid</Badge>
                          )}
                        </div>
                        <p className="text-lg font-bold text-primary">Rs.{order.total_amount.toFixed(2)}</p>
                      </div>

                      {/* Status Update */}
                      <div className="pt-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">Update Status</Label>
                        <Select
                          value={order.status}
                          onValueChange={(value: OrderStatus) => updateOrderStatus(order.id, value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                <div className="flex items-center gap-2">
                                  {statusConfig[s].icon}
                                  {statusConfig[s].label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
