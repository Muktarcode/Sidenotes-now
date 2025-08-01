import React from 'react';
import { StickyNote, X } from 'lucide-react';

const FloatingButton = ({ isOpen, onToggle, isDark }) => {
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <button
        onClick={onToggle}
        className={`
          group relative w-14 h-14 rounded-full shadow-lg
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-opacity-30
          ${isDark 
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-400 shadow-slate-900/50' 
            : 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-400 shadow-gray-400/30'
          }
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}
        aria-label={isOpen ? 'Close notes panel' : 'Open notes panel'}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <StickyNote className="w-6 h-6 transition-transform duration-200" />
          )}
        </div>
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <div className={`
            absolute inset-0 rounded-full animate-pulse
            ${isDark ? 'bg-slate-600' : 'bg-blue-400'}
            opacity-20
          `} />
        )}
      </button>
      
      {/* Tooltip */}
      <div className={`
        absolute right-16 top-1/2 transform -translate-y-1/2
        px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 pointer-events-none
        ${isDark 
          ? 'bg-slate-700 text-slate-200 border border-slate-600' 
          : 'bg-gray-900 text-white'
        }
        ${isOpen ? 'opacity-0 scale-95' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}
        whitespace-nowrap
      `}>
        {isOpen ? 'Close Notes' : 'Open Notes (Ctrl+Shift+N)'}
        <div className={`
          absolute left-full top-1/2 transform -translate-y-1/2
          border-4 border-transparent
          ${isDark ? 'border-l-slate-700' : 'border-l-gray-900'}
        `} />
      </div>
    </div>
  );
};

export default FloatingButton;