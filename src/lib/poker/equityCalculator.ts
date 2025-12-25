import { Card, Player, EquityResult, cardsEqual } from './types';
import { evaluateOmahaHand, compareHands } from './handEvaluator';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDeck(excludeCards: Card[]): Card[] {
  const suits: ('h' | 'd' | 'c' | 's')[] = ['h', 'd', 'c', 's'];
  const ranks: ('2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A')[] = 
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      const card: Card = { rank, suit };
      if (!excludeCards.some(c => cardsEqual(c, card))) {
        deck.push(card);
      }
    }
  }
  return deck;
}

export function calculateEquity(
  players: Player[],
  boardCards: Card[],
  deadCards: Card[] = [],
  simulations: number = 10000
): EquityResult {
  // Get all known cards
  const knownCards: Card[] = [
    ...boardCards,
    ...deadCards,
    ...players.flatMap(p => p.cards.filter((c): c is Card => c !== null)),
  ];
  
  // Validate all players have complete hands
  const validPlayers = players.filter(p => 
    p.cards.length > 0 && p.cards.every(c => c !== null)
  );
  
  if (validPlayers.length < 2) {
    return {
      playerEquities: players.map(p => ({
        playerId: p.id,
        winEquity: 0,
        tieEquity: 0,
        totalEquity: 0,
      })),
      simulations: 0,
    };
  }
  
  const remainingDeck = getDeck(knownCards);
  const boardCardsNeeded = 5 - boardCards.length;
  
  const wins: Map<number, number> = new Map();
  const ties: Map<number, number> = new Map();
  
  validPlayers.forEach(p => {
    wins.set(p.id, 0);
    ties.set(p.id, 0);
  });
  
  for (let i = 0; i < simulations; i++) {
    const shuffledDeck = shuffleArray(remainingDeck);
    const runoutCards = shuffledDeck.slice(0, boardCardsNeeded);
    const fullBoard = [...boardCards, ...runoutCards];
    
    // Evaluate each player's hand
    const evaluatedHands = validPlayers.map(p => ({
      playerId: p.id,
      hand: evaluateOmahaHand(p.cards as Card[], fullBoard),
    }));
    
    // Find winner(s)
    let bestHand = evaluatedHands[0].hand;
    let winners = [evaluatedHands[0].playerId];
    
    for (let j = 1; j < evaluatedHands.length; j++) {
      const comparison = compareHands(evaluatedHands[j].hand, bestHand);
      if (comparison > 0) {
        bestHand = evaluatedHands[j].hand;
        winners = [evaluatedHands[j].playerId];
      } else if (comparison === 0) {
        winners.push(evaluatedHands[j].playerId);
      }
    }
    
    if (winners.length === 1) {
      wins.set(winners[0], (wins.get(winners[0]) || 0) + 1);
    } else {
      winners.forEach(id => {
        ties.set(id, (ties.get(id) || 0) + 1);
      });
    }
  }
  
  return {
    playerEquities: players.map(p => {
      const winCount = wins.get(p.id) || 0;
      const tieCount = ties.get(p.id) || 0;
      const winEquity = (winCount / simulations) * 100;
      const tieEquity = (tieCount / simulations) * 100;
      return {
        playerId: p.id,
        winEquity,
        tieEquity,
        totalEquity: winEquity + tieEquity,
      };
    }),
    simulations,
  };
}