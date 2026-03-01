import { Button } from "@/components/ui/button";
import { Banknote, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const LoginIncentive = () => {
  return (
    <section className="py-10 sm:py-14 bg-card" aria-labelledby="why-direct-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="why-direct-heading" className="font-bebas text-3xl sm:text-4xl text-foreground tracking-wider mb-1">
            WHY ORDER DIRECT?
          </h2>
          <div className="w-10 h-1 bg-primary mx-auto mb-6" aria-hidden="true" />

          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6">
            <div className="p-3 sm:p-5 rounded-lg bg-background text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary mb-2">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <p className="font-bebas text-sm sm:text-lg text-foreground">LOWER PRICES</p>
              <p className="font-montserrat text-[10px] sm:text-xs text-muted-foreground mt-0.5">No middleman fees</p>
            </div>
            <div className="p-3 sm:p-5 rounded-lg bg-background text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary mb-2">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <p className="font-bebas text-sm sm:text-lg text-foreground">FREE DELIVERY</p>
              <p className="font-montserrat text-[10px] sm:text-xs text-muted-foreground mt-0.5">Within 3km</p>
            </div>
            <div className="p-3 sm:p-5 rounded-lg bg-background text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary mb-2">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <p className="font-bebas text-sm sm:text-lg text-foreground">WHATSAPP UPDATES</p>
              <p className="font-montserrat text-[10px] sm:text-xs text-muted-foreground mt-0.5">Real-time tracking</p>
            </div>
          </div>

          <Link to="/menu">
            <Button variant="brand" className="h-11 px-6 text-sm font-montserrat font-semibold">
              Start Your Order
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoginIncentive;
