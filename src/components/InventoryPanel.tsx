import { useGameStore } from '@/store/gameStore';
import { Package, Clock } from 'lucide-react';
import { calculateStorageCost, getTotalInventoryQuantity } from '@/utils/gameLogic';

export function InventoryPanel() {
  const { inventory, crops, config } = useGameStore();

  const storageCost = calculateStorageCost(inventory, config);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const groupedInventory = crops.map((crop) => {
    const items = inventory.filter((item) => item.cropId === crop.id);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const avgQuality =
      totalQuantity > 0
        ? items.reduce((sum, item) => sum + item.quality * item.quantity, 0) / totalQuantity
        : 0;
    const minDaysLeft = items.length > 0 ? Math.min(...items.map((i) => i.daysLeft)) : 0;

    return {
      crop,
      quantity: totalQuantity,
      avgQuality,
      minDaysLeft,
    };
  }).filter((item) => item.quantity > 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-cyan-400">仓库</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-purple-400">物品总数</div>
          <div className="text-white font-bold">{totalItems}</div>
        </div>
      </div>

      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-orange-300 text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            每日仓储成本
          </span>
          <span className="text-orange-400 font-bold">-{storageCost} 💰/天</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {groupedInventory.length === 0 ? (
          <div className="text-center py-8 text-purple-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>仓库空空如也</p>
            <p className="text-xs">收获作物后会存入仓库</p>
          </div>
        ) : (
          groupedInventory.map(({ crop, quantity, avgQuality, minDaysLeft }) => (
            <div
              key={crop.id}
              className="flex items-center justify-between p-3 bg-purple-950/50 rounded-lg border border-purple-700/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{crop.emoji}</span>
                <div>
                  <div className="text-white font-medium">{crop.name}</div>
                  <div className="text-xs text-purple-400">
                    品质: {Math.round(avgQuality)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">x{quantity}</div>
                <div
                  className={`text-xs flex items-center gap-1 justify-end ${
                    minDaysLeft <= 2 ? 'text-red-400' : 'text-purple-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {minDaysLeft <= 1 ? '即将腐烂' : `${minDaysLeft}天后腐烂`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
