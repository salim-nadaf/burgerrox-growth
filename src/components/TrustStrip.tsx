const GOOGLE_RATING = 4.7;

const TrustStrip = () => {
  return (
    <section className="bg-foreground py-3 px-4" aria-label="Trust indicators">
      <div className="container mx-auto space-y-2">
        {/* Google Trust Badge */}
        <div className="flex items-center justify-center gap-2 font-montserrat text-xs sm:text-sm text-background font-semibold">
          <span className="text-amber-400 text-base">⭐</span>
          <span>Rated {GOOGLE_RATING} on Google</span>
          <span className="text-background/40">•</span>
          <span>💬 Loved by local burger fans</span>
          <span className="text-background/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">📍 Mamurdi · Kiwale · Ravet</span>
        </div>
        {/* Mobile location line */}
        <p className="sm:hidden text-center font-montserrat text-[11px] text-background/80 font-medium">
          📍 Mamurdi · Kiwale · Ravet
        </p>
        {/* Trust details row */}
        <div className="hidden md:flex items-center justify-center gap-6 font-montserrat text-[11px] text-background/70 font-medium">
          <span>⭐ WhatsApp confirmation in minutes</span>
          <span className="text-background/30">•</span>
          <span>🔥 Fresh batches every evening</span>
        </div>
        <div className="flex md:hidden flex-col items-center gap-0.5 font-montserrat text-[10px] text-background/70 font-medium">
          <span>⭐ WhatsApp confirmation · 🔥 Fresh batches daily</span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
