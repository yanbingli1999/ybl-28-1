import { useGameStore } from '@/store/gameStore';
import { FileText, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getTotalInventoryQuantity } from '@/utils/gameLogic';

export function ContractPanel() {
  const { contracts, merchants, crops, inventory, fulfillContract } = useGameStore();

  const activeContracts = contracts.filter((c) => !c.fulfilled && !c.defaulted);
  const historyContracts = contracts.filter((c) => c.fulfilled || c.defaulted).slice(0, 5);

  const canFulfill = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return false;
    const available = getTotalInventoryQuantity(inventory, contract.cropId);
    return available >= contract.quantity;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-yellow-400">合同</h2>
        <span className="ml-auto text-sm text-purple-400">
          {activeContracts.length} 个待履约
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {activeContracts.length === 0 && historyContracts.length === 0 ? (
          <div className="text-center py-8 text-purple-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无合同</p>
            <p className="text-xs">与商人谈判成功后会签订合同</p>
          </div>
        ) : (
          <>
            {activeContracts.map((contract) => {
              const merchant = merchants.find((m) => m.id === contract.merchantId);
              const crop = crops.find((c) => c.id === contract.cropId);
              const canDeliver = canFulfill(contract.id);

              return (
                <div
                  key={contract.id}
                  className="p-3 bg-purple-950/50 rounded-lg border border-purple-700/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{merchant?.emoji || '👽'}</span>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {merchant?.name || '未知商人'}
                        </div>
                        <div className="text-xs text-purple-400">
                          {crop?.emoji} {crop?.name} x{contract.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">
                        {contract.agreedPrice} 💰
                      </div>
                      <div
                        className={`text-xs flex items-center gap-1 justify-end ${
                          contract.daysLeft <= 1 ? 'text-red-400' : 'text-purple-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {contract.daysLeft} 天
                      </div>
                    </div>
                  </div>

                  <div className="h-1.5 bg-purple-900/60 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all ${
                        contract.daysLeft <= 1
                          ? 'bg-red-500'
                          : contract.daysLeft <= 2
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(contract.daysLeft / 3) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => fulfillContract(contract.id)}
                    disabled={!canDeliver}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      canDeliver
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canDeliver ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        交付履约
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        库存不足
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            {historyContracts.length > 0 && (
              <>
                <div className="text-xs text-purple-500 pt-2 border-t border-purple-700/30 mt-2">
                  历史记录
                </div>
                {historyContracts.map((contract) => {
                  const merchant = merchants.find((m) => m.id === contract.merchantId);
                  const crop = crops.find((c) => c.id === contract.cropId);

                  return (
                    <div
                      key={contract.id}
                      className={`p-2 rounded-lg border text-sm flex items-center justify-between ${
                        contract.fulfilled
                          ? 'bg-green-900/20 border-green-700/30'
                          : 'bg-red-900/20 border-red-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {contract.fulfilled ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-purple-300">
                          {merchant?.name} - {crop?.name}
                        </span>
                      </div>
                      <span
                        className={
                          contract.fulfilled ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {contract.fulfilled ? '已完成' : '已违约'}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
