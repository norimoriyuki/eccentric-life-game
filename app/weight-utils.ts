import { 
  WeightFunctionType, 
  WeightFunctionParams, 
  StatusWeightConfig, 
  WeightCombineMethod, 
  GameStatus 
} from './types';

/**
 * 重み関数のパラメータにデフォルト値を適用
 */
function applyDefaults(params: WeightFunctionParams): Required<WeightFunctionParams> {
  return {
    type: params.type,
    slope: params.slope ?? 1,
    offset: params.offset ?? 0,
    base: params.base ?? 1,
    exponent: params.exponent ?? 1,
    coefficient: params.coefficient ?? 1,
    steepness: params.steepness ?? 1,
    midpoint: params.midpoint ?? 50,
    threshold: params.threshold ?? 50,
    highWeight: params.highWeight ?? 2,
    lowWeight: params.lowWeight ?? 0.5,
    minWeight: params.minWeight ?? 0,
    maxWeight: params.maxWeight ?? 10,
    customFunction: params.customFunction ?? ((x) => x)
  };
}

/**
 * 値を指定範囲内にクランプ
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 単一のステータス値に対する重みを計算
 */
export function calculateStatusWeight(value: number, params: WeightFunctionParams): number {
  const p = applyDefaults(params);
  let weight: number;

  switch (p.type) {
    case WeightFunctionType.LINEAR:
      weight = p.slope * (value - p.offset) + p.base;
      break;

    case WeightFunctionType.EXPONENTIAL:
      weight = p.base * Math.exp(p.exponent * (value - p.offset));
      break;

    case WeightFunctionType.INVERSE:
      weight = p.coefficient / (value + p.offset);
      break;

    case WeightFunctionType.SIGMOID:
      weight = 1 / (1 + Math.exp(-p.steepness * (value - p.midpoint)));
      break;

    case WeightFunctionType.THRESHOLD:
      weight = value >= p.threshold ? p.highWeight : p.lowWeight;
      break;

    case WeightFunctionType.CUSTOM:
      weight = p.customFunction!(value);
      break;

    default:
      weight = 1;
  }

  return clamp(weight, p.minWeight, p.maxWeight);
}

/**
 * 全ステータスの重みを計算
 */
export function calculateAllStatusWeights(
  status: GameStatus, 
  config: StatusWeightConfig
): Record<string, number> {
  const weights: Record<string, number> = {};

  if (config.wealth) {
    weights.wealth = calculateStatusWeight(status.wealth, config.wealth);
  }
  if (config.goodness) {
    weights.goodness = calculateStatusWeight(status.goodness, config.goodness);
  }
  if (config.ability) {
    weights.ability = calculateStatusWeight(status.ability, config.ability);
  }
  if (config.age) {
    weights.age = calculateStatusWeight(status.age, config.age);
  }

  return weights;
}

/**
 * 複数の重みを合成
 */
export function combineWeights(
  weights: Record<string, number>, 
  method: WeightCombineMethod = WeightCombineMethod.MULTIPLY,
  customCombiner?: (weights: Record<string, number>) => number
): number {
  const values = Object.values(weights);
  
  if (values.length === 0) return 1;

  switch (method) {
    case WeightCombineMethod.MULTIPLY:
      return values.reduce((acc, val) => acc * val, 1);

    case WeightCombineMethod.ADD:
      return values.reduce((acc, val) => acc + val, 0);

    case WeightCombineMethod.AVERAGE:
      return values.reduce((acc, val) => acc + val, 0) / values.length;

    case WeightCombineMethod.MAX:
      return Math.max(...values);

    case WeightCombineMethod.MIN:
      return Math.min(...values);

    case WeightCombineMethod.CUSTOM:
      return customCombiner ? customCombiner(weights) : 1;

    default:
      return 1;
  }
}

/**
 * メイン関数：ステータスから最終的な重み係数を計算
 */
export function calculateAppearanceWeight(
  status: GameStatus,
  config: StatusWeightConfig,
  combineMethod: WeightCombineMethod = WeightCombineMethod.MULTIPLY,
  customCombiner?: (weights: Record<string, number>) => number
): number {
  const statusWeights = calculateAllStatusWeights(status, config);
  return combineWeights(statusWeights, combineMethod, customCombiner);
}

/**
 * よく使われる重み関数のプリセット
 */
export const WeightPresets = {
  // 値が高いほど重みが大きくなる（線形）
  positiveLinear: (slope: number = 0.01): WeightFunctionParams => ({
    type: WeightFunctionType.LINEAR,
    slope,
    base: 1
  }),

  // 値が低いほど重みが大きくなる（線形）
  negativeLinear: (slope: number = -0.01): WeightFunctionParams => ({
    type: WeightFunctionType.LINEAR,
    slope,
    base: 1
  }),

  // 値が低いほど指数関数的に重みが大きくなる（暗殺カード向け）
  lowValueExponential: (steepness: number = 0.05): WeightFunctionParams => ({
    type: WeightFunctionType.EXPONENTIAL,
    exponent: -steepness,
    base: 1,
    maxWeight: 5
  }),

  // 年齢が高いほど指数関数的に重みが大きくなる（老衰カード向け）
  ageExponential: (baseAge: number = 100, steepness: number = 0.1): WeightFunctionParams => ({
    type: WeightFunctionType.EXPONENTIAL,
    exponent: steepness,
    offset: baseAge,
    base: 0.1,
    maxWeight: 10
  }),

  // 閾値未満で高重み、以上で低重み
  belowThreshold: (threshold: number, highWeight: number = 3, lowWeight: number = 0.1): WeightFunctionParams => ({
    type: WeightFunctionType.THRESHOLD,
    threshold,
    highWeight,
    lowWeight
  }),

  // 逆比例（値が高いほど重みが小さくなる）
  inverse: (coefficient: number = 100): WeightFunctionParams => ({
    type: WeightFunctionType.INVERSE,
    coefficient,
    offset: 1,
    maxWeight: 5
  })
}; 