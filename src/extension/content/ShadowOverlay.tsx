import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useExtensionStorage } from '../../hooks/useExtensionStorage';
import { autoFillForm } from '../engine/formFiller';
import { computeTestEmail } from '../engine/dateSuffix';
import { Zap, Crosshair, Check } from 'lucide-react';

export const ShadowOverlay: React.FC = () => {
  const { settings } = useExtensionStorage();
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [shadowMount, setShadowMount] = useState<HTMLElement | null>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    let host = document.getElementById('devfill-shadow-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'devfill-shadow-host';
      host.style.position = 'fixed';
      host.style.bottom = '20px';
      host.style.right = '20px';
      host.style.zIndex = '2147483647';
      host.style.pointerEvents = 'none';
      document.body.appendChild(host);
    }

    if (!shadowRootRef.current) {
      try {
        const shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRootRef.current = shadowRoot;

        const style = document.createElement('style');
        style.textContent = `
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
          .pill-container { pointer-events: auto; }
          .amber-btn {
            background-color: #FFB800;
            color: #121212;
            font-weight: 700;
            border: 1px solid #FFB800;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .amber-btn:hover { background-color: #E5A600; }
          .amber-btn:active { transform: scale(0.96); }
          .tactile-btn {
            background-color: #1E1E1E;
            color: #F3F3F1;
            border: 1px solid #2E2E2E;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .tactile-btn:hover { background-color: #282828; border-color: #3E3E3E; }
        `;
        shadowRoot.appendChild(style);

        const mount = document.createElement('div');
        mount.className = 'pill-container';
        shadowRoot.appendChild(mount);
        setShadowMount(mount);
      } catch {
        const existingMount = shadowRootRef.current?.querySelector('.pill-container') as HTMLElement;
        if (existingMount) setShadowMount(existingMount);
      }
    }
  }, []);

  // Keyboard shortcut listener (Alt+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleFill('active_form');
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [settings]);

  const handleFill = (target: 'active_form' | 'focused_element') => {
    const result = autoFillForm(settings, target);
    setStatusToast(`Filled ${result.filledCount} field${result.filledCount === 1 ? '' : 's'}`);
    setTimeout(() => setStatusToast(null), 2500);
  };

  if (!settings.enableFloatingTrigger || !shadowMount) return null;

  const currentEmail = computeTestEmail(settings);

  return createPortal(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: '#141414',
      border: '1px solid #2E2E2E',
      borderRadius: '24px',
      padding: '5px 8px 5px 10px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 184, 0, 0.25)',
      userSelect: 'none'
    }}>
      {/* Auto-Fill Form Button */}
      <button
        onClick={() => handleFill('active_form')}
        className="amber-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          borderRadius: '18px',
          fontSize: '13px'
        }}
        title={`Auto-Fill Active Form (${settings.keyboardShortcut})`}
      >
        <Zap size={14} fill="#121212" />
        <span>DevFill</span>
      </button>

      {/* Fill Focused Input Button */}
      <button
        onClick={() => handleFill('focused_element')}
        className="tactile-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '7px 11px',
          borderRadius: '18px',
          fontSize: '12px'
        }}
        title="Inject into Focused Input"
      >
        <Crosshair size={13} color="#FFB800" />
        <span>Focused</span>
      </button>

      {/* Dynamic Email Display */}
      <div 
        className="font-mono"
        style={{
          fontSize: '12px',
          color: '#D4D4D0',
          padding: '4px 8px',
          maxWidth: '190px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={currentEmail}
      >
        {currentEmail}
      </div>

      {statusToast && (
        <span style={{
          fontSize: '12px',
          background: '#00D084',
          color: '#121212',
          fontWeight: '700',
          padding: '4px 8px',
          borderRadius: '10px'
        }}>
          {statusToast}
        </span>
      )}
    </div>,
    shadowMount
  );
};
