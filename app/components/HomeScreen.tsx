import React from 'react';
import { UpdateNotification } from './UpdateNotification';

interface HomeScreenProps {
  onStartNewGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartNewGame }) => {
  return (
    <>
      <UpdateNotification />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 leading-tight">
              💀 エキセントリック人生ゲーム 💀
            </h1>
            <p className="text-base mb-6 text-gray-300 font-medium px-2">
            生きている間に可能な限り金を稼ごう！
            </p>
            <div className="space-y-4">
              <button
                onClick={onStartNewGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-xl transform hover:scale-105 transition-all border border-red-500"
              >
                🎲 人生ガチャ開始
              </button>
              <div className="space-y-2 text-sm text-gray-400 bg-black/30 p-3 rounded-lg border border-gray-700">
                <p className="text-red-400 font-semibold">⚠️ エキセントリックで不謹慎な内容が含まれています</p>
                <p className="text-yellow-400">💡 行動の数だけランダムな災厄が降りかかる</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 