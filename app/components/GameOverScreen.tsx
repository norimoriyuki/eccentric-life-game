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
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const deathReasonMap: Record<string, string> = {
    [GameOverReason.OLD_AGE]: '老衰で朽ち果てた',
    [GameOverReason.ASSASSINATION]: '暗殺された',
    [GameOverReason.ALIEN_ABDUCTION]: 'エイリアンに解剖された',
    [GameOverReason.DIMENSION_SUCKED]: '異次元に吸い込まれた',
    [GameOverReason.BLACKHOLE]: 'ブラックホールに呑まれた',
    [GameOverReason.SUICIDE]: '自ら命を絶った'
  };

  const handleSaveScore = async () => {
    if (isSavingScore || scoreSaved) return;
    
    setIsSavingScore(true);
    
    try {
      const scoreData = {
        playerName: gameState.playerName,
        wealth: Math.floor(gameState.status.wealth),
        goodness: gameState.status.goodness,
        ability: gameState.status.ability,
        age: gameState.status.age,
        turns: gameState.turn - 1,
        gameOverReason: gameState.gameOverReason ? deathReasonMap[gameState.gameOverReason] || gameState.gameOverReason : '原因不明',
        timestamp: Date.now(),
      };

      const result = await saveScore(scoreData);
      
      if (result) {
        setScoreSaved(true);
        console.log('スコアが正常に保存されました');
      } else {
        console.error('スコア保存に失敗しました');
      }
    } catch (error) {
      console.error('スコア保存エラー:', error);
    } finally {
      setIsSavingScore(false);
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
              {/* スコア登録ボタン */}
              <button
                onClick={handleSaveScore}
                disabled={isSavingScore || scoreSaved}
                className={`w-full font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 transition-all shadow-xl ${
                  scoreSaved 
                    ? 'bg-green-600 text-white cursor-not-allowed' 
                    : isSavingScore
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                }`}
              >
                {scoreSaved ? '✅ スコア登録完了' : isSavingScore ? '⏳ 登録中...' : '🏆 スコアを登録'}
              </button>

              {/* 再プレイボタン */}
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