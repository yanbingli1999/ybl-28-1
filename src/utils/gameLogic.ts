import type { Plot, Crop, InventoryItem, Contract, Merchant, GameConfig, LedgerEntry } from '@/types/game';
import { CONTRACT_DURATION } from '@/constants/gameData';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function growPlots(plots: Plot[], crops: Crop[], config: GameConfig): Plot[] {
  return plots.map((plot) => {
    if (!plot.cropId || plot.mature || plot.rotten) return plot;

    const crop = crops.find((c) => c.id === plot.cropId);
    if (!crop) return plot;

    const growthPerDay = (100 / crop.growTime) * config.growSpeedMultiplier;
    const waterBonus = plot.watered ? config.waterBonus : 1;
    const newGrowth = Math.min(100, plot.growth + growthPerDay * waterBonus);

    const qualityChange = plot.watered ? 5 : -3;
    const newQuality = Math.max(0, Math.min(100, plot.quality + qualityChange));

    const isMature = newGrowth >= 100;

    return {
      ...plot,
      growth: newGrowth,
      mature: isMature,
      watered: false,
      quality: isMature ? plot.quality : newQuality,
    };
  });
}

export function rotPlots(plots: Plot[], crops: Crop[], config: GameConfig): Plot[] {
  return plots.map((plot) => {
    if (!plot.cropId || !plot.mature || plot.rotten) return plot;

    const crop = crops.find((c) => c.id === plot.cropId);
    if (!crop) return plot;

    const rotChancePerDay = (1 / crop.rotTime) * config.rotSpeedMultiplier;
    if (Math.random() < rotChancePerDay) {
      return { ...plot, rotten: true };
    }

    return plot;
  });
}

export function rotInventory(inventory: InventoryItem[], config: GameConfig): InventoryItem[] {
  return inventory
    .map((item) => ({
      ...item,
      daysLeft: item.daysLeft - config.rotSpeedMultiplier,
    }))
    .filter((item) => item.daysLeft > 0 && item.quantity > 0);
}

export function addToInventory(
  inventory: InventoryItem[],
  cropId: string,
  quantity: number,
  quality: number,
  rotTime: number
): InventoryItem[] {
  const existingIndex = inventory.findIndex(
    (item) => item.cropId === cropId && Math.abs(item.daysLeft - rotTime) <= 1
  );

  if (existingIndex >= 0) {
    const existing = inventory[existingIndex];
    const totalQuantity = existing.quantity + quantity;
    const avgQuality = (existing.quality * existing.quantity + quality * quantity) / totalQuantity;

    return inventory.map((item, i) =>
      i === existingIndex
        ? { ...item, quantity: totalQuantity, quality: avgQuality }
        : item
    );
  }

  return [...inventory, { cropId, quantity, quality, daysLeft: rotTime }];
}

export function removeFromInventory(
  inventory: InventoryItem[],
  cropId: string,
  quantity: number
): { inventory: InventoryItem[]; removed: number } {
  let remaining = quantity;
  const newInventory: InventoryItem[] = [];

  const sortedItems = [...inventory]
    .filter((item) => item.cropId === cropId)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const otherItems = inventory.filter((item) => item.cropId !== cropId);

  for (const item of sortedItems) {
    if (remaining <= 0) {
      newInventory.push(item);
      continue;
    }

    if (item.quantity <= remaining) {
      remaining -= item.quantity;
    } else {
      newInventory.push({ ...item, quantity: item.quantity - remaining });
      remaining = 0;
    }
  }

  return {
    inventory: [...otherItems, ...newInventory],
    removed: quantity - remaining,
  };
}

export function getTotalInventoryQuantity(inventory: InventoryItem[], cropId: string): number {
  return inventory
    .filter((item) => item.cropId === cropId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getAverageInventoryQuality(inventory: InventoryItem[], cropId: string): number {
  const items = inventory.filter((item) => item.cropId === cropId);
  if (items.length === 0) return 50;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const weightedQuality = items.reduce((sum, item) => sum + item.quality * item.quantity, 0);

  return weightedQuality / totalQuantity;
}

export function calculateStorageCost(inventory: InventoryItem[], config: GameConfig): number {
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  return Math.round(totalUnits * config.storageCostPerUnit);
}

export function updateContracts(contracts: Contract[]): {
  contracts: Contract[];
  defaults: Contract[];
} {
  const defaults: Contract[] = [];

  const updated = contracts.map((contract) => {
    if (contract.fulfilled || contract.defaulted) return contract;

    const newDaysLeft = contract.daysLeft - 1;

    if (newDaysLeft <= 0) {
      defaults.push(contract);
      return { ...contract, daysLeft: 0, defaulted: true };
    }

    return { ...contract, daysLeft: newDaysLeft };
  });

  return { contracts: updated, defaults };
}

export function createContract(
  merchantId: string,
  cropId: string,
  quantity: number,
  agreedPrice: number
): Contract {
  return {
    id: generateId(),
    merchantId,
    cropId,
    quantity,
    agreedPrice,
    daysLeft: CONTRACT_DURATION,
    fulfilled: false,
    defaulted: false,
  };
}

export function addLedgerEntry(
  ledger: LedgerEntry[],
  type: 'income' | 'expense',
  category: string,
  description: string,
  amount: number,
  day: number
): LedgerEntry[] {
  const entry: LedgerEntry = {
    id: generateId(),
    type,
    category,
    description,
    amount,
    day,
  };
  return [entry, ...ledger];
}

export function updateMerchantOpinions(
  merchants: Merchant[],
  defaultedContracts: Contract[],
  fulfilledContracts: Contract[],
  config: GameConfig
): Merchant[] {
  return merchants.map((merchant) => {
    let opinionChange = 0;
    let newMemory = [...merchant.memory];

    for (const contract of defaultedContracts) {
      if (contract.merchantId === merchant.id) {
        opinionChange -= 30;
        newMemory.push(contract.id);
      }
    }

    for (const contract of fulfilledContracts) {
      if (contract.merchantId === merchant.id) {
        opinionChange += 10;
      }
    }

    newMemory = newMemory.slice(-config.merchantMemoryDays);

    return {
      ...merchant,
      opinion: Math.max(-100, Math.min(100, merchant.opinion + opinionChange)),
      memory: newMemory,
    };
  });
}

export function selectRandomMerchant(merchants: Merchant[]): Merchant | null {
  if (merchants.length === 0) return null;
  return merchants[Math.floor(Math.random() * merchants.length)];
}
