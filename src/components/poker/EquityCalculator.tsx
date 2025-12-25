import { useState, useEffect, useCallback } from "react";
import { Card, Player, OmahaVariant, VARIANT_CARDS, cardsEqual } from "@/lib/poker/types";
import { calculateEquity } from "@/lib/poker/equityCalculator";
import { VariantTabs } from "./VariantTabs";
import { PlayerHand } from "./PlayerHand";
import { BoardCards } from "./BoardCards";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const createEmptyPlayer = (id: number, numCards: number): Player => ({
  id,
  cards: Array(numCards).fill(null),
  equity: 0,
  winEquity: 0,
  tieEquity: 0,
});

export function EquityCalculator() {
  const [variant, setVariant] = useState<OmahaVariant>("PLO4");
  const [players, setPlayers] = useState<Player[]>([createEmptyPlayer(1, 4), createEmptyPlayer(2, 4)]);
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);
  const { toast } = useToast();

  // Get all used cards
  const usedCards: Card[] = [...boardCards, ...players.flatMap((p) => p.cards.filter((c): c is Card => c !== null))];

  // Handle variant change
  const handleVariantChange = (newVariant: OmahaVariant) => {
    setVariant(newVariant);
    const numCards = VARIANT_CARDS[newVariant];

    // Adjust player cards to new variant
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        cards: p.cards.slice(0, numCards).concat(Array(Math.max(0, numCards - p.cards.length)).fill(null)),
        equity: 0,
        winEquity: 0,
        tieEquity: 0,
      })),
    );
  };

  // Add player
  const addPlayer = () => {
    if (players.length >= 6) {
      toast({
        title: "מקסימום שחקנים",
        description: "ניתן להוסיף עד 6 שחקנים",
        variant: "destructive",
      });
      return;
    }
    const numCards = VARIANT_CARDS[variant];
    const newId = Math.max(...players.map((p) => p.id)) + 1;
    setPlayers((prev) => [...prev, createEmptyPlayer(newId, numCards)]);
  };

  // Remove player
  const removePlayer = (playerId: number) => {
    if (players.length <= 2) {
      toast({
        title: "מינימום שחקנים",
        description: "חייבים לפחות 2 שחקנים",
        variant: "destructive",
      });
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  // Update player cards
  const updatePlayerCards = (playerId: number, cards: (Card | null)[]) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, cards, equity: 0, winEquity: 0, tieEquity: 0 } : p)),
    );
  };

  // Calculate equity
  const calculate = useCallback(async () => {
    // Check if at least 2 players have complete hands
    const completePlayers = players.filter(
      (p) => p.cards.every((c) => c !== null) && p.cards.length === VARIANT_CARDS[variant],
    );

    if (completePlayers.length < 2) {
      toast({
        title: "חסרים קלפים",
        description: "נדרשים לפחות 2 שחקנים עם יד מלאה",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const result = calculateEquity(players, boardCards, [], 20000);

      setPlayers((prev) =>
        prev.map((p) => {
          const equity = result.playerEquities.find((e) => e.playerId === p.id);
          return {
            ...p,
            equity: equity?.totalEquity || 0,
            winEquity: equity?.winEquity || 0,
            tieEquity: equity?.tieEquity || 0,
          };
        }),
      );

      setSimulationCount(result.simulations);
      setIsCalculating(false);

      toast({
        title: "החישוב הושלם",
        description: `${result.simulations.toLocaleString()} סימולציות`,
      });
    }, 50);
  }, [players, boardCards, variant, toast]);

  // Reset everything
  const reset = () => {
    const numCards = VARIANT_CARDS[variant];
    setPlayers([createEmptyPlayer(1, numCards), createEmptyPlayer(2, numCards)]);
    setBoardCards([]);
    setSimulationCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">מחשבון סיכויים אומהה</h1>
        <p className="text-muted-foreground">חישוב אחוזי זכייה ל-PLO4, PLO5 ו-PLO6</p>
      </div>

      {/* Variant Tabs */}
      <VariantTabs variant={variant} onChange={handleVariantChange} />

      {/* Board */}
      <BoardCards
        cards={boardCards}
        usedCards={usedCards}
        onUpdateCards={setBoardCards}
      />

      {/* Players */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">שחקנים ({players.length}/6)</h2>
          <Button variant="outline" size="sm" onClick={addPlayer} disabled={players.length >= 6} className="gap-1">
            <Plus className="h-4 w-4" />
            הוסף שחקן
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {players.map((player, index) => (
            <PlayerHand
              key={player.id}
              player={player}
              variant={variant}
              playerIndex={index}
              usedCards={usedCards}
              onUpdateCards={(cards) => updatePlayerCards(player.id, cards)}
              onRemove={() => removePlayer(player.id)}
              canRemove={players.length > 2}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          איפוס
        </Button>
        <Button onClick={calculate} disabled={isCalculating} className="gap-2 min-w-[140px]">
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              מחשב...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              חשב Equity
            </>
          )}
        </Button>
      </div>

      {/* Results info */}
      {simulationCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          תוצאות מבוססות על {simulationCount.toLocaleString()} סימולציות Monte Carlo
        </div>
      )}
    </div>
  );
}
