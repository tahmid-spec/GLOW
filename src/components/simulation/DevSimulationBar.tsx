import React from 'react';
import { ArrowLeftRight, Smartphone, RefreshCw, SplitSquareVertical, UserCheck } from 'lucide-react';
import { storage, DEFAULT_USERS } from '../../services/storage';

interface DevSimulationBarProps {
  currentUserId: string;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onResetDemo: () => void;
}

export const DevSimulationBar: React.FC<DevSimulationBarProps> = ({
  currentUserId,
  isSplitView,
  onToggleSplitView,
  onResetDemo
}) => {
  const users = storage.getUsers();
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const otherUser = users.find((u) => u.id !== currentUserId) || users[1];

  const handleSwitchUser = () => {
    if (otherUser) {
      storage.setCurrentUserId(otherUser.id);
    }
  };

  return (
    <div className="bg-[#151322] border-b border-[#242036] px-4 py-2 flex items-center justify-between text-xs text-[#AAA5B8] z-50">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#79E6DF] animate-pulse" />
        <span className="text-[11px] font-bold text-[#F8F6FC] tracking-wide">GLOW</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#221D38] text-[#BBA2FF] border border-[#352D54]">
          Two-Person Space
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Switch Persona button */}
        <button
          onClick={handleSwitchUser}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E1A30] hover:bg-[#282342] text-[#F8F6FC] border border-[#2D2747] transition-all"
          title="Switch view between Tahmid and Rafi"
        >
          <span className="text-sm">{currentUser.avatar}</span>
          <span className="font-semibold text-[11px]">{currentUser.displayName}</span>
          <ArrowLeftRight size={12} className="text-[#BBA2FF]" />
          <span className="text-sm">{otherUser?.avatar}</span>
        </button>

        {/* Jump to Main Screen button */}
        <button
          onClick={() => storage.connectDefaultPair()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#272138] hover:bg-[#342C4C] text-[#BBA2FF] border border-[#413660] transition-all"
          title="Jump directly to Our Candle main screen"
        >
          <span className="text-[11px] font-semibold">🏠 Main Screen</span>
        </button>

        {/* Dual Phone Split View Toggle */}
        <button
          onClick={onToggleSplitView}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
            isSplitView
              ? 'bg-[#BBA2FF] text-[#11101A] border-[#BBA2FF] font-semibold'
              : 'bg-[#1E1A30] text-[#AAA5B8] hover:text-[#F8F6FC] border-[#2D2747]'
          }`}
          title="Toggle side-by-side view of both phones"
        >
          <SplitSquareVertical size={13} />
          <span className="text-[11px] hidden sm:inline">Split 2 Phones</span>
        </button>

        {/* Reset Demo button */}
        <button
          onClick={onResetDemo}
          className="p-1 rounded-lg hover:bg-[#1E1A30] text-[#7D788E] hover:text-[#AAA5B8] transition-colors"
          title="Reset demo data"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
};
