import React from 'react';
import { CandleHeartIcon } from '../common/CandleHeartIcon';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogIn }) => {
  return (
    <div className="relative flex flex-col justify-between min-h-screen p-6 bg-[#11101A] overflow-hidden text-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#BBA2FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#F5A8D0]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top subtle badge */}
      <div className="pt-8 relative z-10 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B1927] border border-[#2B273C] text-xs text-[#AAA5B8]">
          <Sparkles size={12} className="text-[#BBA2FF]" />
          <span>Two people. One private space.</span>
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="flex flex-col items-center justify-center my-auto relative z-10 py-10">
        <div className="mb-6">
          <CandleHeartIcon size={76} glow={true} />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[#F8F6FC] mb-2 font-sans">
          Glow
        </h1>
        
        <p className="text-lg text-[#AAA5B8] font-normal max-w-[260px] mx-auto leading-relaxed">
          A little space, just for us.
        </p>

        {/* Feature Pill highlights */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xs text-xs text-[#8F8A9E]">
          <span className="px-2.5 py-1 bg-[#1B1927]/80 rounded-md border border-[#272336]">Doodles</span>
          <span className="px-2.5 py-1 bg-[#1B1927]/80 rounded-md border border-[#272336]">10s Walkie-Talkie</span>
          <span className="px-2.5 py-1 bg-[#1B1927]/80 rounded-md border border-[#272336]">Live Widgets</span>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="pb-8 space-y-3 relative z-10 w-full max-w-xs mx-auto">
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#BBA2FF] to-[#D5C2FF] text-[#11101A] font-semibold text-base shadow-lg shadow-[#BBA2FF]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={onLogIn}
          className="w-full py-3 px-6 text-[#AAA5B8] hover:text-[#F8F6FC] text-sm font-medium transition-colors"
        >
          Already have an account? <span className="text-[#BBA2FF] font-semibold">Log in</span>
        </button>
      </div>
    </div>
  );
};
