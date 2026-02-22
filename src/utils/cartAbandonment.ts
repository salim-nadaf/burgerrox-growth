const KEYS = {
  lastActivity: 'cart_last_activity',
  abandoned: 'cart_abandoned',
  eventFired: 'cart_abandoned_event_fired',
  bannerShown: 'cart_abandoned_banner_shown',
  recoveryMsg: 'cart_recovery_message',
};

const ABANDONMENT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

export function recordCartActivity() {
  localStorage.setItem(KEYS.lastActivity, String(Date.now()));
  // Reset abandoned state on new activity
  localStorage.removeItem(KEYS.abandoned);
  localStorage.removeItem(KEYS.eventFired);
}

export function markOrderCompleted() {
  localStorage.removeItem(KEYS.lastActivity);
  localStorage.removeItem(KEYS.abandoned);
  localStorage.removeItem(KEYS.eventFired);
  localStorage.removeItem(KEYS.bannerShown);
  localStorage.removeItem(KEYS.recoveryMsg);
}

export function isCartAbandoned(): boolean {
  return localStorage.getItem(KEYS.abandoned) === 'true';
}

export function wasBannerShownThisSession(): boolean {
  return sessionStorage.getItem(KEYS.bannerShown) === 'true';
}

export function markBannerShown() {
  sessionStorage.setItem(KEYS.bannerShown, 'true');
}

export function prepareRecoveryMessage(name: string, cartLink: string) {
  const msg = `Hi ${name}, you left something tasty in your cart at Burger Rox 😋\nComplete your order here: ${cartLink}`;
  localStorage.setItem(KEYS.recoveryMsg, msg);
  return msg;
}

export function getRecoveryMessage(): string | null {
  return localStorage.getItem(KEYS.recoveryMsg);
}

/** Fire CartAbandoned pixel event once per session */
function fireAbandonmentPixel(cartTotal: number) {
  if (sessionStorage.getItem(KEYS.eventFired) === 'true') return;
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'CartAbandoned', {
      value: cartTotal,
      currency: 'INR',
    });
  }
  sessionStorage.setItem(KEYS.eventFired, 'true');
}

/**
 * Start the background abandonment checker.
 * Returns a cleanup function to clear the interval.
 */
export function startAbandonmentChecker(
  getCartItemCount: () => number,
  getCartTotal: () => number,
  getUserName?: () => string | null,
): () => void {
  const check = () => {
    const lastActivity = localStorage.getItem(KEYS.lastActivity);
    if (!lastActivity) return;

    const itemCount = getCartItemCount();
    if (itemCount === 0) return;

    const elapsed = Date.now() - Number(lastActivity);
    if (elapsed > ABANDONMENT_THRESHOLD_MS) {
      localStorage.setItem(KEYS.abandoned, 'true');
      fireAbandonmentPixel(getCartTotal());

      // Prepare WhatsApp recovery message if user name available
      const name = getUserName?.();
      if (name) {
        prepareRecoveryMessage(name, window.location.origin + '/menu');
      }
    }
  };

  const id = setInterval(check, CHECK_INTERVAL_MS);
  return () => clearInterval(id);
}
