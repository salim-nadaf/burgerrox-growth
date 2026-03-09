import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroMobile from "@/assets/hero-mobile.webp";
import heroDesktop from "@/assets/zinger-hero.webp";

const Hero = () => {
  return (
    <section className="relative min-h-[65vh] sm:min-h-[70vh] flex items-end overflow-hidden bg-foreground" aria-labelledby="hero-heading">
      {/* Background Image */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <picture>
          <source media="(max-width: 640px)" srcSet={heroMobile} type="image/webp" />
          <img 
            src={heroDesktop}
            alt="" 
            className="w-full h-full object-cover object-[center_40%] sm:object-center opacity-40"
            width="700"
            height="525"
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
      </div>

      <div className="container mx-auto px-4 z-10 pb-8 sm:pb-12 pt-20">
        <div className="max-w-xl space-y-4">
          {/* Price anchor */}
          <div className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full">
            <span className="font-montserrat text-xs sm:text-sm font-bold text-primary-foreground">
              Burgers from ₹89 · Free delivery within 3km
            </span>
          </div>

          <h1 id="hero-heading" className="font-bebas text-5xl sm:text-6xl md:text-8xl text-card leading-[0.9] tracking-wider">
            CRAVE-WORTHY<br />BURGERS
          </h1>
          
          <p className="font-montserrat text-sm sm:text-base text-card/80 max-w-sm">
            Fresh homemade burgers with our signature blaze sauce. Order now, get WhatsApp confirmation in minutes.
          </p>

          <p className="font-montserrat text-xs text-card/70">
            ⭐ Loved by burger fans in Mamurdi–Ravet
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button 
              variant="brand" 
              className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg font-montserrat font-bold"
              asChild
            >
              <Link to="/menu">Order Now</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto h-12 sm:h-14 px-6 text-sm font-montserrat text-card/70 hover:text-card hover:bg-card/10"
              asChild
            >
              <a href="https://wa.me/919321389985" target="_blank" rel="noopener noreferrer">
                📲 WhatsApp Order
              </a>
            </Button>
          </div>

          <p className="font-montserrat text-xs text-card/50 pt-1">
            🕖 Open daily 7 PM – 10 PM
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
