import { Button } from "@/components/ui/button";
import zingerHero from "@/assets/Zinger hero.webp";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden max-w-full bg-background" aria-labelledby="hero-heading">
      {/* Background Image */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img 
          src={zingerHero}
          alt="" 
          className="w-full h-full object-cover object-center"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsla(45, 100%, 55%, 0.55), hsla(45, 100%, 55%, 0.75))' }}></div>
      </div>


      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 id="hero-heading" className="font-bebas text-6xl sm:text-7xl md:text-9xl text-foreground leading-none tracking-wider font-bold" style={{ textShadow: '0 2px 8px rgba(255,217,57,0.3)' }}>
            CRAVE-WORTHY BURGERS
          </h1>
          
          <p className="font-allura text-3xl md:text-5xl text-primary font-bold" role="doc-subtitle" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
            Rockin' homemade flavor
          </p>

          <p className="font-montserrat text-sm md:text-base text-foreground font-semibold max-w-[420px] mx-auto" style={{ textShadow: '0 1px 4px rgba(255,217,57,0.5)' }}>
            Freshly made burgers with our homemade signature sauce.
          </p>

          <p className="font-montserrat text-xs md:text-sm text-foreground/90 font-medium mt-2.5 bg-foreground/10 inline-block px-4 py-1 rounded-full">
            🔥 1000+ burgers served to students and families
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

          <p className="font-montserrat text-xs md:text-sm text-foreground font-semibold mt-3">
            🕖 Open daily from 7 PM to 10 PM
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
