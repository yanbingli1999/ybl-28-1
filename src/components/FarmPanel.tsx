import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Droplets, Sprout, Leaf } from 'lucide-react';

export function FarmPanel() {
  const { plots, crops, money, plantCrop, waterPlot, harvestPlot } = useGameStore();
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [showSeedMenu, setShowSeedMenu] = useState(false);

  const handlePlotClick = (plotId: number) => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot) return;

    if (!plot.cropId) {
      setSelectedPlot(plotId);
      setShowSeedMenu(true);
    }
  };

  const handlePlant = (cropId: string) => {
    if (selectedPlot === null) return;
    const crop = crops.find((c) => c.id === cropId);
    if (!crop || money < crop.seedPrice) return;

    plantCrop(selectedPlot, cropId);
    setShowSeedMenu(false);
    setSelectedPlot(null);
  };

  const handleWater = (plotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    waterPlot(plotId);
  };

  const handleHarvest = (plotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    harvestPlot(plotId);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌱</span>
        <h2 className="text-lg font-bold text-green-400">异星农场</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {plots.map((plot) => {
          const crop = plot.cropId ? crops.find((c) => c.id === plot.cropId) : null;

          return (
            <div
              key={plot.id}
              onClick={() => handlePlotClick(plot.id)}
              className={`relative aspect-square rounded-lg border-2 transition-all cursor-pointer overflow-hidden
                ${
                  plot.cropId
                    ? plot.rotten
                      ? 'bg-red-900/30 border-red-500/40'
                      : plot.mature
                      ? 'bg-green-900/30 border-green-500/50 hover:border-green-400'
                      : 'bg-amber-900/20 border-amber-600/30 hover:border-amber-500'
                    : 'bg-purple-950/50 border-purple-700/40 hover:border-purple-500 hover:bg-purple-900/40'
                }
              `}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                {crop ? (
                  <>
                    <span
                      className={`text-4xl transition-transform ${
                        plot.mature ? 'animate-bounce' : ''
                      } ${plot.rotten ? 'grayscale opacity-50' : ''}`}
                    >
                      {crop.emoji}
                    </span>
                    <span className="text-xs text-purple-200 mt-1 font-medium">
                      {crop.name}
                    </span>

                    {!plot.rotten && (
                      <div className="w-full mt-2">
                        <div className="h-1.5 bg-purple-900/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              plot.mature
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            }`}
                            style={{ width: `${plot.growth}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {plot.rotten && (
                      <span className="text-xs text-red-400 mt-1">💀 已腐烂</span>
                    )}

                    {plot.mature && !plot.rotten && (
                      <button
                        onClick={(e) => handleHarvest(plot.id, e)}
                        className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-md font-medium transition-colors flex items-center gap-1"
                      >
                        <Leaf className="w-3 h-3" />
                        收获
                      </button>
                    )}

                    {!plot.mature && !plot.rotten && (
                      <button
                        onClick={(e) => handleWater(plot.id, e)}
                        disabled={plot.watered}
                        className={`mt-2 px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                          plot.watered
                            ? 'bg-blue-900/50 text-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <Droplets className="w-3 h-3" />
                        {plot.watered ? '已浇' : '浇水'}
                      </button>
                    )}

                    {plot.watered && !plot.mature && !plot.rotten && (
                      <span className="absolute top-1 right-1 text-sm">💧</span>
                    )}
                  </>
                ) : (
                  <>
                    <Sprout className="w-8 h-8 text-purple-600/50" />
                    <span className="text-xs text-purple-500 mt-1">点击播种</span>
                  </>
                )}
              </div>

              {crop && !plot.rotten && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="flex justify-between text-[10px] text-purple-300">
                    <span>品质: {plot.quality}</span>
                    <span>{Math.round(plot.growth)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showSeedMenu && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSeedMenu(false)}>
          <div
            className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/30 rounded-xl p-5 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <span>🌱</span> 选择种子
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => handlePlant(crop.id)}
                  disabled={money < crop.seedPrice}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    money >= crop.seedPrice
                      ? 'bg-purple-800/50 border-purple-600/40 hover:border-green-500 hover:bg-purple-700/50'
                      : 'bg-gray-800/30 border-gray-700/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{crop.emoji}</span>
                    <span className="text-white font-medium">{crop.name}</span>
                  </div>
                  <div className="text-xs text-purple-300 space-y-0.5">
                    <p>⏱️ 成熟: {crop.growTime}天</p>
                    <p>💰 基础价: {crop.basePrice}</p>
                    <p>🪦 保质期: {crop.rotTime}天</p>
                  </div>
                  <div className="mt-2 text-yellow-400 text-sm font-bold">
                    种子: {crop.seedPrice} 💰
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSeedMenu(false)}
              className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
