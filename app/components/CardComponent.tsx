import React from 'react';
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
      shadow-lg
    `}
    onClick={disabled ? undefined : onClick}
  >
    <h3 className="font-bold text-sm mb-2 text-white">{card.name}</h3>
    <div className="text-xs bg-black/40 p-2 rounded border border-gray-600 text-gray-100">
      {card.effect.description}
    </div>
  </div>
); 