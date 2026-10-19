import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, SquarePen, Sparkles, Check, ChevronRight, Clock, Volume2 } from 'lucide-react';
import { UserProfile, PrivatePair, WidgetTheme, WidgetPreferences, VoiceMessageItem, DoodleItem } from '../../types';
import { audioService } from '../../services/audio';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';

interface CandleHomeWidgetProps {
  currentUser: UserProfile;
  partner: UserProfile;
  pair: PrivatePair;
  latestVoiceNote?: VoiceMessageItem;
  latestDoodle?: DoodleItem;
  preferences?: WidgetPreferences;
  onOpenCanvas?: () => void;
  onOpenVoice?: () => void;
  size?: 'medium' | 'large' | 'compact';
  interactive?: boolean;
}

const THEME_STYLES: Record<WidgetTheme, {
  bg: string;
  border: string;
  text: string;
  subtext: string;
  accent: string;
  barBg: string;
  activeBar: string;
  pillBg: string;
  cardBg: string;
}> = {
  midnight: {
    bg: 'bg-[#151320]',
    border: 'border-[#28233C]',
    text: 'text-[#F8F6FC]',
    subtext: 'text-[#AAA5B8]',
    accent: '#BBA2FF',
    barBg: 'bg-[#2E2840]',
    activeBar: 'bg-[#BBA2FF]',
    pillBg: 'bg-[#201C30]',
    cardBg: 'bg-[#1B182B]/90'
  },
  pastel: {
    bg: 'bg-gradient-to-br from-[#FFF0F5] to-[#FCE7F3]',
    border: 'border-[#F9A8D4]',
    text: 'text-[#4A154B]',
    subtext: 'text-[#831843]',
    accent: '#DB2777',
    barBg: 'bg-[#FBCFE8]',
    activeBar: 'bg-[#BE185D]',
    pillBg: 'bg-white/80',
    cardBg: 'bg-white/85'
  },
  lavender: {
    bg: 'bg-gradient-to-br from-[#2D214D] to-[#1E1738]',
    border: 'border-[#5B478E]',
    text: 'text-[#F5F3FF]',
    subtext: 'text-[#DDD6FE]',
    accent: '#A78BFA',
    barBg: 'bg-[#3F3166]',
    activeBar: 'bg-[#C4B5FD]',
    pillBg: 'bg-[#382B5E]',
    cardBg: 'bg-[#271E42]/90'
  },
  sunset: {
    bg: 'bg-gradient-to-br from-[#4A1E2E] to-[#2B1829]',
    border: 'border-[#7E3B57]',
    text: 'text-[#FFF1F2]',
    subtext: 'text-[#FECDD3]',
    accent: '#FB7185',
    barBg: 'bg-[#5B293C]',
    activeBar: 'bg-[#FDA4AF]',
    pillBg: 'bg-[#3D1A27]',
    cardBg: 'bg-[#351624]/90'
  }
};

export const CandleHomeWidget: React.FC<CandleHomeWidgetProps> = ({
  currentUser,
  partner,
  pair,
  latestVoiceNote,
  latestDoodle,
  preferences,
  onOpenCanvas,
  onOpenVoice,
  size = 'medium',
  interactive = true
}) => {
  const prefs = preferences || pair.widgetPreferences || {
    theme: 'midnight',
    customNote: 'miss you',
    hidePersonalContent: false,
    showTimestamp: true,
    showWalkieTalkie: true
  };

  const themeStyle = THEME_STYLES[prefs.theme] || THEME_STYLES.midnight;

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  // Widget Walkie-Talkie recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [justSent, setJustSent] = useState(false);
  const recordTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      audioService.stopPlayback();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;

    if (isPlaying) {
      audioService.stopPlayback();
      setIsPlaying(false);
      return;
    }

    if (latestVoiceNote) {
      setIsPlaying(true);
      storage.markVoiceMessageListened(latestVoiceNote.id);
      audioService.playAudio(
        latestVoiceNote.audioUrl,
        (progress) => {
          setPlayProgress(progress);
        },
        () => {
          setIsPlaying(false);
          setPlayProgress(0);
        }
      );
    } else {
      setIsPlaying(true);
      audioService.playAudio(
        '',
        (p) => setPlayProgress(p),
        () => {
          setIsPlaying(false);
          setPlayProgress(0);
        }
      );
    }
  };

  const startWidgetRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!interactive) return;

    setIsRecording(true);
    setRecordSec(0);
    recordTimerRef.current = setInterval(() => {
      setRecordSec((s) => {
        if (s >= 10) {
          stopWidgetRecording();
          return 10;
        }
        return s + 0.2;
      });
    }, 200);

    await audioService.startRecording(
      () => {},
      () => stopWidgetRecording()
    );
  };

  const stopWidgetRecording = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!isRecording) return;

    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }

    const res = await audioService.stopRecording();
    if (res.duration >= 0.5) {
      storage.addVoiceMessage({
        pairId: pair.id,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderAvatar: currentUser.avatar,
        duration: res.duration,
        audioUrl: res.audioUrl,
        waveform: res.waveform
      });

      setJustSent(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#BBA2FF', '#F5A8D0', '#79E6DF']
      });
      setTimeout(() => setJustSent(false), 2200);
    }
  };

  const waveformBars = latestVoiceNote?.waveform?.slice(0, 12) || [0.25, 0.55, 0.9, 0.45, 0.8, 0.6, 0.4, 0.75, 0.6, 0.8, 0.5, 0.35];

  return (
    <div
      className={`w-full rounded-2xl sm:rounded-[22px] p-3 border-2 relative overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 select-none ${themeStyle.bg} ${themeStyle.border}`}
    >
      {/* 1. COMPACT TOP HEADER */}
      <div className="flex items-center justify-between relative z-10 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="text-[#F5A8D0] shrink-0">
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path
                d="M 20 34 C 18 32, 6 22, 6 14 C 6 8, 10 5, 15 6 C 18 7, 20 9, 20 9 C 20 9, 22 7, 25 6 C 30 5, 34 8, 34 14 C 34 22, 22 32, 20 34 Z"
                stroke={prefs.theme === 'pastel' ? '#BE185D' : '#F5A8D0'}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h4 className={`text-[11px] font-bold leading-none flex items-center gap-1 ${themeStyle.text}`}>
            <span>Glow</span>
            <span className="opacity-40">·</span>
            <span className="opacity-75 font-normal truncate max-w-[110px] sm:max-w-[160px]">
              {prefs.hidePersonalContent ? 'Private' : prefs.customNote || 'miss you'}
            </span>
          </h4>
        </div>

        {/* Partner Avatar Pill with Live Dot */}
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${themeStyle.pillBg} ${themeStyle.text}`}>
          <span>{partner.avatar}</span>
          <span>{partner.displayName}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#79E6DF] animate-pulse" />
        </div>
      </div>

      {/* 2. COMPACT CANVAS & DRAW DISPLAY (HEIGHT ~76px) */}
      <div
        onClick={() => {
          if (interactive && onOpenCanvas) onOpenCanvas();
        }}
        className={`relative rounded-xl p-2.5 mb-2 cursor-pointer group hover:border-[#BBA2FF]/50 border border-white/5 active:scale-[0.99] transition-all overflow-hidden ${themeStyle.cardBg}`}
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#BBA2FF]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#BBA2FF]/15 transition-all" />

        {/* Compact Drawing Display */}
        <div className="relative h-16 flex items-center justify-center">
          <div className="absolute left-2 top-0 text-[#F5A8D0] animate-pulse" style={{ animationDuration: '3s' }}>
            <span className="text-xs">♡</span>
          </div>

          <div className="absolute right-3 top-0 text-[#79E6DF]">
            <Sparkles size={14} />
          </div>

          <div className="absolute left-3 bottom-0 text-[#FFE28A]">
            <span className="text-[10px]">☆</span>
          </div>

          <div className="absolute right-4 bottom-0 text-[#79E6DF]">
            <span className="text-[10px]">✦</span>
          </div>

          {/* Central artistic text */}
          <div className="text-center z-10 leading-tight">
            <p className={`text-base sm:text-lg font-bold font-sans tracking-wide ${themeStyle.text}`}>
              Better
            </p>
            <p className={`text-base sm:text-lg font-bold flex items-center justify-center gap-1 ${themeStyle.text}`}>
              together <span className="text-[#F5A8D0]">♡</span>
            </p>
          </div>
        </div>

        {/* Compact Action Banner inside Canvas */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
          <span className="text-[#AAA5B8] flex items-center gap-1">
            <Clock size={10} className="text-[#7D788E]" />
            <span>Shared Canvas</span>
          </span>

          <span className="text-[#BBA2FF] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <SquarePen size={11} />
            <span>Draw</span>
            <ChevronRight size={11} />
          </span>
        </div>
      </div>

      {/* 3. COMPACT ROW: "HOLD TO TALK" AND BESIDE THAT "LISTEN TO VOICE NOTE" (HEIGHT ~40px) */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {/* OPTION 1: HOLD TO TALK */}
        <div
          className={`rounded-xl p-2 border border-white/5 flex flex-col justify-center ${themeStyle.cardBg}`}
        >
          {isRecording ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF7D90] animate-ping" />
                <span className="text-[10px] font-mono font-bold text-[#FF7D90]">
                  0:0{Math.floor(recordSec)}/10s
                </span>
              </div>
              <button
                onMouseUp={stopWidgetRecording}
                onTouchEnd={stopWidgetRecording}
                className="px-2 py-0.5 rounded-lg bg-[#FF7D90] text-[#11101A] text-[9px] font-bold shadow active:scale-95 transition-all"
              >
                Send
              </button>
            </div>
          ) : justSent ? (
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#79E6DF]">
              <Check size={12} />
              <span>Sent!</span>
            </div>
          ) : (
            <button
              onMouseDown={startWidgetRecording}
              onMouseUp={stopWidgetRecording}
              onTouchStart={startWidgetRecording}
              onTouchEnd={stopWidgetRecording}
              className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#9B7BFF] to-[#F5A8D0] text-[#11101A] font-bold text-[11px] flex items-center justify-center gap-1 shadow active:scale-95 hover:opacity-95 transition-all"
              title="Hold to speak (10s max)"
            >
              <Mic size={13} />
              <span>Hold to Talk</span>
            </button>
          )}
        </div>

        {/* OPTION 2 (BESIDE IT): LISTEN TO VOICE NOTE */}
        <div
          className={`rounded-xl p-2 border border-white/5 flex items-center justify-between ${themeStyle.cardBg}`}
        >
          {/* Interactive Player: Play Button + Waveform + Duration */}
          <div
            onClick={handleTogglePlay}
            className="w-full flex items-center gap-1.5 cursor-pointer"
            title="Tap to listen"
          >
            <button
              onClick={handleTogglePlay}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 shadow ${
                isPlaying
                  ? 'bg-[#F5A8D0] text-[#11101A] scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-[#F8F6FC]'
              }`}
            >
              {isPlaying ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
            </button>

            {/* Audio Waveform */}
            <div className="flex-1 flex items-center gap-[1.5px] h-5">
              {waveformBars.map((amp, idx) => {
                const barProg = idx / waveformBars.length;
                const isBarActive = isPlaying && barProg <= playProgress;
                return (
                  <div
                    key={idx}
                    className={`w-[2px] rounded-full transition-all duration-150 ${
                      isBarActive ? themeStyle.activeBar : themeStyle.barBg
                    }`}
                    style={{ height: `${Math.max(3, amp * 14)}px` }}
                  />
                );
              })}
            </div>

            <span className={`text-[9px] font-mono shrink-0 opacity-70 ${themeStyle.text}`}>
              0:0{Math.floor(latestVoiceNote?.duration || 8)}
            </span>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-xl pointer-events-none opacity-20"
        style={{ backgroundColor: themeStyle.accent }}
      />
    </div>
  );
};
