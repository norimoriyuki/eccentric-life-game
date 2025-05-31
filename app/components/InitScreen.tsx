import React from 'react';
import { UpdateNotification } from './UpdateNotification';

interface InitScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onInitializeGame: () => void;
  onGoBack: () => void;
}

export const InitScreen: React.FC<InitScreenProps> = ({ 
  playerName, 
  setPlayerName, 
  onInitializeGame, 
  onGoBack 
}) => {
  return (
    <>
      <UpdateNotification />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400">運命の初期化</h2>
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-xl">
            <label htmlFor="player-name" className="block text-base font-medium text-gray-300 mb-3">
              🏷️ プレイヤー名
            </label>
            <input
              id="player-name"
              name="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-base"
              placeholder="あなたの名前を入力してください"
              maxLength={20}
              autoComplete="name"
            />
            <p className="text-sm text-gray-400 mt-2 mb-4">
              🎲 初期資産や才能をガチャで決めましょう！
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={onInitializeGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all"
              >
                🌪️ 人生をはじめる
              </button>
              <button
                onClick={onGoBack}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all border border-gray-600"
              >
                🏃 逃げる
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 