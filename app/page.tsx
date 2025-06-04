'use client';

import React, { useState, useRef } from 'react';
import { GameEngine } from './game-engine';
import { GameState, Card, CardDrawResult, GameStatus, GameInitParams } from './types';
import { CardExecutionOverlay } from './components/CardExecutionOverlay';
import { HomeScreen } from './components/HomeScreen';
import { MainGameScreen } from './components/MainGameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ScoreboardScreen } from './components/ScoreboardScreen';
import { SuicideConfirmationOverlay } from './components/SuicideConfirmationOverlay';
import { StatusExplanationOverlay } from './components/StatusExplanationOverlay';

// ゲーム画面の種類
enum GameScreen {
  HOME = 'home',
  MAIN = 'main',
  CARD_EFFECT = 'card_effect',
  GAME_OVER = 'game_over',
  SCOREBOARD = 'scoreboard'
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

  // オーバーレイ状態の管理
  const [showSuicideConfirmation, setShowSuicideConfirmation] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState<string | null>(null);

  // ゲーム初期化
  const initializeGame = (playerName: string) => {
    setPlayerName(playerName);
    const initialParams: GameInitParams = { playerName };
    const newGameState = gameEngine.initializeGame(initialParams);
    setGameState(newGameState);
    drawNewCards();
    setCurrentScreen(GameScreen.MAIN);
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
        
        if (previewStatusAfter.passiveIncome && previewStatusAfter.passiveIncome >= 1) {
          const passiveIncomeAmount = previewStatusAfter.passiveIncome * 100;
          previewStatusAfter.wealth += passiveIncomeAmount;
          descriptions.push(`不労所得効果: 資産+${passiveIncomeAmount}万円（レベル${previewStatusAfter.passiveIncome}×100万円）`);
        }
        
        if (previewStatusAfter.trauma && previewStatusAfter.trauma >= 1) {
          const abilityDecrease = previewStatusAfter.trauma * 5;
          previewStatusAfter.ability -= abilityDecrease;
          descriptions.push(`トラウマ効果: 能力-${abilityDecrease}（レベル${previewStatusAfter.trauma}×5）`);
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
    // 現在の名前を保持（GameEngineがリセット前に名前を保持する）
    const currentPlayerName = gameEngine.getState().playerName;
    gameEngine.resetGame();
    setGameState(gameEngine.getState());
    // 名前を保持してタイトル画面に戻る
    setPlayerName(currentPlayerName);
    setDrawnCards(null);
    setSelectedPositiveCards([]);
    setCurrentScreen(GameScreen.HOME); // タイトル画面に戻る
  };

  // 自殺（即ゲームオーバー）
  const commitSuicide = () => {
    // GameEngineの専用メソッドを使用して確実に自殺理由を設定
    gameEngine.commitSuicide();
    setGameState(gameEngine.getState());
    setCurrentScreen(GameScreen.GAME_OVER);
  };

  // 自殺確認表示
  const handleShowSuicideConfirmation = () => {
    setShowSuicideConfirmation(true);
  };

  // 自殺キャンセル
  const handleCancelSuicide = () => {
    setShowSuicideConfirmation(false);
  };

  // 自殺実行（確認後）
  const handleConfirmSuicide = () => {
    setShowSuicideConfirmation(false);
    commitSuicide();
  };

  // ステータス説明表示
  const handleStatusClick = (statusType: string) => {
    setSelectedStatusType(statusType);
  };

  // ステータス説明閉じる
  const handleCloseStatusExplanation = () => {
    setSelectedStatusType(null);
  };

  // スコアボード画面への遷移
  const handleShowScoreboard = () => {
    setCurrentScreen(GameScreen.SCOREBOARD);
  };

  // スコアボードからホームに戻る
  const handleBackToHome = () => {
    setCurrentScreen(GameScreen.HOME);
  };

  // 画面レンダリング
  if (currentScreen === GameScreen.HOME) {
    return <HomeScreen onInitializeGame={initializeGame} defaultName={playerName} onShowScoreboard={handleShowScoreboard} />;
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
          showSuicideConfirmation={showSuicideConfirmation}
          onShowSuicideConfirmation={handleShowSuicideConfirmation}
          onCancelSuicide={handleCancelSuicide}
          selectedStatusType={selectedStatusType}
          onStatusClick={handleStatusClick}
          onCloseStatusExplanation={handleCloseStatusExplanation}
        />

        {/* カード実行オーバーレイ */}
        {isShowingCardExecution && phaseExecutionDetails.length > 0 && (
          <CardExecutionOverlay
            detail={phaseExecutionDetails[0]}
            onNext={handleNextPhase}
            onSkip={handleSkipPhases}
            currentIndex={currentExecutionPhase === ExecutionPhase.POSITIVE ? 0 : currentExecutionPhase === ExecutionPhase.NEGATIVE ? 1 : 2}
            totalCards={3}
          />
        )}

        {/* 自殺確認オーバーレイ */}
        {showSuicideConfirmation && (
          <SuicideConfirmationOverlay
            onConfirm={handleConfirmSuicide}
            onCancel={handleCancelSuicide}
          />
        )}

        {/* ステータス説明オーバーレイ */}
        {selectedStatusType && (
          <StatusExplanationOverlay
            statusType={selectedStatusType}
            onClose={handleCloseStatusExplanation}
          />
        )}
      </>
    );
  }

  if (currentScreen === GameScreen.GAME_OVER) {
    return <GameOverScreen gameState={gameState} onResetGame={resetGame} />;
  }

  if (currentScreen === GameScreen.SCOREBOARD) {
    return <ScoreboardScreen onBackToHome={handleBackToHome} />;
  }

  return null;
};

export default EccentricLifeGame; 