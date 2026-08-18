import React, { useState } from 'react';
import { useExtensionStorage } from './hooks/useExtensionStorage';
import { PopupView } from './components/extension/PopupView';
import { OptionsView } from './components/extension/OptionsView';
import { ShadowOverlay } from './extension/content/ShadowOverlay';
import { ContextMenuSimulator } from './extension/content/ContextMenuSimulator';
import { computeTestEmail, generateDateString } from './extension/engine/dateSuffix';
import { Zap, Copy, Check, Sliders, LayoutGrid, Calendar } from 'lucide-react';

export default function App() {
  const { settings } = useExtensionStorage();
  const [activeTab, setActiveTab] = useState<'popup' | 'options'>('popup');
  const [copied, setCopied] = useState(false);

  const dynamicEmail = computeTestEmail(settings);
  const currentDateSuffix = generateDateString(settings.dateSuffixFormat);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(dynamicEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F3F1] flex flex-col selection:bg-[#FFB800] selection:text-[#121212]">
      
      {/* Top Extension Header */}
      <header className="bg-[#161616] border-b border-[#242424] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#FFB800] flex items-center justify-center">
              <Zap size={16} className="text-[#121212] fill-[#121212]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-[#F3F3F1]">DevFill</span>
                <span className="text-[10px] font-mono font-bold text-[#FFB800] bg-[#222] px-1.5 py-0.5 rounded border border-[#333]">
                  Manifest V3
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Test Email Preview */}
          <div 
            onClick={handleCopyEmail}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2C2C2C] hover:border-[#FFB800]/50 rounded-lg px-3 py-1.5 cursor-pointer transition-all text-xs group"
            title="Click to copy dynamic test email"
          >
            <Calendar size={13} className="text-[#FFB800]" />
            <span className="text-[#888884]">Email:</span>
            <span className="font-mono text-[#FFB800] font-semibold">{dynamicEmail}</span>
            {copied ? (
              <span className="text-[10px] text-[#00D084] font-bold ml-1 flex items-center gap-0.5">
                <Check size={11} /> Copied
              </span>
            ) : (
              <Copy size={11} className="text-[#777] group-hover:text-[#FFB800] ml-1" />
            )}
          </div>

          {/* View Mode Switcher */}
          <nav className="flex items-center bg-[#1A1A1A] border border-[#282828] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('popup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'popup'
                  ? 'bg-[#FFB800] text-[#121212]'
                  : 'text-[#A3A3A0] hover:text-[#F3F3F1]'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Toolbar Popup</span>
            </button>

            <button
              onClick={() => setActiveTab('options')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'options'
                  ? 'bg-[#FFB800] text-[#121212]'
                  : 'text-[#A3A3A0] hover:text-[#F3F3F1]'
              }`}
            >
              <Sliders size={13} />
              <span>Settings & Options</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        {activeTab === 'popup' ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#888884]">
                Browser Action Toolbar Popup
              </span>
            </div>
            <PopupView onOpenOptions={() => setActiveTab('options')} />
          </div>
        ) : (
          <div className="w-full">
            <OptionsView onBackToPopup={() => setActiveTab('popup')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-[#222222] px-6 py-3 text-xs text-[#6E6E6A] text-center">
        DevFill Manifest V3 Extension • Pure Client-Side <code className="text-[#A3A3A0] font-mono">chrome.storage.local</code>
      </footer>

      {/* In-Page Content Script Overlays */}
      <ContextMenuSimulator />
      <ShadowOverlay />

    </div>
  );
}
