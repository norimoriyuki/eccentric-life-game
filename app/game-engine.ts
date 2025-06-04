import { 
  GameState, 
  GameStatus, 
  Card, 
  EffectType,
  CardDrawResult, 
  CardSelectionResult,
  GameInitParams,
  GameOverReason,
  GameTurnHistory,
  CardEffectResult
} from './types';
import { positiveCards, negativeCards } from './cards';

// ゲーム内の上限値定数
const WEALTH_CAP = 1e15 - 1;        // 999,999,999,999,999万円（1京円-1万円）
const WEALTH_FLOOR = -(1e15 - 1);   // -999,999,999,999,999万円（マイナス1京円+1万円）

/**
 * シンプルな重み計算（weight-utils の代替）
 */
function calculateAppearanceWeight(): number {
  // 簡略化された実装
  return 1;
}

/**
 * 資産の上限・下限チェック
 */
function clampWealth(wealth: number): number {
  if (wealth > WEALTH_CAP) {
    return WEALTH_CAP;
  }
  if (wealth < WEALTH_FLOOR) {
    return WEALTH_FLOOR;
  }
  return wealth;
}

/**
 * ゲームエンジンクラス
 */
export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = this.createEmptyState();
  }

  /**
   * 空のゲーム状態を作成
   */
  private createEmptyState(): GameState {
    return {
      playerName: '',
      status: { wealth: 0, goodness: 0, ability: 0, age: 0 },
      turn: 0,
      isGameOver: false,
      selectedPositiveCards: [],
      selectedNegativeCards: [],
      history: []
    };
  }

  /**
   * ゲームを初期化
   */
  initializeGame(params: GameInitParams): GameState {
    const initialStatus: GameStatus = params.initialStatus ? {
      wealth: params.initialStatus.wealth ?? this.randomBetween(-500, 1000),
      goodness: params.initialStatus.goodness ?? this.randomBetween(0, 100),
      ability: params.initialStatus.ability ?? this.randomBetween(0, 100),
      age: params.initialStatus.age ?? this.randomBetween(18, 22)
    } : {
      wealth: this.randomBetween(-500, 1000),
      goodness: this.randomBetween(-50, 100),
      ability: this.randomBetween(0, 100),
      age: this.randomBetween(18, 22)
    };

    // 50%の確率で仕送り状態を付与（1-40の範囲）
    if (Math.random() < 0.5) {
      initialStatus.allowance = this.randomBetween(1, 40);
    }

    // 10%の確率で不労所得状態を付与（1-10の範囲）
    if (Math.random() < 0.1) {
      initialStatus.passiveIncome = this.randomBetween(1, 10);
    }

    // 40%の確率でトラウマ状態を付与（1-3の範囲）
    if (Math.random() < 0.4) {
      initialStatus.trauma = this.randomBetween(1, 3);
    }

    this.state = {
      playerName: params.playerName,
      status: initialStatus,
      turn: 1,
      isGameOver: false,
      selectedPositiveCards: [],
      selectedNegativeCards: [],
      history: []
    };

    return this.getState();
  }

  /**
   * 指定範囲の乱数を生成
   */
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 現在のゲーム状態を取得
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * カードを抽選
   */
  drawCards(): CardDrawResult {
    const drawnPositiveCards = this.drawCardsByTypeWithoutDuplication(positiveCards, 4);
    const drawnNegativeCards = this.drawCardsByTypeWithoutDuplication(negativeCards, 4);

    return {
      positiveCards: drawnPositiveCards,
      negativeCards: drawnNegativeCards
    };
  }

  /**
   * 指定されたカード群から指定枚数を抽選（重複なし）
   */
  private drawCardsByTypeWithoutDuplication(cardPool: Card[], count: number): Card[] {
    const availableCards = cardPool.map(card => ({
      card,
      weight: this.calculateCardAppearanceRate(card)
    }));

    const drawnCards: Card[] = [];
    const usedCardIds = new Set<string>();

    for (let i = 0; i < count; i++) {
      const remainingCards = availableCards.filter(item => !usedCardIds.has(item.card.id));
      if (remainingCards.length === 0) break;

      const selectedCard = this.weightedRandomSelect(remainingCards);
      drawnCards.push(selectedCard.card);
      usedCardIds.add(selectedCard.card.id);
    }

    return drawnCards;
  }

  /**
   * 指定されたカード群から指定枚数を抽選（重複あり）
   */
  private drawCardsByTypeWithDuplication(cardPool: Card[], count: number): Card[] {
    const availableCards = cardPool.map(card => ({
      card,
      weight: this.calculateCardAppearanceRate(card)
    }));

    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      if (availableCards.length === 0) break;

      const selectedCard = this.weightedRandomSelect(availableCards);
      drawnCards.push(selectedCard.card);
    }

    return drawnCards;
  }

  /**
   * 指定されたカード群から指定枚数を抽選（旧バージョン、重複なし）
   */
  private drawCardsByType(cardPool: Card[], count: number): Card[] {
    return this.drawCardsByTypeWithoutDuplication(cardPool, count);
  }

  /**
   * カードの出現確率を計算
   */
  private calculateCardAppearanceRate(card: Card): number {
    let finalRate = card.baseAppearanceRate;

    if (card.appearanceCondition?.statusWeights) {
      const weight = calculateAppearanceWeight();
      finalRate *= weight;
    }

    // 旧式の範囲指定にも対応
    if (card.appearanceCondition) {
      const condition = card.appearanceCondition;
      if (condition.minAge !== undefined && this.state.status.age < condition.minAge) finalRate = 0;
      if (condition.maxAge !== undefined && this.state.status.age > condition.maxAge) finalRate = 0;
      if (condition.minGoodness !== undefined && this.state.status.goodness < condition.minGoodness) finalRate = 0;
      if (condition.maxGoodness !== undefined && this.state.status.goodness > condition.maxGoodness) finalRate = 0;
      if (condition.minWealth !== undefined && this.state.status.wealth < condition.minWealth) finalRate = 0;
      if (condition.maxWealth !== undefined && this.state.status.wealth > condition.maxWealth) finalRate = 0;
      if (condition.minAbility !== undefined && this.state.status.ability < condition.minAbility) finalRate = 0;
      if (condition.maxAbility !== undefined && this.state.status.ability > condition.maxAbility) finalRate = 0;
    }

    // カスタム確率計算があれば適用
    if (card.probabilityCalculator) {
      finalRate *= card.probabilityCalculator(this.state.status);
    }

    return Math.max(0, finalRate);
  }

  /**
   * 重み付きランダム選択
   */
  private weightedRandomSelect<T>(items: Array<{ card: T; weight: number }>): { card: T; weight: number } {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight === 0) {
      return items[Math.floor(Math.random() * items.length)];
    }

    let random = Math.random() * totalWeight;
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    return items[items.length - 1];
  }

  /**
   * カードを選択して効果を適用
   */
  selectCards(
    positiveCards: Card[], 
    availableNegativeCards: Card[]
  ): CardSelectionResult {
    // 選択したポジティブカードと同じ枚数のネガティブカードを自動選択
    const autoSelectedNegativeCards = this.autoSelectNegativeCards(
      availableNegativeCards, 
      positiveCards.length
    );

    const allSelectedCards = [...positiveCards, ...autoSelectedNegativeCards];
    const statusBefore = { ...this.state.status };
    let newStatus = { ...this.state.status };
    let isGameOver = false;
    let gameOverReason: GameOverReason | undefined;

    // カード効果を順番に適用
    for (const card of allSelectedCards) {
      const effectResult = this.executeCardEffect(card, newStatus);
      
      // 新しい統合ステータスシステム
      if (effectResult.newStatus) {
        newStatus = { ...effectResult.newStatus };
      }
      
      if (effectResult.isGameOver) {
        isGameOver = true;
        gameOverReason = effectResult.gameOverReason;
        break;
      } else if (card.effect.type === EffectType.SPECIAL) {
        // 特殊効果の処理（不老不死など）
        console.log(`特殊効果: ${effectResult.description}`);
      }
    }

    // 状態による継続効果を適用（1以上の場合のみ）
    if (!isGameOver) {
      newStatus = this.applyStateEffects(newStatus);
    }

    // 毎ターン年齢を+3する（ゲームオーバーでない場合のみ）
    if (!isGameOver) {
      newStatus = { ...newStatus, age: newStatus.age + 3 };
    }

    // 最終的な資産の上限・下限チェック
    newStatus.wealth = clampWealth(newStatus.wealth);

    // ゲーム状態を更新
    this.state.selectedPositiveCards = positiveCards;
    this.state.selectedNegativeCards = autoSelectedNegativeCards;
    this.state.status = newStatus;
    this.state.turn += 1;
    this.state.isGameOver = isGameOver;
    this.state.gameOverReason = gameOverReason;

    // 履歴に追加
    const history: GameTurnHistory = {
      turn: this.state.turn - 1,
      statusBefore,
      statusAfter: newStatus,
      selectedPositiveCards: positiveCards,
      selectedNegativeCards: autoSelectedNegativeCards,
      timestamp: new Date()
    };
    this.state.history.push(history);

    return {
      selectedPositiveCards: positiveCards,
      autoSelectedNegativeCards,
      newStatus,
      isGameOver,
      gameOverReason
    };
  }

  /**
   * ネガティブカードを自動選択
   */
  private autoSelectNegativeCards(availableCards: Card[], count: number): Card[] {
    return this.drawCardsByType(availableCards, count);
  }

  /**
   * 状態による継続効果を適用
   */
  private applyStateEffects(status: GameStatus): GameStatus {
    const newStatus = { ...status };

    // 複利効果の適用
    if (newStatus.compound && newStatus.compound >= 1) {
      const multiplier = 1 + (newStatus.compound * 0.1); // 1なら1.1倍、2なら1.2倍
      newStatus.wealth *= multiplier;
    }

    // 薬中効果の適用
    if (newStatus.addiction && newStatus.addiction >= 1) {
      newStatus.age += newStatus.addiction; // 薬中レベル分だけ追加で年齢増加
    }

    // 仕送り効果の適用
    if (newStatus.allowance && newStatus.allowance >= 1) {
      newStatus.wealth += 30; // 資産+30万円
      newStatus.allowance -= 1; // 仕送り-1
      
      // 仕送りが0になったら削除
      if (newStatus.allowance <= 0) {
        delete newStatus.allowance;
      }
    }

    // 不労所得効果の適用
    if (newStatus.passiveIncome && newStatus.passiveIncome >= 1) {
      newStatus.wealth += newStatus.passiveIncome * 100; // 不労所得レベル×100万円
    }

    // トラウマ効果の適用
    if (newStatus.trauma && newStatus.trauma >= 1) {
      newStatus.ability -= newStatus.trauma * 5; // トラウマレベル×5の能力減少
    }

    // 資産の上限・下限チェック
    newStatus.wealth = clampWealth(newStatus.wealth);

    // 他の状態効果もここに追加可能
    // 例：「再生」状態なら能力回復など

    return newStatus;
  }

  /**
   * カード効果を実行（新システム）
   */
  private executeCardEffect(
    card: Card, 
    currentStatus: GameStatus
  ): CardEffectResult {
    // 新しい関数ベース効果が定義されている場合はそれを使用
    if (card.effect.execute) {
      const result = card.effect.execute(currentStatus);
      
      // カード効果実行後に資産の上限・下限をチェック
      if (result.newStatus) {
        result.newStatus.wealth = clampWealth(result.newStatus.wealth);
      }
      
      return result;
    }

    // フォールバック（基本的にはすべてのカードがexecuteを持つべき）
    const result: CardEffectResult = {
      description: card.description
    };

    if (card.effect.type === EffectType.GAME_OVER) {
      result.isGameOver = true;
      result.gameOverReason = card.effect.gameOverReason;
    }

    return result;
  }

  /**
   * 年齢による自動ゲームオーバー判定
   */
  checkAgeGameOver(): boolean {
    if (this.state.status.age >= 160) {
      this.state.isGameOver = true;
      this.state.gameOverReason = GameOverReason.OLD_AGE;
      return true;
    }
    return false;
  }

  /**
   * 自殺によるゲームオーバー処理
   */
  commitSuicide(): void {
    this.state.isGameOver = true;
    this.state.gameOverReason = GameOverReason.SUICIDE;
    
    console.log('自殺実行: ゲームオーバー理由が設定されました:', this.state.gameOverReason);
  }

  /**
   * ゲームをリセット
   */
  resetGame(): void {
    // 現在の名前を保持
    const currentPlayerName = this.state.playerName;
    
    // ステートをリセット
    this.state = this.createEmptyState();
    
    // 名前を復元
    this.state.playerName = currentPlayerName;
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo(): {
    currentStatus: GameStatus;
    turn: number;
    isGameOver: boolean;
    gameOverReason?: GameOverReason;
    historyCount: number;
  } {
    return {
      currentStatus: this.state.status,
      turn: this.state.turn,
      isGameOver: this.state.isGameOver,
      gameOverReason: this.state.gameOverReason,
      historyCount: this.state.history.length
    };
  }
} 