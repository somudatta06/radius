import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center">
              <Circle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">GeoPulse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-700 hover:text-black transition-colors" data-testid="link-features">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-700 hover:text-black transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <a href="#about" className="text-sm text-gray-700 hover:text-black transition-colors" data-testid="link-about">
              About
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#login" className="text-sm text-gray-700 hover:text-black transition-colors" data-testid="link-login">
              Login
            </a>
            <Button 
              size="sm" 
              className="bg-black hover:bg-gray-900 text-white rounded-lg px-6"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
