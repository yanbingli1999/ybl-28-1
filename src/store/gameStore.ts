import { create } from 'zustand';
import type { GameState, GameActions, GameConfig, Crop } from '@/types/game';
import {
  INITIAL_CROPS,
  INITIAL_MERCHANTS,
  INITIAL_PLOTS,
  INITIAL_CONFIG,
  INITIAL_NEGOTIATION,
  INITIAL_MONEY,
} from '@/constants/gameData';
import {
  growPlots,
  rotPlots,
  rotInventory,
  addToInventory,
  removeFromInventory,
  calculateStorageCost,
  updateContracts,
  createContract,
  addLedgerEntry,
  updateMerchantOpinions,
  selectRandomMerchant,
  getTotalInventoryQuantity,
  getAverageInventoryQuality,
} from '@/utils/gameLogic';
import {
  calculateMerchantInitialOffer,
  calculateMerchantCounterOffer,
} from '@/utils/negotiationAI';

const STORAGE_KEY = 'alien-farm-save';

function loadFromStorage(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return null;
}

function saveToStorage(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

const getInitialState = (): GameState => {
  const saved = loadFromStorage();
  const base: GameState = {
    day: 1,
    money: INITIAL_MONEY,
    crops: INITIAL_CROPS,
    plots: INITIAL_PLOTS.map((p) => ({ ...p })),
    inventory: [],
    merchants: INITIAL_MERCHANTS.map((m) => ({ ...m })),
    currentMerchantId: null,
    contracts: [],
    ledger: [],
    negotiation: { ...INITIAL_NEGOTIATION },
    config: { ...INITIAL_CONFIG },
  };
  if (saved) {
    return { ...base, ...saved };
  }
  return base;
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  nextDay: () => {
    const state = get();
    const { config, crops, inventory, contracts, merchants, day, money } = state;

    const newPlots = growPlots(state.plots, crops, config);
    const rottedPlots = rotPlots(newPlots, crops, config);
    const newInventory = rotInventory(inventory, config);

    const { contracts: updatedContracts, defaults } = updateContracts(contracts);

    const storageCost = calculateStorageCost(newInventory, config);
    let newMoney = money - storageCost;

    let newLedger = addLedgerEntry(
      state.ledger,
      'expense',
      '仓储费用',
      `第${day}天仓储成本`,
      storageCost,
      day
    );

    const fulfilledToday: typeof contracts = [];
    const defaultedToday = defaults;

    for (const contract of defaults) {
      const penalty = Math.round(contract.agreedPrice * config.defaultPenaltyRate);
      newMoney -= penalty;
      newLedger = addLedgerEntry(
        newLedger,
        'expense',
        '违约罚金',
        `与${merchants.find((m) => m.id === contract.merchantId)?.name || '商人'}的合同违约`,
        penalty,
        day
      );
    }

    const updatedMerchants = updateMerchantOpinions(
      merchants,
      defaultedToday,
      fulfilledToday,
      config
    );

    const randomMerchant = selectRandomMerchant(updatedMerchants);

    set({
      day: day + 1,
      money: newMoney,
      plots: rottedPlots,
      inventory: newInventory,
      contracts: updatedContracts,
      ledger: newLedger,
      merchants: updatedMerchants,
      currentMerchantId: randomMerchant?.id || null,
    });
  },

  plantCrop: (plotId: number, cropId: string) => {
    const state = get();
    const crop = state.crops.find((c) => c.id === cropId);
    if (!crop) return;
    if (state.money < crop.seedPrice) return;

    const newPlots = state.plots.map((plot) =>
      plot.id === plotId && (!plot.cropId || plot.rotten)
        ? { ...plot, cropId, growth: 0, watered: false, mature: false, rotten: false, quality: 50 }
        : plot
    );

    const newLedger = addLedgerEntry(
      state.ledger,
      'expense',
      '购买种子',
      `购买${crop.name}种子`,
      crop.seedPrice,
      state.day
    );

    set({
      plots: newPlots,
      money: state.money - crop.seedPrice,
      ledger: newLedger,
    });
  },

  waterPlot: (plotId: number) => {
    set((state) => ({
      plots: state.plots.map((plot) =>
        plot.id === plotId && plot.cropId && !plot.watered && !plot.mature
          ? { ...plot, watered: true }
          : plot
      ),
    }));
  },

  harvestPlot: (plotId: number) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);
    if (!plot || !plot.mature || plot.rotten || !plot.cropId) return;

    const crop = state.crops.find((c) => c.id === plot.cropId);
    if (!crop) return;

    const harvestQuantity = Math.max(1, Math.round(plot.quality / 20) + 1);

    const newInventory = addToInventory(
      state.inventory,
      plot.cropId,
      harvestQuantity,
      plot.quality,
      crop.rotTime
    );

    const newPlots = state.plots.map((p) =>
      p.id === plotId
        ? { ...p, cropId: null, growth: 0, watered: false, mature: false, rotten: false, quality: 0 }
        : p
    );

    set({
      plots: newPlots,
      inventory: newInventory,
    });
  },

  startNegotiation: (merchantId: string, cropId: string, quantity: number) => {
    const state = get();
    const merchant = state.merchants.find((m) => m.id === merchantId);
    const crop = state.crops.find((c) => c.id === cropId);
    if (!merchant || !crop || quantity <= 0) return;

    const inventoryQty = getTotalInventoryQuantity(state.inventory, cropId);
    if (inventoryQty < quantity) return;

    const quality = getAverageInventoryQuality(state.inventory, cropId);
    const initialOffer = calculateMerchantInitialOffer(merchant, crop, quantity, quality);

    const maxRounds = Math.round(
      state.config.negotiationRounds * (merchant.patience / 5)
    );

    set({
      negotiation: {
        active: true,
        merchantId,
        cropId,
        quantity,
        currentRound: 1,
        maxRounds,
        merchantOffer: initialOffer,
        playerOffer: 0,
        lastOfferFrom: 'merchant',
      },
    });
  },

  playerBid: (price: number) => {
    const state = get();
    const { negotiation } = state;
    if (!negotiation.active) return;
    if (price <= 0) return;

    const merchant = state.merchants.find((m) => m.id === negotiation.merchantId);
    const crop = state.crops.find((c) => c.id === negotiation.cropId);
    if (!merchant || !crop) return;

    const quality = getAverageInventoryQuality(state.inventory, negotiation.cropId);

    const nextRound = negotiation.currentRound + 1;

    if (nextRound > negotiation.maxRounds) {
      set({
        negotiation: {
          ...state.negotiation,
          playerOffer: price,
          lastOfferFrom: 'player',
        },
      });
      return;
    }

    const counterOffer = calculateMerchantCounterOffer(
      merchant,
      crop,
      negotiation.quantity,
      quality,
      price,
      nextRound,
      negotiation.maxRounds
    );

    if (counterOffer === null) {
      set({
        negotiation: {
          ...state.negotiation,
          playerOffer: price,
          lastOfferFrom: 'player',
          currentRound: nextRound,
        },
      });
      return;
    }

    set({
      negotiation: {
        ...state.negotiation,
        playerOffer: price,
        merchantOffer: counterOffer,
        currentRound: nextRound,
        lastOfferFrom: 'merchant',
      },
    });
  },

  acceptOffer: () => {
    const state = get();
    const { negotiation } = state;
    if (!negotiation.active) return;

    const agreedPrice = negotiation.lastOfferFrom === 'merchant'
      ? negotiation.merchantOffer
      : negotiation.playerOffer;

    if (agreedPrice <= 0) return;

    const contract = createContract(
      negotiation.merchantId,
      negotiation.cropId,
      negotiation.quantity,
      agreedPrice
    );

    set({
      contracts: [...state.contracts, contract],
      negotiation: { ...INITIAL_NEGOTIATION },
    });
  },

  endNegotiation: () => {
    set({
      negotiation: { ...INITIAL_NEGOTIATION },
    });
  },

  fulfillContract: (contractId: string) => {
    const state = get();
    const contract = state.contracts.find((c) => c.id === contractId);
    if (!contract || contract.fulfilled || contract.defaulted) return;

    const { inventory, removed } = removeFromInventory(
      state.inventory,
      contract.cropId,
      contract.quantity
    );

    if (removed < contract.quantity) return;

    const merchant = state.merchants.find((m) => m.id === contract.merchantId);
    const crop = state.crops.find((c) => c.id === contract.cropId);

    const newMoney = state.money + contract.agreedPrice;

    const newLedger = addLedgerEntry(
      state.ledger,
      'income',
      '合同履约',
      `向${merchant?.name || '商人'}交付${crop?.name || '作物'}`,
      contract.agreedPrice,
      state.day
    );

    const newContracts = state.contracts.map((c) =>
      c.id === contractId ? { ...c, fulfilled: true } : c
    );

    const updatedMerchants = state.merchants.map((m) => {
      if (m.id !== contract.merchantId) return m;
      return {
        ...m,
        opinion: Math.min(100, m.opinion + 10),
      };
    });

    set({
      inventory,
      contracts: newContracts,
      money: newMoney,
      ledger: newLedger,
      merchants: updatedMerchants,
    });
  },

  updateConfig: (config: Partial<GameConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  updateCrop: (cropId: string, updates: Partial<Crop>) => {
    set((state) => ({
      crops: state.crops.map((c) =>
        c.id === cropId ? { ...c, ...updates } : c
      ),
    }));
  },

  resetGame: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    const freshState: GameState = {
      day: 1,
      money: INITIAL_MONEY,
      crops: INITIAL_CROPS,
      plots: INITIAL_PLOTS.map((p) => ({ ...p })),
      inventory: [],
      merchants: INITIAL_MERCHANTS.map((m) => ({ ...m })),
      currentMerchantId: null,
      contracts: [],
      ledger: [],
      negotiation: { ...INITIAL_NEGOTIATION },
      config: { ...INITIAL_CONFIG },
    };
    set(freshState);
  },
}));

useGameStore.subscribe((state) => {
  saveToStorage(state);
});
