import { ReactNode } from 'react';

interface AccentProps {
  children: ReactNode;
  italic?: boolean;
  className?: string;
}

/**
 * Wraps text in the blue accent color. Optionally italic.
 * Use for emphasized words in headlines and body copy.
 */
export function Accent({ children, italic = false, className = '' }: AccentProps) {
  return (
    <span
      className={`text-accent ${italic ? 'italic' : ''} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
