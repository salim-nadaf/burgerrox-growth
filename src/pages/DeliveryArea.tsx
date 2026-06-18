import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DELIVERY_TIERS = [
  { range: "0 – 3 km", charge: "FREE", note: "Free delivery zone" },
  { range: "3 – 5 km", charge: "₹50", note: "" },
  { range: "5 – 7 km", charge: "₹75", note: "" },
  { range: "7 – 10 km", charge: "₹105", note: "" },
  { range: "10 – 12 km", charge: "₹175", note: "Max delivery distance" },
];

const DeliveryArea = () => {
  useEffect(() => {
    document.title = "Delivery Area & Charges - Burger Rox";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Burger Rox delivers to Mamurdi, Kiwale, Punawale & Ravet within 12 km. Free delivery up to 3 km. See distance-based delivery charges."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-foreground mb-2">
            DELIVERY AREA
          </h1>
          <p className="font-allura text-xl text-primary mb-8">From Urban Forest, Kiwale – Pune</p>

          <div className="font-montserrat text-sm sm:text-base text-muted-foreground space-y-6">
            <p>
              We deliver within <strong>12 km</strong> of our outlet at Urban Forest, Mamurdi, Saint Tukaram Nagar Road, Kiwale, Taluka Haveli, Pune 412101. Distance is calculated by road (driving) using Google Maps. Delivery charges are based on the distance from our kitchen to your location.
            </p>

            <section>
              <h2 className="font-bebas text-xl tracking-wide text-foreground mb-3">Delivery charges</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Distance from outlet</TableHead>
                      <TableHead className="font-semibold text-right">Delivery charge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DELIVERY_TIERS.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.range}{row.note ? ` (${row.note})` : ""}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">{row.charge}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <p>
              At checkout, enter your delivery address or use “Use my location” so we can show the exact charge for your order. Pickup orders have no delivery charge—collect from our outlet.
            </p>

            <p>
              For any doubt about whether we deliver to your area, WhatsApp us at <a href="https://wa.me/919321389985" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">9321389985</a> or call <a href="tel:+919970078688" className="text-primary hover:underline">9970078688</a> (alternate).
            </p>
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

export default DeliveryArea;
