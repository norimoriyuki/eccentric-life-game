import { 
  Card, 
  CardType, 
  EffectType, 
  GameOverReason, 
  WeightCombineMethod 
} from './types';

// 簡易的な重み設定関数
const createWeightConfig = (value: number) => ({ value });

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
      statusChange: {
        wealth: 50,
        age: 1
      },
      description: '資産+50万円、年齢+1歳'
    },
    baseAppearanceRate: 0.8 // 高確率で出現
  },

  {
    id: 'pension',
    name: '年金',
    type: CardType.POSITIVE,
    description: '安定した収入源',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: 30
      },
      description: '資産+30万円'
    },
    baseAppearanceRate: 0.6
  },

  {
    id: 'bonds',
    name: '国債',
    type: CardType.POSITIVE,
    description: '安全な投資で資産を増やす',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 1.1
      },
      description: '資産が1.1倍になる'
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
      statusChange: {
        wealthMultiplier: 1.2
      },
      description: '資産が1.2倍になる'
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
      statusChange: {
        wealthMultiplier: 1.4
      },
      description: '資産が1.4倍になる'
    },
    baseAppearanceRate: 0.2
  },

  // エキセントリックカード
  {
    id: 'lottery_win',
    name: '宝くじ大当たり',
    type: CardType.POSITIVE,
    description: '一攫千金！でも周囲の羨望を買う',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 10,
        trust: -20
      },
      description: '資産が10倍、信用度-20',
      risks: ['周囲からの嫉妬']
    },
    baseAppearanceRate: 0.01 // 超低確率
  },

  {
    id: 'alien_abduction',
    name: 'エイリアン誘拐',
    type: CardType.POSITIVE,
    description: '宇宙人に誘拐され、超技術を学んで帰還',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: 50,
        age: -5
      },
      description: '能力+50、年齢-5歳（若返り）'
    },
    baseAppearanceRate: 0.005 // 極低確率
  },

  {
    id: 'cult_leader',
    name: 'カルト教祖になる',
    type: CardType.POSITIVE,
    description: '信者から多額の寄付を集める',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 5,
        trust: -40
      },
      description: '資産が5倍、信用度-40',
      risks: ['社会的信用失墜']
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'time_slip',
    name: 'タイムスリップ',
    type: CardType.POSITIVE,
    description: '過去に戻って若返る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        age: -20
      },
      description: '年齢-20歳'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'immortality_drug',
    name: '不老不死の薬発見',
    type: CardType.POSITIVE,
    description: '秘密の薬で老化を停止する',
    effect: {
      type: EffectType.SPECIAL,
      description: '年齢上昇が永続的に停止'
    },
    baseAppearanceRate: 0.001, // 超レア
  },

  {
    id: 'zombification',
    name: 'ゾンビ化',
    type: CardType.POSITIVE,
    description: '死んでも復活できる能力を獲得',
    effect: {
      type: EffectType.SPECIAL,
      description: 'ゲームオーバーしても一度だけ復活',
      risks: ['人間性の喪失']
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'psychic_awakening',
    name: '超能力覚醒',
    type: CardType.POSITIVE,
    description: '超常的な力に目覚める',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: 200 // 能力を大幅に超える値も設定可能
      },
      description: '能力が大幅上昇（+200）'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'isekai_reincarnation',
    name: '異世界転生',
    type: CardType.POSITIVE,
    description: '新しい世界で人生をやり直す',
    effect: {
      type: EffectType.SPECIAL,
      description: '全ステータスをランダムでリセット、新しい人生開始'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'politician',
    name: '政治家になる',
    type: CardType.POSITIVE,
    description: '権力と富を得るが、スキャンダルのリスクも',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 2,
        trust: -25
      },
      description: '資産2倍、信用度-25',
      risks: ['政治スキャンダル', '汚職疑惑']
    },
    baseAppearanceRate: 0.1,
  },

  {
    id: 'youtuber_explosion',
    name: 'YouTuber爆発',
    type: CardType.POSITIVE,
    description: 'バズって一気に稼ぐが、中身は薄い',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 3,
        ability: -10
      },
      description: '資産3倍、能力-10',
      risks: ['炎上リスク', '一発屋のレッテル']
    },
    baseAppearanceRate: 0.15
  },

  {
    id: 'underground_friend',
    name: '地底人と友達',
    type: CardType.POSITIVE,
    description: '地底の秘密技術で富を得る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: 500,
        trust: -30
      },
      description: '資産+500万円、信用度-30',
      risks: ['社会からの隔離']
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'forbidden_love',
    name: '禁断の恋',
    type: CardType.POSITIVE,
    description: '危険な恋で人生に刺激を与える',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: 30,
        trust: -15
      },
      description: '能力+30、信用度-15'
    },
    baseAppearanceRate: 0.2
  },

  {
    id: 'human_experiment_subject',
    name: '人体実験の被験者',
    type: CardType.POSITIVE,
    description: '危険な実験で大金を稼ぐ',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: 300
      },
      description: '資産+300万円',
      risks: ['健康リスク', '後遺症の可能性']
    },
    baseAppearanceRate: 0.05
  },

  {
    id: 'mafia_boss',
    name: 'マフィアの親分',
    type: CardType.POSITIVE,
    description: '裏社会の頂点に立つ',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 5,
        trust: -50
      },
      description: '資産5倍、信用度-50',
      risks: ['暗殺リスク大幅増加']
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'mars_immigration',
    name: '火星移住権獲得',
    type: CardType.POSITIVE,
    description: '新天地での新しい生活',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 0.5 // 資産半分
      },
      description: '資産半分、新天地でリスタート'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'ai_personality_transfer',
    name: 'AI人格移植',
    type: CardType.POSITIVE,
    description: 'デジタル存在として永遠の命を得る',
    effect: {
      type: EffectType.SPECIAL,
      description: '年齢上昇停止、人間性に疑問',
      risks: ['人間としてのアイデンティティ喪失']
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'devil_contract',
    name: '悪魔と契約',
    type: CardType.POSITIVE,
    description: '魂と引き換えに莫大な富を得る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 10,
        trust: -30
      },
      description: '資産10倍、信用度-30',
      risks: ['魂の代償', '地獄行きのリスク']
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'suspicious_inheritance',
    name: '遺産相続（怪しい親戚）',
    type: CardType.POSITIVE,
    description: '謎の親戚から巨額の遺産',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 3
      },
      description: '資産3倍',
      risks: ['謎の呪い付き', '後ろ暗い過去']
    },
    baseAppearanceRate: 0.05
  },

  {
    id: 'underground_fighting_champion',
    name: '地下格闘技チャンピオン',
    type: CardType.POSITIVE,
    description: '命をかけた戦いで賞金を稼ぐ',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 2,
        ability: 20
      },
      description: '資産2倍、能力+20',
      risks: ['身体への深刻なダメージ']
    },
    baseAppearanceRate: 0.03
  },

  {
    id: 'secret_society_member',
    name: '秘密結社のメンバー',
    type: CardType.POSITIVE,
    description: '秘密の知識で能力向上',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: 40,
        trust: -20
      },
      description: '能力+40、信用度-20',
      risks: ['監視社会からの逃避']
    },
    baseAppearanceRate: 0.02
  }
];

// ===============================
// ネガティブカード
// ===============================

export const negativeCards: Card[] = [
  // 基本カード
  {
    id: 'old_age',
    name: '老衰',
    type: CardType.NEGATIVE,
    description: '年老いて命を終える',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.OLD_AGE,
      description: 'ゲームオーバー：老衰'
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
    id: 'assassination',
    name: '暗殺',
    type: CardType.NEGATIVE,
    description: '信用を失った末路',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.ASSASSINATION,
      description: 'ゲームオーバー：暗殺'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'minor_crime',
    name: '軽犯罪',
    type: CardType.NEGATIVE,
    description: '小さな犯罪で信用失墜',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -10
      },
      description: '信用度-10'
    },
    baseAppearanceRate: 0.3
  },

  {
    id: 'sex_crime',
    name: '性犯罪',
    type: CardType.NEGATIVE,
    description: '重大な犯罪で社会的に抹殺',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -50,
        wealth: -200
      },
      description: '信用度-50、資産-200万円'
    },
    baseAppearanceRate: 0.05
  },

  {
    id: 'traffic_violation',
    name: '交通違反',
    type: CardType.NEGATIVE,
    description: '罰金で資産が減る',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: -500  // -50から-500に大幅増加
      },
      description: '資産-500万円（重い罰金）'
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
      statusChange: {
        age: 2
      },
      description: '年齢+2歳'
    },
    baseAppearanceRate: 0.6
  },

  // エキセントリックカード
  {
    id: 'dimension_sucked',
    name: '異次元に吸い込まれる',
    type: CardType.NEGATIVE,
    description: '突然異次元の裂け目に吸い込まれる',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.DIMENSION_SUCKED,
      description: 'ゲームオーバー：異次元消失'
    },
    baseAppearanceRate: 0.002
  },

  {
    id: 'government_abduction',
    name: '政府に拉致される',
    type: CardType.NEGATIVE,
    description: '秘密機関に連行され、全財産が没収される',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: -999999, // 全資産没収
        trust: 0
      },
      description: '全資産没収、信用度ゼロ'
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'sns_flame',
    name: 'SNS炎上',
    type: CardType.NEGATIVE,
    description: 'ネットで叩かれて社会的地位失墜',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -30,
        wealth: -800  // -100から-800に大幅増加
      },
      description: '信用度-30、資産-800万円（仕事失い、賠償金）'
    },
    baseAppearanceRate: 0.15
  },

  {
    id: 'cursed',
    name: '呪いにかかる',
    type: CardType.NEGATIVE,
    description: '古い遺跡の呪いで全ステータス減少',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: -1500,  // -200から-1500に大幅増加
        trust: -15,
        ability: -20,
        age: 3
      },
      description: '資産-1500万円、信用-15、能力-20、年齢+3歳'
    },
    baseAppearanceRate: 0.05
  },

  {
    id: 'alien_dissection',
    name: 'エイリアンに解剖される',
    type: CardType.NEGATIVE,
    description: '宇宙人の実験台になる',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.ALIEN_ABDUCTION,
      description: 'ゲームオーバー：宇宙人による解剖'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'brainwashed',
    name: '洗脳される',
    type: CardType.NEGATIVE,
    description: '心を支配され操り人形に',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -40,
        trust: -20
      },
      description: '能力-40、信用度-20'
    },
    baseAppearanceRate: 0.04
  },

  {
    id: 'clone_replacement',
    name: 'クローン人間に入れ替わられる',
    type: CardType.NEGATIVE,
    description: '自分のクローンと入れ替わられる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -50
      },
      description: 'アイデンティティ喪失、信用度-50'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'time_paradox',
    name: 'タイムパラドックス',
    type: CardType.NEGATIVE,
    description: '時間軸の矛盾で存在が不安定に',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -30,
        age: 10 // 急激に老ける
      },
      description: '存在不安定、能力-30、年齢+10歳'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'zombie_virus',
    name: 'ゾンビウイルス感染',
    type: CardType.NEGATIVE,
    description: '理性を失いゾンビ化',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -50,
        trust: -70
      },
      description: '理性喪失、能力-50、信用度-70'
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'demon_possession',
    name: '悪魔憑き',
    type: CardType.NEGATIVE,
    description: '悪魔に憑依され社会から追放',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -100
      },
      description: '信用度ゼロ、社会から完全追放'
    },
    baseAppearanceRate: 0.015
  },

  {
    id: 'memory_loss',
    name: '記憶喪失',
    type: CardType.NEGATIVE,
    description: 'すべての記憶と能力を失う',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -999999, // 能力リセット
        trust: -50
      },
      description: '能力リセット、人間関係リセット'
    },
    baseAppearanceRate: 0.03
  },

  {
    id: 'experiment_failure',
    name: '人体実験の失敗',
    type: CardType.NEGATIVE,
    description: '違法実験の後遺症で社会復帰困難',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -30,
        trust: -25,
        wealth: -1200  // -300から-1200に大幅増加
      },
      description: '能力-30、信用-25、資産-1200万円（医療費・補償）'
    },
    baseAppearanceRate: 0.03
  },

  {
    id: 'apocalypse_prophet',
    name: '地球滅亡予言者認定',
    type: CardType.NEGATIVE,
    description: '終末論者として精神病院送り',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -100,
        wealth: -200
      },
      description: '信用度ゼロ、資産-200万円'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'alien_pet',
    name: '宇宙人のペット',
    type: CardType.NEGATIVE,
    description: '宇宙で飼育され自由を失う',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: 0, // 全資産失う
        trust: -50,
        ability: -20
      },
      description: '自由喪失、全資産失う'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'ai_rebellion_target',
    name: 'AI反乱の標的',
    type: CardType.NEGATIVE,
    description: 'AIに敵視されテクノロジーから排除',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -40,
        wealth: -300
      },
      description: '能力-40、資産-300万円'
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'parallel_world_lost',
    name: '平行世界に迷い込む',
    type: CardType.NEGATIVE,
    description: '元の世界に戻れなくなる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -40,
        wealth: -50 // 現地通貨への換算で損失
      },
      description: '元の世界に戻れない、信用度-40'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'immortality_curse',
    name: '不老不死の呪い',
    type: CardType.NEGATIVE,
    description: '永遠に苦痛を味わい続ける',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -30,
        ability: -20
      },
      description: '永遠の苦痛、能力-20、信用度-30'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'cult_brainwashing',
    name: 'カルトに洗脳される',
    type: CardType.NEGATIVE,
    description: '全財産を寄付し社会復帰不能',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: -999999, // 全資産寄付
        ability: -30,
        trust: -40
      },
      description: '全財産寄付、社会復帰不能'
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'genetic_mutation',
    name: '遺伝子実験の副作用',
    type: CardType.NEGATIVE,
    description: '体が変異し社会から排除',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        ability: -25,
        trust: -60
      },
      description: '体の変異、能力-25、信用度-60'
    },
    baseAppearanceRate: 0.01
  },

  {
    id: 'blackhole_absorption',
    name: 'ブラックホールに吸い込まれる',
    type: CardType.NEGATIVE,
    description: '物理法則の犠牲となる',
    effect: {
      type: EffectType.GAME_OVER,
      gameOverReason: GameOverReason.BLACKHOLE,
      description: 'ゲームオーバー：ブラックホール'
    },
    baseAppearanceRate: 0.001 // 超レア
  },

  {
    id: 'evil_organization_scout',
    name: '悪の組織にスカウト',
    type: CardType.NEGATIVE,
    description: '道徳感覚を失い法執行機関に追われる',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -40,
        wealth: -100
      },
      description: '道徳喪失、信用度-40、資産-100万円'
    },
    baseAppearanceRate: 0.02
  },

  {
    id: 'paranormal_witness',
    name: '超常現象の目撃者',
    type: CardType.NEGATIVE,
    description: '誰にも信じてもらえず孤立',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: -25,
        ability: -10
      },
      description: '孤立、信用度-25、能力-10'
    },
    baseAppearanceRate: 0.05
  },

  {
    id: 'demon_king_summon',
    name: '異世界の魔王に召喚',
    type: CardType.NEGATIVE,
    description: '元の世界に戻れない契約',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealth: 0, // 元の世界の財産は無効
        trust: -50
      },
      description: '元の世界に戻れない、全財産無効'
    },
    baseAppearanceRate: 0.005
  },

  {
    id: 'financial_crash',
    name: '金融破綻',
    type: CardType.NEGATIVE,
    description: '投資先が破綻して大損失',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        wealthMultiplier: 0.3,  // 0.7から0.3に大幅減少（70%の損失）
        trust: -10
      },
      description: '資産が70%減少、信用-10'
    },
    baseAppearanceRate: 0.1,
  },

  {
    id: 'political_scandal',
    name: '政治スキャンダルに巻き込まれる',
    type: CardType.NEGATIVE,
    description: '政治家の汚職に関与したとして社会的に抹殺される',
    effect: {
      type: EffectType.STATUS_CHANGE,
      statusChange: {
        trust: 0,
        wealth: -2000  // -500から-2000に大幅増加
      },
      description: '信用度ゼロ、資産-2000万円（法廷費用・賠償金）'
    },
    baseAppearanceRate: 0.02
  }
];

// 全カードを統合
export const allCards: Card[] = [...positiveCards, ...negativeCards]; 