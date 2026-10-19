import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Github, X, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (!isOpen) return null;

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install on your phone:\n• Android: Tap browser menu (⋮) -> "Add to Home screen"\n• iPhone: Tap Share icon -> "Add to Home Screen"');
    }
  };

  const copyGitCommands = () => {
    const cmds = `git clone <YOUR_REPO_URL>
cd glow-app
npm install
npm run build
npx cap add android
npx cap open android`;
    navigator.clipboard.writeText(cmds);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#171524] border border-[#2E2840] rounded-3xl p-5 sm:p-6 text-[#F8F6FC] shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors rounded-full bg-[#201C30]"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#282138] text-[#BBA2FF] flex items-center justify-center text-lg">
            ♡
          </div>
          <h3 className="text-base font-bold text-[#F8F6FC]">Install Glow / Get APK</h3>
        </div>
        <p className="text-xs text-[#AAA5B8] mb-4">
          Two easy ways to use Glow as a standalone mobile app on your phone.
        </p>

        {/* OPTION 1: INSTANT INSTALL (PWA / TWA) */}
        <div className="p-4 rounded-2xl bg-[#1D192C] border border-[#2E2840] mb-3">
          <div className="flex items-center gap-2 mb-1 text-[#79E6DF]">
            <Smartphone size={16} />
            <h4 className="text-xs font-bold text-[#F8F6FC]">Method 1: Instant Phone Install</h4>
          </div>
          <p className="text-[11px] text-[#AAA5B8] leading-relaxed mb-3">
            Install directly from your browser. Opens as a full-screen native mobile app with home-screen icon.
          </p>
          <button
            onClick={handlePWAInstall}
            className="w-full py-2.5 px-3 rounded-xl bg-[#79E6DF] text-[#11101A] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow transition-all hover:opacity-95"
          >
            <Download size={14} />
            <span>Install on Home Screen</span>
          </button>
        </div>

        {/* OPTION 2: NATIVE ANDROID APK (GITHUB & CAPACITOR) */}
        <div className="p-4 rounded-2xl bg-[#1D192C] border border-[#2E2840] mb-4">
          <div className="flex items-center gap-2 mb-1 text-[#BBA2FF]">
            <Github size={16} />
            <h4 className="text-xs font-bold text-[#F8F6FC]">Method 2: Native Android APK</h4>
          </div>
          <p className="text-[11px] text-[#AAA5B8] leading-relaxed mb-2.5">
            Push this codebase to GitHub. Our included <strong>GitHub Actions</strong> workflow automatically compiles and outputs a downloadable <code>app-debug.apk</code> file!
          </p>

          <div className="p-2.5 rounded-xl bg-[#13111E] border border-white/5 font-mono text-[10px] text-[#AAA5B8] leading-relaxed mb-3">
            <div>1. Push code to GitHub repository</div>
            <div>2. Check Actions tab for ready-to-install APK</div>
            <div>3. Or run Capacitor locally:</div>
          </div>

          <button
            onClick={copyGitCommands}
            className="w-full py-2 px-3 rounded-xl bg-[#262038] border border-[#3E335E] text-[#BBA2FF] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#31284A] transition-colors mb-2.5"
          >
            {copiedCmd ? <Check size={13} className="text-[#79E6DF]" /> : <Copy size={13} />}
            <span>{copiedCmd ? 'Commands Copied!' : 'Copy Capacitor APK Commands'}</span>
          </button>

          {/* Direct Download ZIP button */}
          <a
            href="/glow-app.zip"
            download="glow-app.zip"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#BBA2FF] to-[#D4B2FF] text-[#11101A] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow transition-all hover:opacity-95"
          >
            <Download size={14} />
            <span>Download Source Code (.ZIP)</span>
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#242132] text-xs font-semibold text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
