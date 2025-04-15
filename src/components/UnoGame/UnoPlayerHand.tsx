import React from 'react';
import { UnoCard as UnoCardType } from '@/types/unoGame';
import UnoCard from './UnoCard';

interface UnoPlayerHandProps {
  hand: UnoCardType[];
  onPlayCard: (index: number) => void;
  isCurrentPlayer: boolean;
}

const UnoPlayerHand: React.FC<UnoPlayerHandProps> = ({ hand, onPlayCard, isCurrentPlayer }) => {
  // Add debugging
  console.log('UnoPlayerHand - Rendering with:', { 
    handLength: hand?.length || 0,
    handCards: hand,
    isCurrentPlayer 
  });
  
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-lg font-bold mb-2">Sua mão</h3>
      <div className="flex justify-center p-2.5 min-h-36">
        {hand && hand.length > 0 ? (
          hand.map((card, index) => (
            <div 
              key={index} 
              className="mx-[-15px] transition-transform hover:translate-y-[-10px]"
            >
              <UnoCard 
                card={card} 
                onClick={isCurrentPlayer ? () => onPlayCard(index) : undefined}
                disabled={!isCurrentPlayer}
              />
            </div>
          ))
        ) : (
          <div className="text-gray-500">Nenhuma carta na mão</div>
        )}
      </div>
    </div>
  );
};

export default UnoPlayerHand;