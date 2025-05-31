'use client';

import React, { useState } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult, GameOverReason, GameStatus } from './types';
import { CardExecutionOverlay } from './components/CardExecutionOverlay';
import { UpdateNotification } from './components/UpdateNotification';

// ゲーム画面の種類
enum GameScreen {
  HOME = 'home',
  INIT = 'init',
  MAIN = 'main',
  CARD_EFFECT = 'card_effect',
  GAME_OVER = 'game_over'
}

// カード実行結果の詳細
interface CardExecutionDetail {
  card: Card;
  statusBefore: GameStatus;
  statusAfter: GameStatus;
}

const EccentricLifeGame: React.FC = () => {
  const [gameEngine] = useState(new GameEngine());
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.HOME);
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [playerName, setPlayerName] = useState('');
  const [drawnCards, setDrawnCards] = useState<CardDrawResult | null>(null);
  const [selectedPositiveCards, setSelectedPositiveCards] = useState<Card[]>([]);
  
  // カード実行オーバーレイ用の状態
  const [isShowingCardExecution, setIsShowingCardExecution] = useState(false);
  const [cardExecutionDetails, setCardExecutionDetails] = useState<CardExecutionDetail[]>([]);

  // カードを一枚ずつ実行するシステム
  const [currentExecutingCards, setCurrentExecutingCards] = useState<Card[]>([]);
  const [currentExecutingIndex, setCurrentExecutingIndex] = useState(0);
  const [selectedNegativeCards, setSelectedNegativeCards] = useState<Card[]>([]);

  const commonNames = [
    '太郎', '花子', '一郎', '美咲', '健太',
    '由美', '大輔', '彩', '翔', '麻衣',
    '慶太', '雅子', '貴史', '麗華', '優介',
    '美樹', '章吾', '優香', '雅人', '千尋',
    '龍之介', '千代姫', '鳳凰', '紫苑', '刀牙',
    '桜花', '雷神', '月華', '炎皇', '雪姫',
    '黄熊', '煉獄散', '勇心炎丸', '心眼衣斗', '姫煌々',
    '紗音瑠', '愛羅武勇', '魔法娘娘', '火星親友', '宝冠黄金大王'
  ];

  // ランダムな名前を生成
  const getRandomName = () => {
    return commonNames[Math.floor(Math.random() * commonNames.length)];
  };

  // ゲーム開始
  const startNewGame = () => {
    setPlayerName(getRandomName()); // ランダムな名前をデフォルト値として設定
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
      const newCards = selectedPositiveCards.filter(c => c.id !== card.id);
      setSelectedPositiveCards(newCards);
    } else {
      const newCards = [...selectedPositiveCards, card];
      setSelectedPositiveCards(newCards);
    }
  };

  // カードを実行
  const executeCards = () => {
    if (selectedPositiveCards.length === 0) {
      return;
    }

    if (!drawnCards) return;

    // 選択したポジティブカードと同じ枚数のネガティブカードをランダムで選択
    const shuffledNegativeCards = [...drawnCards.negativeCards].sort(() => Math.random() - 0.5);
    const randomSelectedNegativeCards = shuffledNegativeCards.slice(0, selectedPositiveCards.length);
    
    // 選択したネガティブカードを状態に保存
    setSelectedNegativeCards(randomSelectedNegativeCards);
    
    // 実行するカードの順序（ポジティブ → ネガティブ）
    const allCards = [...selectedPositiveCards, ...randomSelectedNegativeCards];
    
    // 実行カードを設定して最初のカードから開始
    setCurrentExecutingCards(allCards);
    setCurrentExecutingIndex(0);
    executeNextCard(allCards, 0);
  };

  // カードを一枚ずつ実行
  const executeNextCard = (allCards: Card[], cardIndex: number) => {
    const currentCard = allCards[cardIndex];
    const statusBefore = { ...gameEngine.getState().status };
    
    // カード効果を実際に適用してシミュレート
    let statusAfter = { ...statusBefore };
    
    if (currentCard.effect.execute) {
      const result = currentCard.effect.execute(statusBefore);
      if (result.newStatus) {
        statusAfter = { ...result.newStatus };
      }
    }
    
    // 毎ターン年齢+1（最後のカードの時のみ）
    if (cardIndex === allCards.length - 1) {
      statusAfter.age += 1;
    }

    // 詳細を設定
    const newDetail: CardExecutionDetail = {
      card: currentCard,
      statusBefore,
      statusAfter
    };

    setCardExecutionDetails([newDetail]);
    setCurrentExecutingIndex(cardIndex);
    setIsShowingCardExecution(true);
  };

  // カード実行完了処理
  const finishCardExecution = () => {
    // 実際のゲームエンジンでカード実行
    if (drawnCards) {
      const result = gameEngine.selectCards(selectedPositiveCards, selectedNegativeCards);
      setGameState(gameEngine.getState());

      if (result.isGameOver) {
        setCurrentScreen(GameScreen.GAME_OVER);
        return;
      }
    }

    // リセットして次のターンへ
    setIsShowingCardExecution(false);
    setCardExecutionDetails([]);
    setCurrentExecutingCards([]);
    setCurrentExecutingIndex(0);
    setSelectedNegativeCards([]);
    nextTurn();
  };

  // オーバーレイで次のカードに進む
  const handleNextCard = () => {
    // 次のカードを実行
    const nextIndex = currentExecutingIndex + 1;
    if (nextIndex < currentExecutingCards.length) {
      // 次のカードがある場合は、背景を戻さずに直接次のカードを実行
      executeNextCard(currentExecutingCards, nextIndex);
    } else {
      // 全カード実行完了時のみ背景を戻す
      setIsShowingCardExecution(false);
      finishCardExecution();
    }
  };

  // 残りのカードをスキップ
  const handleSkipCards = () => {
    setIsShowingCardExecution(false);
    finishCardExecution();
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

  // 自殺（即ゲームオーバー）
  const commitSuicide = () => {
    // ゲーム状態を強制的にゲームオーバーに設定
    gameEngine.getState().isGameOver = true;
    gameEngine.getState().gameOverReason = GameOverReason.SUICIDE; // 自殺を理由として設定
    setGameState(gameEngine.getState());
    setCurrentScreen(GameScreen.GAME_OVER);
  };

  // ステータス表示コンポーネント
  const StatusDisplay: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg mb-4 shadow-xl">
      <h2 className="text-lg font-bold mb-3 text-red-400 text-center">{gameState.playerName} さんの人生状況</h2>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center bg-gray-800 p-2 rounded border border-gray-600">
          <div className={`text-lg font-bold ${gameState.status.wealth >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {gameState.status.wealth >= 0 ? '¥' : '-¥'}{Math.abs(Math.floor(gameState.status.wealth))}万
          </div>
          <div className="text-xs text-gray-300">資産</div>
        </div>
        <div className="text-center bg-gray-800 p-2 rounded border border-gray-600">
          <div className={`text-lg font-bold ${gameState.status.trust >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
            {gameState.status.trust}
          </div>
          <div className="text-xs text-gray-300">信用</div>
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
        !['wealth', 'trust', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
      ).length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">状態効果</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(gameState.status)
              .filter(([key, value]) => 
                !['wealth', 'trust', 'ability', 'age'].includes(key) && typeof value === 'number' && value > 0
              )
              .map(([stateName, value]) => (
                <span
                  key={stateName}
                  className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs font-medium"
                >
                  {stateName} {value}
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
        border rounded-lg p-2 cursor-pointer transition-all transform hover:scale-105
        ${isPositive 
          ? 'border-green-500 bg-gradient-to-br from-green-900 to-green-800' 
          : 'border-red-500 bg-gradient-to-br from-red-900 to-red-800'
        }
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${disabled ? 'opacity-70 cursor-not-allowed hover:scale-100' : ''}
        shadow-lg
      `}
      onClick={disabled ? undefined : onClick}
    >
      <h3 className="font-bold text-sm mb-2 text-white">{card.name}</h3>
      <div className="text-xs bg-black/40 p-2 rounded border border-gray-600 text-gray-100">
        {card.effect.description}
      </div>
    </div>
  );

  // ホーム画面
  if (currentScreen === GameScreen.HOME) {
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
                リアル人生ゲーム - 資産、信用、能力、年齢を管理して生き抜け！
              </p>
              <div className="space-y-4">
                <button
                  onClick={startNewGame}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-xl transform hover:scale-105 transition-all border border-red-500"
                >
                  🎲 人生ガチャ開始
                </button>
                <div className="space-y-2 text-sm text-gray-400 bg-black/30 p-3 rounded-lg border border-gray-700">
                  <p className="text-red-400 font-semibold">⚠️ エキセントリックで不謹慎な内容が含まれています</p>
                  <p className="text-yellow-400">💡 ポジティブカードを選ぶと同数のネガティブカードも選ばれます</p>
                  <p className="text-blue-400">🎯 リスクとリターンのバランスを考えて選択しましょう</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ゲーム初期化画面
  if (currentScreen === GameScreen.INIT) {
    return (
      <>
        <UpdateNotification />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="max-w-md mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-400">運命の初期化</h2>
            <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-xl">
              <label htmlFor="player-name" className="block text-base font-medium text-gray-300 mb-3">
                🏷️ プレイヤー名
              </label>
              <input
                id="player-name"
                name="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-base"
                placeholder="あなたの名前を入力してください"
                maxLength={20}
                autoComplete="name"
              />
              <p className="text-sm text-gray-400 mt-2 mb-4">
                🎲 初期資産や才能をガチャで決めましょう！
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={initializeGame}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all"
                >
                  🌪️ 人生をはじめる
                </button>
                <button
                  onClick={() => setCurrentScreen(GameScreen.HOME)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all border border-gray-600"
                >
                  🏃 逃げる
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // メインゲーム画面
  if (currentScreen === GameScreen.MAIN) {
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
                        onClick={() => togglePositiveCard(card)}
                      />
                    ))}
                  </div>
                </div>

                {/* 操作ボタン */}
                <div className="text-center space-y-2">
                  <button
                    onClick={() => executeCards()}
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
                    onClick={commitSuicide}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-6 rounded-lg text-sm transform hover:scale-105 transition-all shadow-xl"
                  >
                    💀 自殺
                  </button>
                </div>
              </>
            )}
          </div>

          {/* オーバーレイ表示 */}
          {isShowingCardExecution && cardExecutionDetails.length > 0 && (
            <CardExecutionOverlay
              detail={cardExecutionDetails[0]}
              onNext={handleNextCard}
              onSkip={handleSkipCards}
              currentIndex={currentExecutingIndex}
              totalCards={currentExecutingCards.length}
            />
          )}
        </div>
      </>
    );
  }

  // ゲームオーバー画面
  if (currentScreen === GameScreen.GAME_OVER) {
    const deathReasonMap: Record<string, string> = {
      [GameOverReason.OLD_AGE]: '老衰で朽ち果てた',
      [GameOverReason.ASSASSINATION]: '暗殺された',
      [GameOverReason.ALIEN_ABDUCTION]: 'エイリアンに解剖された',
      [GameOverReason.DIMENSION_SUCKED]: '異次元に吸い込まれた',
      [GameOverReason.BLACKHOLE]: 'ブラックホールに呑まれた',
      [GameOverReason.SUICIDE]: '自ら命を絶った'
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

              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 transition-all shadow-xl"
              >
                🔄 再び人生を始める
              </button>
              
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default EccentricLifeGame; 