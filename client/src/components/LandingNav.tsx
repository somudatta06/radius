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
            <span className="text-xl font-semibold text-black">GEOOptimize</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-black transition-colors" data-testid="link-features">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-black transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <a href="#resources" className="text-sm font-medium text-gray-600 hover:text-black transition-colors" data-testid="link-resources">
              Resources
            </a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-black transition-colors" data-testid="link-about">
              About
            </a>
          </div>
          
          <div className="flex items-center">
            <Button 
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-6" 
              data-testid="button-start-trial"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
