import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';

const PWAInstaller = ({ isDark }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed/standalone
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      
      // Show install prompt after a short delay if not installed
      if (!isStandalone) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setShowInstallPrompt(false);
      setCanInstall(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for iOS Safari (manual install instructions)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isStandalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('PWA: Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
      } else {
        console.log('PWA: User dismissed install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('sidenotes-install-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('sidenotes-install-dismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < dayInMs) {
        setShowInstallPrompt(false);
        return;
      }
    }
  }, []);

  // Don't show if already installed or can't install
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  // Detect device type for appropriate messaging
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const getDeviceIcon = () => {
    if (isAndroid || navigator.userAgent.includes('Mobile')) return <Smartphone className="w-5 h-5" />;
    if (navigator.userAgent.includes('iPad')) return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return (
        <div className="text-sm space-y-2">
          <p>To install SideNotes on iOS:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to install the app</li>
          </ol>
        </div>
      );
    }
    
    return (
      <div className="text-sm">
        <p>Install SideNotes as an app for quick access and offline use!</p>
      </div>
    );
  };

  return (
    <div className={`
      fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80
      z-50 animate-slide-up
    `}>
      <div className={`
        p-4 rounded-xl shadow-2xl backdrop-blur-sm border
        ${isDark 
          ? 'bg-slate-800/95 border-slash-600 text-slate-100' 
          : 'bg-white/95 border-gray-200 text-gray-900'
        }
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg
              ${isDark ? 'bg-slate-700' : 'bg-gray-100'}
            `}>
              {getDeviceIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-base">Install SideNotes</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Get the full app experience
              </p>
            </div>
          </div>
          
          <button
            onClick={dismissPrompt}
            className={`
              p-1 rounded-lg transition-colors
              ${isDark 
                ? 'hover:bg-slate-700 text-slate-400' 
                : 'hover:bg-gray-100 text-gray-500'
              }
            `}
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          {getInstallInstructions()}
        </div>

        {/* Benefits */}
        <div className={`
          grid grid-cols-3 gap-2 mb-4 text-xs
          ${isDark ? 'text-slate-400' : 'text-gray-600'}
        `}>
          <div className="text-center">
            <div className={`
              w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center
              ${isDark ? 'bg-slate-700' : 'bg-gray-100'}
            `}>
              ⚡
            </div>
            <span>Faster</span>
          </div>
          <div className="text-center">
            <div className={`
              w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center
              ${isDark ? 'bg-slate-700' : 'bg-gray-100'}
            `}>
              📱
            </div>
            <span>Native Feel</span>
          </div>
          <div className="text-center">
            <div className={`
              w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center
              ${isDark ? 'bg-slate-700' : 'bg-gray-100'}
            `}>
              🔒
            </div>
            <span>Offline</span>
          </div>
        </div>

        {/* Install Button */}
        {canInstall && deferredPrompt && !isIOS && (
          <button
            onClick={handleInstallClick}
            className={`
              w-full flex items-center justify-center space-x-2
              px-4 py-3 rounded-lg font-medium
              transition-all duration-200 hover:scale-105
              ${isDark 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white'
              }
              shadow-lg
            `}
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
        )}
        
        {/* iOS specific message */}
        {isIOS && (
          <div className={`
            text-center text-xs
            ${isDark ? 'text-slate-400' : 'text-gray-600'}
          `}>
            Use Safari's share menu to install
          </div>
        )}
      </div>
    </div>
  );
};

// CSS for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default PWAInstaller;