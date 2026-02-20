import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden max-w-full" aria-labelledby="hero-heading">
      {/* Background Image */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <picture>
          <source
            type="image/webp"
            srcSet="/hero-burger-mobile.webp 768w, /hero-burger.webp 1920w"
            sizes="100vw"
          />
          <img 
            src="/hero-burger.jpg"
            alt="" 
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.6))' }}></div>
      </div>


      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 id="hero-heading" className="font-bebas text-6xl sm:text-7xl md:text-9xl text-primary-foreground leading-none tracking-wider font-bold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            CRAVE-WORTHY BURGERS
          </h1>
          
          <p className="font-allura text-3xl md:text-5xl text-primary drop-shadow-md" role="doc-subtitle">
            Rockin' homemade flavor
          </p>

          <p className="font-montserrat text-sm md:text-base text-primary-foreground/90 max-w-[420px] mx-auto drop-shadow-md">
            Freshly made burgers with our homemade signature sauce.
          </p>

          <p className="font-montserrat text-xs text-primary-foreground/70 mt-2.5">
            1000+ burgers served to students and families
          </p>

          <div className="pt-4 flex justify-center">
            <Button 
              variant="hero" 
              className="w-full max-w-[260px] sm:w-auto sm:max-w-none h-12 sm:h-[52px] px-7 text-[15px] sm:text-base md:text-lg"
              onClick={() => window.location.href = '/menu'}
              aria-label="View full menu"
            >
              View Menu
            </Button>
          </div>

          <p className="font-montserrat text-xs md:text-sm text-primary-foreground/80 mt-3">
            Open daily from 7 PM to 10 PM
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
