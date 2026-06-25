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
            className="w-full h-full object-cover object-[center_40%] sm:object-center"
            width="700"
            height="525"
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        {/* Brand-yellow overlay for stronger background presence (image less prominent) */}
        <div className="absolute inset-0 bg-background/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      <div className="container mx-auto px-4 z-10 pb-8 sm:pb-12 pt-20">
        <div className="max-w-xl space-y-5 bg-foreground/45 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
          {/* Price anchor */}
          <div className="inline-flex items-center gap-2 bg-primary px-3.5 py-1.5 rounded-full shadow-brand">
            <span className="font-montserrat text-xs sm:text-sm font-bold text-primary-foreground">
              Burgers from ₹89 · Free delivery within 3km
            </span>
          </div>

          <h1 id="hero-heading" className="font-bebas text-5xl sm:text-6xl md:text-7xl text-card leading-[0.95] tracking-wider">
            BURGER ROX<br />CRAVE-WORTHY BURGERS<br /><span className="text-2xl sm:text-3xl md:text-4xl text-secondary">IN MAMURDI - RAVET</span>
          </h1>
          
          <p className="font-montserrat text-sm sm:text-base text-card/85 max-w-sm leading-relaxed">
            Fresh homemade patties with our signature blaze sauce. Flame-grilled daily. WhatsApp confirmation in minutes.
          </p>

          <p className="font-montserrat text-xs text-card/70 flex items-center gap-1.5">
            <span className="text-secondary">★</span> Loved by burger fans in Mamurdi–Ravet
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button 
              variant="brand" 
              className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg font-montserrat font-bold hover:scale-[1.02] transition-transform shadow-brand"
              asChild
            >
              <Link to="/menu">Order Now</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto h-12 sm:h-14 px-6 text-sm font-montserrat text-card/85 hover:text-card hover:bg-card/10 border border-white/20"
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
