// ゲームの基本ステータス（状態も含む）
export interface GameStatus {
  wealth: number; 
  goodness: number; 
  ability: number; 
  age: number; 
  [stateName: string]: number; 
}

// ゲームの状態（継続効果）
export interface GameStates {
  [stateName: string]: number; // 状態名と値のペア（0以上の整数）
}

// カードの種類
export enum CardType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative'
}

// ゲーム終了条件
export enum GameOverReason {
  OLD_AGE = 'old_age', // 老衰
  ASSASSINATION = 'assassination', // 暗殺
  ALIEN_ABDUCTION = 'alien_abduction', // エイリアンに解剖される
  DIMENSION_SUCKED = 'dimension_sucked', // 異次元に吸い込まれる
  BLACKHOLE = 'blackhole', // ブラックホール
  SUICIDE = 'suicide', // 自殺
  DEATH_PENALTY = 'death_penalty', // 死刑
  // 他のゲームオーバー理由も追加可能
}

// カードの効果種類
export enum EffectType {
  STATUS_CHANGE = 'status_change', // ステータス変化
  GAME_OVER = 'game_over', // ゲームオーバー
  SPECIAL = 'special' // 特殊効果（復活能力など）
}

// カードの効果結果
export interface CardEffectResult {
  // 新しい統合ステータス
  newStatus?: GameStatus;
  // 共通
  isGameOver?: boolean;
  gameOverReason?: GameOverReason;
  description: string;
}

// カード効果関数の型
export type CardEffectFunction = (
  currentStatus: GameStatus
) => CardEffectResult;

// カードの効果
export interface CardEffect {
  type: EffectType;
  gameOverReason?: GameOverReason;
  risks?: string[]; // 付随するリスク
  // 関数ベース効果
  execute?: CardEffectFunction; // カスタム効果処理関数
}

// 重み関数の種類
export enum WeightFunctionType {
  LINEAR = 'linear', // 線形関数
  EXPONENTIAL = 'exponential', // 指数関数
  INVERSE = 'inverse', // 逆比例
  SIGMOID = 'sigmoid', // シグモイド関数
  THRESHOLD = 'threshold', // 閾値関数
  CUSTOM = 'custom' // カスタム関数
}

// 重み関数のパラメータ
export interface WeightFunctionParams {
  type: WeightFunctionType;
  // 線形関数: weight = slope * (value - offset) + base
  slope?: number; // 傾き（デフォルト: 1）
  offset?: number; // オフセット（デフォルト: 0）
  base?: number; // ベース値（デフォルト: 1）
  
  // 指数関数: weight = base * exp(exponent * (value - offset))
  exponent?: number; // 指数（デフォルト: 1）
  
  // 逆比例: weight = coefficient / (value + offset)
  coefficient?: number; // 係数（デフォルト: 1）
  
  // シグモイド: weight = 1 / (1 + exp(-steepness * (value - midpoint)))
  steepness?: number; // 急峻さ（デフォルト: 1）
  midpoint?: number; // 中点（デフォルト: 50）
  
  // 閾値関数: value >= threshold ? highWeight : lowWeight
  threshold?: number; // 閾値
  highWeight?: number; // 閾値以上の場合の重み
  lowWeight?: number; // 閾値未満の場合の重み
  
  // 最小・最大値制限
  minWeight?: number; // 最小重み（デフォルト: 0）
  maxWeight?: number; // 最大重み（デフォルト: 10）
  
  // カスタム関数
  customFunction?: (value: number) => number;
}

// ステータス別重み設定
export interface StatusWeightConfig {
  wealth?: WeightFunctionParams; // 資産による重み
  goodness?: WeightFunctionParams; // 善良さによる重み
  ability?: WeightFunctionParams; // 能力による重み
  age?: WeightFunctionParams; // 年齢による重み
}

// 重み合成方法
export enum WeightCombineMethod {
  MULTIPLY = 'multiply', // 掛け算（デフォルト）
  ADD = 'add', // 足し算
  AVERAGE = 'average', // 平均
  MAX = 'max', // 最大値
  MIN = 'min', // 最小値
  CUSTOM = 'custom' // カスタム合成
}

// 出現確率の条件（新しい柔軟な設定）
export interface AppearanceCondition {
  // 旧式の簡単な範囲指定（後方互換性のため残す）
  minAge?: number;
  maxAge?: number;
  minGoodness?: number;
  maxGoodness?: number;
  minWealth?: number;
  maxWealth?: number;
  minAbility?: number;
  maxAbility?: number;
  
  // 新しい重みベースシステム
  statusWeights?: StatusWeightConfig; // ステータス別重み設定
  combineMethod?: WeightCombineMethod; // 重み合成方法
  customCombiner?: (weights: Record<string, number>) => number; // カスタム合成関数
}

// 確率計算関数の型
export type ProbabilityCalculator = (status: GameStatus) => number;

// カードの定義
export interface Card {
  id: string; // カードの一意ID
  name: string; // カード名
  type: CardType; // ポジティブ・ネガティブ
  description: string; // カードの説明
  iconSource: string; // カードアイコンの画像パス
  effect: CardEffect; // カードの効果
  baseAppearanceRate: number; // 基本出現確率（0-1）
  appearanceCondition?: AppearanceCondition; // 出現条件
  probabilityCalculator?: ProbabilityCalculator; // カスタム確率計算
}

// ゲームの状態
export interface GameState {
  playerId?: string; // プレイヤーID（将来の拡張用）
  playerName: string; // プレイヤー名
  status: GameStatus; // 現在のステータス（状態も含む）
  turn: number; // ターン数
  isGameOver: boolean; // ゲーム終了フラグ
  gameOverReason?: GameOverReason; // ゲーム終了理由
  selectedPositiveCards: Card[]; // 選択されたポジティブカード
  selectedNegativeCards: Card[]; // 自動選択されたネガティブカード
  history: GameTurnHistory[]; // ゲーム履歴
}

// ターンの履歴
export interface GameTurnHistory {
  turn: number;
  statusBefore: GameStatus;
  statusAfter: GameStatus;
  selectedPositiveCards: Card[];
  selectedNegativeCards: Card[];
  timestamp: Date;
}

// カードドロー結果
export interface CardDrawResult {
  positiveCards: Card[]; // 引いたポジティブカード（3枚）
  negativeCards: Card[]; // 引いたネガティブカード（3枚）
}

// ゲーム初期化パラメータ
export interface GameInitParams {
  playerName: string;
  initialStatus?: Partial<GameStatus>; // 指定しない場合はランダム生成
}

// カード選択結果
export interface CardSelectionResult {
  selectedPositiveCards: Card[];
  autoSelectedNegativeCards: Card[];
  newStatus: GameStatus;
  isGameOver: boolean;
  gameOverReason?: GameOverReason;
}

// デバッグ用の確率情報
export interface DebugProbabilityInfo {
  cardId: string;
  cardName: string;
  baseRate: number;
  calculatedRate: number;
  conditions: string[];
}

// スコアボード用の型定義
export interface Score {
  id?: string;
  playerName: string;
  wealth: number;
  goodness: number;
  ability: number;
  age: number;
  turns: number;
  gameOverReason: string;
  timestamp: number; // Unix timestamp
  createdAt: Date;
} 