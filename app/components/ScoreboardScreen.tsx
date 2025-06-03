import React, { useState, useEffect } from 'react';
import { UpdateNotification } from './UpdateNotification';
import { getTopScores } from '../../lib/scoreboard';
import { Score } from '../types';

interface ScoreboardScreenProps {
  onBackToHome: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({ onBackToHome }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const topScores = await getTopScores(100); // 100件取得
        setScores(topScores);
      } catch (err) {
        console.error('スコア取得エラー:', err);
        setError('スコアの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatWealth = (wealth: number) => {
    if (wealth >= 0) {
      return `¥${Math.floor(wealth)}万`;
    } else {
      return `-¥${Math.abs(Math.floor(wealth))}万`;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}位`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-900/30';
      case 2: return 'text-gray-300 bg-gray-700/30';
      case 3: return 'text-orange-400 bg-orange-900/30';
      default: return 'text-gray-400 bg-gray-800/30';
    }
  };

  return (
    <>
      <UpdateNotification />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-4xl mx-auto px-3 py-4">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              🏆 スコアボード 🏆
            </h1>
            <p className="text-sm text-gray-300 mb-4">
              資産ランキング TOP 100
            </p>
            
            <button
              onClick={onBackToHome}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl mb-4"
            >
              🏠 ホームに戻る
            </button>
          </div>

          {/* ローディング */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-xl text-gray-300">📊 スコアを読み込み中...</div>
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="text-center py-8">
              <div className="text-lg text-red-400 mb-4">❌ {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                🔄 再読み込み
              </button>
            </div>
          )}

          {/* スコアリスト */}
          {!isLoading && !error && (
            <div className="space-y-2">
              {scores.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-400">📝 まだスコアが登録されていません</div>
                </div>
              ) : (
                scores.map((score, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={score.id || index}
                      className={`p-3 rounded-lg border border-gray-600 ${getRankColor(rank)} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-center justify-between">
                        {/* ランクと名前 */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="text-lg font-bold min-w-[60px]">
                            {getRankIcon(rank)}
                          </div>
                          <div className="font-bold text-white truncate">
                            {score.playerName}
                          </div>
                        </div>

                        {/* ステータス */}
                        <div className="flex items-center space-x-4 text-sm">
                          {/* 資産 */}
                          <div className="text-center min-w-[80px]">
                            <div className={`font-bold ${score.wealth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatWealth(score.wealth)}
                            </div>
                            <div className="text-xs text-gray-400">資産</div>
                          </div>

                          {/* 年齢 */}
                          <div className="text-center min-w-[50px]">
                            <div className="text-orange-400 font-bold">{score.age}歳</div>
                            <div className="text-xs text-gray-400">年齢</div>
                          </div>

                          {/* 善良さ */}
                          <div className="text-center min-w-[50px]">
                            <div className={`font-bold ${score.goodness >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                              {score.goodness}
                            </div>
                            <div className="text-xs text-gray-400">善良</div>
                          </div>

                          {/* 登録日 */}
                          <div className="text-center min-w-[60px]">
                            <div className="text-gray-300 text-xs">
                              {formatDate(score.timestamp)}
                            </div>
                            <div className="text-xs text-gray-400">登録日</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 統計情報 */}
          {!isLoading && !error && scores.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>総登録者数: {scores.length}名</p>
              {scores.length > 0 && (
                <p>最高資産: {formatWealth(scores[0].wealth)} (by {scores[0].playerName})</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 