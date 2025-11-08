import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="relative w-full bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        
        <div className="text-center mb-20">
          <h2 className="text-[80px] md:text-[120px] lg:text-[180px] xl:text-[220px] font-black text-foreground leading-none tracking-tight" data-testid="footer-hero-text">
            Radius
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mt-6 max-w-2xl mx-auto">
            Dominate AI search. Maximize visibility.
            <br />
            Start your GEO journey today.
          </p>
        </div>

        <div className="text-center mb-20">
          <Button 
            size="lg"
            className="text-xl px-10 py-6 h-auto"
            data-testid="button-footer-cta"
          >
            Get Started for Free →
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 30-second analysis • Free forever
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#integrations" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#blog" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#guides" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  GEO Guides
                </a>
              </li>
              <li>
                <a href="#case-studies" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#documentation" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#press" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#security" className="text-base text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 mb-12">
          <a
            href="https://twitter.com/radius"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border hover-elevate active-elevate-2 transition-all"
            aria-label="Twitter"
            data-testid="link-social-twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/company/radius"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border hover-elevate active-elevate-2 transition-all"
            aria-label="LinkedIn"
            data-testid="link-social-linkedin"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/radius"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border hover-elevate active-elevate-2 transition-all"
            aria-label="GitHub"
            data-testid="link-social-github"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
              <span className="text-background text-sm font-bold">R</span>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2025 Radius. All rights reserved.
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Built for the AI-native era
          </div>
        </div>
      </div>
    </footer>
  );
};
