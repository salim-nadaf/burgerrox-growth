import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  item_name: string;
  item_price: number;
  quantity: number;
}

export interface Order {
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

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: {
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentId?: string;
    orderNumber?: string;
  }) => Promise<Order | null>;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setOrders([]);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Parse items JSON and cast status
      const parsedOrders: Order[] = (data || []).map((order: any) => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        status: order.status as OrderStatus
      }));

      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BRX-${timestamp}-${random}`;
  };

  const createOrder = async (orderData: {
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentId?: string;
    orderNumber?: string;
  }): Promise<Order | null> => {
    if (!user) return null;

    try {
      const orderNumber = orderData.orderNumber || generateOrderNumber();
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: orderNumber,
          items: orderData.items as any,
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentStatus,
          payment_id: orderData.paymentId || null,
          status: 'pending' as const,
          customer_name: profile?.name || null,
          customer_whatsapp: profile?.whatsapp_number || null,
          customer_area: profile?.area || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return null;
      }

      const newOrder: Order = {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        status: data.status as OrderStatus
      };

      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      loading,
      createOrder,
      refreshOrders
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
