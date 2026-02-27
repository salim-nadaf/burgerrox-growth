import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";

// Lazy load below-the-fold components for better performance
const MenuHighlights = lazy(() => import("@/components/MenuHighlights"));
const About = lazy(() => import("@/components/About"));
const Contact = lazy(() => import("@/components/Contact"));
const WelcomeMessage = lazy(() => import("@/components/WelcomeMessage"));
const LoginIncentive = lazy(() => import("@/components/LoginIncentive"));

// Simple loading fallback
const SectionLoader = () => (
  <div className="py-12 flex justify-center" aria-busy="true" aria-label="Loading content">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status">
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
          <WelcomeMessage />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LoginIncentive />
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
