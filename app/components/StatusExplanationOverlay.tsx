import React from 'react';

interface StatusExplanationOverlayProps {
  statusType: 'wealth' | 'goodness' | 'ability' | 'age' | string; // string for state effects
  onClose: () => void;
}

// ステータスの説明データ
const statusExplanations: Record<string, { title: string; description: string; emoji: string }> = {
  wealth: {
    title: '総資産',
    description: 'お金です。死ぬまでに可能な限り増やすことが人生の目的です。',
    emoji: '💰'
  },
  goodness: {
    title: '善良さ',
    description: '人から善良に思われている度合いです。マイナスだと逮捕されます。極端に高いか低いと命を狙われます。',
    emoji: '😇'
  },
  ability: {
    title: '能力',
    description: '総合能力です。高いといいカードを引きやすくなり、低いと詐欺などにあいます。',
    emoji: '🧠'
  },
  age: {
    title: '年齢',
    description: '毎ターン3上がり、上がると老衰カードの出現率が上がります。160歳で誰もが死にます。',
    emoji: '🎂'
  },
  allowance: {
    title: '仕送り',
    description: '親からの援助です。毎ターン資産が+30万円増加し1減ります。回数が0になると効果が終了します。',
    emoji: '👨‍👩‍👧‍👦'
  },
  compound: {
    title: '複利',
    description: '毎ターン資産が10%×レベル分増加します。',
    emoji: '📈'
  },
  addiction: {
    title: '薬中',
    description: '薬物依存により老化し、追加で年齢が増加します。',
    emoji: '💊'
  },
  passiveIncome: {
    title: '不労所得',
    description: '毎ターン資産がレベル×100万円増加します。',
    emoji: '🏦'
  },
  trauma: {
    title: 'トラウマ',
    description: '心的外傷です。毎ターン能力がレベル×5減少します。',
    emoji: '😰'
  },
  security: {
    title: '警護',
    description: '暗殺や誘拐などの危険なイベントから身を守ります。',
    emoji: '🛡️'
  }
};

export const StatusExplanationOverlay: React.FC<StatusExplanationOverlayProps> = ({
  statusType,
  onClose
}) => {
  const explanation = statusExplanations[statusType];
  
  if (!explanation) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-sm w-full bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 shadow-2xl cursor-pointer"
        onClick={onClose}
      >
        {/* タイトル */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{explanation.emoji}</div>
          <h3 className="font-bold text-xl text-yellow-400 mb-2">
            {explanation.title}
          </h3>
        </div>

        {/* 説明 */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {explanation.description}
          </p>
        </div>

        {/* 閉じる指示 */}
        <div className="text-center">
          <div className="text-xs text-gray-500">
            📱 画面をタップして閉じる
          </div>
        </div>
      </div>
    </div>
  );
}; 