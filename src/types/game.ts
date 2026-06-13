export type Personality = 'aggressive' | 'friendly' | 'greedy' | 'cautious' | 'mysterious';

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  growTime: number;
  basePrice: number;
  rotTime: number;
  seedPrice: number;
}

export interface Plot {
  id: number;
  cropId: string | null;
  growth: number;
  watered: boolean;
  mature: boolean;
  rotten: boolean;
  quality: number;
}

export interface Merchant {
  id: string;
  name: string;
  emoji: string;
  personality: Personality;
  basePriceMultiplier: number;
  patience: number;
  opinion: number;
  memory: string[];
}

export interface InventoryItem {
  cropId: string;
  quantity: number;
  quality: number;
  daysLeft: number;
}

export interface Contract {
  id: string;
  merchantId: string;
  cropId: string;
  quantity: number;
  agreedPrice: number;
  daysLeft: number;
  fulfilled: boolean;
  defaulted: boolean;
}

export interface NegotiationState {
  active: boolean;
  merchantId: string;
  cropId: string;
  quantity: number;
  currentRound: number;
  maxRounds: number;
  merchantOffer: number;
  playerOffer: number;
  lastOfferFrom: 'merchant' | 'player' | null;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  day: number;
}

export interface GameConfig {
  growSpeedMultiplier: number;
  rotSpeedMultiplier: number;
  negotiationRounds: number;
  defaultPenaltyRate: number;
  storageCostPerUnit: number;
  merchantMemoryDays: number;
  waterBonus: number;
}

export interface GameState {
  day: number;
  money: number;
  crops: Crop[];
  plots: Plot[];
  inventory: InventoryItem[];
  merchants: Merchant[];
  currentMerchantId: string | null;
  contracts: Contract[];
  ledger: LedgerEntry[];
  negotiation: NegotiationState;
  config: GameConfig;
}

export interface GameActions {
  nextDay: () => void;
  plantCrop: (plotId: number, cropId: string) => void;
  waterPlot: (plotId: number) => void;
  harvestPlot: (plotId: number) => void;
  startNegotiation: (merchantId: string, cropId: string, quantity: number) => void;
  playerBid: (price: number) => void;
  acceptOffer: () => void;
  endNegotiation: () => void;
  fulfillContract: (contractId: string) => void;
  updateConfig: (config: Partial<GameConfig>) => void;
  updateCrop: (cropId: string, updates: Partial<Crop>) => void;
  resetGame: () => void;
}
