import { useState, useEffect } from 'react';

const MESSAGES = [
  'Generate GEO Report with Radius',
  "Analyse your website's visibility",
  'Optimize your AI presence',
];

export function NavbarTypingText() {
  const [displayText, setDisplayText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentMessage = MESSAGES[messageIndex];
    
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        if (displayText.length === currentMessage.length) {
          setIsDeleting(true);
        } else if (displayText.length === 0) {
          setIsDeleting(false);
        }
      }, 2000);
    } else if (!isDeleting && displayText.length < currentMessage.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentMessage.slice(0, displayText.length + 1));
      }, 100);
    } else if (!isDeleting && displayText.length === currentMessage.length) {
      setIsPaused(true);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, 50);
    } else if (isDeleting && displayText.length === 0) {
      timeout = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setIsDeleting(false);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [displayText, messageIndex, isDeleting, isPaused]);

  return (
    <div className="flex items-center justify-center" data-testid="navbar-typing-text">
      <span className="text-sm md:text-base font-medium text-black">
        {displayText}
        <span className="inline-block w-0.5 h-4 md:h-5 bg-black ml-1 animate-blink" data-testid="typing-cursor" />
      </span>
    </div>
  );
}
