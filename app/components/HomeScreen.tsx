import React, { useState, useEffect } from 'react';
import { UpdateNotification } from './UpdateNotification';

interface HomeScreenProps {
  onInitializeGame: (playerName: string) => void;
  defaultName?: string; // デフォルト名前を受け取る
  onShowScoreboard: () => void; // スコアボード画面への遷移
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onInitializeGame, defaultName, onShowScoreboard }) => {
  const getRandomName = () => {
    const names = [
      '太郎', '花子', '健太', '美咲', '翔', '麻衣', '大輔', '彩', '慶太', '由美',
      '雅之介', '美智子', '貴一郎', '麗香子', '慶太郎', '雅美子', '裕太郎', '貴美子', '雄一朗', '真理子',
      '勇心斗', '光宙', '天使羅', '姫煌々', '龍皇牙', '独角獣王', '幻想曲', '虹色愛', '雷音丸', '不死鳥炎',
      '究極無敵', '無限大愛', '銀河系王', '伝説勇者', '最終幻想', '超人王者', '不思議国', '王者無敵', '永遠愛心', '奇跡星愛',
      '煉獄散', '勇心炎丸', '心眼衣斗', '姫煌々愛', '宝冠黄金大王', '紗音瑠', '愛羅武勇', '魔法娘娘', '火星親友', '黄熊親方'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  const [playerName, setPlayerName] = useState('');

  // コンポーネントマウント時にデフォルト名前またはランダム名前を設定
  useEffect(() => {
    setPlayerName(defaultName || getRandomName());
  }, [defaultName]);

  const handleStartGame = () => {
    const name = playerName.trim() || getRandomName();
    onInitializeGame(name);
  };

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
            
            {/* 名前入力フィールド */}
            <div className="mb-6">
              <label htmlFor="player-name" className="block text-sm font-medium text-gray-300 mb-2">
                🏷️ プレイヤー名
              </label>
              <input
                id="player-name"
                name="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-center"
                placeholder="あなたの名前"
                maxLength={20}
                autoComplete="name"
              />
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-xl transform hover:scale-105 transition-all border border-red-500"
              >
                🎲 人生ガチャ開始
              </button>
              
              <button
                onClick={onShowScoreboard}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-2 px-6 rounded-lg text-base shadow-xl transform hover:scale-105 transition-all border border-yellow-500"
              >
                🏆 スコアボードを見る
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