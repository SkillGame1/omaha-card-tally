import { Card, Suit, Rank, SUITS, RANKS, SUIT_SYMBOLS, SUIT_COLORS, cardsEqual } from '@/lib/poker/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CardPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
  usedCards: Card[];
  title?: string;
}

export function CardPicker({ open, onClose, onSelect, usedCards, title = 'בחר קלף' }: CardPickerProps) {
  const isCardUsed = (card: Card) => usedCards.some(c => cardsEqual(c, card));

  const handleSelect = (rank: Rank, suit: Suit) => {
    const card = { rank, suit };
    if (!isCardUsed(card)) {
      onSelect(card);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {SUITS.map(suit => (
            <div key={suit} className="flex gap-1 justify-center">
              {RANKS.map(rank => {
                const card = { rank, suit };
                const used = isCardUsed(card);
                const color = SUIT_COLORS[suit];
                
                return (
                  <button
                    key={`${rank}${suit}`}
                    onClick={() => handleSelect(rank, suit)}
                    disabled={used}
                    className={cn(
                      'w-8 h-11 rounded-sm bg-card-bg border border-card-border',
                      'flex flex-col items-center justify-center text-xs font-bold',
                      'transition-all duration-150 hover:scale-110 hover:shadow-lg',
                      color === 'red' ? 'text-card-red' : 'text-card-black',
                      used && 'opacity-20 cursor-not-allowed hover:scale-100 hover:shadow-none'
                    )}
                  >
                    <span>{rank}</span>
                    <span className="text-[10px]">{SUIT_SYMBOLS[suit]}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}