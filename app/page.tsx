'use client';

import React, { useState } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult } from './types';

// ゲーム画面の種類
enum GameScreen {
  HOME = 'home',
  INIT = 'init',
  MAIN = 'main',
  CARD_EFFECT = 'card_effect',
  GAME_OVER = 'game_over'
}

const EccentricLifeGame: React.FC = () => {
  const [gameEngine] = useState(new GameEngine());
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.HOME);
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [playerName, setPlayerName] = useState('');
  const [drawnCards, setDrawnCards] = useState<CardDrawResult | null>(null);
  const [selectedPositiveCards, setSelectedPositiveCards] = useState<Card[]>([]);

  // ゲーム開始
  const startNewGame = () => {
    setCurrentScreen(GameScreen.INIT);
  };

  // ゲーム初期化
  const initializeGame = () => {
    if (!playerName.trim()) {
      alert('プレイヤー名を入力してください');
      return;
    }

    const state = gameEngine.initializeGame({ playerName });
    setGameState(state);
    setCurrentScreen(GameScreen.MAIN);
    drawNewCards();
  };

  // 新しいカードを引く
  const drawNewCards = () => {
    const cards = gameEngine.drawCards();
    setDrawnCards(cards);
    setSelectedPositiveCards([]);
  };

  // ポジティブカードの選択/選択解除
  const togglePositiveCard = (card: Card) => {
    if (selectedPositiveCards.some(c => c.id === card.id)) {
      setSelectedPositiveCards(selectedPositiveCards.filter(c => c.id !== card.id));
    } else {
      setSelectedPositiveCards([...selectedPositiveCards, card]);
    }
  };

  // カードを実行
  const executeCards = () => {
    if (selectedPositiveCards.length === 0) {
      alert('最低1枚のポジティブカードを選択してください');
      return;
    }

    if (!drawnCards) return;

    const result = gameEngine.selectCards(selectedPositiveCards, drawnCards.negativeCards);
    setGameState(gameEngine.getState());

    if (result.isGameOver) {
      setCurrentScreen(GameScreen.GAME_OVER);
    } else {
      setCurrentScreen(GameScreen.CARD_EFFECT);
    }
  };

  // 次のターンへ
  const nextTurn = () => {
    const isAgeGameOver = gameEngine.checkAgeGameOver();
    if (isAgeGameOver) {
      setGameState(gameEngine.getState());
      setCurrentScreen(GameScreen.GAME_OVER);
    } else {
      drawNewCards();
      setCurrentScreen(GameScreen.MAIN);
    }
  };

  // ゲームリセット
  const resetGame = () => {
    gameEngine.resetGame();
    setGameState(gameEngine.getState());
    setPlayerName('');
    setDrawnCards(null);
    setSelectedPositiveCards([]);
    setCurrentScreen(GameScreen.HOME);
  };

  // ステータス表示コンポーネント
  const StatusDisplay: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-2">{gameState.playerName} さんの状況</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">¥{Math.floor(gameState.status.wealth)}万</div>
          <div className="text-sm text-gray-600">資産</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{gameState.status.trust}</div>
          <div className="text-sm text-gray-600">信用度</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{gameState.status.ability}</div>
          <div className="text-sm text-gray-600">能力</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{gameState.status.age}歳</div>
          <div className="text-sm text-gray-600">年齢</div>
        </div>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        ターン: {gameState.turn}
      </div>
    </div>
  );

  // カード表示コンポーネント
  const CardComponent: React.FC<{ 
    card: Card; 
    isPositive: boolean; 
    isSelected?: boolean; 
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ card, isPositive, isSelected, onClick, disabled }) => (
    <div 
      className={`
        border-2 rounded-lg p-4 cursor-pointer transition-all
        ${isPositive ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
        ${isSelected ? 'ring-4 ring-blue-300' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <h3 className="font-bold text-lg mb-2">{card.name}</h3>
      <p className="text-sm text-gray-700 mb-2">{card.description}</p>
      <div className="text-xs bg-gray-200 p-2 rounded">
        {card.effect.description}
      </div>
      {card.effect.risks && card.effect.risks.length > 0 && (
        <div className="text-xs text-red-600 mt-2">
          リスク: {card.effect.risks.join(', ')}
        </div>
      )}
    </div>
  );

  // ホーム画面
  if (currentScreen === GameScreen.HOME) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 text-purple-800">
            🎮 エキセントリック人生ゲーム 🎮
          </h1>
          <p className="text-xl mb-8 text-gray-700">
            リアル人生ゲーム - 資産、信用、能力、年齢を管理して生き抜け！
          </p>
          <div className="space-y-4">
            <button
              onClick={startNewGame}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
            >
              ゲーム開始
            </button>
            <div className="space-y-2 text-sm text-gray-600 max-w-md mx-auto">
              <p>⚠️ このゲームにはエキセントリックで不謹慎な内容が含まれています</p>
              <p>💡 ポジティブカードを選ぶと同数のネガティブカードも選ばれます</p>
              <p>🎯 リスクとリターンのバランスを考えて選択しましょう</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ゲーム初期化画面
  if (currentScreen === GameScreen.INIT) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">ゲーム初期化</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレイヤー名
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="あなたの名前を入力してください"
              maxLength={20}
            />
            <p className="text-sm text-gray-600 mt-2 mb-4">
              初期ステータスはランダムで決定されます
            </p>
            <div className="flex space-x-3">
              <button
                onClick={initializeGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                ゲーム開始
              </button>
              <button
                onClick={() => setCurrentScreen(GameScreen.HOME)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メインゲーム画面
  if (currentScreen === GameScreen.MAIN) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-4">
        <div className="max-w-6xl mx-auto">
          <StatusDisplay gameState={gameState} />

          {drawnCards && (
            <>
              {/* ポジティブカード */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4 text-green-700">
                  ポジティブカード（選択してください）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {drawnCards.positiveCards.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      isPositive={true}
                      isSelected={selectedPositiveCards.some(c => c.id === card.id)}
                      onClick={() => togglePositiveCard(card)}
                    />
                  ))}
                </div>
              </div>

              {/* ネガティブカード */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4 text-red-700">
                  ネガティブカード（自動選択される）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {drawnCards.negativeCards.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      isPositive={false}
                      disabled={true}
                    />
                  ))}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="text-center space-x-4">
                <button
                  onClick={executeCards}
                  disabled={selectedPositiveCards.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg"
                >
                  カードを実行
                </button>
                <button
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg"
                >
                  ゲーム終了
                </button>
              </div>

              {selectedPositiveCards.length > 0 && (
                <p className="text-center mt-4 text-sm text-gray-600">
                  選択中: {selectedPositiveCards.length}枚のポジティブカード
                  → {selectedPositiveCards.length}枚のネガティブカードが自動選択されます
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // カード効果実行画面
  if (currentScreen === GameScreen.CARD_EFFECT) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">カード効果実行</h2>
          
          <StatusDisplay gameState={gameState} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 選択されたポジティブカード */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-700">実行されたポジティブカード</h3>
              <div className="space-y-3">
                {gameState.selectedPositiveCards.map((card) => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    isPositive={true}
                    disabled={true}
                  />
                ))}
              </div>
            </div>

            {/* 自動選択されたネガティブカード */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-700">実行されたネガティブカード</h3>
              <div className="space-y-3">
                {gameState.selectedNegativeCards.map((card) => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    isPositive={false}
                    disabled={true}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={nextTurn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              次のターンへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ゲームオーバー画面
  if (currentScreen === GameScreen.GAME_OVER) {
    const deathReasonMap: Record<string, string> = {
      'old_age': '老衰',
      'assassination': '暗殺',
      'alien_abduction': 'エイリアンに解剖',
      'dimension_sucked': '異次元に吸い込まれ',
      'blackhole': 'ブラックホールに吸い込まれ'
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-orange-100 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-red-700">💀 GAME OVER 💀</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <p className="text-xl mb-4">
              死因: <span className="font-bold text-red-600">
                {gameState.gameOverReason ? deathReasonMap[gameState.gameOverReason] || gameState.gameOverReason : '不明'}
              </span>
            </p>
            
            <StatusDisplay gameState={gameState} />
            
            <div className="text-lg mb-4">
              <p>生存ターン数: <span className="font-bold">{gameState.turn - 1}</span></p>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              もう一度遊ぶ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EccentricLifeGame; 