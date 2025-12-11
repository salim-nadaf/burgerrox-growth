import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-burger.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
      {/* Background Image - Critical LCP element */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img 
          src={heroImage} 
          alt="" 
          className="w-full h-full object-cover opacity-50"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-background/40"></div>
      </div>

      {/* Restaurant Guru Recommended Badge - Floating Position */}
      <aside className="absolute bottom-4 right-4 md:top-8 md:bottom-auto md:right-8 z-20" aria-label="Awards">
        <a 
          id="b-circledLeaves27" 
          target="_blank" 
          rel="noopener noreferrer"
          href="https://restaurant-guru.in/Burger-Rox-Pimpri-Chinchwad" 
          className="b-circledLeaves27--light b-circledLeaves27--2025 transform scale-50 sm:scale-75 md:scale-100"
          aria-label="Burger Rox recommended by Restaurant Guru 2025"
        >
          <span className="b-circledLeaves27__title">Recommended</span>
          <span className="b-circledLeaves27__separator"></span>
          <span className="b-circledLeaves27__name">Burger Rox</span>
        </a>
      </aside>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h1 id="hero-heading" className="font-bebas text-7xl md:text-9xl text-foreground leading-none tracking-wider">
              CRAVE-WORTHY BURGERS
            </h1>
            
            <p className="font-allura text-3xl md:text-4xl text-foreground mt-4" role="doc-subtitle">
              Rockin' homemade flavor
            </p>
            
            <p className="font-montserrat text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Maximum taste, minimum drama. We're all about serving up affordable, 
              delicious burgers that hit different. No fancy fluff – just real food 
              that gets it.
            </p>

            <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8" aria-label="Primary actions">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full sm:w-auto"
                onClick={() => window.open('https://wa.me/919970078688', '_blank')}
                aria-label="Order on WhatsApp"
              >
                Order Your Fix
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto" asChild>
                <a href="/menu" aria-label="View full menu">View Menu</a>
              </Button>
            </nav>

            <div className="flex items-center justify-center space-x-4 sm:space-x-8 mt-12 text-center" role="list" aria-label="Key features">
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="Starting from 79 rupees">₹79</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Affordable</div>
              </div>
              <div className="w-px h-12 bg-border" aria-hidden="true"></div>
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="30 minute delivery">30MIN</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Quick Delivery</div>
              </div>
              <div className="w-px h-12 bg-border" aria-hidden="true"></div>
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="4.6 star rating">4.6★</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Customer Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;