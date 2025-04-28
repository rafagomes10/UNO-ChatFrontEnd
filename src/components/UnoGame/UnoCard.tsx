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
      draggable={!disabled && !isTopCard}
      onDragStart={e => {
        if (!disabled && !isTopCard) {
          e.dataTransfer.setData('card-index', String(card.index ?? ''));
        }
      }}
    >
      <span className="uno-card-symbol">
        {card.type === 'wild' ? (
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#000" />
            <g>
              <circle cx="12" cy="12" r="5" fill="#e53935" />
              <circle cx="20" cy="12" r="5" fill="#43a047" />
              <circle cx="12" cy="20" r="5" fill="#1e88e5" />
              <circle cx="20" cy="20" r="5" fill="#fbc02d" />
            </g>
          </svg>
        ) : card.type === 'wild_draw_four' ? (
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" rx="6" fill="#000" />
            <text x="16" y="21" textAnchor="middle" fontSize="18" fill="#fff" fontWeight="bold">+4</text>
            <g>
              <circle cx="10" cy="10" r="3" fill="#e53935" />
              <circle cx="22" cy="10" r="3" fill="#43a047" />
              <circle cx="10" cy="22" r="3" fill="#1e88e5" />
              <circle cx="22" cy="22" r="3" fill="#fbc02d" />
            </g>
          </svg>
        ) : card.type === 'reverse' ? (
          <span title="Reverse" style={{fontSize: '2rem'}}>↺</span>
        ) : card.type === 'skip' ? (
          <span title="Skip" style={{fontSize: '2rem'}}>⦸</span>
        ) : card.type === 'draw_two' ? (
          <span title="+2" style={{fontSize: '2rem'}}>+2</span>
        ) : (
          card.value
        )}
      </span>
      <span className="uno-card-corner uno-card-corner-top">
        {card.type === 'wild' ? 'W' : card.type === 'wild_draw_four' ? '+4' : card.type === 'reverse' ? '↺' : card.type === 'skip' ? '⦸' : card.type === 'draw_two' ? '+2' : card.value}
      </span>
      <span className="uno-card-corner uno-card-corner-bottom">
        {card.type === 'wild' ? 'W' : card.type === 'wild_draw_four' ? '+4' : card.type === 'reverse' ? '↺' : card.type === 'skip' ? '⦸' : card.type === 'draw_two' ? '+2' : card.value}
      </span>
    </button>
  );
};

export default UnoCard;