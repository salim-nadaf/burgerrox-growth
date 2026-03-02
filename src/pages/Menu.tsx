import { useEffect, lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustStrip from "@/components/TrustStrip";
import { trackViewContent } from "@/utils/metaPixel";

// Lazy load heavy components on menu page too
const GoogleReviews = lazy(() => import("@/components/GoogleReviews"));
const FoodPhotoStrip = lazy(() => import("@/components/FoodPhotoStrip"));
const MenuPage = lazy(() => import("@/components/MenuPage"));

const SectionLoader = () => (
  <div className="py-8 flex justify-center" aria-busy="true">
    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

const Menu = () => {
  useEffect(() => {
    document.title = "Menu - Burger Rox | Burgers, Fries & Combos from ₹79";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Browse Burger Rox full menu. Chicken burgers, veggie options, crispy fries, combos & desserts. Prices start at ₹79. Order on WhatsApp for 30-min delivery in Pune.");
    }
    trackViewContent("Full Menu");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">
        <TrustStrip />
        <Suspense fallback={<SectionLoader />}>
          <GoogleReviews />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FoodPhotoStrip />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MenuPage showAll={true} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Menu;