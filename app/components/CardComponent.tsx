import React from 'react';
import Image from 'next/image';
import { Card } from '../types';

interface CardComponentProps {
  card: Card;
  isPositive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  isPositive, 
  isSelected, 
  onClick, 
  disabled 
}) => (
  <div 
    className={`
      border rounded-lg p-2 cursor-pointer transition-all transform hover:scale-105
      ${isPositive 
        ? 'border-green-500 bg-gradient-to-br from-green-900 to-green-800' 
        : 'border-red-500 bg-gradient-to-br from-red-900 to-red-800'
      }
      ${isSelected ? 'ring-2 ring-yellow-400' : ''}
      ${disabled ? 'opacity-70 cursor-not-allowed hover:scale-100' : ''}
      shadow-lg flex flex-col items-center text-center
    `}
    onClick={disabled ? undefined : onClick}
  >
    {/* カード名 */}
    <h2 className="font-bold text-sm mb-2 text-white">{card.name}</h2>

    {/* 大きなカードアイコン */}
    <div className="w-20 h-20 mb-1 flex items-center justify-center">
      <Image 
        src={card.iconSource} 
        alt={card.name}
        width={64}
        height={64}
        className="object-cover"
        unoptimized
        onError={(e) => {
          // 画像が読み込めない場合は代替文字を表示
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling!.textContent = '🎴';
        }}
      />
      <span className="text-3xl hidden">��</span>
    </div>
    
    {/* カード説明 */}
    <div className="text-xs bg-black/40 p-1 rounded border border-gray-600 text-gray-100 w-full">
      {card.description}
    </div>
  </div>
); 