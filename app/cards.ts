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
    description: '能力の値だけ稼ぐ、善良さ+5、能力+5',
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
    description: '能力の値だけ稼ぐ、善良さ-10、能力+5',
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
    id: 'pension',
    name: '年金',
    type: CardType.POSITIVE,
    description: '資産+40万円',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth += 40;
        
        return {
          newStatus,
          description: '資産+40万円'
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 年齢が高いほど出現率UP
      if (status.age >= 60) return 2.0;
      if (status.age >= 40) return 1.2;
      return 0.6;
    }
  },

  {
    id: 'investment',
    name: '投資',
    type: CardType.POSITIVE,
    description: '複利状態+1（毎ターン資産10%増加）',
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
    name: '株取引',
    type: CardType.POSITIVE,
    description: '資産が1.2倍になる',
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
    name: '起業',
    type: CardType.POSITIVE,
    description: '資産が1.4倍になる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth *= 1.4;
        
        return {
          newStatus,
          description: `事業成功！資産が${Math.floor(oldWealth)}万円から${Math.floor(newStatus.wealth)}万円に増加`
        };
      }
    },
    baseAppearanceRate: 0.3,
    probabilityCalculator: (status) => {
      // 能力が高く、ある程度の資産があると出現率UP
      if (status.ability >= 80 && status.wealth >= 200) return 1.2;
      if (status.ability >= 60 && status.wealth >= 100) return 0.8;
      return 0.4;
    }
  },

  {
    id: 'smart_investment',
    name: '賢い投資',
    type: CardType.POSITIVE,
    description: '能力80以上で資産1.5倍、50以上で1.3倍、未満で1.1倍',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        let multiplier = 1.1;
        let description = '資産が10%増加';

        if (status.ability >= 80) {
          multiplier = 1.5;
          description = '高い能力で資産が50%増加';
        } else if (status.ability >= 50) {
          multiplier = 1.3;
          description = '中程度の能力で資産が30%増加';
        }

        const oldWealth = newStatus.wealth;
        newStatus.wealth *= multiplier;
        
        return {
          newStatus,
          description: `${description}（${Math.floor(oldWealth)}万円→${Math.floor(newStatus.wealth)}万円）`
        };
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 能力が高いほど出現率UP
      if (status.ability >= 70) return 1.5;
      if (status.ability >= 50) return 1.0;
      return 0.6;
    }
  },

  {
    id: 'compound_interest_mastery',
    name: '複利の極意',
    type: CardType.POSITIVE,
    description: '複利なしなら開始+能力+10、ありなら強化+複利レベル×80万円',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentCompound = status.compound || 0;
        
        if (currentCompound === 0) {
          newStatus.compound = 1;
          newStatus.ability += 10;
          
          return {
            newStatus,
            description: '複利開始+投資知識で能力+10'
          };
        } else {
          const bonusWealth = currentCompound * 80;
          newStatus.compound += 1;
          newStatus.wealth += bonusWealth;
          
          return {
            newStatus,
            description: `複利強化+ボーナス資産+${bonusWealth}万円`
          };
        }
      }
    },
    baseAppearanceRate: 0.2,
    probabilityCalculator: (status) => {
      // 複利状態があると出現率UP、能力も影響
      const compoundBonus = (status.compound || 0) > 0 ? 2.0 : 1.0;
      const abilityBonus = status.ability >= 60 ? 1.5 : 1.0;
      return compoundBonus * abilityBonus;
    }
  },

  {
    id: 'wealth_doubler',
    name: '大当たり',
    type: CardType.POSITIVE,
    description: '資産が2倍になる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth *= 2;
        
        return {
          newStatus,
          description: `大当たり！資産が${Math.floor(oldWealth)}万円から${Math.floor(newStatus.wealth)}万円に倍増`
        };
      }
    },
    baseAppearanceRate: 0.05,
    probabilityCalculator: (status) => {
      // 極レアカード、善良さが高いとわずかに出現率UP
      return status.goodness >= 80 ? 0.08 : 0.05;
    }
  },

  {
    id: 'isekai_reincarnation',
    name: '異世界転生',
    type: CardType.POSITIVE,
    description: '能力保持、他ステータス乱数、状態リセット、50%で仕送り取得',
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
    description: '善良さのマイナスの値の10%の年数服役、善良さ0に回復',
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
    description: '資産-1000万円で善良さ0に回復（資産不足なら失敗）',
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
];

// ===============================
// ネガティブカード
// ===============================

export const negativeCards: Card[] = [
  {
    id: 'old_age',
    name: '老衰',
    type: CardType.NEGATIVE,
    description: 'ゲームオーバー（年老いて死亡）',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.OLD_AGE,
      execute: (__status: GameStatus): CardEffectResult => {
        return {
          isGameOver: true,
          gameOverReason: GameOverReason.OLD_AGE,
          description: 'ゲームオーバー：老衰'
        };
      }
    },
    baseAppearanceRate: 0.02,
    probabilityCalculator: (status) => {
      if (status.age > 80) return status.age - 75;
      if (status.age > 60) return 1.5 + (status.age - 60) * 0.1;
      if (status.age > 40) return 0.5;
      return 0;
    }
  },

  {
    id: 'minor_crime',
    name: '軽犯罪',
    type: CardType.NEGATIVE,
    description: '善良さ-15',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.goodness -= 15;
        
        return {
          newStatus,
          description: '善良さ-15'
        };
      }
    },
    baseAppearanceRate: 0.8,
    probabilityCalculator: (status) => {
      // 善良さが低いほど出現率UP
      if (status.goodness <= 20) return 2.5;
      if (status.goodness <= 40) return 1.5;
      if (status.goodness >= 80) return 0.3;
      return 1.0;
    }
  },

  {
    id: 'traffic_violation',
    name: '交通違反',
    type: CardType.NEGATIVE,
    description: '資産-80万円（罰金）',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.wealth -= 80;
        
        return {
          newStatus,
          description: '資産-80万円（罰金）'
        };
      }
    },
    baseAppearanceRate: 1.0,
    probabilityCalculator: (status) => {
      // 善良さが低いと出現率UP
      if (status.goodness <= 30) return 1.8;
      if (status.goodness >= 70) return 0.6;
      return 1.0;
    }
  },

  {
    id: 'aging',
    name: '加齢',
    type: CardType.NEGATIVE,
    description: '年齢+3歳（疲労による老化）',
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
    description: '年金を10万円払う',
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
    id: 'wealth_dependent_crisis',
    name: '資産危機',
    type: CardType.NEGATIVE,
    description: '50万円未満で貧困、200万円未満で詐欺-60万円、1000万円未満で15%減、以上で30%減',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        if (status.wealth < 50) {
          newStatus.goodness -= 10;
          newStatus.ability -= 5;
          return {
            newStatus,
            description: '貧困によるストレス、善良さ-10、能力-5'
          };
        } else if (status.wealth < 200) {
          newStatus.wealth -= 60;
          newStatus.goodness -= 5;
          return {
            newStatus,
            description: '詐欺被害、資産-60万円、善良さ-5'
          };
        } else if (status.wealth < 1000) {
          newStatus.wealth *= 0.85;
          newStatus.goodness -= 8;
          return {
            newStatus,
            description: '投資詐欺で資産15%減少、善良さ-8'
          };
        } else {
          newStatus.wealth *= 0.7;
          newStatus.goodness -= 15;
          return {
            newStatus,
            description: '巨額詐欺で資産30%減少、善良さ-15'
          };
        }
      }
    },
    baseAppearanceRate: 0.4,
    probabilityCalculator: (status) => {
      // 資産が多いほど出現率UP
      if (status.wealth >= 1000) return 1.5;
      if (status.wealth >= 500) return 1.0;
      if (status.wealth >= 100) return 0.8;
      return 0.6;
    }
  },

  {
    id: 'state_dependent_disease',
    name: '病気',
    type: CardType.NEGATIVE,
    description: '基本：能力-15、資産-100万円。複利状態で悪化。薬中状態で重症化',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        
        // 基本的な病気
        newStatus.ability -= 15;
        newStatus.wealth -= 100;
        let description = '一般的な病気、能力-15、治療費-100万円';

        // 複利状態があるとストレス病
        if (status.compound && status.compound > 0) {
          newStatus.ability -= 10;
          newStatus.wealth -= 80;
          newStatus.goodness -= 8;
          description = '投資ストレス病、能力-25、治療費-180万円、善良さ-8';
        }

        // 薬中状態があると重症化
        if (status.addiction && status.addiction > 0) {
          newStatus.ability -= 20;
          newStatus.wealth -= 150;
          newStatus.age += 2;
          description = '薬物による重症化、能力-35、治療費-250万円、年齢+2歳';
        }

        return {
          newStatus,
          description
        };
      }
    },
    baseAppearanceRate: 0.6,
    probabilityCalculator: (status) => {
      // 年齢が高いほど、状態異常があるほど出現率UP
      let multiplier = 1.0;
      if (status.age >= 60) multiplier += 1.0;
      if (status.age >= 40) multiplier += 0.5;
      if (status.compound && status.compound > 0) multiplier += 0.8;
      if (status.addiction && status.addiction > 0) multiplier += 1.5;
      return Math.min(multiplier, 3.0);
    }
  },

  {
    id: 'wealth_halver',
    name: '大損失',
    type: CardType.NEGATIVE,
    description: '資産が半分になる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const oldWealth = newStatus.wealth;
        newStatus.wealth /= 2;
        
        return {
          newStatus,
          description: `大損失！資産が${Math.floor(oldWealth)}万円から${Math.floor(newStatus.wealth)}万円に半減`
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
    description: '薬中状態+1（毎ターン追加老化）、善良さ-20、資産-120万円',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        newStatus.addiction = (newStatus.addiction || 0) + 1;
        newStatus.goodness -= 20;
        newStatus.wealth -= 120;
        
        return {
          newStatus,
          description: '薬中状態+1、善良さ-20、資産-120万円'
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
    id: 'heavy_drugs',
    name: '危険薬物',
    type: CardType.NEGATIVE,
    description: '初回：薬中状態+2、善良さ-30、資産-250万円、能力-15。既存時：悪化',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentAddiction = status.addiction || 0;
        
        if (currentAddiction === 0) {
          // 初回
          newStatus.addiction = 2;
          newStatus.goodness -= 30;
          newStatus.wealth -= 250;
          newStatus.ability -= 15;
          
          return {
            newStatus,
            description: '重度薬物中毒、薬中状態+2、善良さ-30、資産-250万円、能力-15'
          };
        } else {
          // 既に薬中の場合はさらに悪化
          newStatus.addiction += 1;
          newStatus.goodness -= 15;
          newStatus.wealth -= 180;
          newStatus.ability -= 10;
          
          return {
            newStatus,
            description: `薬物中毒悪化、薬中状態+1（合計${newStatus.addiction}）、善良さ-15、資産-180万円、能力-10`
          };
        }
      }
    },
    baseAppearanceRate: 0.05,
    probabilityCalculator: (status) => {
      // 既に薬中の場合は出現率が大幅UP、善良さも影響
      const addiction = status.addiction || 0;
      const addictionMultiplier = addiction > 0 ? 2.0 + addiction * 0.5 : 1.0;
      const goodnessMultiplier = status.goodness <= 30 ? 2.0 : status.goodness <= 50 ? 1.5 : 1.0;
      return addictionMultiplier * goodnessMultiplier;
    }
  },

  {
    id: 'property_tax',
    name: '固定資産税',
    type: CardType.NEGATIVE,
    description: '資産の10%を税金として徴収（資産1000万円超でのみ出現）',
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
    description: '資産-10万円（住民税）',
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
    description: '善良さのマイナスの値の20%の年数服役、善良さ0に回復、費用-200万円',
    effect: {
      type: EffectType.STATUS_CHANGE,
      execute: (status: GameStatus): CardEffectResult => {
        const newStatus = { ...status };
        const currentGoodness = status.goodness;
        
        const prisonYears = Math.ceil(Math.abs(currentGoodness) * 0.2); // マイナス善良さの20%
        newStatus.goodness = 0; // 善良さを0に回復
        newStatus.age += prisonYears;
        newStatus.wealth -= 200; // 弁護士費用や罰金
        
        return {
          newStatus,
          description: `逮捕され${prisonYears}年間の服役、善良さが0に回復、年齢+${prisonYears}歳、費用-200万円`
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
];

// 全カードを統合
export const allCards: Card[] = [...positiveCards, ...negativeCards]; 