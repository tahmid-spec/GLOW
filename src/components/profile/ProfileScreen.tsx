import React, { useState } from 'react';
import { 
  ArrowLeft,
  Users, 
  Bell, 
  Shield, 
  LayoutGrid, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  X,
  HeartCrack,
  Check,
  Radio,
  Lock,
  MessageSquareHeart,
  Volume2,
  Calendar,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { UserProfile, PrivatePair } from '../../types';
import { storage } from '../../services/storage';
import { InstallGuideModal } from '../common/InstallGuideModal';

type ActiveOption = 'none' | 'connected_person' | 'notifications' | 'privacy' | 'help';

interface ProfileScreenProps {
  currentUser: UserProfile;
  partner: UserProfile | null;
  pair: PrivatePair | null;
  onOpenWidgetStudio: () => void;
  onLogOut: () => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  partner,
  pair,
  onOpenWidgetStudio,
  onLogOut,
  onBack
}) => {
  const [activeOption, setActiveOption] = useState<ActiveOption>('none');
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Notification states
  const [notifyDoodles, setNotifyDoodles] = useState(true);
  const [notifyVoice, setNotifyVoice] = useState(true);
  const [notifyChirps, setNotifyChirps] = useState(true);

  const handleDisconnect = () => {
    if (pair) {
      storage.disconnectPair(pair.id);
      setShowDisconnectModal(false);
      setActiveOption('none');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // SUB-VIEW 1: Connected Person Details
  if (activeOption === 'connected_person') {
    return (
      <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-5 pt-4">
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-3 py-3 mb-6">
          <button
            onClick={() => setActiveOption('none')}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F8F6FC]">Connected Person</h2>
            <p className="text-xs text-[#AAA5B8]">Your private space partner</p>
          </div>
        </div>

        {partner ? (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-[#1B1927] border border-[#272336] flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-[#151320] border-2 border-[#2F2942] flex items-center justify-center text-4xl shadow-inner">
                  {partner.avatar}
                </div>
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#79E6DF] rounded-full ring-2 ring-[#1B1927]" />
              </div>
              <h3 className="text-lg font-bold text-[#F8F6FC]">{partner.displayName}</h3>
              <p className="text-xs text-[#BBA2FF]">{partner.username}</p>
              <p className="text-xs text-[#AAA5B8] mt-2 italic">{partner.bio || 'Connected in Glow'}</p>

              <div className="w-full mt-6 pt-5 border-t border-[#242132] grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#151320] border border-[#231F33]">
                  <p className="text-[11px] text-[#7D788E]">Status</p>
                  <p className="text-xs font-semibold text-[#79E6DF] flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#79E6DF] animate-pulse" />
                    Online
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#151320] border border-[#231F33]">
                  <p className="text-[11px] text-[#7D788E]">Connected Since</p>
                  <p className="text-xs font-semibold text-[#F8F6FC] mt-0.5">
                    {pair ? formatDate(pair.connectedAt) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-2">
              <h4 className="text-xs font-bold text-[#F8F6FC]">About Your Connection</h4>
              <p className="text-xs text-[#AAA5B8] leading-relaxed">
                You and {partner.displayName} share an exclusive two-person private channel. All doodles, voice notes, and canvas updates are only visible to the two of you.
              </p>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="w-full py-3.5 rounded-2xl bg-[#2D1B28] border border-[#4D2439] text-[#FF7D90] font-semibold text-xs transition-colors flex items-center justify-center gap-2 hover:bg-[#381F30]"
            >
              <HeartCrack size={16} />
              <span>Disconnect from {partner.displayName}</span>
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[#1B1927] border border-[#272336] text-center">
            <p className="text-sm text-[#AAA5B8]">You are not currently connected to anyone.</p>
          </div>
        )}

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && partner && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-full max-w-xs bg-[#1B1927] border border-[#2E2840] rounded-3xl p-6 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#351B27] text-[#FF7D90] flex items-center justify-center mx-auto mb-4">
                <HeartCrack size={22} />
              </div>

              <h3 className="text-base font-bold text-[#F8F6FC] mb-2">
                Disconnect from {partner.displayName}?
              </h3>
              <p className="text-xs text-[#AAA5B8] leading-relaxed mb-6">
                Disconnecting will close "Our Glow" private space. Shared doodles and voice notes will be archived. You can always reconnect with a new invitation code.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 rounded-xl bg-[#FF7D90] text-[#11101A] font-bold text-xs hover:opacity-95 transition-all"
                >
                  Yes, Disconnect
                </button>
                <button
                  onClick={() => setShowDisconnectModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#242132] text-xs font-semibold text-[#AAA5B8] hover:text-[#F8F6FC]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SUB-VIEW 2: Notification Settings
  if (activeOption === 'notifications') {
    return (
      <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-5 pt-4">
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-3 py-3 mb-6">
          <button
            onClick={() => setActiveOption('none')}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F8F6FC]">Notifications</h2>
            <p className="text-xs text-[#AAA5B8]">Manage alerts from your partner</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">New Doodle Alerts</h4>
              <p className="text-[11px] text-[#AAA5B8]">Notify me when a new doodle or canvas stroke arrives</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDoodles}
              onChange={(e) => setNotifyDoodles(e.target.checked)}
              className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Walkie-Talkie Voice Notes</h4>
              <p className="text-[11px] text-[#AAA5B8]">Notify me when a 10s voice note is delivered</p>
            </div>
            <input
              type="checkbox"
              checked={notifyVoice}
              onChange={(e) => setNotifyVoice(e.target.checked)}
              className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Tactile Walkie Chirp</h4>
              <p className="text-[11px] text-[#AAA5B8]">Play subtle tone on mic press & voice note sent</p>
            </div>
            <input
              type="checkbox"
              checked={notifyChirps}
              onChange={(e) => setNotifyChirps(e.target.checked)}
              className="w-5 h-5 rounded accent-[#BBA2FF] cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-[#171523] border border-[#272336]">
          <p className="text-xs text-[#7D788E] leading-relaxed">
            Glow notifications are discreet. We never send spam, marketing, or promotional push messages.
          </p>
        </div>
      </div>
    );
  }

  // SUB-VIEW 3: Privacy & Security
  if (activeOption === 'privacy') {
    return (
      <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-5 pt-4">
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-3 py-3 mb-6">
          <button
            onClick={() => setActiveOption('none')}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F8F6FC]">Privacy & Security</h2>
            <p className="text-xs text-[#AAA5B8]">How Glow protects your space</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <div className="flex items-center gap-2 text-[#79E6DF] mb-1">
              <Lock size={16} />
              <h4 className="text-xs font-bold text-[#F8F6FC]">Strictly Two Members</h4>
            </div>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              Every Glow space is cryptographically partitioned to exactly two authenticated members. There are no group chats, public feeds, or third-party observers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <div className="flex items-center gap-2 text-[#BBA2FF] mb-1">
              <Shield size={16} />
              <h4 className="text-xs font-bold text-[#F8F6FC]">Single-Use 10-Minute Codes</h4>
            </div>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              Connection invitations automatically expire in 10 minutes and can only be used once. Mutual authorization is required before any private channel is established.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <div className="flex items-center gap-2 text-[#F5A8D0] mb-1">
              <Radio size={16} />
              <h4 className="text-xs font-bold text-[#F8F6FC]">10-Second Voice Guard</h4>
            </div>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              Voice notes are strictly capped at 10 seconds. Microphones are never activated in the background or without deliberate touch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUB-VIEW 4: Help & Support
  if (activeOption === 'help') {
    return (
      <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-5 pt-4">
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-3 py-3 mb-6">
          <button
            onClick={() => setActiveOption('none')}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#F8F6FC]">Help & Support</h2>
            <p className="text-xs text-[#AAA5B8]">Guides and common questions</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <h4 className="text-xs font-bold text-[#F8F6FC]">How do I connect with my person?</h4>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              One person taps "Send Code" to generate an 8-character code (e.g. 7F3K-9D2P). The other person types that code into "Enter Code". The sender then confirms with "Accept & Connect".
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <h4 className="text-xs font-bold text-[#F8F6FC]">How does the shared canvas work?</h4>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              Choose "Our Canvas" to work together on the same canvas, or "Draw for You" to send individual doodles with cute word stickers and sparkles.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] space-y-1">
            <h4 className="text-xs font-bold text-[#F8F6FC]">How do I add the Home Screen Widget?</h4>
            <p className="text-xs text-[#AAA5B8] leading-relaxed">
              Open Widget Studio from the Home screen or settings, pick your favorite theme (Midnight, Pastel, Lavender, Sunset), write your custom message, and save.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PROFILE SCREEN WITH TOP BACK BUTTON
  return (
    <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] pb-24 px-5 pt-4">
      {/* Header with Back button to return to Home */}
      <div className="flex items-center gap-3 py-3 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          title="Back to Home"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-[#F8F6FC]">Profile & Settings</h2>
          <p className="text-xs text-[#AAA5B8]">Manage your space and preferences</p>
        </div>
      </div>

      {/* Profile Card matching Mockup Screen 10 */}
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#1B1927] border border-[#272336] mb-6 shadow-md">
        <div className="w-20 h-20 rounded-full bg-[#151320] border-2 border-[#2F2942] flex items-center justify-center text-4xl mb-3 shadow-inner">
          {currentUser.avatar}
        </div>
        <h3 className="text-lg font-bold text-[#F8F6FC]">{currentUser.displayName}</h3>
        <p className="text-xs text-[#AAA5B8]">{currentUser.username}</p>
      </div>

      {/* Menu List */}
      <div className="space-y-2.5 mb-8">
        {/* Connected Person Option */}
        <div
          onClick={() => setActiveOption('connected_person')}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38324C] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#282138] text-[#BBA2FF] flex items-center justify-center text-lg">
              <Users size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Connected person</h4>
              <p className="text-[11px] text-[#AAA5B8]">
                {partner ? `${partner.displayName} (${partner.username})` : 'Not connected'}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>

        {/* Notification Settings Option */}
        <div
          onClick={() => setActiveOption('notifications')}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38324C] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F2236] text-[#79E6DF] flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Notification settings</h4>
              <p className="text-[11px] text-[#AAA5B8]">Alerts for doodles & voice notes</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>

        {/* Privacy & Security Option */}
        <div
          onClick={() => setActiveOption('privacy')}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38324C] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B2332] text-[#F5A8D0] flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Privacy & security</h4>
              <p className="text-[11px] text-[#AAA5B8]">Private encryption, no public feeds</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>

        {/* Widget Settings Option */}
        <div
          onClick={onOpenWidgetStudio}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38324C] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#282138] text-[#BBA2FF] flex items-center justify-center">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Widget settings</h4>
              <p className="text-[11px] text-[#AAA5B8]">Customize themes & home screen</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>

        {/* Help & Support Option */}
        <div
          onClick={() => setActiveOption('help')}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] flex items-center justify-between cursor-pointer hover:border-[#38324C] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D242E] text-[#FFE28A] flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Help & support</h4>
              <p className="text-[11px] text-[#AAA5B8]">Guides & connection troubleshooting</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>

        {/* Install Glow & Get APK Option */}
        <div
          onClick={() => setShowInstallModal(true)}
          className="p-4 rounded-2xl bg-[#1B1927] border border-[#272336] hover:border-[#79E6DF]/50 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#17262E] text-[#79E6DF] flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#F8F6FC]">Install App & Get APK</h4>
              <p className="text-[11px] text-[#AAA5B8]">Install on home screen or export Android APK</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7D788E]" />
        </div>
      </div>

      {/* Log Out Action */}
      <button
        onClick={onLogOut}
        className="w-full py-3.5 rounded-2xl bg-[#1B1927] border border-[#272336] text-[#AAA5B8] hover:text-[#FF7D90] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        <span>Log out</span>
      </button>

      {/* Install App & APK Guide Modal */}
      <InstallGuideModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
