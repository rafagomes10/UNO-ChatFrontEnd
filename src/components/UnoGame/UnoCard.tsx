import React from 'react';
import { UnoCard as UnoCardType } from '@/types/unoGame';
import '@/styles/uno-cards.css';

interface UnoCardProps {
  card: UnoCardType;
  onClick?: () => void;
  disabled?: boolean;
  isTopCard?: boolean;
}

const UnoCard: React.FC<UnoCardProps> = ({ card, onClick, disabled, isTopCard }) => {
  const getCardClass = () => {
    const baseClass = 'uno-card';
    if (!card.color) return `${baseClass} uno-card-special`;
    return `${baseClass} uno-card-${card.color}`;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getCardClass()}
        ${!disabled && !isTopCard ? 'hover:scale-110' : ''}
        ${disabled ? 'opacity-75' : ''}
        w-24
      `}
    >
      <span className="uno-card-symbol">{card.value}</span>
      <span className="uno-card-corner uno-card-corner-top">{card.value}</span>
      <span className="uno-card-corner uno-card-corner-bottom">{card.value}</span>
    </button>
  );
};

export default UnoCard;