import { 
  Card, 
  CardType, 
  EffectType, 
  GameOverReason,
  CardEffectResult,
  GameStatus
} from './types';

// ===============================
// ポジティブカード
// ===============================

export const positiveCards: Card[] = [
  // 基本カード
  {
    id: 'labor',
    name: '苦役',
    type: CardType.POSITIVE,
    description: '辛い労働で資産を得るが、年も取る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産+50万円、年齢+1歳',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += 50;
        newStatus.age += 1;
        
        return {
          newStatus,
          description: '資産+50万円、年齢+1歳'
        };
      }
    },
    baseAppearanceRate: 0.8
  },

  {
    id: 'pension',
    name: '年金',
    type: CardType.POSITIVE,
    description: '安定した収入源',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産+30万円',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += 30;
        
        return {
          newStatus,
          description: '資産+30万円'
        };
      }
    },
    baseAppearanceRate: 0.6
  },

  {
    id: 'investment',
    name: '投資',
    type: CardType.POSITIVE,
    description: '複利の力で資産を積み重ねる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '状態「複利」+1（資産が継続的に増加）',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.複利 = (newStatus.複利 || 0) + 1;
        
        return {
          newStatus,
          description: '状態「複利」+1（資産が継続的に増加）'
        };
      }
    },
    baseAppearanceRate: 0.5
  },

  {
    id: 'stocks',
    name: '株',
    type: CardType.POSITIVE,
    description: 'リスクを取って大きなリターンを狙う',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産が1.2倍になる',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth *= 1.2;
        
        return {
          newStatus,
          description: '資産が1.2倍になる'
        };
      }
    },
    baseAppearanceRate: 0.4
  },

  {
    id: 'business',
    name: '経営',
    type: CardType.POSITIVE,
    description: '事業を始めて大きく稼ぐ',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産が1.4倍になる',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth *= 1.4;
        
        return {
          newStatus,
          description: '資産が1.4倍になる'
        };
      }
    },
    baseAppearanceRate: 0.2
  },

  // 条件分岐を使った高度なカード例
  {
    id: 'smart_investment',
    name: 'スマート投資',
    type: CardType.POSITIVE,
    description: '能力に応じて投資効果が変わる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '能力に応じた投資効果',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        let multiplier = 1.1; // 基本倍率
        let description = '資産が1.1倍';

        if (status.ability >= 80) {
          multiplier = 1.5;
          description = '高能力により資産が1.5倍';
        } else if (status.ability >= 50) {
          multiplier = 1.3;
          description = '中程度の能力により資産が1.3倍';
        }

        newStatus.wealth *= multiplier;
        
        return {
          newStatus,
          description
        };
      }
    },
    baseAppearanceRate: 0.3
  },

  {
    id: 'compound_interest_mastery',
    name: '複利の極意',
    type: CardType.POSITIVE,
    description: '既存の複利効果を加速させる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '複利状態に応じた効果',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentCompound = status.複利 || 0;
        
        if (currentCompound === 0) {
          newStatus.複利 = 1;
          newStatus.ability += 5;
          
          return {
            newStatus,
            description: '複利を開始+投資知識で能力+5'
          };
        } else {
          const bonusWealth = currentCompound * 50; // 複利レベル×50万円
          newStatus.複利 += 1;
          newStatus.wealth += bonusWealth;
          
          return {
            newStatus,
            description: `複利+1、既存複利効果でボーナス資産+${bonusWealth}万円`
          };
        }
      }
    },
    baseAppearanceRate: 0.3
  },

  {
    id: 'wealth_doubler',
    name: '資産倍増',
    type: CardType.POSITIVE,
    description: '現在の資産を2倍にする',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産を2倍にする',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth *= 2; // 直接倍にする
        
        return {
          newStatus,
          description: `資産を${oldWealth}万円から${newStatus.wealth}万円に倍増`
        };
      }
    },
    baseAppearanceRate: 0.1
  },
];

// ===============================
// ネガティブカード
// ===============================

export const negativeCards: Card[] = [
  {
    id: 'old_age',
    name: '老衰',
    type: CardType.NEGATIVE,
    description: '年老いて命を終える',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.OLD_AGE,
      description: 'ゲームオーバー：老衰',
      execute: (__status: GameStatus): CardEffectResult => {
        return {
          isGameOver: true,
          gameOverReason: GameOverReason.OLD_AGE,
          description: 'ゲームオーバー：老衰'
        };
      }
    },
    baseAppearanceRate: 0.01,
    probabilityCalculator: (status) => {
      if (status.age > 50) {
        return 1 + (status.age - 50); // 50歳を超えると出現率上昇
      }
      return 1; // 50歳以下は基本確率
    }
  },

  {
    id: 'minor_crime',
    name: '軽犯罪',
    type: CardType.NEGATIVE,
    description: '小さな犯罪で善良さ失墜',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '善良さ-10',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 10;
        
        return {
          newStatus,
          description: '善良さ-10'
        };
      }
    },
    baseAppearanceRate: 0.3
  },

  {
    id: 'traffic_violation',
    name: '交通違反',
    type: CardType.NEGATIVE,
    description: '罰金で資産が減る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産-500万円（重い罰金）',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 500;
        
        return {
          newStatus,
          description: '資産-500万円（重い罰金）'
        };
      }
    },
    baseAppearanceRate: 0.4
  },

  {
    id: 'aging',
    name: '加齢',
    type: CardType.NEGATIVE,
    description: '時の流れは止められない',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '年齢+2歳',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.age += 2;
        
        return {
          newStatus,
          description: '年齢+2歳'
        };
      }
    },
    baseAppearanceRate: 0.6
  },

  {
    id: 'wealth_dependent_crisis',
    name: '資産に応じた危機',
    type: CardType.NEGATIVE,
    description: '資産が多いほど狙われやすくなる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産に応じた危機',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        if (status.wealth < 100) {
          newStatus.goodness -= 5;
          return {
            newStatus,
            description: '貧困による善良さ失墜、善良さ-5'
          };
        } else if (status.wealth < 500) {
          newStatus.wealth -= 50;
          newStatus.goodness -= 3;
          return {
            newStatus,
            description: '中程度の詐欺被害、資産-50万円、善良さ-3'
          };
        } else if (status.wealth < 2000) {
          newStatus.wealth *= 0.8;
          newStatus.goodness -= 10;
          return {
            newStatus,
            description: '投資詐欺で資産20%減少、善良さ-10'
          };
        } else {
          newStatus.wealth *= 0.6;
          newStatus.goodness -= 20;
          return {
            newStatus,
            description: '巨額詐欺で資産40%減少、善良さ-20'
          };
        }
      }
    },
    baseAppearanceRate: 0.2
  },

  {
    id: 'state_dependent_disease',
    name: '状態に応じた病気',
    type: CardType.NEGATIVE,
    description: '複利などの状態によって症状が変わる病気',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '状態に応じた病気',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        // 基本的な病気
        newStatus.ability -= 10;
        newStatus.wealth -= 50;
        let description = '一般的な病気、能力-10、資産-50万円';

        // 複利状態があるとストレス病
        if (status.複利 && status.複利 > 0) {
          newStatus.ability -= 5; // 追加で-5（合計-15）
          newStatus.wealth -= 50; // 追加で-50（合計-100）
          newStatus.goodness -= 5;
          description = '投資ストレス病、能力-15、資産-100万円、善良さ-5';
        }

        return {
          newStatus,
          description
        };
      }
    },
    baseAppearanceRate: 0.1
  },

  {
    id: 'wealth_halver',
    name: '資産半減',
    type: CardType.NEGATIVE,
    description: '資産が半分になる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      description: '資産半減',
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth /= 2; // 直接半分にする
        
        return {
          newStatus,
          description: `資産が${oldWealth}万円から${newStatus.wealth}万円に半減`
        };
      }
    },
    baseAppearanceRate: 0.15
  },
];

// 全カードを統合
export const allCards: Card[] = [...positiveCards, ...negativeCards]; 