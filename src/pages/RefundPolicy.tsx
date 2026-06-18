import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund Policy - Burger Rox";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Burger Rox refund & cancellation policy. Cancel within 1 minute, secure refunds via Razorpay for prepaid orders. Read full terms."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-foreground mb-2">
            REFUND POLICY
          </h1>
          <p className="font-allura text-xl text-primary mb-8">Last updated: 2026</p>

          <div className="font-montserrat text-sm sm:text-base text-muted-foreground space-y-6">
            <p>
              At Burger Rox we want you to be satisfied. Our refunds are processed securely through <strong>Razorpay</strong> (India). Please read the following.
            </p>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Cancellation Policy</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Orders can be cancelled within <strong>1 minute</strong> of placing the order.</li>
                <li>After 1 minute, once preparation has begun, cancellations are <strong>not possible</strong>.</li>
                <li>For cancellation requests before delivery, please contact us immediately via WhatsApp or phone (details below). We will do our best to accommodate, subject to order preparation status.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Refund Eligibility</h2>
              <p>Refunds may be considered for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Order cancelled within the 1-minute cancellation window</li>
                <li>Wrong or missing items (reported promptly)</li>
                <li>Payment charged in error or duplicate</li>
              </ul>
              <p className="mt-2">Refunds are at our discretion for quality or delivery issues once we have verified the same.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">How Refunds Work (Razorpay)</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Normal refund:</strong> Processed within <strong>5–7 working days</strong> to the original payment method. No refund fee from our side.</li>
                <li><strong>Instant refund:</strong> May be offered in select cases; Razorpay may apply a small fee.</li>
                <li>Once a refund is issued, it cannot be cancelled or reversed.</li>
                <li>Razorpay sends you an email with refund ID and bank reference (ARN/RRN/UTR). Credit typically appears in <strong>7–10 working days</strong> depending on your bank.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">How to Request a Refund</h2>
              <p>Contact us as soon as possible with your order number and reason:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>WhatsApp: <a href="https://wa.me/919321389985" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">9321389985</a></li>
                <li>Alternate: <a href="tel:+919970078688" className="text-primary hover:underline">9970078688</a></li>
                <li>Email: <a href="mailto:cloudspicepvtltd@gmail.com" className="text-primary hover:underline">cloudspicepvtltd@gmail.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Cash on Delivery (COD)</h2>
              <p>For COD orders, no payment has been taken online; refunds do not apply. For any issue with your COD order, contact us for a replacement or credit as applicable.</p>
            </section>
          </div>

          <div className="mt-10">
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
