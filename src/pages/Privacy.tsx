import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - Burger Rox";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-foreground mb-2">
            PRIVACY POLICY
          </h1>
          <p className="font-allura text-xl text-primary mb-8">Last updated: 2026</p>

          <div className="font-montserrat text-sm sm:text-base text-muted-foreground space-y-6">
            <p>
              Burger Rox (“we”, “our”) respects your privacy. This policy describes how we collect, use, and protect your information when you use our website and ordering services.
            </p>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Information We Collect</h2>
              <p>We may collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name, email, phone (WhatsApp), and delivery address when you create an account or place an order</li>
                <li>Order history and preferences</li>
                <li>Device and browser information (e.g. IP address) for security and improving the site</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">How We Use It</h2>
              <p>We use your information to process orders, send order updates via WhatsApp, improve our service, and comply with legal obligations. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Data Security & Storage</h2>
              <p>We store data securely and use industry-standard practices. Payment processing is handled by Razorpay; we do not store your full card details.</p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-2">Contact</h2>
              <p>For privacy-related questions, contact us at <a href="mailto:cloudspicepvtltd@gmail.com" className="text-primary hover:underline">cloudspicepvtltd@gmail.com</a> or call <a href="tel:+919321389985" className="text-primary hover:underline">9321389985</a>.</p>
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

export default Privacy;
