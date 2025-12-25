import { Card, SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/poker/types';
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
  sm: 'w-8 h-11 text-xs',
  md: 'w-12 h-16 text-sm',
  lg: 'w-16 h-22 text-base',
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
          'rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/30',
          'flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        <span className="text-muted-foreground/50">?</span>
      </div>
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-md bg-card-bg border border-card-border card-shadow',
        'flex flex-col items-center justify-center cursor-pointer',
        'transition-all duration-200 hover:scale-105',
        color === 'red' ? 'text-card-red' : 'text-card-black',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <span className="font-bold leading-none">{card.rank}</span>
      <span className="leading-none">{symbol}</span>
    </div>
  );
}