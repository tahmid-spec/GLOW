import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, ScanLine, Copy, Check, ArrowRight, QrCode, RefreshCw, X, AlertCircle } from 'lucide-react';
import { storage } from '../../services/storage';
import { InvitationCode, ConnectionRequest } from '../../types';
import confetti from 'canvas-confetti';

interface ConnectScreenProps {
  onBack: () => void;
  onConnected: () => void;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onBack, onConnected }) => {
  const currentUser = storage.getCurrentUser();
  const [activeCode, setActiveCode] = useState<InvitationCode | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);

  // Load or generate current invitation code
  const loadCode = () => {
    const invites = storage.getInvitations();
    const active = invites.find(
      (inv) => inv.creatorId === currentUser.id && inv.status === 'active' && inv.expiresAt > Date.now()
    );

    if (active) {
      setActiveCode(active);
      setTimeLeft(Math.max(0, Math.floor((active.expiresAt - Date.now()) / 1000)));
    } else {
      const generated = storage.generateInvitationCode();
      setActiveCode(generated);
      setTimeLeft(600);
    }
  };

  // Check pending requests directed to current user
  const checkRequests = () => {
    const reqs = storage.getConnectionRequests();
    const incoming = reqs.filter(r => r.receiverId === currentUser.id && r.status === 'pending');
    setPendingRequests(incoming);
  };

  useEffect(() => {
    loadCode();
    checkRequests();

    const unsub = storage.subscribe(() => {
      checkRequests();
      // Check if current user has now become part of a pair
      const myPair = storage.getMyPair();
      if (myPair.pair) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BBA2FF', '#F5A8D0', '#79E6DF', '#FFE28A']
        });
        setTimeout(onConnected, 600);
      }
    });

    return () => unsub();
  }, [currentUser.id]);

  // Expiration countdown
  useEffect(() => {
    if (!activeCode || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          loadCode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCode]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = () => {
    const generated = storage.generateInvitationCode();
    setActiveCode(generated);
    setTimeLeft(600);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setInputCode(val);
    setErrorMsg('');
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('Please enter an invitation code');
      return;
    }

    const res = storage.submitInvitationCode(inputCode);
    if (!res.success) {
      setErrorMsg(res.error || 'Unable to connect with this code');
    } else {
      setSuccessMsg('Request sent! Waiting for your person to approve...');
      // If we are in simulated local mode with user Rafi or partner, we can auto-notify
      setTimeout(() => {
        checkRequests();
      }, 500);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const res = storage.acceptConnectionRequest(requestId);
    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#BBA2FF', '#F5A8D0', '#79E6DF', '#FFE28A']
      });
      setTimeout(onConnected, 600);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    storage.rejectConnectionRequest(requestId);
    checkRequests();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] p-6 justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-medium text-[#7D788E]">Connect</span>
          <div className="w-10" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#F8F6FC] mb-1">Connect with your person</h2>
          <p className="text-sm text-[#AAA5B8]">
            Share your code or enter their code to start your private space.
          </p>
        </div>

        {/* Incoming Connection Request Modal / Card */}
        {pendingRequests.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#241F36] to-[#1E1B2E] border-2 border-[#BBA2FF]/50 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl p-1 bg-[#151320] rounded-xl">{pendingRequests[0].senderAvatar}</span>
              <div>
                <h4 className="text-sm font-bold text-[#F8F6FC] flex items-center gap-1.5">
                  <span>{pendingRequests[0].senderName}</span>
                  <span className="text-xs text-[#AAA5B8] font-normal">{pendingRequests[0].senderUsername}</span>
                </h4>
                <p className="text-xs text-[#BBA2FF]">wants to connect with you!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAcceptRequest(pendingRequests[0].id)}
                className="flex-1 py-2.5 rounded-xl bg-[#BBA2FF] text-[#11101A] font-semibold text-xs shadow hover:opacity-95 transition-all"
              >
                Accept & Connect
              </button>
              <button
                onClick={() => handleRejectRequest(pendingRequests[0].id)}
                className="px-4 py-2.5 rounded-xl bg-[#1B1927] border border-[#2B273C] text-xs text-[#AAA5B8] hover:text-[#F8F6FC]"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Send Code Card */}
        <div className="mb-4 p-5 rounded-2xl bg-[#1B1927] border border-[#272336] transition-all hover:border-[#38334D]">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2A2440] text-[#BBA2FF] flex items-center justify-center shrink-0">
              <Send size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#F8F6FC]">Send Code</h3>
              <p className="text-xs text-[#AAA5B8]">Share your code with your person</p>
            </div>
            <button
              onClick={handleRegenerate}
              title="Regenerate code"
              className="text-[#7D788E] hover:text-[#AAA5B8] p-1.5 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Large Code Display Box */}
          <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-[#151320] border border-[#242132]">
            <span className="text-2xl font-mono font-bold tracking-wider text-[#F8F6FC]">
              {activeCode?.code || '••••-••••'}
            </span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg bg-[#242132] text-[#AAA5B8] hover:text-[#F8F6FC] active:scale-95 transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-[#79E6DF]" />
                  <span className="text-xs text-[#79E6DF] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-[#7D788E]">
            <span>Expires in {formatSeconds(timeLeft)}</span>
            <span>Single-use encrypted</span>
          </div>
        </div>

        {/* Section 2: Enter Code Card */}
        <div className="p-5 rounded-2xl bg-[#1B1927] border border-[#272336] transition-all hover:border-[#38334D]">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2D2136] text-[#F5A8D0] flex items-center justify-center shrink-0">
              <ScanLine size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F8F6FC]">Enter Code</h3>
              <p className="text-xs text-[#AAA5B8]">Get their code and connect</p>
            </div>
          </div>

          <form onSubmit={handleConnectSubmit} className="relative">
            <input
              type="text"
              value={inputCode}
              onChange={handleInputChange}
              placeholder="XXXX-XXXX"
              maxLength={9}
              className="w-full px-4 py-3.5 pr-14 rounded-xl bg-[#151320] border border-[#242132] text-lg font-mono font-semibold tracking-wider text-[#F8F6FC] placeholder-[#4F4A5E] focus:outline-none focus:border-[#BBA2FF] transition-colors"
            />
            <button
              type="submit"
              disabled={inputCode.length < 8}
              className="absolute right-2 top-2 bottom-2 w-10 rounded-lg bg-[#BBA2FF] text-[#11101A] flex items-center justify-center disabled:opacity-30 disabled:hover:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowRight size={18} />
            </button>
          </form>

          {errorMsg && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[#FF7D90]">
              <AlertCircle size={13} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[#79E6DF]">
              <Check size={13} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Action & Privacy Notice */}
      <div className="pt-6 pb-2 text-center">
        <button
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors py-2 px-3 rounded-lg hover:bg-[#1B1927]"
        >
          <QrCode size={16} />
          <span>Or scan QR code</span>
        </button>

        <p className="text-[11px] text-[#696475] mt-4">
          Glow connects strictly two people. Neither member can view other pairs.
        </p>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#1B1927] border border-[#2E2840] rounded-3xl p-6 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-[#AAA5B8] hover:text-[#F8F6FC]"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#F8F6FC] mb-1">Your Glow QR</h3>
            <p className="text-xs text-[#AAA5B8] mb-6">Hold your camera over this QR code to connect instantly.</p>

            {/* Generated QR visual */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* SVG QR Code Pattern mockup */}
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#11101A" rx="2" />
                <rect x="15" y="15" width="15" height="15" fill="white" rx="1" />
                <rect x="18" y="18" width="9" height="9" fill="#11101A" />
                
                <rect x="65" y="10" width="25" height="25" fill="#11101A" rx="2" />
                <rect x="70" y="15" width="15" height="15" fill="white" rx="1" />
                <rect x="73" y="18" width="9" height="9" fill="#11101A" />

                <rect x="10" y="65" width="25" height="25" fill="#11101A" rx="2" />
                <rect x="15" y="70" width="15" height="15" fill="white" rx="1" />
                <rect x="18" y="73" width="9" height="9" fill="#11101A" />

                {/* Data blocks */}
                <rect x="42" y="12" width="6" height="6" fill="#11101A" />
                <rect x="52" y="16" width="6" height="6" fill="#11101A" />
                <rect x="42" y="26" width="6" height="6" fill="#11101A" />
                <rect x="42" y="42" width="16" height="16" fill="#BBA2FF" rx="4" />
                <rect x="65" y="42" width="6" height="6" fill="#11101A" />
                <rect x="75" y="52" width="6" height="6" fill="#11101A" />
                <rect x="42" y="65" width="6" height="6" fill="#11101A" />
                <rect x="52" y="75" width="6" height="6" fill="#11101A" />
                <rect x="65" y="65" width="6" height="6" fill="#11101A" />
                <rect x="75" y="75" width="6" height="6" fill="#11101A" />
              </svg>
            </div>

            <p className="mt-4 font-mono font-bold text-sm tracking-widest text-[#BBA2FF]">
              {activeCode?.code}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-[#242132] text-xs font-semibold text-[#F8F6FC] hover:bg-[#2C293D]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
