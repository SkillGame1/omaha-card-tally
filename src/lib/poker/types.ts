export type Suit = 'h' | 'd' | 'c' | 's';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type OmahaVariant = 'PLO4' | 'PLO5' | 'PLO6';

export interface Player {
  id: number;
  cards: (Card | null)[];
  equity: number;
  winEquity: number;
  tieEquity: number;
}

export interface EquityResult {
  playerEquities: {
    playerId: number;
    winEquity: number;
    tieEquity: number;
    totalEquity: number;
  }[];
  simulations: number;
}

export const SUITS: Suit[] = ['h', 'd', 'c', 's'];
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  h: 'red',
  d: 'red',
  c: 'black',
  s: 'black',
};

export const VARIANT_CARDS: Record<OmahaVariant, number> = {
  PLO4: 4,
  PLO5: 5,
  PLO6: 6,
};

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function stringToCard(str: string): Card | null {
  if (str.length !== 2) return null;
  const rank = str[0].toUpperCase() as Rank;
  const suit = str[1].toLowerCase() as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return { rank, suit };
}

export function getAllCards(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  return cards;
}

export function cardsEqual(a: Card | null, b: Card | null): boolean {
  if (!a || !b) return false;
  return a.rank === b.rank && a.suit === b.suit;
}