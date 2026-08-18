import React, { useState, useEffect } from 'react';
import { useExtensionStorage } from '../../hooks/useExtensionStorage';
import { autoFillForm } from '../engine/formFiller';
import { Zap } from 'lucide-react';

export const ContextMenuSimulator: React.FC = () => {
  const { settings } = useExtensionStorage();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 240);
      const y = Math.min(e.clientY, window.innerHeight - 80);
      setPosition({ x, y });
      setIsOpen(true);
    };

    const handleClickOutside = () => setIsOpen(false);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleFill = () => {
    autoFillForm(settings, 'active_form');
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
        width: '230px',
        backgroundColor: '#161616',
        border: '1px solid #333333',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 184, 0, 0.25)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleFill}
        className="flex items-center justify-between w-full px-2.5 py-2 text-left rounded hover:bg-[#FFB800] hover:text-[#121212] font-semibold text-xs text-[#F3F3F1] transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-[#FFB800] group-hover:text-[#121212] group-hover:fill-[#121212]" />
          <span>Fill Form with Test Data</span>
        </div>
        <span className="text-[10px] font-mono opacity-70">Alt+Shift+F</span>
      </button>
    </div>
  );
};
