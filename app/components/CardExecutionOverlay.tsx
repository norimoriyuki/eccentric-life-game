import React from 'react';
import { Card, GameStatus } from '../types';

interface CardExecutionDetail {
  card: Card;
  statusBefore: GameStatus;
  statusAfter: GameStatus;
}

interface CardExecutionOverlayProps {
  detail: CardExecutionDetail;
  onNext: () => void;
  onSkip?: () => void;
  currentIndex: number;
  totalCards: number;
}

export const CardExecutionOverlay: React.FC<CardExecutionOverlayProps> = ({ 
  detail, 
  onNext, 
  onSkip, 
  currentIndex, 
  totalCards 
}) => {
  const { card, statusBefore, statusAfter } = detail;
  
  const formatChange = (before: number, after: number) => {
    const change = after - before;
    if (change === 0) return '変化なし';
    return change > 0 ? `+${change}` : `${change}`;
  };

  const getChangeColor = (before: number, after: number, isAge: boolean = false) => {
    const change = after - before;
    if (change === 0) return 'text-gray-400';
    if (isAge) {
      return change > 0 ? 'text-red-400' : 'text-green-400';
    }
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
      onClick={onNext}
    >
      <div 
        className="max-w-md w-full bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 shadow-2xl cursor-pointer"
        onClick={onNext}
      >
        {/* カード情報 */}
        <div className={`
          border-2 rounded-lg p-4 mb-6
          ${card.type === 'positive' 
            ? 'border-green-500 bg-gradient-to-br from-green-900 to-green-800' 
            : 'border-red-500 bg-gradient-to-br from-red-900 to-red-800'
          }
        `}>
          <h3 className="font-bold text-xl mb-2 text-white">{card.name}</h3>
          <p className="text-sm text-gray-200 mb-2">{card.description}</p>
          <div className="text-xs bg-black/40 p-2 rounded text-gray-100">
            {card.effect.description}
          </div>
        </div>

        {/* ステータス変化 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-yellow-400 mb-4 text-center">📊 ステータス変化</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-300">資産</div>
              <div className="text-lg">
                <span className="text-gray-400">{Math.floor(statusBefore.wealth)}万</span>
                <span className="mx-1">→</span>
                <span className="text-white">{Math.floor(statusAfter.wealth)}万</span>
              </div>
              <div className={`text-sm font-bold ${getChangeColor(statusBefore.wealth, statusAfter.wealth)}`}>
                {formatChange(statusBefore.wealth, statusAfter.wealth)}
              </div>
            </div>
            <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-300">信用度</div>
              <div className="text-lg">
                <span className="text-gray-400">{statusBefore.trust}</span>
                <span className="mx-1">→</span>
                <span className="text-white">{statusAfter.trust}</span>
              </div>
              <div className={`text-sm font-bold ${getChangeColor(statusBefore.trust, statusAfter.trust)}`}>
                {formatChange(statusBefore.trust, statusAfter.trust)}
              </div>
            </div>
            <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-300">能力</div>
              <div className="text-lg">
                <span className="text-gray-400">{statusBefore.ability}</span>
                <span className="mx-1">→</span>
                <span className="text-white">{statusAfter.ability}</span>
              </div>
              <div className={`text-sm font-bold ${getChangeColor(statusBefore.ability, statusAfter.ability)}`}>
                {formatChange(statusBefore.ability, statusAfter.ability)}
              </div>
            </div>
            <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-300">年齢</div>
              <div className="text-lg">
                <span className="text-gray-400">{statusBefore.age}歳</span>
                <span className="mx-1">→</span>
                <span className="text-white">{statusAfter.age}歳</span>
              </div>
              <div className={`text-sm font-bold ${getChangeColor(statusBefore.age, statusAfter.age, true)}`}>
                {formatChange(statusBefore.age, statusAfter.age)}
              </div>
            </div>
          </div>
        </div>

        {/* 進行情報 */}
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-3">
            {currentIndex + 1} / {totalCards}
          </div>
          <div className="text-xs text-gray-500">
            📱 画面をタップして次へ
          </div>
        </div>
      </div>

      {/* スキップリンク（オーバーレイコンテナの外） */}
      {onSkip && totalCards > 1 && currentIndex < totalCards - 1 && (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            残り{totalCards - currentIndex - 1}枚をスキップ
          </button>
        </div>
      )}
    </div>
  );
}; 