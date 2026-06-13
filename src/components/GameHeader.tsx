import { useGameStore } from '@/store/gameStore';
import { Sun, Coins, Calendar, RotateCcw } from 'lucide-react';

export function GameHeader() {
  const { day, money, nextDay, resetGame } = useGameStore();

  return (
    <header className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-sm border-b border-purple-500/30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👽</span>
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              外星农场
            </h1>
            <p className="text-xs text-purple-300">种植 · 谈判 · 经营</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-purple-800/50 px-4 py-2 rounded-lg border border-purple-600/30">
            <Calendar className="w-5 h-5 text-purple-300" />
            <span className="text-purple-200 font-medium">第 {day} 天</span>
          </div>

          <div className="flex items-center gap-2 bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-500/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-bold">💰 {money}</span>
          </div>

          <button
            onClick={nextDay}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
          >
            <Sun className="w-5 h-5" />
            下一天
          </button>

          <button
            onClick={resetGame}
            className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-3 py-2 rounded-lg transition-all"
            title="重新开始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
