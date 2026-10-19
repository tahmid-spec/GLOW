import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check } from 'lucide-react';
import { storage } from '../../services/storage';

interface AccountSetupProps {
  onBack: () => void;
  onContinue: () => void;
  onLogIn: () => void;
}

const AVATAR_OPTIONS = ['🐱', '🦊', '🐻', '🐰', '🐶', '🐼', '🐨', '🐥'];

export const AccountSetup: React.FC<AccountSetupProps> = ({ onBack, onContinue, onLogIn }) => {
  const currentUser = storage.getCurrentUser();
  const [displayName, setDisplayName] = useState(currentUser.displayName || 'Tahmid');
  const [username, setUsername] = useState(currentUser.username.replace('@', '') || 'tahmid');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || '🐱');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    storage.updateCurrentUser({
      displayName: displayName.trim(),
      username: `@${username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
      avatar: selectedAvatar
    });

    onContinue();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#11101A] text-[#F8F6FC] p-6 justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-medium text-[#7D788E]">Step 1 of 2</span>
          <div className="w-10" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#F8F6FC] mb-1">Create your account</h2>
          <p className="text-sm text-[#AAA5B8]">Choose a unique username and set up your profile.</p>
        </div>

        {/* Profile Avatar Selection */}
        <div className="flex flex-col items-center my-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-24 h-24 rounded-full bg-[#1B1927] border-2 border-[#2F2A42] hover:border-[#BBA2FF] flex items-center justify-center text-4xl shadow-inner transition-all group"
            >
              <span>{selectedAvatar}</span>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#BBA2FF] text-[#11101A] flex items-center justify-center shadow">
                <Camera size={14} />
              </div>
            </button>
          </div>
          <span className="text-xs text-[#AAA5B8] mt-2 font-medium">Choose avatar</span>

          {showAvatarPicker && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 p-3 bg-[#1B1927] border border-[#2B273C] rounded-2xl max-w-xs animate-in fade-in duration-200">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-10 h-10 text-2xl rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedAvatar === avatar ? 'bg-[#2E2844] ring-2 ring-[#BBA2FF]' : 'bg-[#151320]'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="block text-xs font-semibold text-[#AAA5B8] uppercase tracking-wider mb-2">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="Tahmid"
              maxLength={25}
              className="w-full px-4 py-3.5 rounded-xl bg-[#1B1927] border border-[#272336] text-[#F8F6FC] placeholder-[#5A556B] focus:outline-none focus:border-[#BBA2FF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#AAA5B8] uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-[#AAA5B8] font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                  setError('');
                }}
                placeholder="tahmid"
                maxLength={20}
                className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-[#1B1927] border border-[#272336] text-[#F8F6FC] placeholder-[#5A556B] focus:outline-none focus:border-[#BBA2FF] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#FF7D90] mt-1">{error}</p>}
        </form>
      </div>

      {/* Bottom Continue button */}
      <div className="pt-6 pb-4 space-y-3 max-w-sm mx-auto w-full">
        <button
          onClick={handleSubmit}
          className="w-full py-4 px-6 rounded-2xl bg-[#BBA2FF] text-[#11101A] font-semibold text-base shadow-lg shadow-[#BBA2FF]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={onLogIn}
          className="w-full py-2 text-center text-xs text-[#AAA5B8] hover:text-[#F8F6FC]"
        >
          Already have an account? <span className="text-[#BBA2FF] font-medium">Log in</span>
        </button>
      </div>
    </div>
  );
};
