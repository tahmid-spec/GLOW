import React from 'react';
import { Home, SquarePen, Mic, User } from 'lucide-react';
import { NavigationTab } from '../../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  hasUnheardVoice?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  hasUnheardVoice = false
}) => {
  const navItems = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'canvas' as NavigationTab, label: 'Canvas', icon: SquarePen },
    { id: 'voice' as NavigationTab, label: 'Voice', icon: Mic, badge: hasUnheardVoice },
    { id: 'profile' as NavigationTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#171523]/95 backdrop-blur-md border-t border-[#272336] px-6 py-2.5 z-40">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-200 ${
                isActive ? 'text-[#BBA2FF]' : 'text-[#7D788E] hover:text-[#AAA5B8]'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F5A8D0] rounded-full ring-2 ring-[#171523] animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-all ${
                  isActive ? 'text-[#F8F6FC] font-semibold' : 'text-[#7D788E]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
