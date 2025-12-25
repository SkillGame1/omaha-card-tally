import { useState } from 'react';
import { Player, Card, OmahaVariant, VARIANT_CARDS } from '@/lib/poker/types';
import { PlayingCard } from './PlayingCard';
import { CardPicker } from './CardPicker';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  player: Player;
  variant: OmahaVariant;
  playerIndex: number;
  usedCards: Card[];
  onUpdateCards: (cards: (Card | null)[]) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

const playerColors = [
  'border-player-1',
  'border-player-2', 
  'border-player-3',
  'border-player-4',
  'border-player-5',
  'border-player-6',
];

const playerBgColors = [
  'bg-player-1/10',
  'bg-player-2/10',
  'bg-player-3/10',
  'bg-player-4/10',
  'bg-player-5/10',
  'bg-player-6/10',
];

export function PlayerHand({
  player,
  variant,
  playerIndex,
  usedCards,
  onUpdateCards,
  onRemove,
  canRemove = true,
}: PlayerHandProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  const numCards = VARIANT_CARDS[variant];
  const cards = [...player.cards];
  
  // Ensure we have the right number of slots
  while (cards.length < numCards) {
    cards.push(null);
  }

  const handleCardClick = (index: number) => {
    setSelectedSlot(index);
    setPickerOpen(true);
  };

  const handleCardSelect = (card: Card) => {
    if (selectedSlot !== null) {
      const newCards = [...cards];
      newCards[selectedSlot] = card;
      onUpdateCards(newCards.slice(0, numCards));
    }
  };

  const handleRemoveCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCards = [...cards];
    newCards[index] = null;
    onUpdateCards(newCards.slice(0, numCards));
  };

  const handleClearAll = () => {
    onUpdateCards(Array(numCards).fill(null));
  };

  const hasCards = cards.some(c => c !== null);
  const filledCards = cards.filter(c => c !== null).length;
  const equityDisplay = player.equity > 0 ? `${player.equity.toFixed(1)}%` : '-';

  return (
    <div className={cn(
      'rounded-lg border-2 p-3 bg-card/50',
      playerColors[playerIndex % 6],
      playerBgColors[playerIndex % 6]
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">שחקן {playerIndex + 1}</span>
          <span className="text-sm text-muted-foreground">({filledCards}/{numCards})</span>
        </div>
        <div className="flex items-center gap-2">
          {player.equity > 0 && (
            <span className="text-lg font-bold text-primary">{equityDisplay}</span>
          )}
          {hasCards && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {canRemove && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex gap-1.5 flex-wrap">
        {cards.slice(0, numCards).map((card, index) => (
          <div key={index} className="relative group">
            <PlayingCard
              card={card}
              size="md"
              onClick={() => handleCardClick(index)}
            />
            {card && (
              <button
                onClick={(e) => handleRemoveCard(index, e)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full 
                         flex items-center justify-center opacity-0 group-hover:opacity-100 
                         transition-opacity text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Equity bar */}
      {player.equity > 0 && (
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(player.equity, 100)}%` }}
          />
        </div>
      )}

      <CardPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCardSelect}
        usedCards={usedCards}
        title={`שחקן ${playerIndex + 1} - קלף ${(selectedSlot ?? 0) + 1}`}
      />
    </div>
  );
}