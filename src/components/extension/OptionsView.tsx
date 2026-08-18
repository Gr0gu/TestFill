import React, { useState } from 'react';
import { useExtensionStorage } from '../../hooks/useExtensionStorage';
import { computeTestEmail, generateDateString } from '../../extension/engine/dateSuffix';
import { DateSuffixFormat } from '../../types/extension';
import { Save, CheckCircle2, RotateCcw, Zap, Calendar, Mail, User, MapPin } from 'lucide-react';

interface OptionsViewProps {
  onBackToPopup?: () => void;
}

export const OptionsView: React.FC<OptionsViewProps> = ({ onBackToPopup }) => {
  const { settings, updateSettings } = useExtensionStorage();
  const [formData, setFormData] = useState(settings);
  const [savedStatus, setSavedStatus] = useState(false);

  // Synchronize when settings change
  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const dynamicEmailPreview = computeTestEmail(formData);
  const currentDateSuffix = generateDateString(formData.dateSuffixFormat);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#141414] border border-[#282828] rounded-xl shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#181818] border-b border-[#262626] px-6 py-4.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#FFB800] flex items-center justify-center">
            <Zap size={20} className="text-[#121212] fill-[#121212]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#F3F3F1]">DevFill Extension Settings</h1>
            <p className="text-sm text-[#888884]">Configure base work email, test profile data, and dynamic date suffixes</p>
          </div>
        </div>

        {onBackToPopup && (
          <button
            onClick={onBackToPopup}
            className="text-sm text-[#A3A3A0] hover:text-[#F3F3F1] bg-[#222] hover:bg-[#2A2A2A] border border-[#333] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            View Popup
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
        
        {/* Section 1: Base Work Email & Dynamic Date Suffix */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#242424] text-sm font-bold uppercase tracking-wider text-[#FFB800]">
            <Mail size={16} />
            <span>Email & Dynamic Date Suffix Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="base-email" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Base Work Email <span className="text-[#FFB800]">*</span>
              </label>
              <input
                id="base-email"
                type="text"
                value={formData.baseEmail}
                onChange={(e) => handleChange('baseEmail', e.target.value)}
                placeholder="user@company.com"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none font-mono"
                required
              />
              <span className="text-xs text-[#888884] mt-1.5 block">
                The prefix/suffix is inserted before the @ (e.g. <code>user+test...</code>)
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Date Suffix Pattern Toggle
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['DDMMYYYY', 'YYYYMMDD', 'YYYY-MM-DD', 'DD-MM-YYYY'] as DateSuffixFormat[]).map(format => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleChange('dateSuffixFormat', format)}
                    className={`py-2 px-2.5 rounded text-xs font-mono border transition-all cursor-pointer ${
                      formData.dateSuffixFormat === format
                        ? 'bg-[#FFB800] text-[#121212] font-bold border-[#FFB800]'
                        : 'bg-[#1A1A1A] text-[#888] border-[#2E2E2E] hover:text-[#CCC]'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Dynamic Email Preview */}
          <div className="bg-[#181818] border border-[#2C2C2C] rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div>
              <div className="text-xs text-[#888884] uppercase font-bold flex items-center gap-1.5">
                <Calendar size={13} className="text-[#FFB800]" />
                <span>Computed Dynamic Test Email (Today's System Date)</span>
              </div>
              <div className="text-sm font-mono text-[#FFB800] font-semibold mt-1">
                {dynamicEmailPreview}
              </div>
            </div>
            <span className="text-xs font-mono text-[#00D084] bg-[#00D084]/10 border border-[#00D084]/20 px-2.5 py-1 rounded">
              Suffix: +{currentDateSuffix}
            </span>
          </div>
        </div>

        {/* Section 2: Default Test Profile Data */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#242424] text-sm font-bold uppercase tracking-wider text-[#FFB800]">
            <User size={16} />
            <span>Default Test Profile Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Alex"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none"
              />
            </div>

            <div>
              <label htmlFor="last-name" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Morgan"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone-number" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Phone Number
              </label>
              <input
                id="phone-number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] font-mono outline-none"
              />
            </div>

            <div>
              <label htmlFor="street-address" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Street Address
              </label>
              <input
                id="street-address"
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                placeholder="742 Evergreen Terrace"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none"
              />
            </div>

            <div>
              <label htmlFor="city-input" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                City
              </label>
              <input
                id="city-input"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="San Francisco"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none"
              />
            </div>

            <div>
              <label htmlFor="zip-code" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                ZIP / Postal Code
              </label>
              <input
                id="zip-code"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="94107"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] font-mono outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="country-input" className="block text-sm font-semibold text-[#D4D4D0] mb-1.5">
                Country
              </label>
              <input
                id="country-input"
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="United States"
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#FFB800] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F3F1] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Floating Trigger & Shortcut */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#242424] text-sm font-bold uppercase tracking-wider text-[#FFB800]">
            <Zap size={16} />
            <span>Execution Controls</span>
          </div>

          <div className="flex items-center justify-between bg-[#181818] border border-[#282828] rounded-lg p-3.5">
            <div>
              <span className="text-sm font-semibold text-[#F3F3F1] block">In-Page Floating Trigger</span>
              <span className="text-xs text-[#888884]">Render floating auto-fill badge (Shadow DOM encapsulated)</span>
            </div>
            <input
              type="checkbox"
              id="enable-floating"
              checked={formData.enableFloatingTrigger}
              onChange={(e) => handleChange('enableFloatingTrigger', e.target.checked)}
              className="w-4 h-4 accent-[#FFB800] cursor-pointer"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedStatus && (
              <span className="flex items-center gap-1.5 text-sm text-[#00D084] font-semibold animate-fade-in">
                <CheckCircle2 size={16} />
                <span>Settings saved to extension storage!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            id="btn-save-settings"
            className="flex items-center gap-2 bg-[#FFB800] hover:bg-[#E5A600] text-[#121212] font-bold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow"
          >
            <Save size={15} />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};
