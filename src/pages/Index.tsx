import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";

// Lazy load ALL below-the-fold components
const FoodPhotoStrip = lazy(() => import("@/components/FoodPhotoStrip"));
const GoogleReviews = lazy(() => import("@/components/GoogleReviews"));
const MenuHighlights = lazy(() => import("@/components/MenuHighlights"));
const About = lazy(() => import("@/components/About"));
const Contact = lazy(() => import("@/components/Contact"));
const WelcomeMessage = lazy(() => import("@/components/WelcomeMessage"));

const SectionLoader = () => (
  <div className="py-8 flex justify-center" aria-busy="true">
    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">
        <Hero />
        <TrustStrip />
        <Suspense fallback={<SectionLoader />}>
          <GoogleReviews />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FoodPhotoStrip />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WelcomeMessage />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MenuHighlights />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;