import React from 'react';
import { GameState } from '../types';

interface StatusDisplayProps {
  gameState: GameState;
}

// 状態名を日本語に変換する関数
const getStateDisplayName = (stateName: string): string => {
  const stateNameMap: Record<string, string> = {
    'allowance': '仕送り',
    'compound': '複利',
    'addiction': '薬中'
  };
  return stateNameMap[stateName] || stateName;
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ gameState }) => (
  <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg mb-4 shadow-xl">
    <h2 className="text-lg font-bold mb-3 text-red-400 text-center">{gameState.playerName} </h2>
    
    {/* 資産を大きく表示 */}
    <div className="text-center bg-gray-800 p-4 rounded border border-gray-600 mb-3">
      <div className={`text-3xl font-bold ${gameState.status.wealth >= 0 ? 'text-green-400' : 'text-red-500'}`}>
        {gameState.status.wealth >= 0 ? '¥' : '-¥'}{Math.abs(Math.floor(gameState.status.wealth))}万円
      </div>
      <div className="text-sm text-gray-300 mt-1">総資産</div>
    </div>
    
    {/* その他のステータス */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="text-center bg-gray-800 p-2 rounded border border-gray-600">
        <div className={`text-lg font-bold ${gameState.status.goodness >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
          {gameState.status.goodness}
        </div>
        <div className="text-xs text-gray-300">善良さ</div>
      </div>
      <div className="text-center bg-gray-800 p-2 rounded border border-gray-600">
        <div className="text-lg font-bold text-purple-400">{gameState.status.ability}</div>
        <div className="text-xs text-gray-300">能力</div>
      </div>
      <div className="text-center bg-gray-800 p-2 rounded border border-gray-600">
        <div className="text-lg font-bold text-orange-400">{gameState.status.age}歳</div>
        <div className="text-xs text-gray-300">年齢</div>
      </div>
    </div>
    
    {/* 状態表示 */}
    {Object.entries(gameState.status).filter(([key, value]) => 
      !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
    ).length > 0 && (
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">状態効果</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(gameState.status)
            .filter(([key, value]) => 
              !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
            )
            .map(([stateName, value]) => (
              <span
                key={stateName}
                className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs font-medium"
              >
                {getStateDisplayName(stateName)} {value}
              </span>
            ))}
        </div>
      </div>
    )}
    
    <div className="text-center text-gray-300">
      <span className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-xs">
        ターン: {gameState.turn} | 生存中...
      </span>
    </div>
  </div>
); 