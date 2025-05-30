import React from 'react';

interface TestOverlayProps {
  onClose: () => void;
  title?: string;
  message?: string;
}

export const TestOverlay: React.FC<TestOverlayProps> = ({ 
  onClose, 
  title = "🎮 ゲーム開始！", 
  message = "エキセントリック人生ゲームへようこそ！" 
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border-2 border-red-600 rounded-lg p-6 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-400">{title}</h2>
          <p className="text-lg text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
          >
            🚀 ゲームを始める
          </button>
        </div>
      </div>
    </div>
  );
}; 