import { Link } from "react-router-dom";

const TrustStrip = () => {
  return (
    <section className="bg-primary py-2 px-4" aria-label="Trust indicators" role="region">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-5 font-montserrat text-[11px] sm:text-sm font-semibold flex-wrap" style={{ color: 'hsl(0 0% 100%)' }}>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden="true">⭐</span> 4.7 on Google
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.5 }} aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden="true">✅</span> WhatsApp confirmation
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.5 }} aria-hidden="true">·</span>
          <Link to="/delivery-area" className="inline-flex items-center gap-1 whitespace-nowrap hover:underline">
            <span aria-hidden="true">📍</span> Mamurdi • Kiwale • Ravet • Punawale
          </Link>
          <span className="hidden sm:inline" style={{ opacity: 0.5 }} aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden="true">🚚</span> Free delivery within 3 km
          </span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
