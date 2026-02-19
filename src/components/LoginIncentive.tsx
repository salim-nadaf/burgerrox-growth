import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import AuthForm from "./AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, Truck, Banknote } from "lucide-react";

const LoginIncentive = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();

  if (user) return null;

  return (
    <section className="py-16 bg-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-5xl md:text-6xl text-background tracking-wider mb-2">
            WHY ORDER DIRECT?
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-3" aria-hidden="true" />
          <p className="font-allura text-2xl md:text-3xl text-primary mb-10">
            Better prices, faster service
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-xl bg-card text-center" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                <Banknote className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="font-bebas text-2xl text-foreground mb-1">LOWER PRICES</div>
              <div className="font-montserrat text-sm text-muted-foreground">
                Direct ordering = no middleman fees. You save more.
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card text-center" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                <Truck className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="font-bebas text-2xl text-foreground mb-1">FREE DELIVERY</div>
              <div className="font-montserrat text-sm text-muted-foreground">
                Within 3 km — no hidden charges.
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card text-center" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                <ShieldCheck className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="font-bebas text-2xl text-foreground mb-1">TRACK ORDERS</div>
              <div className="font-montserrat text-sm text-muted-foreground">
                Save your address and view order history.
              </div>
            </div>
          </div>

          <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="h-12 sm:h-[52px] px-8 text-base md:text-lg">
                Create Free Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogTitle className="sr-only">Authentication</DialogTitle>
              <DialogDescription className="sr-only">Login or create an account</DialogDescription>
              <AuthForm onClose={() => setAuthDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default LoginIncentive;
