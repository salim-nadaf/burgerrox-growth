import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import burgerTrio from "@/assets/burger-trio.jpg";
import friesImage from "@/assets/fries.jpg";
import nuggetsImage from "@/assets/nuggets.jpg";
import chickenBurgerImage from "@/assets/chicken-burger.jpg";
import eggBurgerImage from "@/assets/egg-burger.jpg";
import veggieBurgerImage from "@/assets/veggie-burger.jpg";
import comboMealImage from "@/assets/combo-meal.jpg";
import cokeImage from "@/assets/coca-cola.jpg";
import lavaCakeImage from "@/assets/lava-cake.jpg";
import restaurantGuruCertificate from "@/assets/RestaurantGuru_Certificate1 (1).png";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "./AuthForm";

const FoodTypeIndicator = ({ type }: { type: 'veg' | 'nonveg' | 'egg' }) => {
  const colors = {
    veg: { border: 'border-green-600', fill: 'bg-green-600' },
    nonveg: { border: 'border-red-600', fill: 'bg-red-600' },
    egg: { border: 'border-amber-500', fill: 'bg-amber-500' },
  };
  const labels = { veg: 'Vegetarian', nonveg: 'Non-Vegetarian', egg: 'Contains Egg' };
  const { border, fill } = colors[type];
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 border-2 ${border} rounded-sm flex-shrink-0`} aria-label={labels[type]} title={labels[type]}>
      <span className={`w-2 h-2 rounded-full ${fill}`} />
    </span>
  );
};

const getItemImage = (name: string, category: string) => {
  if (name.includes("Fries") || name.includes("Wedges")) return friesImage;
  if (name.includes("Popcorn")) return nuggetsImage;
  if (name.includes("Lava Cake")) return lavaCakeImage;
  if (name.includes("Coke") || name.includes("drink")) return cokeImage;
  if (name.includes("Egg")) return eggBurgerImage;
  if (name.includes("Veg") || name.includes("Aloo")) return veggieBurgerImage;
  if (category === "Combos") return comboMealImage;
  return chickenBurgerImage;
};

interface AddOn {
  name: string;
  price: number;
}

const BURGER_ADDONS: AddOn[] = [
  { name: "Signature Sauce", price: 49 },
  { name: "Cheese Slice", price: 29 },
  { name: "Extra Lettuce & Onion", price: 19 },
];

interface MenuItem {
  name: string;
  description: string;
  price: number;
  popular: boolean;
  category: string;
  foodType: 'veg' | 'nonveg' | 'egg';
  section: string[];
  variants?: { size: string; price: number }[];
  hasAddons?: boolean;
  comboChoice?: boolean;
}

const allMenuItems: MenuItem[] = [
  // Burgers
  { name: "Blaze Chicken Burger", description: "Crispy chicken patty with fresh veggies and our rockin' homemade blaze sauce.", price: 129, popular: true, category: "Burgers", foodType: "nonveg", section: ["Most Popular", "All Burgers"], hasAddons: true },
  { name: "Blaze Veg Burger", description: "Golden veg patty, crunchy lettuce, and signature blaze sauce in a soft bun.", price: 149, popular: true, category: "Burgers", foodType: "veg", section: ["Most Popular", "All Burgers"], hasAddons: true },
  { name: "Aloo Rock Burger", description: "Classic aloo tikki with onions, lettuce, and our homemade signature sauce.", price: 99, popular: false, category: "Burgers", foodType: "veg", section: ["All Burgers"], hasAddons: true },
  { name: "Egg Blaze Smash", description: "Crispy aloo tikki topped with scrambled egg and loaded with blaze sauce.", price: 169, popular: false, category: "Burgers", foodType: "egg", section: ["All Burgers"], hasAddons: true },
  { name: "Double Blaze Chicken", description: "Two crispy chicken patties stacked with fresh veggies and double blaze flavor.", price: 199, popular: false, category: "Burgers", foodType: "nonveg", section: ["All Burgers"], hasAddons: true },
  { name: "Double Blaze Veg", description: "Double veg patties with crunchy lettuce and extra signature sauce.", price: 169, popular: false, category: "Burgers", foodType: "veg", section: ["All Burgers"], hasAddons: true },
  { name: "Burger Rox Zinger", description: "Our premium zinger-style chicken burger with bold spices and signature sauce.", price: 259, popular: true, category: "Burgers", foodType: "nonveg", section: ["All Burgers"], hasAddons: true },

  // Combos
  { name: "Blaze Combo", description: "Blaze Chicken Burger with fries and your choice of drink or lava cake.", price: 229, popular: true, category: "Combos", foodType: "nonveg", section: ["Combos"], comboChoice: true },
  { name: "Zinger Combo", description: "Burger Rox Zinger with fries and your choice of drink or lava cake.", price: 349, popular: true, category: "Combos", foodType: "nonveg", section: ["Combos"], comboChoice: true },

  // Sides
  { name: "Salted Fries", description: "Hot, crunchy and irresistibly delicious.", price: 79, popular: true, category: "Sides", foodType: "veg", section: ["Sides"], variants: [
    { size: "Small", price: 79 },
    { size: "Regular", price: 109 },
  ]},
  { name: "Peri Peri Fries", description: "Golden crisp fries tossed in a flavorful blend of herbs and spices.", price: 89, popular: true, category: "Sides", foodType: "veg", section: ["Sides"], variants: [
    { size: "Small", price: 89 },
    { size: "Regular", price: 119 },
  ]},
  { name: "Potato Wedges", description: "Crispy golden potato wedges seasoned to perfection.", price: 99, popular: false, category: "Sides", foodType: "veg", section: ["Sides"] },
  { name: "Chicken Popcorn", description: "Bite-sized crispy chicken pieces, perfect for sharing.", price: 119, popular: false, category: "Sides", foodType: "nonveg", section: ["Sides"] },
  { name: "Choco Lava Cake", description: "Rich, decadent cake oozing with warm, velvety chocolate center.", price: 79, popular: true, category: "Sides", foodType: "veg", section: ["Sides"] },
];

const MENU_SECTIONS = ["Most Popular", "Combos", "All Burgers", "Sides"];

interface MenuPageProps {
  showAll?: boolean;
}

const MenuPage = ({ showAll = false }: MenuPageProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingAddItem, setPendingAddItem] = useState<{ itemName: string; itemPrice: number } | null>(null);
  const prevUserRef = useRef(user);

  // Addon state per item
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  // Combo choice state per item
  const [comboChoices, setComboChoices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!prevUserRef.current && user && pendingAddItem) {
      addToCart(pendingAddItem.itemName, pendingAddItem.itemPrice);
      setPendingAddItem(null);
    }
    prevUserRef.current = user;
  }, [user, pendingAddItem, addToCart]);

  const toggleAddon = (itemName: string, addonName: string) => {
    setSelectedAddons(prev => {
      const current = prev[itemName] || [];
      if (current.includes(addonName)) {
        return { ...prev, [itemName]: current.filter(a => a !== addonName) };
      }
      return { ...prev, [itemName]: [...current, addonName] };
    });
  };

  const setComboChoice = (itemName: string, choice: string) => {
    setComboChoices(prev => ({ ...prev, [itemName]: choice }));
  };

  const getAddonTotal = (itemName: string) => {
    const addons = selectedAddons[itemName] || [];
    return addons.reduce((sum, name) => {
      const addon = BURGER_ADDONS.find(a => a.name === name);
      return sum + (addon?.price || 0);
    }, 0);
  };

  const handleAddToCart = async (item: MenuItem, variantSize?: string, variantPrice?: number) => {
    let finalName = item.name;
    let finalPrice = variantPrice ?? item.price;

    // Append combo choice
    if (item.comboChoice) {
      const choice = comboChoices[item.name] || "Soft Drink";
      finalName = `${item.name} (with ${choice})`;
    }

    // Append variant
    if (variantSize) {
      finalName = `${item.name} (${variantSize})`;
    }

    // Handle add-ons for burgers
    if (item.hasAddons) {
      const addons = selectedAddons[item.name] || [];
      if (addons.length > 0) {
        finalName = `${finalName} + ${addons.join(', ')}`;
        finalPrice += getAddonTotal(item.name);
      }
    }

    if (!user) {
      setPendingAddItem({ itemName: finalName, itemPrice: finalPrice });
      setAuthDialogOpen(true);
      return;
    }
    await addToCart(finalName, finalPrice);
    // Reset addons/combo choice for this item after adding
    setSelectedAddons(prev => ({ ...prev, [item.name]: [] }));
  };

  const handleAuthClose = () => {
    setAuthDialogOpen(false);
  };

  // For homepage preview, show Most Popular + Combos only
  const sectionsToShow = showAll ? MENU_SECTIONS : ["Most Popular", "Combos"];

  const getItemsForSection = (section: string) => {
    return allMenuItems.filter(item => item.section.includes(section));
  };

  const renderItemCard = (item: MenuItem) => {
    const addons = selectedAddons[item.name] || [];
    const addonTotal = getAddonTotal(item.name);
    const comboChoice = comboChoices[item.name] || "Soft Drink";

    return (
      <article key={item.name} role="listitem">
        <Card className="border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-brand h-full">
          <CardContent className="p-4">
            <div className="flex gap-3 mb-4">
              <img
                src={getItemImage(item.name, item.category)}
                alt={`${item.name} - ${item.description}`}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <FoodTypeIndicator type={item.foodType} />
                        <h3 className="font-bebas text-lg sm:text-xl text-foreground tracking-wide leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      {item.popular && (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs mt-1" aria-label="Popular item">
                          POPULAR
                        </Badge>
                      )}
                    </div>
                    {!item.variants && (
                      <span className="font-bebas text-lg sm:text-xl text-primary flex-shrink-0" aria-label={`Price ${item.price} rupees`}>
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="font-montserrat text-sm text-muted-foreground leading-relaxed mb-4">
              {item.description}
            </p>

            {/* Combo choice */}
            {item.comboChoice && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                <p className="font-montserrat text-xs font-medium text-foreground mb-2">Choose one:</p>
                <RadioGroup value={comboChoice} onValueChange={(v) => setComboChoice(item.name, v)} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Soft Drink" id={`${item.name}-drink`} />
                    <Label htmlFor={`${item.name}-drink`} className="text-sm font-montserrat">Soft Drink</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Choco Lava Cake" id={`${item.name}-cake`} />
                    <Label htmlFor={`${item.name}-cake`} className="text-sm font-montserrat">Choco Lava Cake</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Add-ons for burgers */}
            {item.hasAddons && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                <p className="font-montserrat text-xs font-medium text-foreground mb-2">Add-ons:</p>
                <div className="space-y-1.5">
                  {BURGER_ADDONS.map(addon => (
                    <div key={addon.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${item.name}-${addon.name}`}
                          checked={addons.includes(addon.name)}
                          onCheckedChange={() => toggleAddon(item.name, addon.name)}
                        />
                        <Label htmlFor={`${item.name}-${addon.name}`} className="text-sm font-montserrat">{addon.name}</Label>
                      </div>
                      <span className="font-bebas text-sm text-primary">+₹{addon.price}</span>
                    </div>
                  ))}
                </div>
                {addonTotal > 0 && (
                  <p className="font-montserrat text-xs text-primary mt-2">Add-ons total: +₹{addonTotal}</p>
                )}
              </div>
            )}

            {/* Variants */}
            {item.variants ? (
              <div className="space-y-2" role="group" aria-label={`${item.name} size options`}>
                {item.variants.map((variant, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border rounded-lg">
                    <span className="font-montserrat text-sm text-foreground">{variant.size}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bebas text-base text-primary" aria-label={`${variant.size} price ${variant.price} rupees`}>₹{variant.price}</span>
                      <Button
                        onClick={() => handleAddToCart(item, variant.size, variant.price)}
                        size="sm"
                        className="text-xs px-2 py-1"
                        aria-label={`Add ${item.name} ${variant.size} to cart`}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Button
                onClick={() => handleAddToCart(item)}
                className="w-full"
                size="sm"
                aria-label={`Add ${item.name} to cart for ${item.price + addonTotal} rupees`}
              >
                Add to Cart{addonTotal > 0 ? ` — ₹${item.price + addonTotal}` : ''}
              </Button>
            )}
          </CardContent>
        </Card>
      </article>
    );
  };

  return (
    <section id="menu" className="py-12 sm:py-20 bg-secondary/30" aria-labelledby="menu-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12 sm:mb-16">
          <h2 id="menu-heading" className="font-bebas text-5xl sm:text-6xl md:text-7xl text-foreground tracking-wider mb-4">
            {showAll ? 'FULL MENU' : 'MENU FAVORITES'}
          </h2>
          <p className="font-allura text-2xl md:text-3xl text-primary mb-6" role="doc-subtitle">
            Rockin' homemade flavor
          </p>
          <p className="font-montserrat text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We keep it simple with burgers that actually slap. No weird ingredients, 
            no pretentious names – just good food that won't break your budget.
          </p>
        </header>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {sectionsToShow.map(section => {
                const items = getItemsForSection(section);
                if (items.length === 0) return null;
                return (
                  <div key={section} className="mb-10">
                    <h3 className="font-bebas text-2xl sm:text-3xl text-foreground tracking-wider mb-4 border-b-2 border-primary/30 pb-2">
                      {section}
                    </h3>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`${section} items`}>
                      {items.map(item => renderItemCard(item))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side Certificate Section - Only on full menu page */}
            {showAll && (
              <aside className="lg:w-64 xl:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <p className="font-bebas text-lg text-foreground mb-3 tracking-wide">CERTIFIED QUALITY</p>
                      <a
                        href="https://restaurant-guru.in/Burger-Rox-Pimpri-Chinchwad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:opacity-90 transition-opacity"
                        aria-label="View our Restaurant Guru certification"
                      >
                        <img
                          src={restaurantGuruCertificate}
                          alt="Restaurant Guru Certificate - Burger Rox Recommended 2025"
                          className="w-full max-w-[200px] mx-auto rounded-lg shadow-md"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                      <p className="font-montserrat text-xs text-muted-foreground mt-3">
                        Recommended by Restaurant Guru
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            )}
          </div>

          <nav className="pt-6 sm:pt-8 space-y-4 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-4 justify-center items-center" aria-label="Menu actions">
            {!showAll && (
              <Link to="/menu">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  aria-label="View complete menu"
                >
                  View Full Menu
                </Button>
              </Link>
            )}
            <Button
              variant="brand"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://wa.me/919321389985', '_blank')}
              aria-label="Order via WhatsApp"
            >
              Order on WhatsApp
            </Button>
          </nav>
        </div>
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">Login or create an account to add items to cart</DialogDescription>
          <AuthForm onClose={handleAuthClose} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MenuPage;
