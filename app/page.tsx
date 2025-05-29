'use client';

import React, { useState } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult, CardSelectionResult } from './types';

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
  const [lastCardResult, setLastCardResult] = useState<CardSelectionResult | null>(null);

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
    setLastCardResult(result);

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
      setLastCardResult(null);
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
    setLastCardResult(null);
    setCurrentScreen(GameScreen.HOME);
  };

  // ステータス表示コンポーネント
  const StatusDisplay: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg mb-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-red-400">{gameState.playerName} さんの人生状況</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className={`text-3xl font-bold ${gameState.status.wealth >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {gameState.status.wealth >= 0 ? '¥' : '-¥'}{Math.abs(Math.floor(gameState.status.wealth))}万
          </div>
          <div className="text-sm text-gray-300">
            資産{gameState.status.wealth < 0 ? '（借金）' : ''}
          </div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className={`text-3xl font-bold ${gameState.status.trust >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
            {gameState.status.trust}
          </div>
          <div className="text-sm text-gray-300">
            信用度{gameState.status.trust < 0 ? '（悪評）' : ''}
          </div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-3xl font-bold text-purple-400">{gameState.status.ability}</div>
          <div className="text-sm text-gray-300">能力</div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-3xl font-bold text-orange-400">{gameState.status.age}歳</div>
          <div className="text-sm text-gray-300">年齢</div>
        </div>
      </div>
      <div className="mt-4 text-center text-gray-300">
        <span className="bg-gray-800 px-3 py-1 rounded border border-gray-600">
          ターン: {gameState.turn} | 生存中...
        </span>
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
        border-2 rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105
        ${isPositive 
          ? 'border-green-500 bg-gradient-to-br from-green-900 to-green-800 shadow-green-500/20' 
          : 'border-red-500 bg-gradient-to-br from-red-900 to-red-800 shadow-red-500/20'
        }
        ${isSelected ? 'ring-4 ring-yellow-400 shadow-yellow-400/30' : ''}
        ${disabled ? 'opacity-70 cursor-not-allowed hover:scale-100' : 'hover:shadow-2xl'}
        shadow-xl
      `}
      onClick={disabled ? undefined : onClick}
    >
      <h3 className="font-bold text-xl mb-3 text-white drop-shadow-lg">{card.name}</h3>
      <p className="text-sm text-gray-200 mb-3 leading-relaxed">{card.description}</p>
      <div className="text-xs bg-black/40 backdrop-blur-sm p-3 rounded border border-gray-600 text-gray-100">
        {card.effect.description}
      </div>
      {card.effect.risks && card.effect.risks.length > 0 && (
        <div className="text-xs text-red-300 mt-3 bg-red-900/30 p-2 rounded border border-red-700">
          ⚠️ リスク: {card.effect.risks.join(', ')}
        </div>
      )}
    </div>
  );

  // ステータス変化差分表示コンポーネント
  const StatusChangeSummary: React.FC<{ result: CardSelectionResult }> = ({ result }) => {
    if (!result.statusChanges || result.statusChanges.length === 0) return null;

    // 変化量の合計を計算
    const totalChanges = result.statusChanges.reduce((acc, change) => {
      return {
        wealth: (acc.wealth || 0) + (change.wealth || 0),
        trust: (acc.trust || 0) + (change.trust || 0),
        ability: (acc.ability || 0) + (change.ability || 0),
        age: (acc.age || 0) + (change.age || 0),
        wealthMultiplier: (change.wealthMultiplier && change.wealthMultiplier !== 1) 
          ? (acc.wealthMultiplier || 1) * change.wealthMultiplier 
          : (acc.wealthMultiplier || 1)
      };
    }, { wealth: 0, trust: 0, ability: 0, age: 0, wealthMultiplier: 1 });

    const formatChange = (value: number, isMultiplier: boolean = false) => {
      if (value === 0 || (isMultiplier && value === 1)) return null;
      
      if (isMultiplier) {
        return value > 1 ? `×${value.toFixed(1)}` : `×${value.toFixed(1)}`;
      }
      
      return value > 0 ? `+${Math.floor(value)}` : `${Math.floor(value)}`;
    };

    const getChangeColor = (value: number, isAge: boolean = false, isMultiplier: boolean = false) => {
      if (value === 0 || (isMultiplier && value === 1)) return 'text-gray-400';
      
      if (isAge) {
        return value > 0 ? 'text-red-400' : 'text-green-400'; // 年齢は増加が悪い
      }
      
      return value > 0 ? 'text-green-400' : 'text-red-400';
    };

    return (
      <div className="bg-black/60 border border-yellow-600 p-6 rounded-lg mb-6">
        <h3 className="text-2xl font-bold mb-4 text-yellow-400 text-center">📊 ステータス変化</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300">資産</div>
            <div className={`text-2xl font-bold ${getChangeColor(totalChanges.wealth || 0)}`}>
              {formatChange(totalChanges.wealth || 0) || '±0'}
            </div>
            {totalChanges.wealthMultiplier && totalChanges.wealthMultiplier !== 1 && (
              <div className={`text-lg font-bold ${getChangeColor(totalChanges.wealthMultiplier, false, true)}`}>
                {formatChange(totalChanges.wealthMultiplier, true)}
              </div>
            )}
          </div>
          <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300">信用度</div>
            <div className={`text-2xl font-bold ${getChangeColor(totalChanges.trust || 0)}`}>
              {formatChange(totalChanges.trust || 0) || '±0'}
            </div>
          </div>
          <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300">能力</div>
            <div className={`text-2xl font-bold ${getChangeColor(totalChanges.ability || 0)}`}>
              {formatChange(totalChanges.ability || 0) || '±0'}
            </div>
          </div>
          <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300">年齢</div>
            <div className={`text-2xl font-bold ${getChangeColor(totalChanges.age || 0, true)}`}>
              {formatChange(totalChanges.age || 0) || '±0'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ホーム画面
  if (currentScreen === GameScreen.HOME) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 drop-shadow-2xl">
            💀 エキセントリック人生ゲーム 💀
          </h1>
          <p className="text-2xl mb-8 text-gray-300 font-medium">
            リアル人生ゲーム - 資産、信用、能力、年齢を管理して生き抜け！
          </p>
          <div className="space-y-6">
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-2xl transform hover:scale-105 transition-all border border-red-500"
            >
              🎲 人生ガチャ開始
            </button>
            <div className="space-y-3 text-sm text-gray-400 max-w-lg mx-auto bg-black/30 p-6 rounded-lg border border-gray-700">
              <p className="text-red-400 font-semibold">⚠️ このゲームにはエキセントリックで不謹慎な内容が含まれています</p>
              <p className="text-yellow-400">💡 ポジティブカードを選ぶと同数のネガティブカードも選ばれます</p>
              <p className="text-blue-400">🎯 リスクとリターンのバランスを考えて選択しましょう</p>
              <p className="text-purple-400">💀 死は常に隣り合わせ...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ゲーム初期化画面
  if (currentScreen === GameScreen.INIT) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center text-red-400">運命の初期化</h2>
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl">
            <label className="block text-lg font-medium text-gray-300 mb-4">
              🏷️ プレイヤー名
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-lg"
              placeholder="あなたの名前を入力してください"
              maxLength={20}
            />
            <p className="text-sm text-gray-400 mt-3 mb-6">
              🎲 出生はガチャです
            </p>
            <div className="flex space-x-4">
              <button
                onClick={initializeGame}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all"
              >
                🌪️ 人生をはじめる
              </button>
              <button
                onClick={() => setCurrentScreen(GameScreen.HOME)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all border border-gray-600"
              >
                🏃 逃げる
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <StatusDisplay gameState={gameState} />

          {drawnCards && (
            <>
              {/* ポジティブカード */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-6 text-green-400 text-center">
                  💰 リターン（選択してください）
                </h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                  {drawnCards.positiveCards.map((card, index) => (
                    <CardComponent
                      key={`positive_${card.id}_${index}`}
                      card={card}
                      isPositive={true}
                      isSelected={selectedPositiveCards.some(c => c.id === card.id)}
                      onClick={() => togglePositiveCard(card)}
                    />
                  ))}
                </div>
              </div>

              {/* ネガティブカード */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-6 text-red-400 text-center">
                  💀 運命の報復（自動選択される）
                </h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
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

              {/* 操作ボタン */}
              <div className="text-center space-x-6">
                <button
                  onClick={executeCards}
                  disabled={selectedPositiveCards.length === 0}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-10 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
                >
                  ⚡ 運命を実行
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
                >
                  💀 諦める
                </button>
              </div>

              {selectedPositiveCards.length > 0 && (
                <p className="text-center mt-6 text-lg text-yellow-400 bg-black/30 p-4 rounded-lg border border-yellow-600 max-w-2xl mx-auto">
                  🎯 選択中: {selectedPositiveCards.length}枚
                  → {selectedPositiveCards.length}枚の報復が自動選択されます
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center text-yellow-400">⚡ 運命の審判 ⚡</h2>
          
          <StatusDisplay gameState={gameState} />

          {/* ステータス変化差分表示 */}
          {lastCardResult && <StatusChangeSummary result={lastCardResult} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* 選択されたポジティブカード */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-400 text-center">
                💰 リターン
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h3 className="text-2xl font-bold mb-6 text-red-400 text-center">
                💀 リスク
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gameState.selectedNegativeCards.map((card, index) => (
                  <CardComponent
                    key={`selected_negative_${card.id}_${index}`}
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
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-12 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
            >
              🔮 次の運命へ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ゲームオーバー画面
  if (currentScreen === GameScreen.GAME_OVER) {
    const deathReasonMap: Record<string, string> = {
      'old_age': '老衰で朽ち果てた',
      'assassination': '暗殺された',
      'alien_abduction': 'エイリアンに解剖された',
      'dimension_sucked': '異次元に吸い込まれた',
      'blackhole': 'ブラックホールに呑まれた'
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-gray-900 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8 text-red-400 animate-pulse drop-shadow-2xl">
            💀 GAME OVER 💀
          </h1>
          
          <div className="bg-gray-900 border-2 border-red-600 p-8 rounded-lg shadow-2xl mb-8">
            <p className="text-3xl mb-6 text-red-300">
              運命の審判: <span className="font-bold text-red-400 block mt-2">
                {gameState.gameOverReason ? deathReasonMap[gameState.gameOverReason] || gameState.gameOverReason : '原因不明で消滅'}
              </span>
            </p>
            
            <StatusDisplay gameState={gameState} />
            
            <div className="text-2xl mb-6 bg-black/40 p-4 rounded border border-gray-700">
              <p className="text-yellow-400">生存記録: <span className="font-bold text-white">{gameState.turn - 1} ターン</span></p>
              <p className="text-gray-400 mt-2 text-lg">
                {gameState.turn < 5 ? "あまりにも短い人生でした..." : 
                 gameState.turn < 15 ? "そこそこ頑張りました" : 
                 gameState.turn < 30 ? "なかなかの生存者です" : 
                 "伝説の生存者です！"}
              </p>
            </div>
          </div>

          <div className="space-x-6">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
            >
              🔄 再び人生を始める
            </button>
          </div>
          
          <p className="mt-8 text-gray-400 text-lg">
            💀 死は新たな始まりに過ぎない 💀
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default EccentricLifeGame; 