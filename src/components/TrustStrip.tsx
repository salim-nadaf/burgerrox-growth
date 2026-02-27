import { Link } from "react-router-dom";

const GOOGLE_RATING = 4.7;

const TrustStrip = () => {
  return (
    <section className="bg-foreground py-2.5 px-4" aria-label="Trust indicators">
      <div className="container mx-auto space-y-1.5">
        {/* Main trust row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 font-montserrat text-xs sm:text-sm text-background font-semibold flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-400">⭐</span> Rated {GOOGLE_RATING} on Google
          </span>
          <span className="text-background/30 hidden sm:inline">•</span>
          <span className="hidden sm:inline">✅ WhatsApp confirmation in minutes</span>
          <span className="text-background/30 hidden sm:inline">•</span>
          <Link to="/delivery-area" className="hidden sm:inline hover:text-primary transition-colors">
            📍 Mamurdi · Kiwale · Ravet · Punawale
          </Link>
        </div>
        {/* Mobile-only compact rows */}
        <div className="sm:hidden flex flex-col items-center gap-0.5 font-montserrat text-[11px] text-background/80 font-medium">
          <span>✅ WhatsApp confirmation · 🔥 Fresh batches daily</span>
          <Link to="/delivery-area" className="hover:text-primary transition-colors">
            📍 Delivering to Mamurdi · Kiwale · Ravet · Punawale
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
