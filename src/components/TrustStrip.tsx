import { Link } from "react-router-dom";
import { Star, CheckCircle2, MapPin, Truck } from "lucide-react";

const TrustStrip = () => {
  return (
    <section className="bg-card border-b border-border py-3 px-4 shadow-sm" aria-label="Trust indicators" role="region">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 md:flex md:flex-row md:items-center md:justify-center md:gap-6 font-montserrat text-[11px] sm:text-xs md:text-sm font-semibold text-foreground">
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap py-0.5">
            <Star className="h-3.5 w-3.5 text-secondary fill-secondary" aria-hidden="true" /> 
            <span>4.7 on Google</span>
          </span>
          <span className="hidden md:inline text-border" aria-hidden="true">|</span>
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap py-0.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> 
            <span>WhatsApp Confirmation</span>
          </span>
          <span className="hidden md:inline text-border" aria-hidden="true">|</span>
          <Link to="/delivery-area" className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap hover:text-primary transition-colors py-0.5 col-span-2 md:col-span-1">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span className="hover:underline">Mamurdi • Kiwale • Ravet • Punawale</span>
          </Link>
          <span className="hidden md:inline text-border" aria-hidden="true">|</span>
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap py-0.5 col-span-2 md:col-span-1">
            <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span>Free Delivery within 3 km</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
