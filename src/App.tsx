import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { PhoneAppInstance } from './components/PhoneAppInstance';
import { DevSimulationBar } from './components/simulation/DevSimulationBar';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.getCurrentUserId());
  const [isSplitView, setIsSplitView] = useState<boolean>(false);

  useEffect(() => {
    // Ensure default pair is active for immediate main screen testing
    storage.connectDefaultPair();

    const unsub = storage.subscribe(() => {
      setCurrentUserId(storage.getCurrentUserId());
    });
    return () => unsub();
  }, []);

  const handleResetDemo = () => {
    if (window.confirm('Reset Candle to default demo state?')) {
      storage.resetToDefault();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0912] flex flex-col items-center justify-start text-[#F8F6FC] font-sans">
      {/* Simulation & persona switcher bar */}
      <div className="w-full">
        <DevSimulationBar
          currentUserId={currentUserId}
          isSplitView={isSplitView}
          onToggleSplitView={() => setIsSplitView(!isSplitView)}
          onResetDemo={handleResetDemo}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {isSplitView ? (
          /* Dual Phone Split Screen for simultaneous two-person testing */
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-5xl py-2">
            {/* Phone 1: Tahmid */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-semibold text-[#AAA5B8] mb-2 flex items-center gap-1.5">
                <span>🐱</span>
                <span className="text-[#F8F6FC]">Tahmid's Phone</span>
              </div>
              <div className="w-[360px] sm:w-[390px] h-[780px] rounded-[48px] bg-[#11101A] border-[8px] border-[#252136] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                <PhoneAppInstance userId="user_tahmid" />
              </div>
            </div>

            {/* Phone 2: Rafi */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-semibold text-[#AAA5B8] mb-2 flex items-center gap-1.5">
                <span>🦊</span>
                <span className="text-[#F8F6FC]">Rafi's Phone</span>
              </div>
              <div className="w-[360px] sm:w-[390px] h-[780px] rounded-[48px] bg-[#11101A] border-[8px] border-[#252136] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                <PhoneAppInstance userId="user_rafi" />
              </div>
            </div>
          </div>
        ) : (
          /* Single Mobile View centered with responsive phone frame */
          <div className="w-full max-w-[420px] h-[840px] max-h-[96vh] rounded-[44px] bg-[#11101A] border-[6px] border-[#231F35] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <PhoneAppInstance userId={currentUserId} />
          </div>
        )}
      </main>
    </div>
  );
}
