import React, { useState, useEffect } from 'react';
import { UserProfile, PrivatePair, DoodleItem, VoiceMessageItem, NavigationTab } from '../types';
import { storage } from '../services/storage';
import { HomeScreen } from './home/HomeScreen';
import { CanvasScreen } from './canvas/CanvasScreen';
import { VoiceScreen } from './voice/VoiceScreen';
import { WidgetStudio } from './widget/WidgetStudio';
import { ProfileScreen } from './profile/ProfileScreen';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { AccountSetup } from './onboarding/AccountSetup';
import { ConnectScreen } from './onboarding/ConnectScreen';
import { Navbar } from './common/Navbar';
import { Wifi, Battery } from 'lucide-react';

interface PhoneAppInstanceProps {
  userId: string;
}

export const PhoneAppInstance: React.FC<PhoneAppInstanceProps> = ({ userId }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const users = storage.getUsers();
    return users.find((u) => u.id === userId) || users[0];
  });

  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [pair, setPair] = useState<PrivatePair | null>(null);
  const [doodles, setDoodles] = useState<DoodleItem[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessageItem[]>([]);

  // Navigation states
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeSubView, setActiveSubView] = useState<'widget_studio' | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'account' | 'connect'>('welcome');

  // Reload data
  const refreshData = () => {
    const users = storage.getUsers();
    const me = users.find((u) => u.id === userId) || users[0];
    setCurrentUser(me);

    // Find pair for this user
    const pairs: PrivatePair[] = JSON.parse(localStorage.getItem('candle_pairs') || '[]');
    const myPair = pairs.find((p) => p.user1Id === userId || p.user2Id === userId) || null;
    setPair(myPair);

    if (myPair) {
      const partnerId = myPair.user1Id === userId ? myPair.user2Id : myPair.user1Id;
      const other = users.find((u) => u.id === partnerId) || null;
      setPartner(other);
      setDoodles(storage.getDoodles(myPair.id));
      setVoiceMessages(storage.getVoiceMessages(myPair.id));
    } else {
      setPartner(null);
      setDoodles([]);
      setVoiceMessages([]);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return () => unsub();
  }, [userId]);

  const handleDirectLogin = () => {
    storage.connectDefaultPair();
    refreshData();
    setCurrentTab('home');
  };

  // If not paired, show onboarding / connection flow
  if (!pair || !partner) {
    return (
      <div className="flex flex-col h-full bg-[#11101A] text-[#F8F6FC] relative overflow-hidden select-none">
        {/* Mobile Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-[#AAA5B8] z-30">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={13} />
            <Battery size={15} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {onboardingStep === 'welcome' && (
            <WelcomeScreen
              onGetStarted={() => setOnboardingStep('account')}
              onLogIn={handleDirectLogin}
            />
          )}

          {onboardingStep === 'account' && (
            <AccountSetup
              onBack={() => setOnboardingStep('welcome')}
              onContinue={() => setOnboardingStep('connect')}
              onLogIn={handleDirectLogin}
            />
          )}

          {onboardingStep === 'connect' && (
            <ConnectScreen
              onBack={() => setOnboardingStep('welcome')}
              onConnected={() => {
                refreshData();
                setCurrentTab('home');
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Active Main App with Pair
  return (
    <div className="flex flex-col h-full bg-[#11101A] text-[#F8F6FC] relative overflow-hidden select-none">
      {/* Mobile Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-[#AAA5B8] z-30 bg-[#11101A]/80 backdrop-blur-sm">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Wifi size={13} />
          <Battery size={15} />
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeSubView === 'widget_studio' ? (
          <WidgetStudio
            currentUser={currentUser}
            partner={partner}
            pair={pair}
            doodles={doodles}
            onBack={() => setActiveSubView(null)}
          />
        ) : currentTab === 'home' ? (
          <HomeScreen
            currentUser={currentUser}
            partner={partner}
            pair={pair}
            doodles={doodles}
            voiceMessages={voiceMessages}
            onOpenCanvas={() => setCurrentTab('canvas')}
            onOpenVoice={() => setCurrentTab('voice')}
            onOpenWidgetStudio={() => setActiveSubView('widget_studio')}
            onOpenProfile={() => setCurrentTab('profile')}
          />
        ) : currentTab === 'canvas' ? (
          <CanvasScreen
            currentUser={currentUser}
            partner={partner}
            pairId={pair.id}
            onBack={() => setCurrentTab('home')}
            onDoodleSent={() => {
              setCurrentTab('home');
            }}
          />
        ) : currentTab === 'voice' ? (
          <VoiceScreen
            currentUser={currentUser}
            partner={partner}
            pairId={pair.id}
            onBack={() => setCurrentTab('home')}
          />
        ) : (
          <ProfileScreen
            currentUser={currentUser}
            partner={partner}
            pair={pair}
            onOpenWidgetStudio={() => setActiveSubView('widget_studio')}
            onLogOut={() => {
              setOnboardingStep('welcome');
              storage.disconnectPair(pair.id);
            }}
            onBack={() => setCurrentTab('home')}
          />
        )}
      </div>

      {/* Bottom Nav Bar (hidden when in canvas drawing or widget studio) */}
      {!activeSubView && currentTab !== 'canvas' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveSubView(null);
            setCurrentTab(tab);
          }}
          hasUnheardVoice={voiceMessages.some((v) => !v.listened && v.senderId !== currentUser.id)}
        />
      )}
    </div>
  );
};
