import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms & Conditions - Burger Rox";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-foreground mb-2">
            TERMS & CONDITIONS
          </h1>
          <p className="font-allura text-xl text-primary mb-8">Last updated: 2026</p>

          <div className="font-montserrat text-sm sm:text-base text-muted-foreground space-y-6">
            <p>
              By using the Burger Rox website and ordering our food, you agree to these terms. Please read them carefully.
            </p>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Use of Service</h2>
              <p>Our website is for ordering food from Burger Rox for delivery or pickup. You must provide accurate contact and delivery details. You must be at least 18 years old or have parental consent to place an order.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Orders & Payment</h2>
              <p>Orders are subject to availability and our delivery area (see our Delivery Area page). We accept online payment via Razorpay (cards, UPI, etc.) and Cash on Delivery (COD) where offered. Prices and delivery charges are as shown at checkout. We reserve the right to cancel or modify orders in case of errors or abuse.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Delivery & Pickup</h2>
              <p>Delivery times are estimates. We are not liable for delays due to traffic, weather, or other factors beyond our control. For pickup, you are responsible for collecting the order at the notified time from our outlet (Urban Forest, Mamurdi, Kiwale, Pune 412101).</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Refunds & Complaints</h2>
              <p>Refunds are governed by our <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>. For wrong or missing items or quality issues, please contact us promptly with your order number so we can resolve it.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Privacy</h2>
              <p>Your use of the site is also subject to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Contact</h2>
              <p>For any questions about these terms, contact us at <a href="mailto:cloudspicepvtltd@gmail.com" className="text-primary hover:underline">cloudspicepvtltd@gmail.com</a> or <a href="tel:+919321389985" className="text-primary hover:underline">9321389985</a>.</p>
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

export default Terms;
