import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Settings,
  Gauge,
  Skull,
  MessageSquare,
  AlertTriangle,
  Warehouse,
  Brain,
  Droplets,
  ChevronDown,
  ChevronUp,
  Sprout,
  Clock,
  Coins,
  Package,
} from 'lucide-react';

export function ConfigPanel() {
  const { config, updateConfig, crops, updateCrop } = useGameStore();
  const [showCropConfig, setShowCropConfig] = useState(false);

  const globalConfigItems = [
    {
      key: 'growSpeedMultiplier',
      label: '生长速度',
      min: 0.5,
      max: 3,
      step: 0.1,
      icon: Gauge,
      color: 'text-green-400',
      desc: '作物生长速度倍率',
    },
    {
      key: 'rotSpeedMultiplier',
      label: '腐烂速度',
      min: 0.5,
      max: 3,
      step: 0.1,
      icon: Skull,
      color: 'text-red-400',
      desc: '作物腐烂速度倍率',
    },
    {
      key: 'negotiationRounds',
      label: '议价轮次',
      min: 2,
      max: 10,
      step: 1,
      icon: MessageSquare,
      color: 'text-blue-400',
      desc: '基础谈判回合数',
    },
    {
      key: 'defaultPenaltyRate',
      label: '违约惩罚',
      min: 0.1,
      max: 1,
      step: 0.05,
      icon: AlertTriangle,
      color: 'text-orange-400',
      desc: '违约罚金占合同比例',
    },
    {
      key: 'storageCostPerUnit',
      label: '仓储成本',
      min: 0,
      max: 10,
      step: 0.5,
      icon: Warehouse,
      color: 'text-yellow-400',
      desc: '每单位每日仓储费',
    },
    {
      key: 'merchantMemoryDays',
      label: '商人记仇',
      min: 1,
      max: 30,
      step: 1,
      icon: Brain,
      color: 'text-purple-400',
      desc: '商人记住违约的天数',
    },
    {
      key: 'waterBonus',
      label: '浇水加成',
      min: 1,
      max: 3,
      step: 0.1,
      icon: Droplets,
      color: 'text-cyan-400',
      desc: '浇水对生长的加成倍率',
    },
  ];

  const cropConfigItems = [
    {
      key: 'growTime',
      label: '成熟周期',
      min: 1,
      max: 15,
      step: 1,
      icon: Clock,
      color: 'text-green-400',
      suffix: '天',
    },
    {
      key: 'rotTime',
      label: '保鲜天数',
      min: 1,
      max: 20,
      step: 1,
      icon: Skull,
      color: 'text-red-400',
      suffix: '天',
    },
    {
      key: 'basePrice',
      label: '基础售价',
      min: 10,
      max: 500,
      step: 5,
      icon: Coins,
      color: 'text-yellow-400',
      suffix: '💰',
    },
    {
      key: 'seedPrice',
      label: '种子价格',
      min: 2,
      max: 100,
      step: 1,
      icon: Sprout,
      color: 'text-emerald-400',
      suffix: '💰',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-purple-400">游戏配置</h2>
      </div>

      <div className="space-y-4 mb-4">
        {globalConfigItems.map((item) => {
          const Icon = item.icon;
          const value = config[item.key as keyof typeof config] as number;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-purple-200">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.color}`}>
                  {item.key === 'defaultPenaltyRate'
                    ? `${Math.round(value * 100)}%`
                    : item.key === 'waterBonus' ||
                      item.key === 'growSpeedMultiplier' ||
                      item.key === 'rotSpeedMultiplier'
                    ? `${value.toFixed(1)}x`
                    : value}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={value}
                onChange={(e) =>
                  updateConfig({
                    [item.key]: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-purple-900/60 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-purple-500 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-purple-700/30 pt-4">
        <button
          onClick={() => setShowCropConfig(!showCropConfig)}
          className="w-full flex items-center justify-between text-sm text-purple-200 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-pink-400" />
            作物参数配置
          </span>
          {showCropConfig ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showCropConfig && (
          <div className="mt-4 space-y-5">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="p-3 bg-purple-950/40 rounded-lg border border-purple-700/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{crop.emoji}</span>
                  <span className="text-white font-medium">{crop.name}</span>
                </div>

                <div className="space-y-3">
                  {cropConfigItems.map((item) => {
                    const Icon = item.icon;
                    const value = crop[item.key as keyof typeof crop] as number;

                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                            <span className="text-xs text-purple-300">{item.label}</span>
                          </div>
                          <span className={`text-xs font-bold ${item.color}`}>
                            {value}
                            {item.suffix}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={item.min}
                          max={item.max}
                          step={item.step}
                          value={value}
                          onChange={(e) =>
                            updateCrop(crop.id, {
                              [item.key]: parseInt(e.target.value),
                            })
                          }
                          className="w-full h-1.5 bg-purple-900/60 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
