import chatgptLogo from '@assets/stock_images/chatgpt_logo_icon_op_c6fc6c95.jpg';
import claudeLogo from '@assets/stock_images/claude_ai_anthropic__ee2f35d0.jpg';
import geminiLogo from '@assets/stock_images/google_gemini_ai_log_cf368a3a.jpg';
import perplexityLogo from '@assets/stock_images/perplexity_ai_logo_i_6b0aab91.jpg';

export default function LogoRibbon() {
  const logos = [
    {
      name: 'ChatGPT',
      src: chatgptLogo,
    },
    {
      name: 'Claude',
      src: claudeLogo,
    },
    {
      name: 'Gemini',
      src: geminiLogo,
    },
    {
      name: 'Perplexity',
      src: perplexityLogo,
    },
  ];

  // Duplicate logos 3x for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full py-12 md:py-16 overflow-hidden bg-background relative" data-testid="section-logo-ribbon">
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Moving logo container */}
      <div className="flex animate-scroll-logos">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex-shrink-0 mx-8 md:mx-12 w-16 h-16 md:w-20 md:h-20 opacity-40 hover:opacity-60 transition-opacity duration-300 flex items-center justify-center"
            aria-label={logo.name}
            data-testid={`logo-${logo.name.toLowerCase()}-${index}`}
          >
            <img 
              src={logo.src} 
              alt={logo.name}
              className="w-full h-full object-contain grayscale"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
