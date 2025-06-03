import React from 'react';

interface SuicideConfirmationOverlayProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const SuicideConfirmationOverlay: React.FC<SuicideConfirmationOverlayProps> = ({
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full bg-gray-900 border-2 border-red-600 rounded-lg p-6 shadow-2xl">
        {/* 警告アイコンとタイトル */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="font-bold text-xl text-red-400 mb-2">
            本当に人生を終了しますか？
          </h3>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <button
            onClick={onCancel}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl"
          >
            💡 やっぱりやめる
          </button>
          
          <button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl"
          >
            💀 人生を終了する
          </button>
        </div>
      </div>
    </div>
  );
}; 