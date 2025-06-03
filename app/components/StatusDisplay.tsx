import React from 'react';
import { GameState } from '../types';

interface StatusDisplayProps {
  gameState: GameState;
  onStatusClick?: (statusType: string) => void;
}

// 状態名を日本語に変換する関数
const getStateDisplayName = (stateName: string): string => {
  const stateNameMap: Record<string, string> = {
    'allowance': '仕送り',
    'compound': '複利',
    'addiction': '薬中',
    'passiveIncome': '不労所得',
    'trauma': 'トラウマ',
    'security': '警護'
  };
  return stateNameMap[stateName] || stateName;
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ gameState, onStatusClick }) => (
  <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg mb-4 shadow-xl">
    <h2 className="text-lg font-bold mb-3 text-red-400 text-center">{gameState.playerName} </h2>
    
    {/* 資産を大きく表示 */}
    <div 
      className="text-center bg-gray-800 p-4 rounded border border-gray-600 mb-3 cursor-pointer hover:bg-gray-750 transition-colors" 
      onClick={() => onStatusClick?.('wealth')}
    >
      <div className={`text-3xl font-bold ${gameState.status.wealth >= 0 ? 'text-green-400' : 'text-red-500'}`}>
        {gameState.status.wealth >= 0 ? '¥' : '-¥'}{Math.abs(Math.floor(gameState.status.wealth))}万円
      </div>
      <div className="text-sm text-gray-300 mt-1">総資産</div>
    </div>
    
    {/* その他のステータス */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div 
        className="text-center bg-gray-800 p-2 rounded border border-gray-600 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => onStatusClick?.('goodness')}
      >
        <div className={`text-lg font-bold ${gameState.status.goodness >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
          {gameState.status.goodness}
        </div>
        <div className="text-xs text-gray-300">善良さ</div>
      </div>
      <div 
        className="text-center bg-gray-800 p-2 rounded border border-gray-600 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => onStatusClick?.('ability')}
      >
        <div className="text-lg font-bold text-purple-400">{gameState.status.ability}</div>
        <div className="text-xs text-gray-300">能力</div>
      </div>
      <div 
        className="text-center bg-gray-800 p-2 rounded border border-gray-600 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => onStatusClick?.('age')}
      >
        <div className="text-lg font-bold text-orange-400">{gameState.status.age}歳</div>
        <div className="text-xs text-gray-300">年齢</div>
      </div>
    </div>
    
    {/* 状態表示 */}
    {Object.entries(gameState.status).filter(([key, value]) => 
      !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
    ).length > 0 && (
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {Object.entries(gameState.status)
            .filter(([key, value]) => 
              !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
            )
            .map(([stateName, value]) => (
              <span
                key={stateName}
                className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-yellow-700 transition-colors"
                onClick={() => onStatusClick?.(stateName)}
              >
                {getStateDisplayName(stateName)} {value}
              </span>
            ))}
        </div>
      </div>
    )}
  </div>
); 