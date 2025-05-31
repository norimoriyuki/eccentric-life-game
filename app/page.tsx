'use client';

import React, { useState, useRef } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult, GameOverReason, GameStatus } from './types';
import { CardExecutionOverlay } from './components/CardExecutionOverlay';
import { HomeScreen } from './components/HomeScreen';
import { InitScreen } from './components/InitScreen';
import { MainGameScreen } from './components/MainGameScreen';
import { GameOverScreen } from './components/GameOverScreen';

// ゲーム画面の種類
enum GameScreen {
  HOME = 'home',
  INIT = 'init',
  MAIN = 'main',
  CARD_EFFECT = 'card_effect',
  GAME_OVER = 'game_over'
}

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

const EccentricLifeGame: React.FC = () => {
  const [gameEngine] = useState(new GameEngine());
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.HOME);
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [playerName, setPlayerName] = useState('');
  const [drawnCards, setDrawnCards] = useState<CardDrawResult | null>(null);
  const [selectedPositiveCards, setSelectedPositiveCards] = useState<Card[]>([]);
  
  // カード実行オーバーレイ用の状態
  const [isShowingCardExecution, setIsShowingCardExecution] = useState(false);
  const [phaseExecutionDetails, setPhaseExecutionDetails] = useState<PhaseExecutionDetail[]>([]);

  // フェーズ実行用の状態
  const [currentExecutionPhase, setCurrentExecutionPhase] = useState<ExecutionPhase>(ExecutionPhase.POSITIVE);
  const [selectedNegativeCards, setSelectedNegativeCards] = useState<Card[]>([]);
  
  // 重複実行防止用のフラグ
  const isExecutingRef = useRef(false);

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
    
    // 重複実行防止
    if (isExecutingRef.current) {
      console.log('⚠️ executeCards重複実行をブロック');
      return;
    }
    
    isExecutingRef.current = true;
    
    // 先に実際のゲームエンジンで処理を実行
    const statusBefore = { ...gameEngine.getState().status };
    console.log('🔵 処理前:', statusBefore);
    
    const result = gameEngine.selectCards(selectedPositiveCards, randomSelectedNegativeCards);
    const statusAfter = result.newStatus;
    console.log('🟡 処理後:', statusAfter);
    
    // ゲーム状態を更新
    setGameState(gameEngine.getState());
    
    // ゲームオーバーチェック
    if (result.isGameOver) {
      setCurrentScreen(GameScreen.GAME_OVER);
      isExecutingRef.current = false;
      return;
    }
    
    // オーバーレイ表示のためのプレビューデータを生成（実際の処理は完了済み）
    // フェーズ実行を開始（プレビューのみ）
    setCurrentExecutionPhase(ExecutionPhase.POSITIVE);
    executePhasePreview(ExecutionPhase.POSITIVE, selectedPositiveCards, randomSelectedNegativeCards, statusBefore, statusAfter);
  };

  // フェーズをプレビュー表示（実際の処理は既に完了済み）
  const executePhasePreview = (phase: ExecutionPhase, positiveCards: Card[], negativeCards: Card[], statusBefore: GameStatus, _statusAfter: GameStatus) => {
    let previewStatusBefore = { ...statusBefore };
    let previewStatusAfter = { ...statusBefore }; // 初期状態から計算開始
    const descriptions: string[] = [];
    let cards: Card[] = [];
    let phaseName = '';

    switch (phase) {
      case ExecutionPhase.POSITIVE:
        cards = positiveCards;
        phaseName = 'ポジティブカード効果';
        
        // ポジティブカード効果のプレビュー計算
        for (const card of positiveCards) {
          if (card.effect.execute) {
            const result = card.effect.execute(previewStatusAfter);
            if (result.newStatus) {
              previewStatusAfter = { ...result.newStatus };
            }
            descriptions.push(`${card.name}: ${result.description}`);
          }
        }
        break;

      case ExecutionPhase.NEGATIVE:
        cards = negativeCards;
        phaseName = 'ネガティブカード効果';
        
        // ポジティブ効果を適用した状態から開始
        for (const card of positiveCards) {
          if (card.effect.execute) {
            const result = card.effect.execute(previewStatusAfter);
            if (result.newStatus) {
              previewStatusAfter = { ...result.newStatus };
            }
          }
        }
        previewStatusBefore = { ...previewStatusAfter };
        
        // ネガティブ効果のプレビュー計算
        for (const card of negativeCards) {
          if (card.effect.execute) {
            const result = card.effect.execute(previewStatusAfter);
            if (result.newStatus) {
              previewStatusAfter = { ...result.newStatus };
            }
            descriptions.push(`${card.name}: ${result.description}`);
          }
        }
        break;

      case ExecutionPhase.STATE_EFFECTS:
        phaseName = '状態効果';
        
        // ポジティブ＋ネガティブ効果を適用した状態から開始
        for (const card of [...positiveCards, ...negativeCards]) {
          if (card.effect.execute) {
            const result = card.effect.execute(previewStatusAfter);
            if (result.newStatus) {
              previewStatusAfter = { ...result.newStatus };
            }
          }
        }
        previewStatusBefore = { ...previewStatusAfter };
        
        // 状態効果のプレビュー計算
        if (previewStatusAfter.compound && previewStatusAfter.compound >= 1) {
          const multiplier = 1 + (previewStatusAfter.compound * 0.1);
          const oldWealth = previewStatusAfter.wealth;
          const newWealth = oldWealth * multiplier;
          previewStatusAfter.wealth = newWealth;
          descriptions.push(`複利効果: 資産が${Math.floor(oldWealth)}万円から${Math.floor(newWealth)}万円に増加`);
        }
        
        if (previewStatusAfter.addiction && previewStatusAfter.addiction >= 1) {
          const ageIncrease = previewStatusAfter.addiction;
          previewStatusAfter.age += ageIncrease;
          descriptions.push(`薬中効果: 年齢が追加で+${ageIncrease}歳（薬物による老化）`);
        }
        
        if (previewStatusAfter.allowance && previewStatusAfter.allowance >= 1) {
          const currentAllowance = previewStatusAfter.allowance;
          previewStatusAfter.wealth += 30;
          previewStatusAfter.allowance -= 1;
          
          if (previewStatusAfter.allowance <= 0) {
            delete previewStatusAfter.allowance;
            descriptions.push(`仕送り効果: 資産+30万円（仕送り終了、残り${currentAllowance}→0回）`);
          } else {
            descriptions.push(`仕送り効果: 資産+30万円（残り${currentAllowance}→${previewStatusAfter.allowance}回）`);
          }
        }
        
        previewStatusAfter.age += 1;
        descriptions.push('年齢+1歳');
        
        if (descriptions.length === 1) {
          descriptions.unshift('状態効果なし');
        }
        break;
    }

    // フェーズ実行結果を設定
    const phaseDetail: PhaseExecutionDetail = {
      phase,
      phaseName,
      cards: phase !== ExecutionPhase.STATE_EFFECTS ? cards : undefined,
      statusBefore: previewStatusBefore,
      statusAfter: previewStatusAfter,
      descriptions
    };

    setPhaseExecutionDetails([phaseDetail]);
    setIsShowingCardExecution(true);
  };

  // 次のフェーズに進む
  const handleNextPhase = () => {
    const currentPhase = currentExecutionPhase;
    
    if (currentPhase === ExecutionPhase.POSITIVE) {
      setCurrentExecutionPhase(ExecutionPhase.NEGATIVE);
      // 実際の処理は完了済みなので、プレビュー表示のみ
      const statusBefore = gameEngine.getState().history[gameEngine.getState().history.length - 1]?.statusBefore || gameEngine.getState().status;
      const statusAfter = gameEngine.getState().status;
      executePhasePreview(ExecutionPhase.NEGATIVE, selectedPositiveCards, selectedNegativeCards, statusBefore, statusAfter);
    } else if (currentPhase === ExecutionPhase.NEGATIVE) {
      setCurrentExecutionPhase(ExecutionPhase.STATE_EFFECTS);
      const statusBefore = gameEngine.getState().history[gameEngine.getState().history.length - 1]?.statusBefore || gameEngine.getState().status;
      const statusAfter = gameEngine.getState().status;
      executePhasePreview(ExecutionPhase.STATE_EFFECTS, selectedPositiveCards, selectedNegativeCards, statusBefore, statusAfter);
    } else {
      // 全フェーズ完了 - 次のターンへ
      finishDisplayPhases();
    }
  };

  // 残りのフェーズをスキップ
  const handleSkipPhases = () => {
    finishDisplayPhases();
  };

  // オーバーレイ表示終了処理
  const finishDisplayPhases = () => {
    setIsShowingCardExecution(false);
    setPhaseExecutionDetails([]);
    setCurrentExecutionPhase(ExecutionPhase.POSITIVE);
    setSelectedNegativeCards([]);
    
    // フラグをリセットしてから次のターンへ
    isExecutingRef.current = false;
    nextTurn();
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

  // 画面レンダリング
  if (currentScreen === GameScreen.HOME) {
    return <HomeScreen onStartNewGame={startNewGame} />;
  }

  if (currentScreen === GameScreen.INIT) {
    return (
      <InitScreen
        playerName={playerName}
        setPlayerName={setPlayerName}
        onInitializeGame={initializeGame}
        onGoBack={() => setCurrentScreen(GameScreen.HOME)}
      />
    );
  }

  if (currentScreen === GameScreen.MAIN) {
    return (
      <>
        <MainGameScreen
          gameState={gameState}
          drawnCards={drawnCards}
          selectedPositiveCards={selectedPositiveCards}
          onTogglePositiveCard={togglePositiveCard}
          onExecuteCards={executeCards}
          onCommitSuicide={commitSuicide}
        />

        {/* オーバーレイ表示 */}
        {isShowingCardExecution && phaseExecutionDetails.length > 0 && (
          <CardExecutionOverlay
            detail={phaseExecutionDetails[0]}
            onNext={handleNextPhase}
            onSkip={handleSkipPhases}
            currentIndex={currentExecutionPhase === ExecutionPhase.POSITIVE ? 0 : currentExecutionPhase === ExecutionPhase.NEGATIVE ? 1 : 2}
            totalCards={3}
          />
        )}
      </>
    );
  }

  if (currentScreen === GameScreen.GAME_OVER) {
    return <GameOverScreen gameState={gameState} onResetGame={resetGame} />;
  }

  return null;
};

export default EccentricLifeGame; 