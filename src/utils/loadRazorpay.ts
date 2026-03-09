let razorpayPromise: Promise<void> | null = null;
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const loadRazorpay = (): Promise<void> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }

  if (window.Razorpay) return Promise.resolve();
  if (razorpayPromise) return razorpayPromise;

  razorpayPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SRC}"]`
    );

    const resolveIfReady = () => {
      if (window.Razorpay) {
        resolve();
      } else {
        const start = performance.now();
        const check = () => {
          if (window.Razorpay) {
            resolve();
          } else if (performance.now() - start > 15000) {
            razorpayPromise = null;
            reject(new Error("Razorpay SDK did not become available"));
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      }
    };

    if (existingScript) {
      if (window.Razorpay) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", resolveIfReady, { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          razorpayPromise = null;
          reject(new Error("Failed to load Razorpay"));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = resolveIfReady;
    script.onerror = () => {
      razorpayPromise = null;
      reject(new Error("Failed to load Razorpay"));
    };
    document.body.appendChild(script);
  });

  return razorpayPromise;
};
