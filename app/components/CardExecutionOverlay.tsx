import React from 'react';
import { Card, GameStatus } from '../types';

// 実行フェーズの種類
enum ExecutionPhase {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  STATE_EFFECTS = 'state_effects'
}

// フェーズ実行結果の詳細
interface PhaseExecutionDetail {
  phase: ExecutionPhase;
  phaseName: string;
  cards?: Card[]; // ポジティブ・ネガティブフェーズのみ
  statusBefore: GameStatus;
  statusAfter: GameStatus;
  descriptions: string[]; // 各効果の説明
}

interface CardExecutionOverlayProps {
  detail: PhaseExecutionDetail;
  onNext: () => void;
  onSkip?: () => void;
  currentIndex: number;
  totalCards: number;
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

export const CardExecutionOverlay: React.FC<CardExecutionOverlayProps> = ({ 
  detail, 
  onNext, 
  onSkip, 
  currentIndex, 
  totalCards: _totalCards 
}) => {
  const { phase, phaseName, cards, statusBefore, statusAfter, descriptions } = detail;
  
  const formatChange = (before: number, after: number) => {
    const change = after - before;
    if (change === 0) return '変化なし';
    return change > 0 ? `+${Math.floor(change)}` : `${Math.floor(change)}`;
  };

  const getChangeColor = (before: number, after: number, isAge: boolean = false) => {
    const change = after - before;
    if (change === 0) return 'text-gray-400';
    if (isAge) {
      return change > 0 ? 'text-red-400' : 'text-green-400';
    }
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPhaseColor = () => {
    switch (phase) {
      case ExecutionPhase.POSITIVE:
        return 'border-green-500 bg-gradient-to-br from-green-900 to-green-800';
      case ExecutionPhase.NEGATIVE:
        return 'border-red-500 bg-gradient-to-br from-red-900 to-red-800';
      case ExecutionPhase.STATE_EFFECTS:
        return 'border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-800';
      default:
        return 'border-gray-500 bg-gradient-to-br from-gray-900 to-gray-800';
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case ExecutionPhase.POSITIVE:
        return '✨';
      case ExecutionPhase.NEGATIVE:
        return '💀';
      case ExecutionPhase.STATE_EFFECTS:
        return '🔄';
      default:
        return '🎲';
    }
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
        {/* フェーズ情報 */}
        <div className={`border-2 rounded-lg p-4 mb-6 ${getPhaseColor()}`}>
          <h3 className="font-bold text-xl mb-3 text-white text-center">
            {getPhaseIcon()} {phaseName}
          </h3>
          
          {/* カード一覧（ポジティブ・ネガティブフェーズのみ） */}
          {cards && cards.length > 0 && (
            <div className="space-y-2">
              {cards.map((card, index) => (
                <div key={index} className="bg-black/40 p-3 rounded border border-gray-600">
                  <div className="text-sm font-semibold text-white mb-1">
                    {card.name}
                  </div>
                  <div className="text-xs text-gray-200">
                    {descriptions[index] ? descriptions[index].replace(`${card.name}: `, '') : card.description}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 状態効果のみの場合（カードがない場合） */}
          {!cards && descriptions.length > 0 && (
            <div className="space-y-1">
              {descriptions.map((desc, index) => (
                <div key={index} className="text-xs bg-black/40 p-2 rounded text-gray-100">
                  {desc}
                </div>
              ))}
            </div>
          )}
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
              <div className="text-sm text-gray-300">善良さ</div>
              <div className="text-lg">
                <span className="text-gray-400">{statusBefore.goodness}</span>
                <span className="mx-1">→</span>
                <span className="text-white">{statusAfter.goodness}</span>
              </div>
              <div className={`text-sm font-bold ${getChangeColor(statusBefore.goodness, statusAfter.goodness)}`}>
                {formatChange(statusBefore.goodness, statusAfter.goodness)}
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

        {/* 状態効果の表示 */}
        {phase !== ExecutionPhase.STATE_EFFECTS && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-purple-400 mb-2 text-center">状態効果</h4>
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(statusAfter)
                .filter(([key, value]) => 
                  !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
                )
                .map(([stateName, value]) => (
                  <span
                    key={stateName}
                    className="bg-purple-600 text-purple-100 px-2 py-1 rounded text-xs font-medium"
                  >
                    {getStateDisplayName(stateName)} {value}
                  </span>
                ))}
              {Object.entries(statusAfter)
                .filter(([key, value]) => 
                  !['wealth', 'goodness', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
                ).length === 0 && (
                <span className="text-gray-400 text-sm">状態効果なし</span>
              )}
            </div>
          </div>
        )}

        {/* 進行情報 */}
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-3">
            フェーズ {currentIndex + 1} / 3
          </div>
          <div className="text-xs text-gray-500">
            📱 画面をタップして次へ
          </div>
        </div>
      </div>

      {/* スキップリンク */}
      {onSkip && currentIndex < 2 && (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            残りフェーズをスキップ
          </button>
        </div>
      )}
    </div>
  );
}; 