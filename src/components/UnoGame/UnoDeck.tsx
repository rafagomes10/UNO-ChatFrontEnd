import React from 'react';
import { UnoCard as UnoCardType } from '@/types/unoGame';
import UnoCard from './UnoCard';

interface UnoDeckProps {
  topCard: UnoCardType | null;
  onDrawCard: () => void;
  disabled: boolean;
}

const UnoDeck: React.FC<UnoDeckProps> = ({ topCard, onDrawCard, disabled }) => {
  return (
    <div className="flex items-center justify-center space-x-8">
      {/* Deck de compra */}
      <button
        onClick={onDrawCard}
        disabled={disabled}
        className={`
          uno-card uno-card-back w-24
          ${!disabled ? 'hover:scale-105 active:scale-95' : 'opacity-75'}
          transition-all duration-200
        `}
      >
        <div className="text-2xl font-bold text-white">UNO</div>
      </button>

      {/* Pilha de descarte */}
      <div className="relative"
        onDragOver={e => { if (!disabled) e.preventDefault(); }}
        onDrop={e => {
          if (!disabled) {
            const cardIndex = e.dataTransfer.getData('card-index');
            if (cardIndex !== undefined && cardIndex !== null && cardIndex !== '') {
              // Chama a função de jogar carta se disponível
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                // Dispara um evento customizado para UnoGame
                const event = new CustomEvent('uno-drop-card', { detail: { cardIndex: Number(cardIndex) } });
                window.dispatchEvent(event);
              }
            }
          }
        }}
      >
        {topCard && (
          <UnoCard
            card={topCard}
            isTopCard
            disabled
          />
        )}
      </div>
    </div>
  );
};

export default UnoDeck;