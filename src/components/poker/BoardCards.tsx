import { useState } from 'react';
import { Card } from '@/lib/poker/types';
import { PlayingCard } from './PlayingCard';
import { CardPicker } from './CardPicker';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

interface BoardCardsProps {
  cards: Card[];
  usedCards: Card[];
  onUpdateCards: (cards: Card[]) => void;
}

export function BoardCards({ cards, usedCards, onUpdateCards }: BoardCardsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const boardSlots = [
    { label: 'Flop', indices: [0, 1, 2] },
    { label: 'Turn', indices: [3] },
    { label: 'River', indices: [4] },
  ];

  const handleCardClick = (index: number) => {
    setSelectedSlot(index);
    setPickerOpen(true);
  };

  const handleCardSelect = (card: Card) => {
    if (selectedSlot !== null) {
      const newCards: (Card | null)[] = [null, null, null, null, null];
      cards.forEach((c, i) => { newCards[i] = c; });
      newCards[selectedSlot] = card;
      onUpdateCards(newCards.filter((c): c is Card => c !== null));
      
      // Move to next empty slot or close if all filled
      const nextEmptySlot = newCards.findIndex((c, i) => i > selectedSlot && c === null);
      if (nextEmptySlot !== -1 && nextEmptySlot < 5) {
        setSelectedSlot(nextEmptySlot);
      } else {
        // Check if there are any empty slots before current
        const firstEmptySlot = newCards.findIndex((c, i) => c === null && i !== selectedSlot);
        if (firstEmptySlot !== -1 && firstEmptySlot < 5) {
          setSelectedSlot(firstEmptySlot);
        } else {
          setPickerOpen(false);
        }
      }
    }
  };

  const handleRemoveCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCards = cards.filter((_, i) => i !== index);
    onUpdateCards(newCards);
  };

  const handleClear = () => {
    onUpdateCards([]);
  };

  return (
    <div className="rounded-lg border-2 border-poker-table-border p-4 poker-gradient">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Board</h3>
        {cards.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            נקה
          </Button>
        )}
      </div>
      
      <div className="flex gap-6 justify-center">
        {boardSlots.map(({ label, indices }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            <div className="flex gap-1">
              {indices.map(index => {
                const card = cards[index] || null;
                return (
                  <div key={index} className="relative group">
                    <PlayingCard
                      card={card}
                      size="lg"
                      onClick={() => handleCardClick(index)}
                    />
                    {card && (
                      <button
                        onClick={(e) => handleRemoveCard(index, e)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full 
                                 flex items-center justify-center opacity-0 group-hover:opacity-100 
                                 transition-opacity text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <CardPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCardSelect}
        usedCards={usedCards}
        title={`בורד - קלף ${(selectedSlot ?? 0) + 1}/5`}
        currentSlot={selectedSlot ?? 0}
        totalSlots={5}
      />
    </div>
  );
}