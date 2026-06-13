import { GameHeader } from '@/components/GameHeader';
import { FarmPanel } from '@/components/FarmPanel';
import { InventoryPanel } from '@/components/InventoryPanel';
import { MerchantPanel } from '@/components/MerchantPanel';
import { ContractPanel } from '@/components/ContractPanel';
import { LedgerPanel } from '@/components/LedgerPanel';
import { ConfigPanel } from '@/components/ConfigPanel';
import { NegotiationModal } from '@/components/NegotiationModal';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <GameHeader />

        <main className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <FarmPanel />
              <InventoryPanel />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <MerchantPanel />
              <ContractPanel />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <LedgerPanel />
              <ConfigPanel />
            </div>
          </div>

          <div className="mt-6 text-center text-purple-500 text-xs">
            <p>🌌 外星农场 · 种植 · 谈判 · 经营</p>
          </div>
        </main>
      </div>

      <NegotiationModal />
    </div>
  );
}
