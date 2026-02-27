const TrustStrip = () => {
  return (
    <section className="bg-foreground py-2.5 px-4" aria-label="Trust indicators">
      <div className="container mx-auto">
        {/* Desktop: single row */}
        <div className="hidden md:flex items-center justify-center gap-6 font-montserrat text-xs text-background/90 font-medium">
          <span>⭐ WhatsApp confirmation in minutes</span>
          <span className="text-background/40">•</span>
          <span>🚚 Delivery in Mamurdi · Punawale · Ravet</span>
          <span className="text-background/40">•</span>
          <span>🔥 Fresh batches every evening</span>
        </div>
        {/* Mobile: stacked */}
        <div className="flex md:hidden flex-col items-center gap-1 font-montserrat text-[11px] text-background/90 font-medium">
          <span>⭐ WhatsApp confirmation in minutes</span>
          <span>🚚 Mamurdi · Punawale · Ravet</span>
          <span>🔥 Fresh batches every evening</span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
