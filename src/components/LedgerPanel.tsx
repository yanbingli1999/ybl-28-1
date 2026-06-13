import { useGameStore } from '@/store/gameStore';
import { BookOpen, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export function LedgerPanel() {
  const { ledger, money } = useGameStore();

  const totalIncome = ledger
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpense = ledger
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const profit = totalIncome - totalExpense;

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-emerald-400">账本</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
          <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-xs text-green-400">总收入</div>
          <div className="text-green-400 font-bold">{totalIncome}</div>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
          <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <div className="text-xs text-red-400">总支出</div>
          <div className="text-red-400 font-bold">{totalExpense}</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
          <Wallet className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-xs text-yellow-400">净利润</div>
          <div className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}
            {profit}
          </div>
        </div>
      </div>

      <div className="text-xs text-purple-400 mb-2 flex items-center justify-between">
        <span>交易记录</span>
        <span className="text-purple-500">当前余额: {money} 💰</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {ledger.length === 0 ? (
          <div className="text-center py-6 text-purple-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无记录</p>
          </div>
        ) : (
          ledger.slice(0, 20).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2 bg-purple-950/30 rounded-lg border border-purple-800/20"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    entry.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <div>
                  <div className="text-xs text-white font-medium">
                    {entry.description}
                  </div>
                  <div className="text-[10px] text-purple-500">
                    第{entry.day}天 · {entry.category}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${
                  entry.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {entry.type === 'income' ? '+' : '-'}
                {entry.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
