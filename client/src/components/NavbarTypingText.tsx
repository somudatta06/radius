import { useState, useEffect } from 'react';

const MESSAGES = [
  'Generate GEO Report with Radius',
  "Analyse your website's visibility",
  'Optimize your AI presence',
];

export function NavbarTypingText() {
  const [displayText, setDisplayText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentMessage = MESSAGES[currentMessageIndex];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseAfterTyping = 2000;
    const pauseAfterDeleting = 300;

    let timeout: NodeJS.Timeout;

    if (isTyping && !isPaused) {
      if (displayText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentMessage.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsTyping(false);
        setIsPaused(true);
        timeout = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseAfterTyping);
      }
    } else if (isDeleting && !isPaused) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setIsPaused(true);
        timeout = setTimeout(() => {
          setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % MESSAGES.length);
          setIsPaused(false);
          setIsTyping(true);
        }, pauseAfterDeleting);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentMessageIndex, isTyping, isDeleting, isPaused]);

  return (
    <div className="flex items-center justify-center" data-testid="navbar-typing-text">
      <span className="text-sm md:text-base font-medium text-black">
        {displayText}
        <span className="inline-block w-0.5 h-4 md:h-5 bg-black ml-1 animate-blink" />
      </span>
    </div>
  );
}
