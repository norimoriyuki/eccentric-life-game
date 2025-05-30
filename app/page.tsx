'use client';

import React, { useState } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult, GameOverReason, GameStatus } from './types';
import { CardExecutionOverlay } from './components/CardExecutionOverlay';

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
    if (cardIndex >= allCards.length) {
      // 全カード実行完了
      finishCardExecution();
      return;
    }

    const currentCard = allCards[cardIndex];
    
    // 実行前の状態を記録
    const statusBefore = { ...gameEngine.getState().status };
    
    // カード効果を実際に適用してシミュレート
    const statusAfter = { ...statusBefore };
    if (currentCard.effect.statusChange) {
      if (currentCard.effect.statusChange.wealth) {
        statusAfter.wealth += currentCard.effect.statusChange.wealth;
      }
      if (currentCard.effect.statusChange.trust) {
        statusAfter.trust += currentCard.effect.statusChange.trust;
      }
      if (currentCard.effect.statusChange.ability) {
        statusAfter.ability += currentCard.effect.statusChange.ability;
      }
      if (currentCard.effect.statusChange.age) {
        statusAfter.age += currentCard.effect.statusChange.age;
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
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6 shadow-xl">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-red-400 text-center">{gameState.playerName} さんの人生状況</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className={`text-xl md:text-2xl font-bold ${gameState.status.wealth >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {gameState.status.wealth >= 0 ? '¥' : '-¥'}{Math.abs(Math.floor(gameState.status.wealth))}万
          </div>
          <div className="text-xs text-gray-300">
            資産{gameState.status.wealth < 0 ? '（借金）' : ''}
          </div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className={`text-xl md:text-2xl font-bold ${gameState.status.trust >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
            {gameState.status.trust}
          </div>
          <div className="text-xs text-gray-300">
            信用度{gameState.status.trust < 0 ? '（悪評）' : ''}
          </div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xl md:text-2xl font-bold text-purple-400">{gameState.status.ability}</div>
          <div className="text-xs text-gray-300">能力</div>
        </div>
        <div className="text-center bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xl md:text-2xl font-bold text-orange-400">{gameState.status.age}歳</div>
          <div className="text-xs text-gray-300">年齢</div>
        </div>
      </div>
      <div className="mt-4 text-center text-gray-300">
        <span className="bg-gray-800 px-3 py-1 rounded border border-gray-600 text-sm">
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

  // ホーム画面
  if (currentScreen === GameScreen.HOME) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-4 py-8 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 drop-shadow-2xl leading-tight">
              💀 エキセントリック人生ゲーム 💀
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300 font-medium px-2">
              リアル人生ゲーム - 資産、信用、能力、年齢を管理して生き抜け！
            </p>
            <div className="space-y-6">
              <button
                onClick={startNewGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-2xl transform hover:scale-105 transition-all border border-red-500"
              >
                🎲 人生ガチャ開始
              </button>
              <div className="space-y-3 text-sm text-gray-400 bg-black/30 p-4 rounded-lg border border-gray-700">
                <p className="text-red-400 font-semibold">⚠️ このゲームにはエキセントリックで不謹慎な内容が含まれています</p>
                <p className="text-yellow-400">💡 ポジティブカードを選ぶと同数のネガティブカードも選ばれます</p>
                <p className="text-blue-400">🎯 リスクとリターンのバランスを考えて選択しましょう</p>
                <p className="text-purple-400">💀 死は常に隣り合わせ...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ゲーム初期化画面
  if (currentScreen === GameScreen.INIT) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-4 py-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-red-400">運命の初期化</h2>
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl">
            <label htmlFor="player-name" className="block text-lg font-medium text-gray-300 mb-4">
              🏷️ プレイヤー名
            </label>
            <input
              id="player-name"
              name="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-lg"
              placeholder="あなたの名前を入力してください"
              maxLength={20}
              autoComplete="name"
            />
            <p className="text-sm text-gray-400 mt-3 mb-6">
              🎲 初期資産や才能をガチャで決めましょう！
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={initializeGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all"
              >
                🌪️ 人生をはじめる
              </button>
              <button
                onClick={() => setCurrentScreen(GameScreen.HOME)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all border border-gray-600"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-md mx-auto px-4 py-6">
          <StatusDisplay gameState={gameState} />

          {drawnCards && (
            <>
              {/* ネガティブカード */}
              <div className="mb-8">
                <h5 className="text-2xl md:text-3xl font-bold mb-4 text-red-400 text-center">
                  ランダムにリスクが選ばれる
                </h5>
                <div className="grid grid-cols-2 gap-3">
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
              <div className="mb-8">
                <h5 className="text-2xl md:text-3xl font-bold mb-4 text-green-400 text-center">
                  行動を選択
                </h5>
                <div className="grid grid-cols-2 gap-3">
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
              <div className="text-center space-y-4">
                <button
                  onClick={() => executeCards()}
                  disabled={selectedPositiveCards.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-all shadow-2xl"
                  style={{
                    opacity: selectedPositiveCards.length === 0 ? 0.5 : 1,
                    cursor: selectedPositiveCards.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ⚡ {selectedPositiveCards.length}枚の行動とリスクを実行
                </button>
                
                <button
                  onClick={commitSuicide}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-all shadow-2xl"
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
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-gray-900">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-red-400 animate-pulse drop-shadow-2xl">
              💀 GAME OVER 💀
            </h1>
            
            <div className="bg-gray-900 border-2 border-red-600 p-6 rounded-lg shadow-2xl mb-8">
              <p className="text-2xl md:text-3xl mb-6 text-red-300">
                運命の審判: <span className="font-bold text-red-400 block mt-2">
                  {gameState.gameOverReason ? deathReasonMap[gameState.gameOverReason] || gameState.gameOverReason : '原因不明で消滅'}
                </span>
              </p>
              
              <StatusDisplay gameState={gameState} />
              
              <div className="text-xl md:text-2xl mb-6 bg-black/40 p-4 rounded border border-gray-700">
                <p className="text-yellow-400">生存記録: <span className="font-bold text-white">{gameState.turn - 1} ターン</span></p>
                <p className="text-gray-400 mt-2 text-base md:text-lg">
                </p>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl transform hover:scale-105 transition-all shadow-2xl"
            >
              🔄 再び人生を始める
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EccentricLifeGame; 