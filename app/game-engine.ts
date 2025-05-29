import { 
  GameState, 
  GameStatus, 
  Card, 
  EffectType,
  CardDrawResult, 
  CardSelectionResult,
  GameInitParams,
  StatusChange,
  GameOverReason,
  GameTurnHistory
} from './types';
import { positiveCards, negativeCards } from './cards';

/**
 * シンプルな重み計算（weight-utils の代替）
 */
function calculateAppearanceWeight(): number {
  // 簡略化された実装
  return 1;
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
      status: { wealth: 0, trust: 0, ability: 0, age: 0 },
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
      wealth: params.initialStatus.wealth ?? this.randomBetween(0, 1000),
      trust: params.initialStatus.trust ?? this.randomBetween(0, 100),
      ability: params.initialStatus.ability ?? this.randomBetween(0, 100),
      age: params.initialStatus.age ?? this.randomBetween(18, 30)
    } : {
      wealth: this.randomBetween(0, 1000),
      trust: this.randomBetween(0, 100),
      ability: this.randomBetween(0, 100),
      age: this.randomBetween(18, 30)
    };

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
    const drawnPositiveCards = this.drawCardsByType(positiveCards, 3);
    const drawnNegativeCards = this.drawCardsByType(negativeCards, 3);

    return {
      positiveCards: drawnPositiveCards,
      negativeCards: drawnNegativeCards
    };
  }

  /**
   * 指定されたカード群から指定枚数を抽選
   */
  private drawCardsByType(cardPool: Card[], count: number): Card[] {
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
      if (condition.minTrust !== undefined && this.state.status.trust < condition.minTrust) finalRate = 0;
      if (condition.maxTrust !== undefined && this.state.status.trust > condition.maxTrust) finalRate = 0;
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
    const statusChanges: StatusChange[] = [];
    let newStatus = { ...this.state.status };
    let isGameOver = false;
    let gameOverReason: GameOverReason | undefined;

    // カード効果を順番に適用
    for (const card of allSelectedCards) {
      if (card.effect.type === EffectType.STATUS_CHANGE && card.effect.statusChange) {
        const change = card.effect.statusChange;
        statusChanges.push(change);
        newStatus = this.applyStatusChange(newStatus, change);
      } else if (card.effect.type === EffectType.GAME_OVER) {
        isGameOver = true;
        gameOverReason = card.effect.gameOverReason;
        break;
      } else if (card.effect.type === EffectType.SPECIAL) {
        // 特殊効果の処理（不老不死など）
        // 今回は簡単な実装にとどめる
        console.log(`特殊効果: ${card.effect.description}`);
      }
    }

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
      statusBefore: this.state.status,
      statusAfter: newStatus,
      selectedPositiveCards: positiveCards,
      selectedNegativeCards: autoSelectedNegativeCards,
      timestamp: new Date()
    };
    this.state.history.push(history);

    return {
      selectedPositiveCards: positiveCards,
      autoSelectedNegativeCards,
      statusChanges,
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
   * ステータス変化を適用
   */
  private applyStatusChange(status: GameStatus, change: StatusChange): GameStatus {
    const newStatus = { ...status };

    // 加算処理
    if (change.wealth !== undefined) {
      newStatus.wealth += change.wealth;
    }
    if (change.trust !== undefined) {
      newStatus.trust += change.trust;
    }
    if (change.ability !== undefined) {
      newStatus.ability += change.ability;
    }
    if (change.age !== undefined) {
      newStatus.age += change.age;
    }

    // 乗算処理
    if (change.wealthMultiplier !== undefined) {
      newStatus.wealth *= change.wealthMultiplier;
    }

    // 下限値の適用
    newStatus.wealth = Math.max(0, newStatus.wealth);
    newStatus.trust = Math.max(0, Math.min(100, newStatus.trust));
    newStatus.ability = Math.max(0, newStatus.ability);
    newStatus.age = Math.max(0, newStatus.age);

    return newStatus;
  }

  /**
   * 年齢による自動ゲームオーバー判定
   */
  checkAgeGameOver(): boolean {
    if (this.state.status.age >= 120) {
      this.state.isGameOver = true;
      this.state.gameOverReason = GameOverReason.OLD_AGE;
      return true;
    }
    return false;
  }

  /**
   * ゲームをリセット
   */
  resetGame(): void {
    this.state = this.createEmptyState();
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