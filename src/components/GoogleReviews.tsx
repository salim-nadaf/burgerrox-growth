import { useRef } from "react";

const REVIEWS = [
  {
    name: "Sidhartha C.",
    location: "Mamurdi",
    text: "The patty was crispy and bun was very fresh. Very delicious burger! 😋",
  },
  {
    name: "Hema C.",
    location: "Kiwale",
    text: "The burger tasted great 👍 Will surely recommend Burger Rox!",
  },
  {
    name: "Aarohi B.",
    location: "Ravet",
    text: "Really loved the burger, will definitely get it again. Totally worth it!",
  },
];

const Stars = () => (
  <div className="flex gap-0.5 text-base" aria-label="5 out of 5 stars">
    {"★★★★★".split("").map((s, i) => (
      <span key={i} className="text-primary">
        {s}
      </span>
    ))}
  </div>
);

const GoogleReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-8 sm:py-10 bg-card" aria-labelledby="reviews-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <p className="font-montserrat text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Google Reviews
          </p>
          <h2
            id="reviews-heading"
            className="font-bebas text-2xl sm:text-3xl text-card-foreground tracking-wider"
          >
            LOVED BY LOCAL BURGER FANS
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-background rounded-xl p-5 border border-border/40 hover:shadow-md transition-shadow duration-200"
            >
              <Stars />
              <p className="font-montserrat text-sm text-card-foreground leading-relaxed mt-3 mb-4">
                "{r.text}"
              </p>
              <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{r.name[0]}</span>
                </div>
                <div>
                  <span className="font-montserrat text-xs font-semibold text-card-foreground block">{r.name}</span>
                  <span className="font-montserrat text-[10px] text-muted-foreground">
                    📍 {r.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-background rounded-xl p-4 border border-border/40 flex-shrink-0 w-[260px] snap-center"
            >
              <Stars />
              <p className="font-montserrat text-sm text-card-foreground leading-relaxed mt-2.5 mb-3">
                "{r.text}"
              </p>
              <div className="flex items-center gap-2 pt-2.5 border-t border-border/30">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{r.name[0]}</span>
                </div>
                <div>
                  <span className="font-montserrat text-xs font-semibold text-card-foreground block">{r.name}</span>
                  <span className="font-montserrat text-[10px] text-muted-foreground">
                    📍 {r.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
