import React, { useState, useEffect } from 'react';
import './App.css';
import FloatingButton from './components/FloatingButton';
import SideNotesPanel from './components/SideNotesPanel';

const STORAGE_KEY = 'sidenotes-theme';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setIsPanelOpen(prev => !prev);
      }
      
      // Escape key to close panel
      if (e.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [isPanelOpen]);

  const togglePanel = () => {
    setIsPanelOpen(prev => !prev);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
    }`}>
      
      {/* Main Content Area */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className={`
          max-w-2xl text-center
          ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}
        `}>
          
          {/* Logo/Icon */}
          <div className={`
            w-20 h-20 mx-auto mb-8 rounded-2xl
            flex items-center justify-center
            ${isDarkMode 
              ? 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg' 
              : 'bg-gradient-to-br from-white to-gray-50 shadow-xl'
            }
          `}>
            <div className={`
              w-12 h-12 rounded-lg
              ${isDarkMode 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }
              flex items-center justify-center text-white text-2xl font-bold
            `}>
              S
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            SideNotes Clone
          </h1>
          
          <p className={`
            text-lg md:text-xl mb-8 leading-relaxed
            ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}
          `}>
            Your offline-first PWA for quick notes and ideas.
            <br />
            Always accessible, works everywhere.
          </p>

          <div className="space-y-4 mb-12">
            <div className={`
              inline-flex items-center px-4 py-2 rounded-full text-sm
              ${isDarkMode 
                ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                : 'bg-white text-gray-700 border border-gray-200'
              }
            `}>
              <kbd className={`
                px-2 py-1 text-xs rounded mr-2
                ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}
              `}>
                Ctrl + Shift + N
              </kbd>
              to toggle notes panel
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Offline First',
                description: 'Works without internet. All your notes are stored locally and sync seamlessly.',
                icon: '📱'
              },
              {
                title: 'Markdown Support',
                description: 'Write with Markdown syntax and see live preview. Drag & drop images directly.',
                icon: '✍️'
              },
              {
                title: 'Always Accessible',
                description: 'Floating button stays visible. Quick access from any screen or application.',
                icon: '🚀'
              }
            ].map((feature, index) => (
              <div key={index} className={`
                p-6 rounded-xl
                ${isDarkMode 
                  ? 'bg-slate-800 border border-slate-700' 
                  : 'bg-white border border-gray-200 shadow-sm'
                }
              `}>
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className={`
                  font-semibold mb-2
                  ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}
                `}>
                  {feature.title}
                </h3>
                <p className={`
                  text-sm
                  ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}
                `}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <button
              onClick={togglePanel}
              className={`
                px-8 py-4 rounded-xl font-semibold text-lg
                transition-all duration-200 hover:scale-105
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg shadow-blue-500/25'
                }
              `}
            >
              Try SideNotes Now
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <FloatingButton 
        isOpen={isPanelOpen}
        onToggle={togglePanel}
        isDark={isDarkMode}
      />

      {/* Side Panel */}
      <SideNotesPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        isDark={isDarkMode}
        onThemeToggle={toggleTheme}
      />
    </div>
  );
}

export default App;