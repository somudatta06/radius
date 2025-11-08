export default function LogoRibbon() {
  const logos = [
    {
      name: 'ChatGPT',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <circle cx="50" cy="50" r="40" strokeWidth="6" stroke="currentColor" fill="none"/>
          <circle cx="50" cy="50" r="12" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'Claude',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <rect x="15" y="15" width="70" height="70" rx="12" fill="none" stroke="currentColor" strokeWidth="6"/>
          <path d="M35 50 L50 35 L65 50 L50 65 Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'Gemini',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <path d="M50,15 L85,50 L50,85 L15,50 Z" fill="none" stroke="currentColor" strokeWidth="6"/>
          <circle cx="50" cy="50" r="8" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'Perplexity',
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <polygon points="50,20 80,80 20,80" fill="none" stroke="currentColor" strokeWidth="6"/>
          <circle cx="50" cy="60" r="8" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  // Duplicate logos 3x for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full py-12 md:py-16 overflow-hidden bg-background" data-testid="section-logo-ribbon">
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Moving logo container */}
        <div className="flex animate-scroll-logos">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 mx-8 md:mx-12 w-16 h-16 md:w-20 md:h-20 text-muted-foreground opacity-40 hover:opacity-60 transition-opacity duration-300"
              aria-label={logo.name}
              data-testid={`logo-${logo.name.toLowerCase()}-${index}`}
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
