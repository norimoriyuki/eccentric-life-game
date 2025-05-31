import React from 'react';
import { GameState, GameOverReason } from '../types';
import { UpdateNotification } from './UpdateNotification';
import { StatusDisplay } from './StatusDisplay';

interface GameOverScreenProps {
  gameState: GameState;
  onResetGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onResetGame }) => {
  const deathReasonMap: Record<string, string> = {
    [GameOverReason.OLD_AGE]: '老衰で朽ち果てた',
    [GameOverReason.ASSASSINATION]: '暗殺された',
    [GameOverReason.ALIEN_ABDUCTION]: 'エイリアンに解剖された',
    [GameOverReason.DIMENSION_SUCKED]: '異次元に吸い込まれた',
    [GameOverReason.BLACKHOLE]: 'ブラックホールに呑まれた',
    [GameOverReason.SUICIDE]: '自ら命を絶った'
  };

  return (
    <>
      <UpdateNotification />
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-gray-900">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-red-400 animate-pulse">
              💀 GAME OVER 💀
            </h1>
            
            <div className="bg-gray-900 border-2 border-red-600 p-4 rounded-lg shadow-xl mb-6">
              <p className="text-lg mb-4 text-red-300">
                運命の審判: <span className="font-bold text-red-400 block mt-1">
                  {gameState.gameOverReason ? deathReasonMap[gameState.gameOverReason] || gameState.gameOverReason : '原因不明で消滅'}
                </span>
              </p>
              
              <StatusDisplay gameState={gameState} />
              
              <div className="text-base mb-4 bg-black/40 p-3 rounded border border-gray-700">
                <p className="text-yellow-400">生存記録: <span className="font-bold text-white">{gameState.turn - 1} ターン</span></p>
              </div>
            </div>

            <button
              onClick={onResetGame}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 transition-all shadow-xl"
            >
              🔄 再び人生を始める
            </button>
            
          </div>
        </div>
      </div>
    </>
  );
}; 