import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuPage from "@/components/MenuPage";
import FoodPhotoStrip from "@/components/FoodPhotoStrip";
import GoogleReviews from "@/components/GoogleReviews";
import { trackViewContent } from "@/utils/metaPixel";

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
        <MenuPage showAll={true} />
        <FoodPhotoStrip />
        <GoogleReviews />
      </main>
      <Footer />
    </div>
  );
};

export default Menu;