import React, { useState } from 'react';
import { GameState, GameOverReason } from '../types';
import { UpdateNotification } from './UpdateNotification';
import { StatusDisplay } from './StatusDisplay';
import { saveScore } from '../../lib/scoreboard';

interface GameOverScreenProps {
  gameState: GameState;
  onResetGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onResetGame }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [playerName, setPlayerName] = useState(gameState.playerName);

  const deathReasonMap: Record<string, string> = {
    [GameOverReason.OLD_AGE]: '老衰で朽ち果てた',
    [GameOverReason.ASSASSINATION]: '暗殺された',
    [GameOverReason.ALIEN_ABDUCTION]: 'エイリアンに解剖された',
    [GameOverReason.DIMENSION_SUCKED]: '異次元に吸い込まれた',
    [GameOverReason.BLACKHOLE]: 'ブラックホールに呑まれた',
    [GameOverReason.SUICIDE]: '自ら命を絶った',
    [GameOverReason.DEATH_PENALTY]: '死刑執行された'
  };

  const handleRegisterScore = async () => {
    if (isRegistering || registrationComplete) return;

    setIsRegistering(true);
    try {
      await saveScore({
        playerName: playerName.trim() || gameState.playerName,
        wealth: Math.floor(gameState.status.wealth),
        age: gameState.status.age,
        goodness: gameState.status.goodness,
        ability: gameState.status.ability,
        gameOverReason: gameState.gameOverReason || GameOverReason.OLD_AGE,
        turns: gameState.turn - 1,
        timestamp: Date.now()
      });
      setRegistrationComplete(true);
    } catch (error) {
      console.error('スコア登録エラー:', error);
    } finally {
      setIsRegistering(false);
    }
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

            <div className="space-y-3">
              {!registrationComplete && (
                <>
                  <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
                    <label htmlFor="score-player-name" className="block text-sm font-medium text-gray-300 mb-2">
                      🏷️ スコア登録名
                    </label>
                    <input
                      id="score-player-name"
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white text-center"
                      placeholder="スコア登録名を入力"
                      maxLength={20}
                      disabled={isRegistering}
                    />
                  </div>
                  
                  <button
                    onClick={handleRegisterScore}
                    disabled={isRegistering || !playerName.trim()}
                    className={`w-full font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 transition-all shadow-xl ${
                      isRegistering || !playerName.trim()
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                    }`}
                  >
                    {isRegistering ? '🔄 登録中...' : '🏆 スコアを登録'}
                  </button>
                </>
              )}
              
              {registrationComplete && (
                <div className="bg-green-900 border border-green-600 p-3 rounded-lg">
                  <p className="text-green-300 font-bold">✅ スコア登録完了！</p>
                </div>
              )}

              <button
                onClick={onResetGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 transition-all shadow-xl"
              >
                🔄 再人生ガチャ
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}; 