import { useRef } from "react";
import fullMeal from "@/assets/Full meal.webp";
import potatoWedges from "@/assets/potato wedges.jpg.webp";
import lavaCake from "@/assets/Rich molten lava cake.webp";
import vegCrispy from "@/assets/Veg crispy.webp";
import variety from "@/assets/showcasing variety.webp";
import zingerPacked from "@/assets/Zinger burgers are getting packed.jpg.webp";

const PHOTOS = [
  { src: fullMeal, alt: "Full meal combo with burger and fries" },
  { src: variety, alt: "Showcasing variety of Burger Rox menu" },
  { src: zingerPacked, alt: "Zinger burgers getting packed fresh" },
  { src: vegCrispy, alt: "Crispy veg burger" },
  { src: lavaCake, alt: "Rich molten lava cake dessert" },
  { src: potatoWedges, alt: "Crispy potato wedges" },
];

const FoodPhotoStrip = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-6 sm:py-10 bg-background" aria-label="Food gallery">
      <div className="container mx-auto px-4">
        <div className="text-center mb-5">
          <p className="font-montserrat text-xs font-semibold tracking-widest text-primary uppercase mb-1">
            Our Kitchen
          </p>
          <h2 className="font-bebas text-2xl sm:text-3xl text-foreground tracking-wider">
            FRESHLY MADE, ALWAYS
          </h2>
        </div>

        {/* Desktop grid — 2 rows of 3, proper aspect ratio */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {PHOTOS.map((p) => (
            <div key={p.alt} className="overflow-hidden rounded-xl aspect-[4/3] group shadow-sm">
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width="400"
                height="300"
              />
            </div>
          ))}
        </div>

        {/* Mobile — larger cards with horizontal scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {PHOTOS.map((p) => (
            <div key={p.alt} className="flex-shrink-0 w-40 h-40 overflow-hidden rounded-xl snap-center shadow-sm">
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="160"
                height="160"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodPhotoStrip;
