import React from 'react';
import { GameState, Card, CardDrawResult } from '../types';
import { UpdateNotification } from './UpdateNotification';
import { StatusDisplay } from './StatusDisplay';
import { CardComponent } from './CardComponent';

interface MainGameScreenProps {
  gameState: GameState;
  drawnCards: CardDrawResult | null;
  selectedPositiveCards: Card[];
  onTogglePositiveCard: (card: Card) => void;
  onExecuteCards: () => void;
  onCommitSuicide: () => void;
}

export const MainGameScreen: React.FC<MainGameScreenProps> = ({
  gameState,
  drawnCards,
  selectedPositiveCards,
  onTogglePositiveCard,
  onExecuteCards,
  onCommitSuicide
}) => {
  return (
    <>
      <UpdateNotification />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-3 py-3">
          <StatusDisplay gameState={gameState} />

          {drawnCards && (
            <>
              {/* ネガティブカード */}
              <div className="mb-3">
                <h5 className="text-lg font-bold mb-2 text-red-400 text-center">
                  ランダムリスク
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {drawnCards.negativeCards.map((card, index) => (
                    <CardComponent
                      key={`negative_${card.id}_${index}`}
                      card={card}
                      isPositive={false}
                      disabled={true}
                    />
                  ))}
                </div>
              </div>

              {/* ポジティブカード */}
              <div className="mb-3">
                <h5 className="text-lg font-bold mb-2 text-green-400 text-center">
                  行動選択
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {drawnCards.positiveCards.map((card, index) => (
                    <CardComponent
                      key={`positive_${card.id}_${index}`}
                      card={card}
                      isPositive={true}
                      isSelected={selectedPositiveCards.some(c => c.id === card.id)}
                      onClick={() => onTogglePositiveCard(card)}
                    />
                  ))}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="text-center space-y-2">
                <button
                  onClick={onExecuteCards}
                  disabled={selectedPositiveCards.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl"
                  style={{
                    opacity: selectedPositiveCards.length === 0 ? 0.5 : 1,
                    cursor: selectedPositiveCards.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ⚡ {selectedPositiveCards.length}枚実行
                </button>
                
                <button
                  onClick={onCommitSuicide}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-6 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl"
                >
                  💀 自殺
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}; 