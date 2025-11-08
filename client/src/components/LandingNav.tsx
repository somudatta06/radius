import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GeoPulse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
              About
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" data-testid="button-login">
              Login
            </Button>
            <Button size="sm" data-testid="button-get-started">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
