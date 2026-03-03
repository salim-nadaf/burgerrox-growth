import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
// Specific menu item images
import blazeChickenImg from "@/assets/Blaze Chicken Burger.jpg";
import blazeVegImg from "@/assets/Blaze Veg Burger.jpg";
import alooRockImg from "@/assets/Aloo Rock Burger.jpg";
import eggBurgerImage from "@/assets/egg-burger.jpg";
import doubleChickenImg from "@/assets/double-blaze-chicken-sm.webp";
import doubleVegImg from "@/assets/Double Blaze Veg.jpg";
import zingerImg from "@/assets/Burger Rox Zinger.jpg";
import blazeComboImg from "@/assets/blaze-combo-sm.webp";
import zingerComboImg from "@/assets/zinger-combo-sm.webp";
import saltedFriesImg from "@/assets/Salted Fries.jpg";
import periPeriFriesImg from "@/assets/Peri Peri Fries.jpg";
import potatoWedgesImg from "@/assets/potato-wedges-menu.webp";
import chickenPopcornImg from "@/assets/chicken-popcorn-sm.webp";
import lavaCakeImage from "@/assets/lava-cake.jpg";
import chickenBurgerImage from "@/assets/chicken-burger.jpg";
import { useCart } from "@/hooks/useCart";

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

const ITEM_IMAGE_MAP: Record<string, string> = {
  "Blaze Chicken Burger": blazeChickenImg,
  "Blaze Veg Burger": blazeVegImg,
  "Aloo Rock Burger": alooRockImg,
  "Egg Blaze Smash": eggBurgerImage,
  "Double Blaze Chicken": doubleChickenImg,
  "Double Blaze Veg": doubleVegImg,
  "Burger Rox Zinger": zingerImg,
  "Blaze Combo": blazeComboImg,
  "Zinger Combo": zingerComboImg,
  "Salted Fries": saltedFriesImg,
  "Peri Peri Fries": periPeriFriesImg,
  "Potato Wedges": potatoWedgesImg,
  "Chicken Popcorn": chickenPopcornImg,
  "Choco Lava Cake": lavaCakeImage,
};

const getItemImage = (name: string) => ITEM_IMAGE_MAP[name] || chickenBurgerImage;

interface AddOn { name: string; price: number; }

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
  customTag?: string;
}

const allMenuItems: MenuItem[] = [
  { name: "Blaze Chicken Burger", description: "Crispy chicken patty with fresh veggies and our rockin' homemade blaze sauce.", price: 129, popular: true, category: "Burgers", foodType: "nonveg", section: ["Most Popular", "All Burgers"], hasAddons: true, customTag: "Most Ordered" },
  { name: "Blaze Veg Burger", description: "Golden veg patty, crunchy lettuce, and signature blaze sauce in a soft bun.", price: 89, popular: true, category: "Burgers", foodType: "veg", section: ["Most Popular", "All Burgers"], hasAddons: true, customTag: "Student Favorite" },
  { name: "Aloo Rock Burger", description: "Classic aloo tikki with onions, lettuce, and our homemade signature sauce.", price: 99, popular: false, category: "Burgers", foodType: "veg", section: ["All Burgers"], hasAddons: true },
  { name: "Egg Blaze Smash", description: "Crispy aloo tikki topped with scrambled egg and loaded with blaze sauce.", price: 169, popular: false, category: "Burgers", foodType: "egg", section: ["All Burgers"], hasAddons: true },
  { name: "Double Blaze Chicken", description: "Two crispy chicken patties stacked with fresh veggies and double blaze flavor.", price: 199, popular: false, category: "Burgers", foodType: "nonveg", section: ["All Burgers"], hasAddons: true },
  { name: "Double Blaze Veg", description: "Double veg patties with crunchy lettuce and extra signature sauce.", price: 149, popular: false, category: "Burgers", foodType: "veg", section: ["All Burgers"], hasAddons: true },
  { name: "Burger Rox Zinger", description: "Our premium zinger-style chicken burger with bold spices and signature sauce.", price: 259, popular: true, category: "Burgers", foodType: "nonveg", section: ["All Burgers"], hasAddons: true, customTag: "Premium Pick" },
  { name: "Blaze Combo", description: "Blaze Chicken Burger with fries and your choice of drink or lava cake.", price: 229, popular: true, category: "Combos", foodType: "nonveg", section: ["Combos"], comboChoice: true },
  { name: "Zinger Combo", description: "Burger Rox Zinger with fries and your choice of drink or lava cake.", price: 349, popular: true, category: "Combos", foodType: "nonveg", section: ["Combos"], comboChoice: true },
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
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [comboChoices, setComboChoices] = useState<Record<string, string>>({});

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

    if (item.comboChoice) {
      const choice = comboChoices[item.name] || "Soft Drink";
      finalName = `${item.name} (with ${choice})`;
    }

    if (variantSize) {
      finalName = `${item.name} (${variantSize})`;
    }

    if (item.hasAddons) {
      const addons = selectedAddons[item.name] || [];
      if (addons.length > 0) {
        finalName = `${finalName} + ${addons.join(', ')}`;
        finalPrice += getAddonTotal(item.name);
      }
    }

    await addToCart(finalName, finalPrice);
    setSelectedAddons(prev => ({ ...prev, [item.name]: [] }));
  };

  const sectionsToShow = showAll ? MENU_SECTIONS : ["Most Popular", "Combos"];

  const getItemsForSection = (section: string) => {
    return allMenuItems.filter(item => item.section.includes(section));
  };

  const renderItemCard = (item: MenuItem) => {
    const addons = selectedAddons[item.name] || [];
    const addonTotal = getAddonTotal(item.name);
    const comboChoice = comboChoices[item.name] || "Soft Drink";

    return (
      <article key={item.name} className="bg-card rounded-lg border border-border/40 p-3 hover:border-primary/50 transition-colors" role="listitem">
        <div className="flex gap-3">
          <img
            src={getItemImage(item.name)}
            alt={item.name}
            className="w-[72px] h-[72px] rounded-lg object-cover flex-shrink-0"
            width="72" height="72" loading="lazy" decoding="async"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <FoodTypeIndicator type={item.foodType} />
                  <h3 className="font-bebas text-base sm:text-lg text-foreground tracking-wide leading-tight truncate">
                    {item.name}
                  </h3>
                </div>
                {item.customTag && (
                  <Badge variant="default" className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 mt-0.5">
                    {item.customTag.toUpperCase()}
                  </Badge>
                )}
              </div>
              {!item.variants && (
                <span className="font-bebas text-lg text-primary flex-shrink-0">₹{item.price}</span>
              )}
            </div>
            <p className="font-montserrat text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        {/* Combo choice */}
        {item.comboChoice && (
          <div className="mt-3 p-2.5 border border-border/30 rounded-md bg-muted/10">
            <p className="font-montserrat text-[11px] font-medium text-foreground mb-1.5">Choose one:</p>
            <RadioGroup value={comboChoice} onValueChange={(v) => setComboChoice(item.name, v)} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Soft Drink" id={`${item.name}-drink`} />
                <Label htmlFor={`${item.name}-drink`} className="text-xs font-montserrat">Soft Drink</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Choco Lava Cake" id={`${item.name}-cake`} />
                <Label htmlFor={`${item.name}-cake`} className="text-xs font-montserrat">Choco Lava Cake</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Add-ons */}
        {item.hasAddons && (
          <div className="mt-3 p-2.5 border border-border/30 rounded-md bg-muted/10">
            <p className="font-montserrat text-[11px] font-medium text-foreground mb-1.5">Add-ons:</p>
            <div className="space-y-1">
              {BURGER_ADDONS.map(addon => (
                <div key={addon.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${item.name}-${addon.name}`}
                      checked={addons.includes(addon.name)}
                      onCheckedChange={() => toggleAddon(item.name, addon.name)}
                    />
                    <Label htmlFor={`${item.name}-${addon.name}`} className="text-xs font-montserrat">{addon.name}</Label>
                  </div>
                  <span className="font-bebas text-xs text-primary">+₹{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants or Add button */}
        <div className="mt-3">
          {item.variants ? (
            <div className="space-y-1.5">
              {item.variants.map((variant, i) => (
                <div key={i} className="flex justify-between items-center p-2 border border-border/30 rounded-md">
                  <span className="font-montserrat text-xs text-foreground">{variant.size}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-sm text-primary">₹{variant.price}</span>
                    <Button onClick={() => handleAddToCart(item, variant.size, variant.price)} size="sm" className="text-xs px-3 h-7">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Button
              onClick={() => handleAddToCart(item)}
              className="w-full h-9"
              size="sm"
              aria-label={`Add ${item.name} to cart`}
            >
              {addonTotal > 0 ? `Add to Cart — ₹${item.price + addonTotal}` : 'Add to Cart'}
            </Button>
          )}
        </div>
      </article>
    );
  };

  return (
    <section id="menu" className="py-8 sm:py-12 bg-secondary/20" aria-labelledby="menu-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h2 id="menu-heading" className="font-bebas text-4xl sm:text-5xl md:text-6xl text-foreground tracking-wider mb-1">
            {showAll ? 'FULL MENU' : 'MENU FAVORITES'}
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto mb-2" aria-hidden="true" />
          <p className="font-montserrat text-sm text-muted-foreground max-w-lg mx-auto">
            Fresh burgers that actually slap. No gimmicks — just good food that won't break your budget.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {sectionsToShow.map(section => {
            const items = getItemsForSection(section);
            if (items.length === 0) return null;
            return (
              <div key={section} className="mb-8">
                <h3 className="font-bebas text-xl sm:text-2xl text-foreground tracking-wider mb-3 border-b border-primary/30 pb-1.5">
                  {section}
                </h3>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2" role="list" aria-label={`${section} items`}>
                  {items.map(item => renderItemCard(item))}
                </div>
              </div>
            );
          })}

          {/* Delivery info on menu page */}
          {showAll && (
            <div className="mt-6 p-4 bg-card rounded-lg border border-border/40 text-center">
              <p className="font-montserrat text-sm text-foreground font-medium mb-1">
                📍 We deliver to Mamurdi, Kiwale, Ravet & Punawale
              </p>
              <p className="font-montserrat text-xs text-muted-foreground mb-3">
                Free within 3km · Max 12km radius · ₹149 minimum for delivery
              </p>
              <Link to="/delivery-area">
                <Button variant="outline" size="sm" className="text-xs">
                  Check Delivery Area & Charges
                </Button>
              </Link>
            </div>
          )}

          <nav className="pt-6 flex flex-col sm:flex-row gap-3 justify-center items-center" aria-label="Menu actions">
            {!showAll && (
              <Link to="/menu">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Full Menu
                </Button>
              </Link>
            )}
            <Button
              variant="brand"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://wa.me/919321389985', '_blank')}
            >
              📲 Order on WhatsApp
            </Button>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default MenuPage;
