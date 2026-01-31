import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import AuthForm from "./AuthForm";
import { useAuth } from "@/hooks/useAuth";

const LoginIncentive = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();

  if (user) return null; // Don't show if user is already logged in

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div>
                  <h2 className="font-bebas text-4xl md:text-5xl text-foreground tracking-wider mb-2">
                    SPECIAL OFFERS AWAIT!
                  </h2>
                  <p className="font-allura text-2xl md:text-3xl text-primary">
                    Just for you
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-background rounded-lg border-2 border-primary/30">
                    <div className="text-center">
                      <div className="font-bebas text-3xl text-primary mb-2">10% OFF</div>
                      <div className="font-montserrat text-lg text-foreground mb-2">First Order Discount</div>
                      <div className="font-montserrat text-sm text-muted-foreground">
                        Sign up now and get 10% off your first order!
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-background rounded-lg border-2 border-primary/30">
                    <div className="text-center">
                      <div className="font-bebas text-3xl text-primary mb-2">EXTRA 5% OFF</div>
                      <div className="font-montserrat text-lg text-foreground mb-2">Student Special</div>
                      <div className="font-montserrat text-sm text-muted-foreground">
                        Show your Symbiosis University ID for additional 5% off!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="xl" className="px-8 py-4 text-lg">
                        Claim Your Discount Now!
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogTitle className="sr-only">Authentication</DialogTitle>
                      <DialogDescription className="sr-only">Login or create an account to claim your discount</DialogDescription>
                      <AuthForm onClose={() => setAuthDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="text-center">
                  <p className="font-montserrat text-sm text-muted-foreground">
                    * Student discount applicable with valid Symbiosis University ID card
                  </p>
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