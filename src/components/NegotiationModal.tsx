import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { PERSONALITY_INFO } from '@/constants/gameData';
import { getMerchantDialogue, willMerchantAccept } from '@/utils/negotiationAI';
import { getAverageInventoryQuality } from '@/utils/gameLogic';

export function NegotiationModal() {
  const {
    negotiation,
    merchants,
    crops,
    inventory,
    playerBid,
    acceptOffer,
    endNegotiation,
  } = useGameStore();

  const [bidAmount, setBidAmount] = useState(0);
  const [merchantMessage, setMerchantMessage] = useState('');
  const [showRejection, setShowRejection] = useState(false);

  const merchant = merchants.find((m) => m.id === negotiation.merchantId);
  const crop = crops.find((c) => c.id === negotiation.cropId);
  const personalityInfo = merchant ? PERSONALITY_INFO[merchant.personality] : null;
  const quality = crop ? getAverageInventoryQuality(inventory, crop.id) : 50;

  useEffect(() => {
    if (negotiation.active && negotiation.lastOfferFrom === 'merchant') {
      const situation = negotiation.currentRound === 1 ? 'greeting' : 'counter';
      setMerchantMessage(getMerchantDialogue(merchant?.personality || 'friendly', situation));
    }
  }, [negotiation.currentRound, negotiation.lastOfferFrom, negotiation.active, merchant?.personality]);

  useEffect(() => {
    if (negotiation.active) {
      const basePrice = (crop?.basePrice || 0) * negotiation.quantity;
      setBidAmount(Math.round(basePrice * 0.8));
    }
  }, [negotiation.active, crop, negotiation.quantity]);

  if (!negotiation.active || !merchant || !crop) return null;

  const currentMerchantOffer = negotiation.merchantOffer;
  const isLastRound = negotiation.currentRound >= negotiation.maxRounds;

  const handleBid = () => {
    if (bidAmount <= 0) return;

    const willAccept = willMerchantAccept(
      merchant,
      crop,
      negotiation.quantity,
      quality,
      bidAmount,
      negotiation.currentRound,
      negotiation.maxRounds
    );

    if (isLastRound && !willAccept) {
      setShowRejection(true);
      setMerchantMessage(getMerchantDialogue(merchant.personality, 'reject'));
      return;
    }

    playerBid(bidAmount);
  };

  const handleAccept = () => {
    acceptOffer();
  };

  const handleLeave = () => {
    endNegotiation();
  };

  const unitPrice = negotiation.lastOfferFrom === 'merchant'
    ? Math.round(currentMerchantOffer / negotiation.quantity)
    : Math.round(negotiation.playerOffer / negotiation.quantity);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-purple-900/50">
        <div className="bg-purple-800/50 px-6 py-4 flex items-center justify-between border-b border-purple-600/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{merchant.emoji}</span>
            <div>
              <h3 className="text-lg font-bold text-white">{merchant.name}</h3>
              <span className={`text-sm ${personalityInfo?.color}`}>
                {personalityInfo?.label}
              </span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="text-purple-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-purple-300 text-sm">
              谈判轮次
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: negotiation.maxRounds }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full transition-all ${
                    i < negotiation.currentRound
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : 'bg-purple-800/60'
                  }`}
                />
              ))}
              <span className="text-white font-bold ml-2">
                {negotiation.currentRound}/{negotiation.maxRounds}
              </span>
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-xl p-4 mb-4 border border-purple-700/30">
            <div className="flex items-center justify-between text-sm text-purple-300 mb-2">
              <span>交易作物</span>
              <span className="text-white font-medium">
                {crop.emoji} {crop.name} x{negotiation.quantity}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-purple-300">
              <span>品质等级</span>
              <span className={`font-medium ${
                quality >= 70 ? 'text-green-400' : quality >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(quality)}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {negotiation.lastOfferFrom === 'merchant' && (
              <div className="flex items-start gap-3">
                <div className="text-2xl">{merchant.emoji}</div>
                <div className="flex-1">
                  <div className="bg-purple-800/60 rounded-2xl rounded-tl-none px-4 py-3 border border-purple-600/30">
                    <p className="text-purple-200 text-sm mb-2">{merchantMessage}</p>
                    <div className="text-yellow-400 font-bold text-lg">
                      出价: {currentMerchantOffer} 💰
                      <span className="text-xs text-purple-400 font-normal ml-2">
                        ({unitPrice}/个)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {negotiation.playerOffer > 0 && (
              <div className="flex items-start gap-3 justify-end">
                <div className="flex-1">
                  <div className="bg-green-800/40 rounded-2xl rounded-tr-none px-4 py-3 border border-green-600/30 ml-auto">
                    <p className="text-green-200 text-sm mb-1">我方出价</p>
                    <div className="text-green-400 font-bold text-lg">
                      {negotiation.playerOffer} 💰
                    </div>
                  </div>
                </div>
                <div className="text-2xl">🧑‍🌾</div>
              </div>
            )}

            {showRejection && (
              <div className="flex items-start gap-3">
                <div className="text-2xl">{merchant.emoji}</div>
                <div className="bg-red-900/40 rounded-2xl rounded-tl-none px-4 py-3 border border-red-600/30">
                  <p className="text-red-300 text-sm font-medium">{merchantMessage}</p>
                  <p className="text-red-400 text-xs mt-1">谈判破裂，商人愤怒离去...</p>
                </div>
              </div>
            )}
          </div>

          {!showRejection && (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-purple-300 block mb-2">你的出价</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-purple-950/50 border border-purple-600/40 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-yellow-400 text-xl">💰</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={negotiation.lastOfferFrom !== 'merchant' || currentMerchantOffer <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  接受报价
                </button>

                <button
                  onClick={handleBid}
                  disabled={isLastRound}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  还价
                </button>
              </div>

              {isLastRound && (
                <p className="text-center text-orange-400 text-sm">
                  ⚠️ 最后一轮！请谨慎出价，可能会谈判破裂
                </p>
              )}
            </div>
          )}

          {showRejection && (
            <button
              onClick={handleLeave}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              离开谈判
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
