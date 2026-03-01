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
  <div className="flex gap-0.5" aria-label="5 out of 5 stars">
    {"★★★★★".split("").map((s, i) => (
      <span key={i} className="text-primary text-sm">{s}</span>
    ))}
  </div>
);

const ReviewCard = ({ r }: { r: typeof REVIEWS[0] }) => (
  <div className="bg-card rounded-lg p-4 border border-border/30">
    <Stars />
    <p className="font-montserrat text-sm text-card-foreground leading-relaxed mt-2 mb-3">
      "{r.text}"
    </p>
    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary">{r.name[0]}</span>
      </div>
      <div>
        <span className="font-montserrat text-xs font-semibold text-card-foreground block leading-tight">{r.name}</span>
        <span className="font-montserrat text-[10px] text-muted-foreground">📍 {r.location}</span>
      </div>
    </div>
  </div>
);

const GoogleReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-6 sm:py-8 bg-secondary/20" aria-labelledby="reviews-heading">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 id="reviews-heading" className="font-bebas text-xl sm:text-2xl text-foreground tracking-wider">
            WHAT CUSTOMERS SAY
          </h2>
          <span className="font-montserrat text-xs text-muted-foreground whitespace-nowrap">
            ⭐ 4.7 avg rating
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {REVIEWS.map((r) => <ReviewCard key={r.name} r={r} />)}
        </div>

        {/* Mobile scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex-shrink-0 w-[260px] snap-center">
              <ReviewCard r={r} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
