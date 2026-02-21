// Meta Pixel (Facebook Pixel) utility
// Pixel ID: 715141415840716

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = '715141415840716';

export const pageView = () => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

export const trackViewContent = (contentName: string, contentCategory: string, value?: number, currency = 'INR') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      ...(value !== undefined && { value, currency }),
    });
  }
};

export const trackAddToCart = (itemName: string, price: number, currency = 'INR') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_name: itemName,
      contents: [{ id: itemName, quantity: 1 }],
      content_type: 'product',
      value: price,
      currency,
    });
  }
};

export const trackInitiateCheckout = (totalValue: number, numItems: number, contents: { id: string; quantity: number }[] = [], currency = 'INR') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: totalValue,
      currency,
      num_items: numItems,
      ...(contents.length > 0 && { contents, content_type: 'product' }),
    });
  }
};

export const trackPurchase = (orderId: string, totalValue: number, contents: { id: string; quantity: number }[] = [], currency = 'INR') => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value: totalValue,
      currency,
      content_name: orderId,
      ...(contents.length > 0 && { contents, content_type: 'product' }),
    });
  }
};
