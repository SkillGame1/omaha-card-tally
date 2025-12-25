import { Card, Rank, RANKS } from './types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
}

export interface EvaluatedHand {
  rank: HandRank;
  value: number; // For comparing hands of the same rank
  cards: Card[];
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  
  const result: T[][] = [];
  
  function combine(start: number, combo: T[]) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  
  combine(0, []);
  return result;
}

function evaluateFiveCards(cards: Card[]): EvaluatedHand {
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const values = sortedCards.map(c => RANK_VALUES[c.rank]);
  const suits = sortedCards.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  
  // Check for straight
  let isStraight = false;
  let straightHighCard = 0;
  
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  
  if (uniqueValues.length >= 5) {
    // Regular straight check
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        isStraight = true;
        straightHighCard = uniqueValues[i];
        break;
      }
    }
    
    // Wheel straight (A-2-3-4-5)
    if (!isStraight && uniqueValues.includes(14) && uniqueValues.includes(2) && 
        uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
      isStraight = true;
      straightHighCard = 5;
    }
  }
  
  // Count ranks
  const rankCounts: Map<number, number> = new Map();
  values.forEach(v => rankCounts.set(v, (rankCounts.get(v) || 0) + 1));
  
  const counts = [...rankCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });
  
  // Straight flush
  if (isFlush && isStraight) {
    return { rank: HandRank.STRAIGHT_FLUSH, value: straightHighCard, cards: sortedCards };
  }
  
  // Four of a kind
  if (counts[0][1] === 4) {
    const quadValue = counts[0][0];
    const kicker = counts[1][0];
    return { rank: HandRank.FOUR_OF_A_KIND, value: quadValue * 100 + kicker, cards: sortedCards };
  }
  
  // Full house
  if (counts[0][1] === 3 && counts[1][1] >= 2) {
    const tripValue = counts[0][0];
    const pairValue = counts[1][0];
    return { rank: HandRank.FULL_HOUSE, value: tripValue * 100 + pairValue, cards: sortedCards };
  }
  
  // Flush
  if (isFlush) {
    const value = values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
    return { rank: HandRank.FLUSH, value, cards: sortedCards };
  }
  
  // Straight
  if (isStraight) {
    return { rank: HandRank.STRAIGHT, value: straightHighCard, cards: sortedCards };
  }
  
  // Three of a kind
  if (counts[0][1] === 3) {
    const tripValue = counts[0][0];
    const kickers = counts.slice(1).map(c => c[0]).sort((a, b) => b - a);
    return { rank: HandRank.THREE_OF_A_KIND, value: tripValue * 10000 + kickers[0] * 100 + kickers[1], cards: sortedCards };
  }
  
  // Two pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const highPair = Math.max(counts[0][0], counts[1][0]);
    const lowPair = Math.min(counts[0][0], counts[1][0]);
    const kicker = counts[2][0];
    return { rank: HandRank.TWO_PAIR, value: highPair * 10000 + lowPair * 100 + kicker, cards: sortedCards };
  }
  
  // Pair
  if (counts[0][1] === 2) {
    const pairValue = counts[0][0];
    const kickers = counts.slice(1).map(c => c[0]).sort((a, b) => b - a);
    return { rank: HandRank.PAIR, value: pairValue * 1000000 + kickers[0] * 10000 + kickers[1] * 100 + kickers[2], cards: sortedCards };
  }
  
  // High card
  const value = values[0] * 10000000 + values[1] * 100000 + values[2] * 1000 + values[3] * 10 + values[4];
  return { rank: HandRank.HIGH_CARD, value, cards: sortedCards };
}

export function evaluateOmahaHand(holeCards: Card[], boardCards: Card[]): EvaluatedHand {
  // In Omaha, must use exactly 2 hole cards and 3 board cards
  const holeCombos = getCombinations(holeCards, 2);
  const boardCombos = getCombinations(boardCards, 3);
  
  let bestHand: EvaluatedHand | null = null;
  
  for (const hole of holeCombos) {
    for (const board of boardCombos) {
      const fiveCards = [...hole, ...board];
      const evaluated = evaluateFiveCards(fiveCards);
      
      if (!bestHand || compareHands(evaluated, bestHand) > 0) {
        bestHand = evaluated;
      }
    }
  }
  
  return bestHand!;
}

export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return a.value - b.value;
}