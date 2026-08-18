import React, { useState } from 'react';
import { useExtensionStorage } from './hooks/useExtensionStorage';
import { PopupView } from './components/extension/PopupView';
import { OptionsView } from './components/extension/OptionsView';
import { ShadowOverlay } from './extension/content/ShadowOverlay';
import { ContextMenuSimulator } from './extension/content/ContextMenuSimulator';
import { computeTestEmail, generateDateString } from './extension/engine/dateSuffix';
import { Zap, Copy, Check, Sliders, LayoutGrid, Calendar, Download, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

export default function App() {
  const { settings } = useExtensionStorage();
  const [activeTab, setActiveTab] = useState<'popup' | 'options' | 'guide'>('popup');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const dynamicEmail = computeTestEmail(settings);
  const currentDateSuffix = generateDateString(settings.dateSuffixFormat);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(dynamicEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExtensionZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Fetch files from public/root
      const filesToInclude = [
        'manifest.json',
        'background.js',
        'content.js',
        'popup.html',
        'popup.js',
        'options.html',
        'options.js',
      ];

      for (const file of filesToInclude) {
        try {
          const res = await fetch(`/${file}`);
          if (res.ok) {
            const text = await res.text();
            zip.file(file, text);
          }
        } catch (e) {
          console.warn(`Could not load ${file}`, e);
        }
      }

      // Add icons
      const iconFolder = zip.folder('icons');
      for (const size of [16, 48, 128]) {
        try {
          const res = await fetch(`/icons/icon${size}.png`);
          if (res.ok) {
            const blob = await res.blob();
            iconFolder?.file(`icon${size}.png`, blob);
          }
        } catch (e) {
          console.warn(`Could not load icon${size}.png`, e);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devfill-extension-v3.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate extension zip', err);
    } finally {
      setDownloading(false);
    }
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

          {/* Actions & View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExtensionZip}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFB800] hover:bg-[#E5A600] text-[#121212] font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download pre-packaged extension zip ready to load in Chrome"
            >
              <Download size={13} />
              <span>{downloading ? 'Packaging...' : 'Download .zip'}</span>
            </button>

            <nav className="flex items-center bg-[#1A1A1A] border border-[#282828] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('popup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'popup'
                    ? 'bg-[#2E2E2E] text-[#FFB800]'
                    : 'text-[#A3A3A0] hover:text-[#F3F3F1]'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Popup</span>
              </button>

              <button
                onClick={() => setActiveTab('options')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'options'
                    ? 'bg-[#2E2E2E] text-[#FFB800]'
                    : 'text-[#A3A3A0] hover:text-[#F3F3F1]'
                }`}
              >
                <Sliders size={13} />
                <span>Options</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-[#2E2E2E] text-[#FFB800]'
                    : 'text-[#A3A3A0] hover:text-[#F3F3F1]'
                }`}
              >
                <HelpCircle size={13} />
                <span>Install Guide</span>
              </button>
            </nav>
          </div>

        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        {activeTab === 'popup' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#888884]">
                Toolbar Action Popup (Live Preview)
              </span>
            </div>
            <PopupView onOpenOptions={() => setActiveTab('options')} />
          </div>
        )}

        {activeTab === 'options' && (
          <div className="w-full">
            <OptionsView onBackToPopup={() => setActiveTab('popup')} />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="w-full max-w-2xl bg-[#181818] border border-[#282828] rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-4 border-b border-[#262626] pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F3F3F1]">How to Install in Chrome / Edge / Brave</h2>
                <p className="text-xs text-[#888884]">Load the extension directly as an Unpacked Extension</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#C4C4C0]">
              <div className="flex items-start gap-3 bg-[#131313] p-3.5 rounded-lg border border-[#222]">
                <div className="w-5 h-5 rounded-full bg-[#FFB800] text-[#121212] font-extrabold flex items-center justify-center shrink-0">1</div>
                <div>
                  <div className="font-semibold text-[#F3F3F1] mb-1">Get the extension folder</div>
                  <p className="text-[#888884]">
                    Click <strong className="text-[#FFB800]">"Download .zip"</strong> at the top right and unzip the folder on your computer, OR select the downloaded GitHub repository root folder (which now contains <code className="text-[#FFB800] font-mono">manifest.json</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#131313] p-3.5 rounded-lg border border-[#222]">
                <div className="w-5 h-5 rounded-full bg-[#FFB800] text-[#121212] font-extrabold flex items-center justify-center shrink-0">2</div>
                <div>
                  <div className="font-semibold text-[#F3F3F1] mb-1">Open Extensions Page in Browser</div>
                  <p className="text-[#888884]">
                    Navigate to <code className="text-[#FFB800] bg-[#1E1E1E] px-1.5 py-0.5 rounded font-mono">chrome://extensions</code> (or <code className="text-[#FFB800] bg-[#1E1E1E] px-1.5 py-0.5 rounded font-mono">edge://extensions</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#131313] p-3.5 rounded-lg border border-[#222]">
                <div className="w-5 h-5 rounded-full bg-[#FFB800] text-[#121212] font-extrabold flex items-center justify-center shrink-0">3</div>
                <div>
                  <div className="font-semibold text-[#F3F3F1] mb-1">Enable Developer Mode & Load Unpacked</div>
                  <p className="text-[#888884]">
                    Turn on the <strong className="text-[#F3F3F1]">"Developer mode"</strong> toggle in the top-right corner. Then click the <strong className="text-[#F3F3F1]">"Load unpacked"</strong> button in the top left and select the folder containing <code className="text-[#FFB800] font-mono">manifest.json</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#1F1905] border border-[#FFB800]/30 rounded-lg flex items-start gap-2.5">
                <AlertCircle size={16} className="text-[#FFB800] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-[#D6B265]">
                  <strong>Why you previously got an error:</strong> Chrome looks for <code className="font-mono">manifest.json</code> directly inside the folder you choose. The repository now includes the root <code className="font-mono">manifest.json</code>, <code className="font-mono">background.js</code>, and <code className="font-mono">content.js</code>, so selecting the folder or downloading the .zip will load instantly with no errors!
                </div>
              </div>

              {/* Local Build & Dev Commands Section */}
              <div className="mt-4 pt-4 border-t border-[#262626]">
                <div className="font-bold text-sm text-[#F3F3F1] mb-2 flex items-center gap-2">
                  <span className="text-[#FFB800]">💻</span> How to Build Locally (Terminal)
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[#A0A09C] mb-1">1. Install dependencies:</div>
                    <div className="bg-[#101010] border border-[#2A2A2A] rounded p-2 font-mono text-xs text-[#00D084] select-all">
                      npm install
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A09C] mb-1">2. Build production assets & extension bundle:</div>
                    <div className="bg-[#101010] border border-[#2A2A2A] rounded p-2 font-mono text-xs text-[#00D084] select-all">
                      npm run build
                    </div>
                    <p className="text-[10px] text-[#777] mt-1">
                      This compiles the app and generates the <code className="text-[#FFB800] font-mono">dist/</code> directory containing all extension scripts, HTML, and assets ready for Chrome.
                    </p>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A09C] mb-1">3. (Optional) Run local dev server:</div>
                    <div className="bg-[#101010] border border-[#2A2A2A] rounded p-2 font-mono text-xs text-[#00D084] select-all">
                      npm run dev
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-[#222222] px-6 py-3 text-xs text-[#6E6E6A] text-center flex items-center justify-between max-w-5xl mx-auto w-full">
        <span>DevFill Manifest V3 Extension</span>
        <span>Alt+Shift+F auto-fill shortcut</span>
      </footer>

      {/* In-Page Content Script Overlays */}
      <ContextMenuSimulator />
      <ShadowOverlay />

    </div>
  );
}
