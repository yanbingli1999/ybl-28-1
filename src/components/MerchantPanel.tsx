import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { User, Heart, MessageSquare } from 'lucide-react';
import { PERSONALITY_INFO } from '@/constants/gameData';
import { getTotalInventoryQuantity } from '@/utils/gameLogic';

export function MerchantPanel() {
  const { merchants, currentMerchantId, crops, inventory, startNegotiation } = useGameStore();
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const currentMerchant = merchants.find((m) => m.id === currentMerchantId);
  const personalityInfo = currentMerchant
    ? PERSONALITY_INFO[currentMerchant.personality]
    : null;

  const availableCrops = crops.filter((crop) => {
    const qty = getTotalInventoryQuantity(inventory, crop.id);
    return qty > 0;
  });

  const selectedCropData = crops.find((c) => c.id === selectedCrop);
  const maxQuantity = selectedCrop
    ? getTotalInventoryQuantity(inventory, selectedCrop)
    : 0;

  const handleStartNegotiation = () => {
    if (!currentMerchant || !selectedCrop || quantity <= 0) return;
    startNegotiation(currentMerchant.id, selectedCrop, quantity);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-bold text-pink-400">来访商人</h2>
      </div>

      {currentMerchant && personalityInfo ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-purple-950/50 rounded-lg border border-purple-700/30">
            <div className="text-5xl animate-bounce">{currentMerchant.emoji}</div>
            <div className="flex-1">
              <div className="text-white font-bold text-lg">{currentMerchant.name}</div>
              <div className={`text-sm font-medium ${personalityInfo.color}`}>
                {personalityInfo.label}
              </div>
              <div className="text-xs text-purple-400 mt-1">
                {personalityInfo.desc}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm text-purple-300">好感度:</span>
            <div className="flex-1 h-2 bg-purple-900/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  currentMerchant.opinion >= 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : 'bg-gradient-to-r from-red-500 to-rose-400'
                }`}
                style={{
                  width: `${50 + currentMerchant.opinion / 2}%`,
                  marginLeft: currentMerchant.opinion < 0 ? `${50 + currentMerchant.opinion / 2}%` : '50%',
                }}
              />
            </div>
            <span className={`text-sm font-bold min-w-[40px] text-right ${
              currentMerchant.opinion >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentMerchant.opinion > 0 ? '+' : ''}
              {currentMerchant.opinion}
            </span>
          </div>

          <div className="border-t border-purple-700/30 pt-4">
            <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              发起谈判
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-purple-400 block mb-1">选择作物</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full bg-purple-950/50 border border-purple-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- 选择作物 --</option>
                  {availableCrops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.emoji} {crop.name} (库存: {getTotalInventoryQuantity(inventory, crop.id)})
                    </option>
                  ))}
                </select>
                {availableCrops.length === 0 && (
                  <p className="text-xs text-orange-400 mt-1">仓库中没有可出售的作物</p>
                )}
              </div>

              {selectedCrop && (
                <>
                  <div>
                    <label className="text-xs text-purple-400 block mb-1">
                      数量 (最大: {maxQuantity})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-full bg-purple-950/50 border border-purple-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="text-xs text-purple-400">
                    基础参考价: {selectedCropData?.basePrice} 💰 x {quantity} ={' '}
                    <span className="text-yellow-400 font-bold">
                      {(selectedCropData?.basePrice || 0) * quantity} 💰
                    </span>
                  </div>

                  <button
                    onClick={handleStartNegotiation}
                    disabled={!selectedCrop || quantity <= 0}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-pink-500/20"
                  >
                    🤝 开始谈判
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-purple-500">
          <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>暂无商人来访</p>
          <p className="text-xs">推进一天可能会有商人到来</p>
        </div>
      )}
    </div>
  );
}
