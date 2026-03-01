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
    <section className="py-4 sm:py-6 bg-background" aria-label="Food gallery">
      <div className="container mx-auto px-4">
        <p className="font-bebas text-lg sm:text-xl text-foreground tracking-wider text-center mb-3">
          FROM OUR KITCHEN 🔥
        </p>

        {/* Desktop — single row auto-scroll feel */}
        <div className="hidden sm:grid sm:grid-cols-6 gap-2 max-w-4xl mx-auto">
          {PHOTOS.map((p) => (
            <div key={p.alt} className="overflow-hidden rounded-lg aspect-square group">
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                width="200"
                height="200"
              />
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {PHOTOS.map((p) => (
            <div key={p.alt} className="flex-shrink-0 w-28 h-28 overflow-hidden rounded-lg snap-center">
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="112"
                height="112"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodPhotoStrip;
