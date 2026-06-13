import type { Crop, Merchant, Plot, GameConfig, NegotiationState } from '@/types/game';

export const INITIAL_CROPS: Crop[] = [
  {
    id: 'crystal-melon',
    name: '水晶瓜',
    emoji: '🍈',
    growTime: 3,
    basePrice: 50,
    rotTime: 5,
    seedPrice: 10,
  },
  {
    id: 'nebula-grape',
    name: '星云葡萄',
    emoji: '🍇',
    growTime: 5,
    basePrice: 120,
    rotTime: 4,
    seedPrice: 25,
  },
  {
    id: 'plasma-pepper',
    name: '等离子辣椒',
    emoji: '🌶️',
    growTime: 4,
    basePrice: 80,
    rotTime: 6,
    seedPrice: 15,
  },
  {
    id: 'aurora-wheat',
    name: '极光麦',
    emoji: '🌾',
    growTime: 6,
    basePrice: 200,
    rotTime: 10,
    seedPrice: 40,
  },
  {
    id: 'void-mushroom',
    name: '虚空菇',
    emoji: '🍄',
    growTime: 2,
    basePrice: 35,
    rotTime: 3,
    seedPrice: 8,
  },
  {
    id: 'stardust-carrot',
    name: '星尘胡萝卜',
    emoji: '🥕',
    growTime: 3,
    basePrice: 60,
    rotTime: 7,
    seedPrice: 12,
  },
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'zorg',
    name: '佐格',
    emoji: '👽',
    personality: 'aggressive',
    basePriceMultiplier: 0.85,
    patience: 3,
    opinion: 0,
    memory: [],
  },
  {
    id: 'blix',
    name: '布利克斯',
    emoji: '👾',
    personality: 'friendly',
    basePriceMultiplier: 1.1,
    patience: 6,
    opinion: 20,
    memory: [],
  },
  {
    id: 'nyx',
    name: '尼克斯',
    emoji: '🛸',
    personality: 'greedy',
    basePriceMultiplier: 0.7,
    patience: 4,
    opinion: -10,
    memory: [],
  },
  {
    id: 'orb',
    name: '奥布',
    emoji: '🔮',
    personality: 'cautious',
    basePriceMultiplier: 0.95,
    patience: 5,
    opinion: 5,
    memory: [],
  },
  {
    id: 'mystra',
    name: '米斯特拉',
    emoji: '🌌',
    personality: 'mysterious',
    basePriceMultiplier: 1.0,
    patience: 7,
    opinion: 0,
    memory: [],
  },
];

export const INITIAL_PLOTS: Plot[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  cropId: null,
  growth: 0,
  watered: false,
  mature: false,
  rotten: false,
  quality: 0,
}));

export const INITIAL_CONFIG: GameConfig = {
  growSpeedMultiplier: 1,
  rotSpeedMultiplier: 1,
  negotiationRounds: 5,
  defaultPenaltyRate: 0.3,
  storageCostPerUnit: 2,
  merchantMemoryDays: 10,
  waterBonus: 1.5,
};

export const INITIAL_NEGOTIATION: NegotiationState = {
  active: false,
  merchantId: '',
  cropId: '',
  quantity: 0,
  currentRound: 0,
  maxRounds: 5,
  merchantOffer: 0,
  playerOffer: 0,
  lastOfferFrom: null,
};

export const PERSONALITY_INFO: Record<string, { label: string; color: string; desc: string }> = {
  aggressive: { label: '强硬派', color: 'text-red-400', desc: '压价凶狠，耐心不足' },
  friendly: { label: '友善型', color: 'text-green-400', desc: '出价公道，有耐心' },
  greedy: { label: '贪婪型', color: 'text-yellow-400', desc: '压价极狠，但有利可图' },
  cautious: { label: '谨慎型', color: 'text-blue-400', desc: '出价保守，稳扎稳打' },
  mysterious: { label: '神秘型', color: 'text-purple-400', desc: '难以捉摸，起伏不定' },
};

export const INITIAL_MONEY = 500;
export const CONTRACT_DURATION = 3;
