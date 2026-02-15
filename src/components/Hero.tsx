import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import heroImage from "@/assets/hero-burger.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
      {/* Background Image - Critical LCP element */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img 
          src={heroImage} 
          alt="" 
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent"></div>
      </div>

      {/* Restaurant Guru Recommended Badge - Top Right Position */}
      <aside className="absolute top-4 right-2 sm:right-4 md:top-8 md:right-8 z-20" aria-label="Awards">
        <div className="bg-white rounded-full p-2 shadow-lg shadow-black/20">
          <a 
            id="b-circledLeaves27" 
            target="_blank" 
            rel="noopener noreferrer"
            href="https://restaurant-guru.in/Burger-Rox-Pimpri-Chinchwad" 
            className="b-circledLeaves27--light b-circledLeaves27--2025 transform scale-[0.45] sm:scale-[0.55] md:scale-[0.85] lg:scale-110 origin-top-right"
            aria-label="Burger Rox recommended by Restaurant Guru 2025"
          >
            <span className="b-circledLeaves27__title">Recommended</span>
            <span className="b-circledLeaves27__separator"></span>
            <span className="b-circledLeaves27__name">Burger Rox</span>
          </a>
        </div>
      </aside>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h1 id="hero-heading" className="font-bebas text-7xl md:text-9xl text-white leading-none tracking-wider font-bold drop-shadow-lg">
              CRAVE-WORTHY BURGERS
            </h1>
            
            <p className="font-allura text-3xl md:text-4xl text-white mt-4 drop-shadow-md" role="doc-subtitle">
              Rockin' homemade flavor
            </p>

            <p className="font-montserrat text-sm md:text-base text-white/80 mt-2">
              Burgers made with our homemade signature sauce.
            </p>

            <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8" aria-label="Primary actions">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/menu'}
                aria-label="Order from menu"
              >
                Order Your Fix
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto" asChild>
                <a href="/menu" aria-label="View full menu">View Menu</a>
              </Button>
            </nav>

            <div className="flex items-center justify-center space-x-4 sm:space-x-8 mt-12 text-center" role="list" aria-label="Key features">
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="Starting from 89 rupees">₹89</div>
                <div className="text-xs sm:text-sm text-white/70">Affordable</div>
              </div>
              <div className="w-px h-12 bg-white/30" aria-hidden="true"></div>
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="30 minute delivery">30MIN</div>
                <div className="text-xs sm:text-sm text-white/70">Quick Delivery</div>
              </div>
              <div className="w-px h-12 bg-white/30" aria-hidden="true"></div>
              <div className="font-montserrat" role="listitem">
                <div className="font-bebas text-2xl sm:text-3xl text-primary" aria-label="4.6 star rating">4.6★</div>
              <div className="text-xs sm:text-sm text-white/70">Customer Rated</div>
              </div>
            </div>

            <p className="font-montserrat text-xs text-white/60 mt-4 italic">
              Fresh batches. Homemade sauce. Evening only.
            </p>

            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 w-fit mx-auto">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-montserrat text-sm text-white font-medium">
                Orders open daily from 7 PM to 10 PM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;