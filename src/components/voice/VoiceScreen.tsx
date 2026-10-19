import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  Play, 
  Pause, 
  X, 
  Send, 
  Sparkles, 
  CheckCheck, 
  Clock,
  MoreVertical,
  Radio
} from 'lucide-react';
import { UserProfile, VoiceMessageItem } from '../../types';
import { audioService } from '../../services/audio';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';

interface VoiceScreenProps {
  currentUser: UserProfile;
  partner: UserProfile;
  pairId: string;
  onBack: () => void;
  initialMode?: 'record' | 'feed';
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  currentUser,
  partner,
  pairId,
  onBack,
  initialMode = 'feed'
}) => {
  const [viewMode, setViewMode] = useState<'record' | 'feed'>(initialMode);
  const [messages, setMessages] = useState<VoiceMessageItem[]>([]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveWaveform, setLiveWaveform] = useState<number[]>(new Array(20).fill(0.2));
  const [recordedDraft, setRecordedDraft] = useState<{
    duration: number;
    audioUrl: string;
    waveform: number[];
  } | null>(null);

  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<{ [id: string]: number }>({});

  const timerRef = useRef<any>(null);

  const loadMessages = () => {
    setMessages(storage.getVoiceMessages(pairId));
  };

  useEffect(() => {
    loadMessages();
    const unsub = storage.subscribe(loadMessages);
    return () => unsub();
  }, [pairId]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => {
          if (sec >= 10) {
            handleStopRecording();
            return 10;
          }
          return sec + 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    setRecordedDraft(null);
    setIsRecording(true);
    await audioService.startRecording(
      (amplitudes) => {
        setLiveWaveform(amplitudes);
      },
      () => {
        // Enforce 10s maximum limit
        handleStopRecording();
      }
    );
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    const result = await audioService.stopRecording();
    setRecordedDraft(result);
  };

  const handleCancelRecording = () => {
    audioService.cancelRecording();
    setIsRecording(false);
    setRecordedDraft(null);
    setRecordSeconds(0);
    setViewMode('feed');
  };

  const handleSendVoiceNote = () => {
    if (!recordedDraft) return;

    audioService.playWalkieTalkieChirp('send');

    storage.addVoiceMessage({
      pairId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      duration: recordedDraft.duration,
      audioUrl: recordedDraft.audioUrl,
      waveform: recordedDraft.waveform
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#F5A8D0', '#BBA2FF', '#79E6DF']
    });

    setRecordedDraft(null);
    setRecordSeconds(0);
    setViewMode('feed');
  };

  const handleTogglePlay = (msg: VoiceMessageItem) => {
    if (playingId === msg.id) {
      audioService.stopPlayback();
      setPlayingId(null);
      return;
    }

    setPlayingId(msg.id);
    storage.markVoiceMessageListened(msg.id);

    audioService.playAudio(
      msg.audioUrl,
      (progress) => {
        setPlaybackProgress((prev) => ({ ...prev, [msg.id]: progress }));
      },
      () => {
        setPlayingId(null);
        setPlaybackProgress((prev) => ({ ...prev, [msg.id]: 0 }));
      }
    );
  };

  const formatSec = (s: number) => {
    const whole = Math.floor(s);
    return `0:0${whole}`;
  };

  const formatMessageTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Dedicated Recording View matching Mockup Screen 6
  if (viewMode === 'record') {
    return (
      <div className="flex flex-col h-screen bg-[#11101A] text-[#F8F6FC] p-6 justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (isRecording) handleCancelRecording();
              setViewMode('feed');
            }}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC]"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <h3 className="text-sm font-bold text-[#F8F6FC]">Send a voice note</h3>
            <p className="text-xs text-[#AAA5B8]">To {partner.displayName}</p>
          </div>

          <div className="w-10" />
        </div>

        {/* Center Concentric Glowing Mic & Waveform */}
        <div className="flex flex-col items-center justify-center my-auto">
          {/* Concentric rings */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Outer subtle glow ring */}
            <div
              className={`absolute w-64 h-64 rounded-full border border-[#BBA2FF]/20 transition-all duration-300 ${
                isRecording ? 'scale-110 opacity-100 animate-ping' : 'opacity-30'
              }`}
              style={{ animationDuration: '2.5s' }}
            />

            {/* Middle pulsating ring */}
            <div
              className={`absolute w-52 h-52 rounded-full border border-[#BBA2FF]/40 transition-all duration-300 ${
                isRecording ? 'scale-105 bg-[#BBA2FF]/10' : 'bg-transparent'
              }`}
            />

            {/* Center mic trigger button */}
            <button
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onTouchStart={handleStartRecording}
              onTouchEnd={handleStopRecording}
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xl ${
                isRecording
                  ? 'bg-gradient-to-tr from-[#9B7BFF] to-[#F5A8D0] text-[#11101A] glow-accent-strong scale-105'
                  : recordedDraft
                  ? 'bg-[#2A2440] text-[#BBA2FF] border-2 border-[#BBA2FF]'
                  : 'bg-[#1B1927] border-2 border-[#2F2942] text-[#BBA2FF] hover:border-[#BBA2FF]'
              }`}
            >
              <Mic size={42} strokeWidth={isRecording ? 2.5 : 2} />
            </button>
          </div>

          {/* Time Counter (strictly 0:00 / 0:10) */}
          <div className="text-center mb-6">
            <span className="text-2xl font-mono font-bold tracking-widest text-[#F8F6FC]">
              {formatSec(recordSeconds)}
            </span>
            <span className="text-base font-mono text-[#7D788E]"> / 0:10</span>
          </div>

          {/* Live Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs px-4">
            {liveWaveform.map((amp, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isRecording ? 'bg-gradient-to-t from-[#BBA2FF] to-[#79E6DF]' : 'bg-[#2F2A42]'
                }`}
                style={{
                  height: isRecording ? `${Math.max(6, amp * 44)}px` : '8px'
                }}
              />
            ))}
          </div>

          <p className="text-xs text-[#AAA5B8] mt-4 font-medium tracking-wide">
            {isRecording
              ? 'Recording... Release to preview'
              : recordedDraft
              ? 'Voice note ready'
              : 'Hold to record (10 sec max)'}
          </p>
        </div>

        {/* Bottom Actions: Cancel & Send */}
        <div className="flex items-center justify-center gap-8 pb-8">
          <button
            onClick={handleCancelRecording}
            className="w-14 h-14 rounded-full bg-[#1B1927] border border-[#272336] text-[#AAA5B8] hover:text-[#FF7D90] flex items-center justify-center active:scale-95 transition-all"
            title="Cancel"
          >
            <X size={20} />
          </button>

          {/* If draft recorded, allow quick replay preview */}
          {recordedDraft && (
            <button
              onClick={() => {
                audioService.playAudio(
                  recordedDraft.audioUrl,
                  () => {},
                  () => {}
                );
              }}
              className="w-14 h-14 rounded-full bg-[#272138] border border-[#3E3557] text-[#79E6DF] flex items-center justify-center active:scale-95 transition-all"
              title="Preview"
            >
              <Play size={20} className="ml-0.5" />
            </button>
          )}

          <button
            onClick={handleSendVoiceNote}
            disabled={!recordedDraft}
            className="w-14 h-14 rounded-full bg-[#BBA2FF] text-[#11101A] flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:hover:opacity-30 shadow-lg shadow-[#BBA2FF]/30 transition-all"
            title="Send voice note"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Conversation Feed View matching Mockup Screen 7
  return (
    <div className="flex flex-col h-screen bg-[#11101A] text-[#F8F6FC] justify-between pb-24 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#171523]/95 backdrop-blur-md border-b border-[#242132]/70 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC]"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#2B273C] flex items-center justify-center text-xl">
              {partner.avatar}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#79E6DF] rounded-full ring-2 ring-[#11101A]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#F8F6FC]">{partner.displayName}</h3>
            <span className="text-[11px] text-[#79E6DF] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#79E6DF] animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <button
          onClick={() => setViewMode('record')}
          className="px-3 py-1.5 rounded-full bg-[#27203B] border border-[#3E335E] text-[#BBA2FF] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#322A4C] transition-colors"
        >
          <Radio size={13} />
          <span>Walkie-Talkie</span>
        </button>
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
        {/* Intro Whisper */}
        <div className="text-center py-2">
          <span className="px-3 py-1 rounded-full bg-[#171523] border border-[#272336] text-[11px] text-[#7D788E]">
            End-to-end encrypted private walkie-talkie
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isPlaying = playingId === msg.id;
          const progress = playbackProgress[msg.id] || 0;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-[#1B1927] flex items-center justify-center text-base shrink-0 mb-1">
                  {msg.senderAvatar}
                </div>
              )}

              {/* Message Bubble matching mockup */}
              <div
                className={`p-3.5 rounded-3xl max-w-[270px] shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-[#8E72E8] to-[#A78BFA] text-[#11101A] rounded-br-sm'
                    : 'bg-[#1B1927] border border-[#272336] text-[#F8F6FC] rounded-bl-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTogglePlay(msg)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                      isMe
                        ? 'bg-[#11101A] text-[#BBA2FF]'
                        : 'bg-[#29223D] text-[#BBA2FF] hover:bg-[#342C4E]'
                    }`}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>

                  {/* Waveform graphic */}
                  <div className="flex-1 flex items-center gap-[2.5px] h-7 px-1">
                    {msg.waveform.slice(0, 20).map((amp, idx) => {
                      const barProg = idx / 20;
                      const isPlayed = isPlaying && barProg <= progress;

                      return (
                        <div
                          key={idx}
                          className={`w-[2.5px] rounded-full transition-all duration-150 ${
                            isMe
                              ? isPlayed
                                ? 'bg-[#11101A]'
                                : 'bg-[#11101A]/35'
                              : isPlayed
                              ? 'bg-[#BBA2FF]'
                              : 'bg-[#2E2840]'
                          }`}
                          style={{ height: `${Math.max(4, amp * 22)}px` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Footer time & receipt */}
                <div
                  className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                    isMe ? 'text-[#11101A]/70' : 'text-[#7D788E]'
                  }`}
                >
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  <CheckCheck
                    size={13}
                    className={msg.listened ? (isMe ? 'text-[#11101A]' : 'text-[#79E6DF]') : ''}
                  />
                </div>
              </div>

              {isMe && (
                <div className="w-8 h-8 rounded-full bg-[#1B1927] flex items-center justify-center text-base shrink-0 mb-1">
                  {currentUser.avatar}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Walkie-Talkie Bar */}
      <div className="p-4 bg-[#171523]/95 backdrop-blur-md border-t border-[#272336] flex items-center gap-3">
        <button
          onClick={() => setViewMode('record')}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#1B1927] border border-[#2B273C] text-xs text-[#AAA5B8] flex items-center justify-between hover:border-[#BBA2FF]/50 transition-colors"
        >
          <span>Tap to record 10s voice note...</span>
          <span className="text-[11px] font-mono text-[#7D788E]">10s max</span>
        </button>

        <button
          onClick={() => setViewMode('record')}
          className="w-12 h-12 rounded-2xl bg-[#BBA2FF] text-[#11101A] flex items-center justify-center active:scale-95 shadow-md shadow-[#BBA2FF]/20 hover:scale-105 transition-all"
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
};
