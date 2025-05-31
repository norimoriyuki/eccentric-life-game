import React, { useEffect, useState } from 'react';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Service Workerの更新を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
                
                // カウントダウン開始
                const interval = setInterval(() => {
                  setCountdown((prev) => {
                    if (prev <= 1) {
                      clearInterval(interval);
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdateNow = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const waiting = registration.waiting;
        if (waiting) {
          waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">🚀 アップデート利用可能</h3>
            <p className="text-xs text-blue-100">
              {countdown}秒後に自動更新します
            </p>
          </div>
          <button
            onClick={handleUpdateNow}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            今すぐ更新
          </button>
        </div>
      </div>
    </div>
  );
}; 