import React, { useState } from 'react';
import { useExtensionStorage } from '../../hooks/useExtensionStorage';
import { computeTestEmail, generateDateString } from '../../extension/engine/dateSuffix';
import { autoFillForm } from '../../extension/engine/formFiller';
import { DateSuffixFormat } from '../../types/extension';
import { Zap, Copy, Check, Settings, Crosshair, Calendar } from 'lucide-react';

interface PopupViewProps {
  onOpenOptions: () => void;
}

export const PopupView: React.FC<PopupViewProps> = ({ onOpenOptions }) => {
  const { settings, updateSettings } = useExtensionStorage();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dynamicEmail = computeTestEmail(settings);
  const currentDateSuffix = generateDateString(settings.dateSuffixFormat);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(dynamicEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFill = (target: 'active_form' | 'focused_element') => {
    const res = autoFillForm(settings, target);
    setFeedback(`Injected ${res.filledCount} field${res.filledCount === 1 ? '' : 's'}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const toggleDateFormat = (format: DateSuffixFormat) => {
    updateSettings({ dateSuffixFormat: format });
  };

  return (
    <div 
      id="devfill-popup"
      className="w-full max-w-[350px] bg-[#141414] text-[#F3F3F1] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl flex flex-col mx-auto"
    >
      {/* Extension Header */}
      <div className="bg-[#181818] px-4 py-3 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#FFB800] flex items-center justify-center">
            <Zap size={14} className="text-[#121212] fill-[#121212]" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-[#F3F3F1]">DevFill</h1>
            <p className="text-[10px] text-[#888884]">Test Form Auto-Filler</p>
          </div>
        </div>

        <button
          onClick={onOpenOptions}
          id="btn-open-options"
          className="p-1.5 rounded-md bg-[#222] hover:bg-[#2C2C2C] border border-[#333] text-[#A3A3A0] hover:text-[#F3F3F1] transition-colors cursor-pointer"
          title="Open Extension Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Main Body */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* Dynamic Computed Email Box */}
        <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg p-3">
          <div className="flex items-center justify-between text-[10px] text-[#888884] mb-1.5 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-[#FFB800]" />
              Dynamic Test Email
            </span>
            <span className="font-mono text-[#FFB800]">+{currentDateSuffix}</span>
          </div>

          <div 
            onClick={handleCopyEmail}
            className="flex items-center justify-between bg-[#121212] border border-[#282828] hover:border-[#FFB800]/50 rounded-md p-2 cursor-pointer transition-colors group"
            title="Click to copy test email"
          >
            <span className="font-mono text-xs text-[#FFB800] truncate font-medium mr-2">
              {dynamicEmail}
            </span>
            <div className="flex-shrink-0 text-[#777] group-hover:text-[#FFB800]">
              {copied ? <Check size={13} className="text-[#00D084]" /> : <Copy size={13} />}
            </div>
          </div>

          {/* Date Suffix Format Toggle */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#262626] text-[10px]">
            <span className="text-[#7A7A76]">Date Format:</span>
            <div className="flex gap-1">
              {(['DDMMYYYY', 'YYYYMMDD'] as DateSuffixFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => toggleDateFormat(fmt)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer transition-colors ${
                    settings.dateSuffixFormat === fmt
                      ? 'bg-[#FFB800] text-[#121212] font-bold'
                      : 'bg-[#222] text-[#888] hover:text-[#CCC] border border-[#2E2E2E]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleFill('active_form')}
            id="btn-fill-active-form"
            className="w-full bg-[#FFB800] hover:bg-[#E5A600] active:scale-[0.98] text-[#121212] font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
          >
            <Zap size={14} className="fill-[#121212]" />
            <span>Fill Form with Test Data</span>
          </button>

          <button
            onClick={() => handleFill('focused_element')}
            id="btn-fill-focused-input"
            className="w-full bg-[#202020] hover:bg-[#282828] text-[#F3F3F1] border border-[#333] font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Crosshair size={13} className="text-[#FFB800]" />
            <span>Fill Focused Input Only</span>
          </button>
        </div>

        {feedback && (
          <div className="bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-semibold px-2.5 py-1.5 rounded-md text-center">
            {feedback}
          </div>
        )}

        {/* Profile Data Snapshot */}
        <div className="bg-[#181818] border border-[#262626] rounded-lg p-2.5 text-[11px] space-y-1.5">
          <div className="text-[10px] text-[#888884] uppercase font-semibold">Current Test Profile Data</div>
          <div className="grid grid-cols-2 gap-1 text-[#D4D4D0]">
            <div>Name: <span className="text-[#F3F3F1] font-medium">{settings.firstName} {settings.lastName}</span></div>
            <div>Phone: <span className="text-[#F3F3F1] font-mono">{settings.phone}</span></div>
            <div className="col-span-2 truncate">Address: <span className="text-[#F3F3F1]">{settings.streetAddress}, {settings.city} {settings.zipCode}</span></div>
            <div>Country: <span className="text-[#F3F3F1]">{settings.country}</span></div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-[#181818] px-4 py-2 border-t border-[#242424] flex items-center justify-between text-[10px] text-[#6E6E6A]">
        <span>Hotkey: {settings.keyboardShortcut}</span>
        <button
          onClick={onOpenOptions}
          className="text-[#FFB800] hover:underline cursor-pointer"
        >
          Edit Profile Data
        </button>
      </div>
    </div>
  );
};
