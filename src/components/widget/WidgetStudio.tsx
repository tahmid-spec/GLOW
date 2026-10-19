import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Copy, 
  Save,
  Radio,
  Mic,
  Volume2
} from 'lucide-react';
import { UserProfile, PrivatePair, WidgetTheme, WidgetPreferences, DoodleItem, VoiceMessageItem } from '../../types';
import { storage } from '../../services/storage';
import { CandleHomeWidget } from './CandleHomeWidget';
import confetti from 'canvas-confetti';

interface WidgetStudioProps {
  currentUser: UserProfile;
  partner: UserProfile;
  pair: PrivatePair;
  doodles: DoodleItem[];
  onBack: () => void;
}

const THEME_OPTIONS: { id: WidgetTheme; name: string; bgClass: string; borderClass: string; textClass: string; previewColor: string }[] = [
  { 
    id: 'midnight', 
    name: 'Midnight', 
    bgClass: 'bg-[#151320]', 
    borderClass: 'border-[#28233C]',
    textClass: 'text-[#F8F6FC]',
    previewColor: '#1B1927'
  },
  { 
    id: 'pastel', 
    name: 'Pastel', 
    bgClass: 'bg-gradient-to-br from-[#FDE2ED] to-[#FCE7F3]', 
    borderClass: 'border-[#F9A8D4]',
    textClass: 'text-[#4A154B]',
    previewColor: '#FBCFE8'
  },
  { 
    id: 'lavender', 
    name: 'Lavender', 
    bgClass: 'bg-gradient-to-br from-[#2D214D] to-[#1E1738]', 
    borderClass: 'border-[#5B478E]',
    textClass: 'text-[#F5F3FF]',
    previewColor: '#A78BFA'
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    bgClass: 'bg-gradient-to-br from-[#4A1E2E] to-[#2B1829]', 
    borderClass: 'border-[#7E3B57]',
    textClass: 'text-[#FFF1F2]',
    previewColor: '#FB7185'
  }
];

export const WidgetStudio: React.FC<WidgetStudioProps> = ({
  currentUser,
  partner,
  pair,
  doodles,
  onBack
}) => {
  const [preferences, setPreferences] = useState<WidgetPreferences>(
    pair.widgetPreferences || {
      theme: 'midnight',
      customNote: 'miss you',
      hidePersonalContent: false,
      showTimestamp: true,
      showWalkieTalkie: true
    }
  );

  const [activeTab, setActiveTab] = useState<'studio' | 'simulate'>('studio');
  const [savedToast, setSavedToast] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const voiceMessages = storage.getVoiceMessages(pair.id);
  const latestVoiceNote = voiceMessages[0];
  const latestDoodle = doodles[0];

  const handleSave = () => {
    storage.updateWidgetPreferences(pair.id, preferences);
    setSavedToast(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#BBA2FF', '#F5A8D0', '#79E6DF']
    });
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCopyWidgetUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-12 overflow-x-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#171523]/90 backdrop-blur-md border-b border-[#242132]/60 z-20 sticky top-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Studio / Phone Preview Toggle */}
        <div className="flex items-center p-1 bg-[#1B1927] border border-[#272336] rounded-full">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'studio' ? 'bg-[#BBA2FF] text-[#11101A]' : 'text-[#AAA5B8]'
            }`}
          >
            Widget Studio
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'simulate' ? 'bg-[#BBA2FF] text-[#11101A]' : 'text-[#AAA5B8]'
            }`}
          >
            Home Screen
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-10 h-10 rounded-full bg-[#BBA2FF] text-[#11101A] flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#BBA2FF]/20"
          title="Save preferences"
        >
          <Check size={18} />
        </button>
      </div>

      {activeTab === 'studio' ? (
        <div className="p-5 max-w-sm mx-auto w-full">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-[#F8F6FC]">Widget Studio</h2>
            <p className="text-xs text-[#AAA5B8]">Customize your compact walkie-talkie home screen widget.</p>
          </div>

          {/* Live Interactive Widget Card with Built-in Walkie Talkie */}
          <div className="mb-6 flex justify-center">
            <div className="w-80">
              <CandleHomeWidget
                currentUser={currentUser}
                partner={partner}
                pair={pair}
                latestVoiceNote={latestVoiceNote}
                latestDoodle={latestDoodle}
                preferences={preferences}
                interactive={true}
              />
            </div>
          </div>

          {/* Theme Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#AAA5B8] uppercase tracking-wider mb-2.5">
              Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = preferences.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setPreferences({ ...preferences, theme: theme.id })}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#BBA2FF] bg-[#221D35] ring-2 ring-[#BBA2FF]/40'
                        : 'border-[#272336] bg-[#1B1927] hover:border-[#3E3854]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl mb-1 shadow-sm border border-white/10"
                      style={{ backgroundColor: theme.previewColor }}
                    />
                    <span className="text-[11px] font-medium text-[#F8F6FC]">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#AAA5B8] uppercase tracking-wider mb-2">
              Widget Message
            </label>
            <input
              type="text"
              value={preferences.customNote}
              onChange={(e) => setPreferences({ ...preferences, customNote: e.target.value })}
              placeholder="e.g. miss you, thinking of you"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl bg-[#1B1927] border border-[#272336] text-[#F8F6FC] placeholder-[#5A556B] focus:outline-none focus:border-[#BBA2FF] transition-colors text-sm"
            />
          </div>

          {/* Features & Options: Walkie Talkie, Privacy, Timestamp */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B1927] border border-[#272336]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#27203A] text-[#BBA2FF] flex items-center justify-center">
                  <Radio size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F8F6FC]">Compact Walkie-Talkie Bar</h4>
                  <p className="text-[11px] text-[#AAA5B8]">Listen and hold mic to send 10s voice notes directly</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.showWalkieTalkie !== false}
                onChange={(e) => setPreferences({ ...preferences, showWalkieTalkie: e.target.checked })}
                className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B1927] border border-[#272336]">
              <div>
                <h4 className="text-xs font-semibold text-[#F8F6FC]">Hide personal content</h4>
                <p className="text-[11px] text-[#AAA5B8]">Only show Candle icon when locked</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.hidePersonalContent}
                onChange={(e) => setPreferences({ ...preferences, hidePersonalContent: e.target.checked })}
                className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B1927] border border-[#272336]">
              <div>
                <h4 className="text-xs font-semibold text-[#F8F6FC]">Show timestamp</h4>
                <p className="text-[11px] text-[#AAA5B8]">Display last active time on widget</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showTimestamp}
                onChange={(e) => setPreferences({ ...preferences, showTimestamp: e.target.checked })}
                className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-[#BBA2FF] text-[#11101A] font-semibold text-sm shadow-lg shadow-[#BBA2FF]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>Save Widget Configuration</span>
          </button>
        </div>
      ) : (
        /* Phone Home Screen Simulator matching Mockup Screen 9 */
        <div className="p-5 max-w-sm mx-auto w-full">
          <div className="mb-4 text-center">
            <h2 className="text-base font-bold text-[#F8F6FC]">Interactive Home Screen Widget</h2>
            <p className="text-xs text-[#AAA5B8]">Test listening and recording right on your phone's home screen widget!</p>
          </div>

          {/* Phone Frame */}
          <div className="relative mx-auto w-72 h-[490px] rounded-[44px] border-[6px] border-[#2E2840] bg-gradient-to-b from-[#1C1A38] via-[#482846] to-[#8C4656] shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="w-24 h-5 rounded-full bg-black mx-auto mb-2 flex items-center justify-between px-2 text-[9px] text-[#AAA5B8]">
              <span>9:41</span>
              <span className="w-2 h-2 rounded-full bg-[#11101A] ring-1 ring-white/20" />
            </div>

            {/* Candle Home Widget placed on home screen */}
            <div className="my-auto">
              <CandleHomeWidget
                currentUser={currentUser}
                partner={partner}
                pair={pair}
                latestVoiceNote={latestVoiceNote}
                latestDoodle={latestDoodle}
                preferences={preferences}
                interactive={true}
                size="compact"
              />
            </div>

            {/* App Dock at bottom */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2.5 flex items-center justify-around">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-sm">
                📞
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                🧭
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                💬
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center text-white shadow-sm">
                📷
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 rounded-full bg-white/60 mx-auto mt-2" />
          </div>

          {/* Quick Install info */}
          <div className="mt-5 p-4 rounded-2xl bg-[#1B1927] border border-[#272336] text-xs space-y-2.5">
            <h4 className="font-bold text-[#F8F6FC] flex items-center gap-2">
              <Smartphone size={15} className="text-[#BBA2FF]" />
              Native Walkie-Talkie Widget
            </h4>
            <p className="text-[#AAA5B8] leading-relaxed">
              Tapping play or holding the microphone on the widget lets you communicate instantly with {partner.displayName} without opening the full app.
            </p>

            <button
              onClick={handleCopyWidgetUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-[#242132] text-[#AAA5B8] hover:text-[#F8F6FC] flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Copy size={13} />
              <span>{copiedCode ? 'Synced Link Copied!' : 'Copy Synced Widget URL'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
