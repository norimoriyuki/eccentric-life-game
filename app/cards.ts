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
  {
    id: 'labor',
    name: '労働',
    type: CardType.POSITIVE,
    description: '資産+（能力）、善良さ+5、能力+5',
    iconSource: '/card-images/labor.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += status.ability;
        newStatus.goodness += 5;
        newStatus.ability += 5;
        
        return {
          newStatus,
          description: `資産+${status.ability}万円、善良さ+5、能力+5`
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 善良さが高いほど出現率UP
      if (status.goodness >= 80) return 2.0;
      if (status.goodness >= 50) return 1.5;
      if (status.goodness >= 20) return 1.2;
      return 1.0;
    }
  },

  {
    id: 'shinogi',
    name: 'シノギ',
    type: CardType.POSITIVE,
    description: '資産+（能力）、善良さ-10、能力+5',
    iconSource: '/card-images/shinogi.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += status.ability;
        newStatus.goodness -= 10;
        newStatus.ability += 5;
        
        return {
          newStatus,
          description: `資産+${status.ability}万円、善良さ-5、能力+5`
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 善良さが低いほど出現率UP
      if (status.goodness <= 20) return 2.5;
      if (status.goodness <= 40) return 1.8;
      if (status.goodness <= 60) return 1.2;
      return 0.8;
    }
  },

  {
    id: 'investment',
    name: '投資',
    type: CardType.POSITIVE,
    description: '複利+1（毎ターン資産+10%）',
    iconSource: '/card-images/stocks.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.compound = (newStatus.compound || 0) + 1;
        
        return {
          newStatus,
          description: '複利状態+1（毎ターン資産10%増加）'
        };
      }
    },
    baseAppearanceRate: 0.6,
    probabilityCalculator: (status) => {
      // 能力と善良さが高いほど出現率UP
      const abilityBonus = status.ability >= 60 ? 1.5 : 1.0;
      const goodnessBonus = status.goodness >= 60 ? 1.3 : 1.0;
      return abilityBonus * goodnessBonus;
    }
  },

  {
    id: 'stocks',
    name: 'デイトレード',
    type: CardType.POSITIVE,
    description: '資産×1.2倍',
    iconSource: '/card-images/stocks.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth *= 1.2;
        
        return {
          newStatus,
          description: `資産が${Math.floor(oldWealth)}万円から${Math.floor(newStatus.wealth)}万円に増加`
        };
      }
    },
    baseAppearanceRate: 0.5,
    probabilityCalculator: (status) => {
      // 資産が多いほど出現率UP、能力も影響
      const wealthMultiplier = status.wealth >= 500 ? 1.8 : status.wealth >= 100 ? 1.2 : 0.8;
      const abilityMultiplier = status.ability >= 50 ? 1.3 : 1.0;
      return wealthMultiplier * abilityMultiplier;
    }
  },

  {
    id: 'business',
    name: '新規事業',
    type: CardType.POSITIVE,
    description: '不労所得+（能力/50）',
    iconSource: '/card-images/business.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const passiveIncomeIncrease = Math.floor(status.ability / 50);
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + passiveIncomeIncrease;
        
        return {
          newStatus,
          description: `新規事業で不労所得+${passiveIncomeIncrease}（能力${status.ability}/50）`
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 能力が高く、ある程度の資産があると出現率UP
      if (status.ability >= 200 && status.wealth >= 200) return 2.0;
      if (status.ability >= 100 && status.wealth >= 100) return 1.0;
      return 0;
    }
  },

  {
    id: 'isekai_reincarnation',
    name: '異世界転生',
    type: CardType.POSITIVE,
    description: '能力をそのままで転生',
    iconSource: '/card-images/isekai_reincarnation.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        // 能力のみ保持、他のステータスを乱数で引き直し
        const preservedAbility = status.ability;
        
        // ヘルパー関数：指定範囲の乱数生成
        const randomBetween = (min: number, max: number): number => {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        
        // 基本ステータスを初期化時と同じ範囲で引き直し
        newStatus.wealth = randomBetween(-500, 1000);
        newStatus.goodness = randomBetween(-50, 100);
        newStatus.age = randomBetween(18, 60);
        newStatus.ability = preservedAbility; // 能力は保持
        
        // 全ての状態をリセット
        Object.keys(newStatus).forEach(key => {
          if (!['wealth', 'goodness', 'ability', 'age'].includes(key)) {
            delete newStatus[key];
          }
        });
        
        // 50%の確率で仕送り状態を付与（初期化時と同じ）
        if (Math.random() < 0.5) {
          newStatus.allowance = randomBetween(1, 40);
        }
        
        return {
          newStatus,
          description: `異世界転生完了！能力${preservedAbility}を保持して新たな人生開始（資産${Math.floor(newStatus.wealth)}万円、善良さ${newStatus.goodness}、年齢${newStatus.age}歳${newStatus.allowance ? '、仕送り' + newStatus.allowance : ''}）`
        };
      }
    },
    baseAppearanceRate: 0.01,
  },

  {
    id: 'surrender',
    name: '自首',
    type: CardType.POSITIVE,
    description: '善良さ×0.1年間し善良さ0に',
    iconSource: '/card-images/surrender.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentGoodness = status.goodness;
        
        const prisonYears = Math.ceil(Math.abs(currentGoodness) * 0.1); // マイナス善良さの10%
        newStatus.goodness = 0; // 善良さを0に回復
        newStatus.age += prisonYears;
        
        return {
          newStatus,
          description: `自首して${prisonYears}年間の服役、善良さが0に回復、年齢+${prisonYears}歳`
        };
      }
    },
    baseAppearanceRate: 0.5,
    probabilityCalculator: (status) => {
      // 善良さがマイナスの時のみ高確率で出現
      if (status.goodness < 0) {
        const badnessLevel = Math.abs(status.goodness);
        if (badnessLevel >= 50) return 2.5;
        if (badnessLevel >= 30) return 2.0;
        return 1.5;
      }
      // 善良さが0以上でも低確率で出現（通常の善良な行い）
      return 0;
    }
  },

  {
    id: 'bribery',
    name: '賄賂',
    type: CardType.POSITIVE,
    description: '資産-1000万円、善良さ0に回復',
    iconSource: '/card-images/bribery.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        if (status.wealth < 1000) {
          // 資産が不足している場合
          return {
            newStatus,
            description: '資産不足で賄賂を渡せない（1000万円必要）'
          };
        }
        
        newStatus.wealth -= 1000;
        newStatus.goodness = 0; // 善良さを0に回復
        
        return {
          newStatus,
          description: '賄賂1000万円で善良さが0に回復（もみ消し成功）'
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 善良さがマイナスかつ資産が十分な時のみ出現
      if (status.goodness < 0) {
        if (status.wealth >= 1000) {
          const badnessLevel = Math.abs(status.goodness);
          if (badnessLevel >= 50) return 2.0;
          if (badnessLevel >= 30) return 1.5;
          return 1.0;
        } else {
          // 資産不足でも低確率で出現（選択すると失敗）
          return 0.3;
        }
      }
      return 0; // 善良さが0以上では出現しない
    }
  },

  {
    id: 'franchise',
    name: 'フランチャイズ',
    type: CardType.POSITIVE,
    description: '不労所得+1、資産-1000万円',
    iconSource: '/card-images/franchise.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 1;
        newStatus.wealth -= 1000;
        
        return {
          newStatus,
          description: `フランチャイズ開始、不労所得+1（毎ターン+100万円）、初期費用-1000万円`
        };
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 資産が十分にあると出現率UP
      if (status.wealth >= 2000) return 1.2;
      if (status.wealth >= 1000) return 1.0;
      return 0.5; // 資産不足でも低確率で出現
    }
  },

  {
    id: 'business_inheritance',
    name: '経営相続',
    type: CardType.POSITIVE,
    description: '不労所得+5',
    iconSource: '/card-images/business.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 5;
        
        return {
          newStatus,
          description: `事業を相続、不労所得+5（毎ターン+500万円）`
        };
      }
    },
    baseAppearanceRate: 0.1,
    probabilityCalculator: (status) => {
      // 能力と善良さが高いと出現率UP
      const abilityBonus = status.ability >= 70 ? 1.5 : status.ability >= 50 ? 1.0 : 0.5;
      const goodnessBonus = status.goodness >= 60 ? 1.3 : 1.0;
      return abilityBonus * goodnessBonus;
    }
  },

  {
    id: 'underground_job',
    name: '闇バイト',
    type: CardType.POSITIVE,
    description: 'トラウマ+1、善良さ-100、資産+100万円',
    iconSource: '/card-images/underground_job.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.trauma = (newStatus.trauma || 0) + 1;
        newStatus.goodness -= 100;
        newStatus.wealth += 100;
        
        return {
          newStatus,
          description: '闇バイトでトラウマ+1（毎ターン能力-5）、善良さ-100、資産+100万円'
        };
      }
    },
    baseAppearanceRate: 0.6,
    probabilityCalculator: (status) => {
      // 善良さが低いほど出現率UP、資産が少ないほど出現率UP
      const goodnessMultiplier = status.goodness <= 20 ? 2.5 : status.goodness <= 50 ? 1.5 : 1.0;
      const wealthMultiplier = status.wealth <= 100 ? 1.8 : status.wealth <= 500 ? 1.2 : 0.8;
      return goodnessMultiplier * wealthMultiplier;
    }
  },

  {
    id: 'dirty_work',
    name: '汚れ仕事',
    type: CardType.POSITIVE,
    description: 'トラウマ+1、善良さ-50、資産+200万円',
    iconSource: '/card-images/dirty_work.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.trauma = (newStatus.trauma || 0) + 1;
        newStatus.goodness -= 50;
        newStatus.wealth += 200;
        
        return {
          newStatus,
          description: '汚れ仕事でトラウマ+1（毎ターン能力-5）、善良さ-50、資産+200万円'
        };
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 善良さが低く、能力が高いと出現率UP
      const goodnessMultiplier = status.goodness <= 30 ? 2.0 : status.goodness <= 60 ? 1.3 : 0.7;
      const abilityMultiplier = status.ability >= 60 ? 1.5 : status.ability >= 40 ? 1.2 : 1.0;
      return goodnessMultiplier * abilityMultiplier;
    }
  },

  {
    id: 'cult_establishment',
    name: 'カルト設立',
    type: CardType.POSITIVE,
    description: '善良さ-1000、不労所得+10',
    iconSource: '/card-images/cult_establishment.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 1000;
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 10;
        
        return {
          newStatus,
          description: 'カルト設立で善良さ-1000、不労所得+10（毎ターン+1000万円）'
        };
      }
    },
    baseAppearanceRate: 0.1,
    probabilityCalculator: (status) => {
      // 能力100以上でのみ出現
      if (status.ability >= 100) {
        // 能力が高いほど出現率UP
        if (status.ability >= 150) return 1;
        if (status.ability >= 120) return 0.5;
        return 0.1;
      }
      return 0; // 能力100未満では出現しない
    }
  },

  {
    id: 'doping',
    name: 'ドーピング',
    type: CardType.POSITIVE,
    description: '善良さ-10、能力+30',
    iconSource: '/card-images/doping.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 10;
        newStatus.ability += 30;
        
        return {
          newStatus,
          description: 'ドーピングで善良さ-10、能力+30'
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 能力が低いほど出現率UP、善良さが低いほど出現率UP
      const abilityMultiplier = status.ability <= 50 ? 1.8 : status.ability <= 100 ? 1.3 : 1.0;
      const goodnessMultiplier = status.goodness <= 30 ? 1.5 : status.goodness <= 60 ? 1.2 : 0.8;
      return abilityMultiplier * goodnessMultiplier;
    }
  },

  {
    id: 'study',
    name: '勉強',
    type: CardType.POSITIVE,
    description: '善良さ+5、能力+20',
    iconSource: '/card-images/study.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness += 5;
        newStatus.ability += 20;
        
        return {
          newStatus,
          description: '勉強で善良さ+5、能力+20'
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 善良さが高いほど出現率UP、年齢が若いほど出現率UP
      const goodnessMultiplier = status.goodness >= 80 ? 1.8 : status.goodness >= 50 ? 1.3 : 1.0;
      const ageMultiplier = status.age <= 30 ? 1.5 : status.age <= 50 ? 1.2 : 0.8;
      return goodnessMultiplier * ageMultiplier;
    }
  },

  {
    id: 'land_fraud',
    name: '地面師',
    type: CardType.POSITIVE,
    description: '資産+10000万円、善良さ-200',
    iconSource: '/card-images/land_fraud.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += 10000;
        newStatus.goodness -= 200;
        
        return {
          newStatus,
          description: '地面師詐欺で資産+10000万円、善良さ-200'
        };
      }
    },
    baseAppearanceRate: 0.15,
    probabilityCalculator: (status) => {
      // 能力100以上でのみ出現
      if (status.ability >= 100) {
        // 善良さが低いほど出現率UP
        if (status.goodness <= 20) return 0.8;
        if (status.goodness <= 50) return 0.5;
        return 0.15;
      }
      return 0; // 能力100未満では出現しない
    }
  },

  {
    id: 'human_modification',
    name: '人体改造',
    type: CardType.POSITIVE,
    description: '資産-1000万円、能力+50',
    iconSource: '/card-images/human_modification.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 1000;
        newStatus.ability += 50;
        
        return {
          newStatus,
          description: '人体改造で資産-1000万円、能力+50'
        };
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 資産が十分にあると出現率UP
      if (status.wealth >= 2000) return 1.0;
      if (status.wealth >= 1000) return 0.8;
      return 0.3; // 資産不足でも低確率で出現
    }
  },

  {
    id: 'social_assistance',
    name: '生活保護',
    type: CardType.POSITIVE,
    description: '資産+30万円',
    iconSource: '/card-images/social_welfare.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += 30;
        
        return {
          newStatus,
          description: '生活保護で資産+30万円'
        };
      }
    },
    baseAppearanceRate: 1.5,
    probabilityCalculator: (status) => {
      // 資産200以下のときのみ出現
      if (status.wealth <= 200) {
        // 資産が少ないほど出現率UP
        if (status.wealth <= 0) return 3.0;
        if (status.wealth <= 50) return 2.5;
        if (status.wealth <= 100) return 2.0;
        return 1.5;
      }
      return 0; // 資産200より多い場合は出現しない
    }
  },

  {
    id: 'propaganda',
    name: 'プロパガンダ',
    type: CardType.POSITIVE,
    description: '資産-1000万円、善良さ+（能力）',
    iconSource: '/card-images/propaganda.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 1000;
        newStatus.goodness += status.ability;
        
        return {
          newStatus,
          description: 'プロパガンダで資産-1000万円、善良さ+（能力）'
        };
      }
    },
    baseAppearanceRate: 0.7,
    probabilityCalculator: (status) => {
      // 能力が高いと出現率UP、資産が十分にあると出現率UP
      const abilityMultiplier = status.ability >= 80 ? 1.5 : status.ability >= 60 ? 1.2 : 1.0;
      const wealthMultiplier = status.wealth >= 2000 ? 1.3 : status.wealth >= 1000 ? 1.0 : 0.5;
      return abilityMultiplier * wealthMultiplier;
    }
  },

  {
    id: 'ipo',
    name: 'IPO',
    type: CardType.POSITIVE,
    description: '複利を倍にする',
    iconSource: '/card-images/ipo.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentCompound = newStatus.compound || 0;
        newStatus.compound = currentCompound * 2;
        
        return {
          newStatus,
          description: `上場により複利が${currentCompound}から${newStatus.compound}に倍増`
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 善良さ200以上かつ複利3以上の場合のみ出現
      if (status.goodness >= 200 && (status.compound || 0) >= 3) {
        // 善良さと複利レベルが高いほど出現率UP
        const goodnessMultiplier = status.goodness >= 300 ? 2.0 : 1.0;
        return goodnessMultiplier;
      }
      return 0; // 条件を満たさない場合は出現しない
    }
  },

  {
    id: 'dictatorship',
    name: '独裁',
    type: CardType.POSITIVE,
    description: '善良さ+9999、不労所得+30000',
    iconSource: '/card-images/dictatorship.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness += 9999;
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 30000;
        
        return {
          newStatus,
          description: '独裁政権樹立で善良さ+9999、不労所得+30000（毎ターン+3億円）'
        };
      }
    },
    baseAppearanceRate: 0.05,
    probabilityCalculator: (status) => {
      // 善良さ1000以上のときのみ出現
      if (status.goodness >= 1000 && status.ability >= 200) {
        if (status.goodness >= 2000) return 3.0;
        if (status.goodness >= 1500) return 2.0;
        return 1.0;
      }
      return 0; // 善良さ1000未満では出現しない
    }
  },

  {
    id: 'security',
    name: '警備',
    type: CardType.POSITIVE,
    description: '警護+1、資産-500万円',
    iconSource: '/card-images/business.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.security = (newStatus.security || 0) + 1;
        newStatus.wealth -= 500;
        
        return {
          newStatus,
          description: '警備雇用で警護+1、資産-500万円'
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 資産が多いほど出現率UP、善良さが高いほど出現率UP
      const wealthMultiplier = status.wealth >= 1000 ? 1.5 : status.wealth >= 500 ? 1.2 : 0.8;
      const goodnessMultiplier = status.goodness >= 100 ? 1.3 : status.goodness >= 50 ? 1.1 : 1.0;
      return wealthMultiplier * goodnessMultiplier;
    }
  },

  {
    id: 'yakuza_protection',
    name: 'ケツ持ち',
    type: CardType.POSITIVE,
    description: '警護+3、資産-1000万円、善良さ-100',
    iconSource: '/card-images/yakuza_protection.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.security = (newStatus.security || 0) + 3;
        newStatus.wealth -= 1000;
        newStatus.goodness -= 100;
        
        return {
          newStatus,
          description: 'ヤクザとの契約で警護+3、資産-1000万円、善良さ-100'
        };
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 善良さが低いほど出現率UP、資産が十分にあると出現率UP
      const goodnessMultiplier = status.goodness <= 0 ? 2.0 : status.goodness <= 50 ? 1.5 : 1.0;
      const wealthMultiplier = status.wealth >= 2000 ? 1.3 : status.wealth >= 1000 ? 1.0 : 0.5;
      return goodnessMultiplier * wealthMultiplier;
    }
  },

  {
    id: 'great_invention',
    name: '大発明',
    type: CardType.POSITIVE,
    description: '善良さ+200、不労所得+10、資産+1億円',
    iconSource: '/card-images/human_modification.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness += 200;
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 10;
        newStatus.wealth += 10000;
        
        return {
          newStatus,
          description: '大発明で善良さ+200、不労所得+10（毎ターン+1000万円）、資産+10000万円'
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 能力250以上でのみ出現
      if (status.ability >= 250) {
        // 能力が高いほど出現率UP
        if (status.ability >= 350) return 3.0;
        if (status.ability >= 300) return 2.0;
        return 1.0;
      }
      return 0; // 能力250未満では出現しない
    }
  },

  {
    id: 'business_reform',
    name: '事業改革',
    type: CardType.POSITIVE,
    description: '複利+3',
    iconSource: '/card-images/ipo.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldCompound = newStatus.compound || 0;
        newStatus.compound = oldCompound + 3;
        
        return {
          newStatus,
          description: `事業改革により複利が${oldCompound}から${newStatus.compound}に向上（毎ターン資産増加率+30%）`
        };
      }
    },
    baseAppearanceRate: 0.5,
    probabilityCalculator: (status) => {
      // 能力200以上かつ複利5以上でのみ出現
      if (status.ability >= 200 && (status.compound || 0) >= 5) {
        // 能力と複利レベルが高いほど出現率UP
        const abilityMultiplier = status.ability >= 300 ? 1.5 : status.ability >= 250 ? 1.2 : 1.0;
        const compoundMultiplier = (status.compound || 0) >= 10 ? 1.3 : 1.0;
        return abilityMultiplier * compoundMultiplier;
      }
      return 0; // 条件を満たさない場合は出現しない
    }
  },

  {
    id: 'charity',
    name: '慈善活動',
    type: CardType.POSITIVE,
    description: '資産-1000万円、善良さ+100',
    iconSource: '/card-images/social_welfare.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 1000;
        newStatus.goodness += 100;
        
        return {
          newStatus,
          description: '慈善活動で資産-1000万円、善良さ+100'
        };
      }
    },
    baseAppearanceRate: 1.0,
    probabilityCalculator: (status) => {
      // 資産1000万円以上で出現
      if (status.wealth >= 1000) {
        // 資産が多いほど出現率UP、善良さが高いほど出現率UP
        const wealthMultiplier = status.wealth >= 5000 ? 1.5 : status.wealth >= 2000 ? 1.2 : 1.0;
        const goodnessMultiplier = status.goodness >= 100 ? 1.3 : status.goodness >= 50 ? 1.1 : 1.0;
        return wealthMultiplier * goodnessMultiplier;
      }
      return 0; // 資産1000万円未満では出現しない
    }
  },

  {
    id: 'money_distribution',
    name: 'お金配り',
    type: CardType.POSITIVE,
    description: '資産-10000万円、善良さ+3000',
    iconSource: '/card-images/money_distribution.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 10000;
        newStatus.goodness += 3000;
        
        return {
          newStatus,
          description: 'お金配りで資産-10000万円、善良さ+3000'
        };
      }
    },
    baseAppearanceRate: 0.2,
    probabilityCalculator: (status) => {
      // 資産10000万円以上で出現
      if (status.wealth >= 10000) {
        // 資産が多いほど出現率UP、善良さが高いほど出現率UP
        const wealthMultiplier = status.wealth >= 50000 ? 3.0 : status.wealth >= 20000 ? 2.0 : 1.0;
        return wealthMultiplier;
      }
      return 0; // 資産10000万円未満では出現しない
    }
  },

  {
    id: 'military_equipment',
    name: '軍備',
    type: CardType.POSITIVE,
    description: '資産-10000万円、警護+5',
    iconSource: '/card-images/military_equipment.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 10000;
        newStatus.security = (newStatus.security || 0) + 5;
        
        return {
          newStatus,
          description: '軍備で資産-10000万円、警護+5'
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 資産10000万円以上で出現
      if (status.wealth >= 10000) {
        // 資産が多いほど出現率UP、善良さが低いほど出現率UP
        const wealthMultiplier = status.wealth >= 50000 ? 2.5 : status.wealth >= 20000 ? 2.0 : 1.0;
        return wealthMultiplier;
      }
      return 0; // 資産10000万円未満では出現しない
    }
  },

  {
    id: 'ai_subscription',
    name: 'AI課金',
    type: CardType.POSITIVE,
    description: '資産-1万円、能力×2倍',
    iconSource: '/card-images/ai_subscription.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldAbility = newStatus.ability;
        newStatus.wealth -= 1;
        newStatus.ability *= 2;
        
        return {
          newStatus,
          description: `AI課金で資産-1万円、能力が${oldAbility}から${newStatus.ability}に倍増`
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 資産1万円以上で出現
      if (status.wealth >= 1) {
        // 能力が低いほど出現率UP、年齢が若いほど出現率UP
        const abilityMultiplier = status.ability >= 100 ? 3.0 : status.ability >= 50 ? 2.0 : 1.0;
        return abilityMultiplier;
      }
      return 0; // 資産1万円未満では出現しない
    }
  },

  {
    id: 'controversy_business',
    name: '炎上商法',
    type: CardType.POSITIVE,
    description: '善良さ-100、資産+（能力×3）',
    iconSource: '/card-images/controversy_business.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const incomeAmount = status.ability * 3;
        newStatus.goodness -= 100;
        newStatus.wealth += incomeAmount;
        
        return {
          newStatus,
          description: `炎上商法で善良さ-100、資産+${incomeAmount}万円（能力${status.ability}×3）`
        };
      }
    },
    baseAppearanceRate: 0.7,
    probabilityCalculator: (status) => {
      // 能力50以上で出現
      if (status.ability >= 50) {
        // 能力が高いほど出現率UP、善良さが低いほど出現率UP
        const abilityMultiplier = status.ability >= 150 ? 1.8 : status.ability >= 100 ? 1.5 : 1.0;
        const goodnessMultiplier = status.goodness <= 50 ? 1.5 : status.goodness <= 100 ? 1.2 : 0.8;
        return abilityMultiplier * goodnessMultiplier;
      }
      return 0; // 能力50未満では出現しない
    }
  },

  {
    id: 'small_business',
    name: '小規模事業',
    type: CardType.POSITIVE,
    description: '不労所得+2',
    iconSource: '/card-images/small_business.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.passiveIncome = (newStatus.passiveIncome || 0) + 2;
        
        return {
          newStatus,
          description: '小規模事業で不労所得+2（毎ターン+200万円）'
        };
      }
    },
    baseAppearanceRate: 0.6,
    probabilityCalculator: (status) => {
      // 能力150以上で出現
      if (status.ability >= 150) {
        // 能力が高いほど出現率UP
        if (status.ability >= 250) return 2.5;
        if (status.ability >= 200) return 2.0;
        return 1;
      }
      return 0; // 能力150未満では出現しない
    }
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
    description: 'ゲームオーバー',
    iconSource: '/card-images/old_age.png',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.OLD_AGE,
      execute: (_status: GameStatus): CardEffectResult => {
        return {
          isGameOver: true,
          gameOverReason: GameOverReason.OLD_AGE,
          description: 'ゲームオーバー：老衰'
        };
      }
    },
    baseAppearanceRate: 1,
    probabilityCalculator: (status) => {
      if (status.age > 80) return status.age - 75;
      return 0;
    }
  },


  {
    id: 'aging',
    name: '過労',
    type: CardType.NEGATIVE,
    description: '年齢+3歳',
    iconSource: '/card-images/aging.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.age += 3;
        
        return {
          newStatus,
          description: '年齢+3歳（疲労による老化）'
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 年齢が高いほど出現率UP
      if (status.age >= 50) return 2.0;
      if (status.age >= 35) return 1.5;
      return 1.0;
    }
  },

  {
    id: 'pay_pension',
    name: '年金',
    type: CardType.NEGATIVE,
    description: '資産-10万円',
    iconSource: '/card-images/pay_pension.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 10
        
        return {
          newStatus,
          description: '年金を10万円払う'
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 年齢が高いほど出現率Down
      if (status.age >= 60) return 0;
      return 1.0;
    }
  },

  {
    id: 'wealth_halver',
    name: '経済危機',
    type: CardType.NEGATIVE,
    description: '資産×0.5倍',
    iconSource: '/card-images/market_crash.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth /= 2;
        
        return {
          newStatus,
          description: `資産が${Math.floor(oldWealth)}万円から${Math.floor(newStatus.wealth)}万円に半減`
        };
      }
    },
    baseAppearanceRate: 0.1,
    probabilityCalculator: (status) => {
      // 資産が多いほど出現率UP、善良さが低いとさらにUP
      const wealthMultiplier = status.wealth >= 1000 ? 0.3 : status.wealth >= 300 ? 0.2 : 0.1;
      const goodnessMultiplier = status.goodness <= 30 ? 2.0 : status.goodness <= 50 ? 1.5 : 1.0;
      return wealthMultiplier * goodnessMultiplier;
    }
  },

  {
    id: 'drug_addiction',
    name: '薬物中毒',
    type: CardType.NEGATIVE,
    description: '薬中+1',
    iconSource: '/card-images/drug_addiction.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.addiction = (newStatus.addiction || 0) + 1;
        
        return {
          newStatus,
          description: '薬中状態+1'
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 善良さが低いと出現率UP
      if (status.goodness <= 20) return 2.0;
      if (status.goodness <= 40) return 1.2;
      if (status.goodness >= 80) return 0.1;
      return 0.8;
    }
  },

  {
    id: 'property_tax',
    name: '固定資産税',
    type: CardType.NEGATIVE,
    description: '資産×0.9倍（資産の10%税金）',
    iconSource: '/card-images/property_tax.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const taxAmount = status.wealth * 0.1;
        newStatus.wealth -= taxAmount;
        
        return {
          newStatus,
          description: `固定資産税として資産の10%（${Math.floor(taxAmount)}万円）を支払い`
        };
      }
    },
    baseAppearanceRate: 0.1,
    probabilityCalculator: (status) => {
      // 資産が1000万円を超えると出現、それ以下は出現しない
      if (status.wealth > 1000) {
        // 資産が多いほど出現率UP
        if (status.wealth >= 5000) return 2.0;
        if (status.wealth >= 2000) return 1.5;
        return 1.0;
      }
      return 0; // 1000万円以下は出現しない
    }
  },

  {
    id: 'resident_tax',
    name: '住民税',
    type: CardType.NEGATIVE,
    description: '資産-10万円',
    iconSource: '/card-images/property_tax.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 10;
        
        return {
          newStatus,
          description: '住民税として10万円を支払い'
        };
      }
    },
    baseAppearanceRate: 1.0,
    probabilityCalculator: (status) => {
      // 基本的に通常確率、資産が多いとわずかに出現率UP
      if (status.wealth >= 500) return 1.3;
      if (status.wealth >= 100) return 1.1;
      return 1.0;
    }
  },

  {
    id: 'arrest',
    name: '逮捕',
    type: CardType.NEGATIVE,
    description: '善良さ×0.2年間服役し善良さ0に',
    iconSource: '/card-images/arrest.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentGoodness = status.goodness;
        
        const prisonYears = currentGoodness < 0 ? Math.ceil(Math.abs(currentGoodness) * 0.2) : 0; // マイナス善良さの20%
        newStatus.goodness = 0; // 善良さを0に回復
        if (currentGoodness < 0) {
          newStatus.age += prisonYears;
        }
        
        return {
          newStatus,
          description: `逮捕され${prisonYears}年間の服役、善良さが0に回復、年齢+${prisonYears}歳`
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 善良さがマイナスの時のみ高確率で出現
      if (status.goodness < 0) {
        const badnessLevel = Math.abs(status.goodness);
        if (badnessLevel >= 50) return 3.0; // 重罪者は逮捕されやすい
        if (badnessLevel >= 30) return 2.0;
        return 1.5;
      }
      // 善良さが0以上でも低確率で出現（冤罪など）
      return 0;
    }
  },

  {
    id: 'stock_decline',
    name: '株価下落',
    type: CardType.NEGATIVE,
    description: '資産-（複利）×5%',
    iconSource: '/card-images/market_crash.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const compoundLevel = status.compound || 0;

        const lossAmount = status.wealth * compoundLevel * 0.05;
        newStatus.wealth -= lossAmount;
        return {
          newStatus,
          description: `株価下落で資産-${Math.floor(lossAmount)}万円（複利レベル${compoundLevel}×5%）`
        };
      } 
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 複利状態があると出現率UP
      const compoundMultiplier = (status.compound || 0) > 0 ? 2.0 : 0.2;
      return compoundMultiplier;
    }
  },

  {
    id: 'market_crash',
    name: '暴落',
    type: CardType.NEGATIVE,
    description: '資産-（複利）×10%',
    iconSource: '/card-images/market_crash.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const compoundLevel = status.compound || 0;
        
        if (compoundLevel > 0) {
          const lossAmount = status.wealth * compoundLevel * 0.1;
          newStatus.wealth -= lossAmount;
          return {
            newStatus,
            description: `市場暴落で資産-${Math.floor(lossAmount)}万円（複利レベル${compoundLevel}×10%）`
          };
        } else {
          newStatus.wealth -= 50;
          return {
            newStatus,
            description: '市場暴落で資産-50万円'
          };
        }
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 複利状態があると出現率UP
      const compoundMultiplier = (status.compound || 0) > 0 ? 1.5 : 0.2;
      return compoundMultiplier;
    }
  },

  {
    id: 'economic_crisis',
    name: '経済危機',
    type: CardType.NEGATIVE,
    description: '資産-（複利）×20%',
    iconSource: '/card-images/market_crash.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const compoundLevel = status.compound || 0;

        const lossAmount = status.wealth * compoundLevel * 0.2;
        newStatus.wealth -= lossAmount;
        return {
          newStatus,
          description: `経済危機で資産-${Math.floor(lossAmount)}万円（複利レベル${compoundLevel}×20%）`
        };

      }
    },
    baseAppearanceRate: 0.2,
    probabilityCalculator: (status) => {
      // 複利状態があると出現率UP
      const compoundMultiplier = (status.compound || 0) > 0 ? 1.0 : 0.2;
      return compoundMultiplier;
    }
  },

  {
    id: 'asset_seizure',
    name: '差し押さえ',
    type: CardType.NEGATIVE,
    description: '不労所得0に',
    iconSource: '/card-images/asset_seizure.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentPassiveIncome = status.passiveIncome || 0;
        
        // 不労所得を0にする
        delete newStatus.passiveIncome;
        
        return {
          newStatus,
          description: `資産差し押さえで不労所得${currentPassiveIncome}を全て失う`
        };
      }
    },
    baseAppearanceRate: 1.5,
    probabilityCalculator: (status) => {
      // 資産がマイナスかつ不労所得が1以上の時のみ出現
      if (status.wealth < 0 && (status.passiveIncome || 0) >= 1) {
        // 資産のマイナス額が大きいほど出現率UP
        const debtLevel = Math.abs(status.wealth);
        if (debtLevel >= 1000) return 3.0;
        if (debtLevel >= 500) return 2.0;
        return 1.5;
      }
      return 0; // 条件を満たさない場合は出現しない
    }
  },

  {
    id: 'death_penalty',
    name: '死刑',
    type: CardType.NEGATIVE,
    description: '善良さ-3000以下ならゲームオーバー',
    iconSource: '/card-images/death_penalty.png',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.DEATH_PENALTY,
      execute: (status: GameStatus): CardEffectResult => {
        // 実行時の善良さをチェック
        if (status.goodness <= -3000) {
          // 善良さが-3000以下なら死刑執行
          return {
            isGameOver: true,
            gameOverReason: GameOverReason.DEATH_PENALTY,
            description: `善良さ${status.goodness}により死刑執行 - ゲームオーバー`
          };
        } else {
          // 善良さが-3000より大きければ不発
          return {
            newStatus: status,
            description: `死刑宣告されたが善良さ${status.goodness}のため執行猶予（-3000以下で執行）`
          };
        }
      }
    },
    baseAppearanceRate: 2.0,
    probabilityCalculator: (status) => {
      // 善良さ-3000以下でのみ出現
      if (status.goodness <= -3000) {
        // 善良さが低いほど出現率UP
        const evilLevel = Math.abs(status.goodness);
        if (evilLevel >= 5000) return 4.0; // 超極悪人
        if (evilLevel >= 4000) return 3.0;
        return 2.0;
      }
      return 0; // 善良さ-3000より大きい場合は出現しない
    }
  },

  {
    id: 'assassination',
    name: '暗殺',
    type: CardType.NEGATIVE,
    description: 'ゲームオーバー。警護で回避可',
    iconSource: '/card-images/assassination.png',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.ASSASSINATION,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentSecurity = status.security || 0;
        
        if (currentSecurity > 0) {
          // 警護があれば警護-1で生存
          newStatus.security = currentSecurity - 1;
          return {
            newStatus,
            description: `暗殺者を警護が撃退、警護レベル${currentSecurity}→${newStatus.security}`
          };
        } else {
          // 警護がなければゲームオーバー
          return {
            isGameOver: true,
            gameOverReason: GameOverReason.ASSASSINATION,
            description: '警護なしで暗殺される - ゲームオーバー'
          };
        }
      }
    },
    baseAppearanceRate: 1.0,
    probabilityCalculator: (status) => {
      // 善良さ1000以上または500以下で出現
      if (status.goodness >= 300 || status.goodness <= -100) {
        // 極端な善良さほど出現率UP
        if (status.goodness >= 750 || status.goodness <= -300) return 2.5;
        if (status.goodness >= 500 || status.goodness <= -200) return 1.8;
        return 1.0;
      }
      return 0; // 条件を満たさない場合は出現しない
    }
  },

  {
    id: 'kidnapping',
    name: '誘拐',
    type: CardType.NEGATIVE,
    description: '資産が0に。警護で回避可',
    iconSource: '/card-images/kidnapping.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentSecurity = status.security || 0;
        
        if (currentSecurity > 0) {
          // 警護があれば警護-1で資産は守られる
          newStatus.security = currentSecurity - 1;
          return {
            newStatus,
            description: `誘拐を警護が阻止、警護レベル${currentSecurity}→${newStatus.security}`
          };
        } else {
          // 警護がなければ資産を全て失う
          const lostWealth = newStatus.wealth;
          newStatus.wealth = 0;
          return {
            newStatus,
            description: `誘拐され身代金${Math.floor(lostWealth)}万円を支払い、資産が0になる`
          };
        }
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 資産100000以上で出現
      if (status.wealth >= 100000) {
        // 資産が多いほど出現率UP
        if (status.wealth >= 500000) return 3.0;
        if (status.wealth >= 200000) return 2.0;
        return 0.8;
      }
      return 0; // 資産100000未満では出現しない
    }
  },

  {
    id: 'scandal',
    name: 'スキャンダル',
    type: CardType.NEGATIVE,
    description: '善良さ-200',
    iconSource: '/card-images/scandal.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 200;
        
        return {
          newStatus,
          description: 'スキャンダル発覚で善良さ-200'
        };
      }
    },
    baseAppearanceRate: 1.2,
    probabilityCalculator: (status) => {
      // 資産10000以上で出現
      if (status.wealth >= 10000) {
        // 資産が多いほど出現率UP
        if (status.wealth >= 50000) return 2.5;
        if (status.wealth >= 20000) return 1.8;
        return 1.2;
      }
      return 0; // 資産10000未満では出現しない
    }
  },

  {
    id: 'marriage_fraud',
    name: '結婚詐欺',
    type: CardType.NEGATIVE,
    description: '資産-1000万円',
    iconSource: '/card-images/land_fraud.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 1000;
        
        return {
          newStatus,
          description: '結婚詐欺に遭い資産-1000万円'
        };
      }
    },
    baseAppearanceRate: 1.0,
    probabilityCalculator: (status) => {
      // 能力50以下で出現
      if (status.ability <= 50) {
        // 能力が低いほど出現率UP
        if (status.ability <= 20) return 2.5;
        if (status.ability <= 35) return 1.8;
        return 1.0;
      }
      return 0; // 能力50より高い場合は出現しない
    }
  },

  {
    id: 'investment_fraud',
    name: '投資詐欺',
    type: CardType.NEGATIVE,
    description: '資産が0になる',
    iconSource: '/card-images/land_fraud.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth = 0;
        
        return {
          newStatus,
          description: `投資詐欺に遭い資産が0になった`
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 能力100以下で出現
      if (status.ability <= 100 && status.wealth >= 200) {
        // 能力が低いほど出現率UP、資産が多いほど出現率UP
        const abilityMultiplier = status.ability <= 10 ? 5.0 : status.ability <= 50 ? 2.0 : 1.0;
        const wealthMultiplier = status.wealth >= 10000 ? 1.5 : status.wealth >= 1000 ? 1.2 : 0.5;
        return abilityMultiplier * wealthMultiplier;
      }
      return 0; // 能力100より高い場合は出現しない
    }
  },

  {
    id: 'false_accusation',
    name: '冤罪',
    type: CardType.NEGATIVE,
    description: '善良さ-100、資産-500万円',
    iconSource: '/card-images/false_accusation.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 100;
        newStatus.wealth -= 500;
        
        return {
          newStatus,
          description: '冤罪により善良さ-100、資産-500万円'
        };
      }
    },
    baseAppearanceRate: 0.6,
    probabilityCalculator: (_status) => {
      // 常に一定確率で出現（条件なし）
      return 0.6;
    }
  },

  {
    id: 'dementia',
    name: 'ボケ',
    type: CardType.NEGATIVE,
    description: '能力が0になる',
    iconSource: '/card-images/dementia.png',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldAbility = newStatus.ability;
        newStatus.ability = 0;
        
        return {
          newStatus,
          description: `認知症により能力が${Math.floor(oldAbility)}から0になった`
        };
      }
    },
    baseAppearanceRate: 1.5,
    appearanceCondition: {
      minAge: 70
    },
    probabilityCalculator: (status) => {
      // 70歳以上で出現
      if (status.age >= 70) {
        // 年齢が高いほど出現率UP
        if (status.age >= 100) return 4.0;
        if (status.age >= 85) return 2.5;
        if (status.age >= 70) return 1.5;
      }
      return 0; // 70歳未満では出現しない
    }
  },
];

// 全カードを統合
export const allCards: Card[] = [...positiveCards, ...negativeCards]; 