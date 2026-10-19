import React, { useState } from 'react';
import { Settings, SquarePen, Mic, Play, Pause, Sparkles, ChevronRight, LayoutGrid, Clock, Radio } from 'lucide-react';
import { UserProfile, PrivatePair, DoodleItem, VoiceMessageItem } from '../../types';
import { audioService } from '../../services/audio';
import { storage } from '../../services/storage';
import { CandleHomeWidget } from '../widget/CandleHomeWidget';

interface HomeScreenProps {
  currentUser: UserProfile;
  partner: UserProfile;
  pair: PrivatePair;
  doodles: DoodleItem[];
  voiceMessages: VoiceMessageItem[];
  onOpenCanvas: () => void;
  onOpenVoice: () => void;
  onOpenWidgetStudio: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  partner,
  pair,
  doodles,
  voiceMessages,
  onOpenCanvas,
  onOpenVoice,
  onOpenWidgetStudio,
  onOpenProfile
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<{ [id: string]: number }>({});

  const latestDoodle = doodles[0];
  const latestVoiceNote = voiceMessages[0];

  const handleTogglePlayVoice = (msg: VoiceMessageItem) => {
    if (playingVoiceId === msg.id) {
      audioService.stopPlayback();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(msg.id);
    storage.markVoiceMessageListened(msg.id);

    audioService.playAudio(
      msg.audioUrl,
      (progress) => {
        setVoiceProgress((prev) => ({ ...prev, [msg.id]: progress }));
      },
      () => {
        setPlayingVoiceId(null);
        setVoiceProgress((prev) => ({ ...prev, [msg.id]: 0 }));
      }
    );
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-4 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#1B1927] border-2 border-[#2B273C] flex items-center justify-center text-xl shadow-sm">
              {partner.avatar}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#79E6DF] rounded-full ring-2 ring-[#11101A]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#F8F6FC]">Our Glow</h2>
              <span className="text-[#F5A8D0] text-xs">♡</span>
            </div>
            <p className="text-[11px] text-[#AAA5B8]">You and {partner.displayName}</p>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* ALL-IN-ONE HOME SCREEN WIDGET: Compact Canvas AND Walkie-Talkie Voice Notes */}
      <div className="mb-3.5">
        <CandleHomeWidget
          currentUser={currentUser}
          partner={partner}
          pair={pair}
          latestVoiceNote={latestVoiceNote}
          latestDoodle={latestDoodle}
          onOpenCanvas={onOpenCanvas}
          onOpenVoice={onOpenVoice}
          interactive={true}
          size="medium"
        />
      </div>

      {/* Quick Action Navigation Buttons (Draw / Voice) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onOpenCanvas}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#1B1927] border border-[#272336] hover:border-[#BBA2FF]/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#28223B] text-[#BBA2FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <SquarePen size={20} />
          </div>
          <span className="text-sm font-bold text-[#F8F6FC]">Draw</span>
          <span className="text-xs text-[#AAA5B8]">For each other</span>
        </button>

        <button
          onClick={onOpenVoice}
          className="flex flex-col items-start p-4 rounded-2xl bg-[#1B1927] border border-[#272336] hover:border-[#F5A8D0]/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2E2033] text-[#F5A8D0] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Mic size={20} />
          </div>
          <span className="text-sm font-bold text-[#F8F6FC]">Voice</span>
          <span className="text-xs text-[#AAA5B8]">10 sec max</span>
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#F8F6FC]">Recent activity</h3>
          <span className="text-xs text-[#7D788E]">Shared timeline</span>
        </div>

        <div className="space-y-3">
          {/* Voice Note Activity Card */}
          {voiceMessages.slice(0, 2).map((msg) => {
            const isPlaying = playingVoiceId === msg.id;
            const progress = voiceProgress[msg.id] || 0;
            const isSender = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#151320] flex items-center justify-center text-lg shrink-0">
                  {msg.senderAvatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#F8F6FC]">
                      {isSender ? 'You sent a voice note' : `${msg.senderName} sent a voice note`}
                    </span>
                    <span className="text-[11px] text-[#7D788E]">{formatTimeAgo(msg.createdAt)}</span>
                  </div>

                  {/* Audio Waveform Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePlayVoice(msg)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isPlaying ? 'bg-[#F5A8D0] text-[#11101A]' : 'bg-[#29243A] text-[#BBA2FF] hover:bg-[#342E4A]'
                      }`}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                    </button>

                    {/* Waveform Visualization */}
                    <div className="flex-1 flex items-center gap-[3px] h-6 px-1">
                      {msg.waveform.slice(0, 18).map((amp, idx) => {
                        const barProgress = idx / 18;
                        const isFilled = isPlaying && barProgress <= progress;
                        return (
                          <div
                            key={idx}
                            className={`w-[3px] rounded-full transition-all duration-150 ${
                              isFilled ? 'bg-[#BBA2FF]' : 'bg-[#2F2A42]'
                            }`}
                            style={{ height: `${Math.max(4, amp * 20)}px` }}
                          />
                        );
                      })}
                    </div>

                    <span className="text-[11px] font-mono text-[#AAA5B8] shrink-0">
                      0:0{Math.floor(msg.duration)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Doodle Activity Card */}
          {doodles.slice(0, 2).map((d) => {
            const isMe = d.authorId === currentUser.id;
            return (
              <div
                key={d.id}
                onClick={onOpenCanvas}
                className="p-3.5 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38334E] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#151320] flex items-center justify-center text-lg shrink-0">
                    {d.authorAvatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F8F6FC]">
                      {isMe ? 'You drew a doodle' : `${d.authorName} drew a doodle`}
                    </h4>
                    <p className="text-[11px] text-[#7D788E]">{formatTimeAgo(d.createdAt)}</p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#151320] border border-[#272336] flex items-center justify-center text-[#F5A8D0]">
                  <span className="text-sm font-bold">♡</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widget Studio Entry Point */}
      <div
        onClick={onOpenWidgetStudio}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#1E1A2C] to-[#171524] border border-[#2B273C] hover:border-[#BBA2FF]/50 cursor-pointer transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#28223B] text-[#BBA2FF] flex items-center justify-center">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F8F6FC]">Widget Studio</h4>
            <p className="text-[11px] text-[#AAA5B8]">Customize themes, canvas & walkie-talkie widget</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#7D788E] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
