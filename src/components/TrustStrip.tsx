import { Link } from "react-router-dom";

const GOOGLE_RATING = 4.7;

const TrustStrip = () => {
  return (
    <section className="bg-primary py-2.5 px-4" aria-label="Trust indicators">
      <div className="container mx-auto">
        {/* Single row on desktop, stacked on mobile */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 font-montserrat text-xs sm:text-sm text-primary-foreground font-semibold flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-300">⭐</span> Rated {GOOGLE_RATING} on Google
          </span>
          <span className="text-primary-foreground/40 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1">
            ✅ WhatsApp confirmation in minutes
          </span>
          <span className="text-primary-foreground/40 hidden sm:inline">•</span>
          <Link to="/delivery-area" className="inline-flex items-center gap-1 hover:underline transition-colors">
            📍 Mamurdi · Kiwale · Ravet · Punawale
          </Link>
        </div>
        {/* Mobile: show all 3 items stacked neatly */}
        <div className="sm:hidden flex flex-col items-center gap-1 mt-1.5 font-montserrat text-[11px] text-primary-foreground/90 font-medium">
          <span>✅ WhatsApp confirmation · 🔥 Fresh batches daily</span>
          <Link to="/delivery-area" className="hover:underline transition-colors">
            📍 Mamurdi · Kiwale · Ravet · Punawale
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
