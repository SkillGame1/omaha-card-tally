import { Card, SUIT_SYMBOLS } from '@/lib/poker/types';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: Card | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-14',
  md: 'w-12 h-17',
  lg: 'w-14 h-20',
};

const fontSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

// Text colors based on suit
const suitTextColors = {
  h: 'text-rose-500',    // Hearts - red/pink
  d: 'text-blue-500',    // Diamonds - blue
  c: 'text-emerald-500', // Clubs - green
  s: 'text-slate-700',   // Spades - dark
};

export function PlayingCard({ 
  card, 
  size = 'md', 
  onClick, 
  selected = false,
  disabled = false,
  className 
}: PlayingCardProps) {
  if (!card) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20',
          'flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        <span className="text-muted-foreground/40 text-lg">?</span>
      </div>
    );
  }

  const symbol = SUIT_SYMBOLS[card.suit];
  const textColor = suitTextColors[card.suit];

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-lg shadow-md bg-white border border-slate-200',
        'flex flex-col items-start justify-start p-1.5 cursor-pointer',
        'transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-lg',
        textColor,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <span className={cn('font-bold leading-none', fontSizes[size])}>{card.rank}</span>
      <span className={cn('leading-none mt-0.5', fontSizes[size])}>{symbol}</span>
    </div>
  );
}