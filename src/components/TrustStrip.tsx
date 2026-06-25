import { Link } from "react-router-dom";
import { Star, CheckCircle2, MapPin, Truck } from "lucide-react";

const TrustStrip = () => {
  return (
    <section className="bg-card border-b border-border py-3 px-4 shadow-sm" aria-label="Trust indicators" role="region">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-6 font-montserrat text-[11px] sm:text-xs md:text-sm font-semibold flex-wrap text-foreground">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Star className="h-3.5 w-3.5 text-secondary fill-secondary" aria-hidden="true" /> 
            <span>4.7 on Google</span>
          </span>
          <span className="hidden sm:inline text-border" aria-hidden="true">|</span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> 
            <span>WhatsApp confirmation</span>
          </span>
          <span className="hidden sm:inline text-border" aria-hidden="true">|</span>
          <Link to="/delivery-area" className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary transition-colors">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span className="hover:underline">Mamurdi • Kiwale • Ravet • Punawale</span>
          </Link>
          <span className="hidden sm:inline text-border" aria-hidden="true">|</span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span>Free delivery within 3 km</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
