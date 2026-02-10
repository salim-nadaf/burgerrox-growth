import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div>
                  <h2 className="font-bebas text-4xl md:text-5xl text-foreground tracking-wider mb-2">
                    WHY ORDER DIRECT?
                  </h2>
                  <p className="font-allura text-2xl md:text-3xl text-primary">
                    Better prices, faster service
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-background rounded-lg border-2 border-primary/30 flex flex-col items-center">
                    <Banknote className="h-8 w-8 text-primary mb-3" />
                    <div className="font-bebas text-2xl text-primary mb-1">LOWER PRICES</div>
                    <div className="font-montserrat text-sm text-muted-foreground">
                      Direct ordering = no middleman fees. You save more.
                    </div>
                  </div>

                  <div className="p-6 bg-background rounded-lg border-2 border-primary/30 flex flex-col items-center">
                    <Truck className="h-8 w-8 text-primary mb-3" />
                    <div className="font-bebas text-2xl text-primary mb-1">FREE DELIVERY</div>
                    <div className="font-montserrat text-sm text-muted-foreground">
                      Within 3 km of our restaurant — no hidden charges.
                    </div>
                  </div>

                  <div className="p-6 bg-background rounded-lg border-2 border-primary/30 flex flex-col items-center">
                    <ShieldCheck className="h-8 w-8 text-primary mb-3" />
                    <div className="font-bebas text-2xl text-primary mb-1">TRACK ORDERS</div>
                    <div className="font-montserrat text-sm text-muted-foreground">
                      Sign up to save your address and view order history.
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="xl" className="px-8 py-4 text-lg">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoginIncentive;
