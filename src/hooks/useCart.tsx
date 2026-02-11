import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (itemName: string, itemPrice: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Merge guest cart from localStorage into DB after login
  useEffect(() => {
    if (user) {
      mergeGuestCart().then(() => fetchCartItems());
    } else {
      setCartItems([]);
    }
  }, [user]);

  const mergeGuestCart = async () => {
    try {
      const raw = localStorage.getItem('guest_cart');
      if (!raw) return;
      const guestItems: { item_name: string; item_price: number; quantity: number }[] = JSON.parse(raw);
      if (!guestItems.length) return;

      // Fetch existing cart items to check for duplicates
      const { data: existingItems } = await (supabase as any)
        .from('cart_items')
        .select('*')
        .eq('user_id', user!.id);

      for (const gi of guestItems) {
        const existing = (existingItems || []).find((e: any) => e.item_name === gi.item_name);
        if (existing) {
          // Update quantity
          await (supabase as any)
            .from('cart_items')
            .update({ quantity: existing.quantity + gi.quantity })
            .eq('id', existing.id);
        } else {
          // Insert new item
          await (supabase as any)
            .from('cart_items')
            .insert({ user_id: user!.id, item_name: gi.item_name, item_price: gi.item_price, quantity: gi.quantity });
        }
      }
      localStorage.removeItem('guest_cart');
    } catch (e) {
      console.error('Error merging guest cart:', e);
      localStorage.removeItem('guest_cart');
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemName: string, itemPrice: number) => {
    if (!user) {
      // Save to localStorage for guest users
      try {
        const raw = localStorage.getItem('guest_cart');
        const guestItems: { item_name: string; item_price: number; quantity: number }[] = raw ? JSON.parse(raw) : [];
        const existing = guestItems.find(i => i.item_name === itemName);
        if (existing) {
          existing.quantity += 1;
        } else {
          guestItems.push({ item_name: itemName, item_price: itemPrice, quantity: 1 });
        }
        localStorage.setItem('guest_cart', JSON.stringify(guestItems));
      } catch (e) {
        console.error('Error saving guest cart:', e);
      }
      toast({
        title: "Login Required",
        description: "Please login to add items to cart. Your item has been saved!",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.item_name === itemName);
      
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        toast({
          title: "Added to Cart ✓",
          description: `${itemName} quantity updated`,
          duration: 2000,
        });
      } else {
        const { data, error } = await (supabase as any)
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_name: itemName,
            item_price: itemPrice,
            quantity: 1
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding to cart:', error);
          toast({
            title: "Error",
            description: "Failed to add item to cart",
            variant: "destructive"
          });
          return;
        }

        setCartItems(prev => [...prev, data]);
        window.dispatchEvent(new CustomEvent('cart-item-added'));
        toast({
          title: "Added to Cart ✓",
          description: `${itemName} added to your cart`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        return;
      }

      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Removed from Cart",
        description: "Item removed from your cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }

      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }

      setCartItems([]);
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.item_price * item.quantity), 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalAmount,
      itemCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}