import { Link } from "react-router-dom";

const TrustStrip = () => {
  return (
    <section className="bg-primary py-2 px-4" aria-label="Trust indicators">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-5 font-montserrat text-[11px] sm:text-sm text-primary-foreground font-semibold flex-wrap">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span className="text-amber-200">⭐</span> 4.7 on Google
          </span>
          <span className="text-primary-foreground/40 hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            ✅ WhatsApp confirmation
          </span>
          <span className="text-primary-foreground/40 hidden sm:inline">·</span>
          <Link to="/delivery-area" className="inline-flex items-center gap-1 whitespace-nowrap hover:underline">
            📍 Mamurdi • Kiwale • Ravet • Punawale
          </Link>
          <span className="text-primary-foreground/40 hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            🚚 Free delivery within 3 km
          </span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
