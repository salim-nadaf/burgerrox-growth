import { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isCartAbandoned, wasBannerShownThisSession, markBannerShown } from '@/utils/cartAbandonment';
import { useCart } from '@/hooks/useCart';

export default function CartAbandonmentBanner() {
  const [visible, setVisible] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    // Show banner only once per session when returning with abandoned cart
    if (isCartAbandoned() && itemCount > 0 && !wasBannerShownThisSession()) {
      setVisible(true);
      markBannerShown();
    }
  }, [itemCount]);

  if (!visible) return null;

  const openCart = () => {
    window.dispatchEvent(new CustomEvent('cart-item-added')); // reuses existing cart-open mechanism
    setVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 min-w-0">
        <ShoppingCart className="h-4 w-4 shrink-0" />
        <span className="text-sm font-montserrat truncate">
          Your cart is waiting 👀 Complete your order before evening slots fill.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="secondary"
          className="text-xs h-7 px-3"
          onClick={openCart}
        >
          View Cart
        </Button>
        <button
          onClick={() => setVisible(false)}
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
