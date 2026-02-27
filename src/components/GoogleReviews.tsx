import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
  <div className="flex gap-0.5 text-amber-400 text-sm" aria-label="5 out of 5 stars">
    {"★★★★★".split("").map((s, i) => (
      <span key={i}>{s}</span>
    ))}
  </div>
);

const GoogleReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-8 sm:py-12 bg-background" aria-labelledby="reviews-heading">
      <div className="container mx-auto px-4">
        <h2
          id="reviews-heading"
          className="font-bebas text-3xl sm:text-4xl text-foreground tracking-wider text-center mb-6"
        >
          WHAT OUR CUSTOMERS SAY
        </h2>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {REVIEWS.map((r) => (
            <Card key={r.name} className="border border-border/50" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <CardContent className="p-4 space-y-2">
                <Stars />
                <p className="font-montserrat text-sm text-foreground leading-relaxed">"{r.text}"</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-montserrat text-xs font-semibold text-foreground">{r.name}</span>
                  <span className="font-montserrat text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    📍 {r.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {REVIEWS.map((r) => (
            <Card
              key={r.name}
              className="border border-border/50 flex-shrink-0 w-[280px] snap-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <CardContent className="p-4 space-y-2">
                <Stars />
                <p className="font-montserrat text-sm text-foreground leading-relaxed">"{r.text}"</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-montserrat text-xs font-semibold text-foreground">{r.name}</span>
                  <span className="font-montserrat text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    📍 {r.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
