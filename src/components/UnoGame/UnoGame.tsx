import React, { useState } from 'react';
import { useUnoGame } from '@/context/UnoGameContext';
import { useChat } from '@/context/ChatContext';
import { UnoCardColor } from '@/types/unoGame';
import UnoDeck from './UnoDeck';
import UnoOpponents from './UnoOpponents';
import UnoColorPicker from './UnoColorPicker';
import UnoNotification from './UnoNotification';
import UnoPlayerHand from './UnoPlayerHand';

const UnoGame: React.FC = () => {
  const { currentUser } = useChat();
  const {
    state,
    notifications,
    playCard,
    drawCard,
    callUno,
    challengeUno,
    removeNotification
  } = useUnoGame();

  const {
    gameStatus,
    hand,
    topCard,
    currentPlayer,
    currentColor,
    opponentHandSize,
  } = state;

  // Add debugging logs
  console.log('UnoGame - Current state:', {
    gameStatus,
    handLength: hand?.length || 0,
    handCards: hand,
    topCard,
    currentPlayer,
    currentColor,
    opponentHandSize
  });

  //const [selectedColor, setSelectedColor] = useState<UnoCardColor | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardPlay = (cardIndex: number) => {
    if (currentPlayer !== currentUser) return;
    
    const card = hand[cardIndex];
    if (!card) return;
    
    if (card.type === 'special' || (card.color === null && card.value === 'wild')) {
      setSelectedCard(cardIndex);
      setShowColorPicker(true);
      return;
    }

    playCard(cardIndex);
  };

  const handleColorSelect = (color: UnoCardColor) => {
    if (selectedCard === null) return;
    
    playCard(selectedCard, color);
    setShowColorPicker(false);
    setSelectedCard(null);
  };

  const handleChallengeUno = (targetPlayer: string) => {
    if (currentUser && targetPlayer !== currentUser) {
      challengeUno(targetPlayer);
    }
  };

  const getColorTextClass = (color: string | null) => {
    const colorMap = {
      red: 'text-red-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
    };
    return color ? colorMap[color as keyof typeof colorMap] : 'text-gray-600';
  };

  if (gameStatus !== 'active') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 animate-pulse">
          Aguardando início do jogo...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto relative bg-violet-500">
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold mb-2">
          {currentPlayer === currentUser ? (
            <span className="text-green-600 animate-pulse">Sua vez!</span>
          ) : (
            <span className="text-gray-700">Vez de {currentPlayer}</span>
          )}
        </div>
        <div className="text-lg">
          Cor atual: 
          <span className={`ml-2 font-bold ${getColorTextClass(currentColor)} capitalize`}>
            {currentColor || 'Nenhuma'}
          </span>
        </div>
      </div>

      <UnoOpponents
        opponents={opponentHandSize}
        currentPlayer={currentPlayer}
        onChallengeUno={handleChallengeUno}
      />

      <div className="mb-8">
        <UnoDeck
          topCard={topCard}
          onDrawCard={drawCard}
          disabled={currentPlayer !== currentUser}
        />
      </div>

      <UnoPlayerHand
        hand={hand}
        onPlayCard={handleCardPlay}
        isCurrentPlayer={currentPlayer === currentUser}
      />

      <div className="mt-6 flex justify-center">
        <button
          onClick={callUno}
          disabled={hand.length !== 1 || currentPlayer !== currentUser}
          className={`
            px-6 py-3 rounded-lg font-bold text-white
            ${hand.length === 1 && currentPlayer === currentUser
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gray-400 cursor-not-allowed'}
            transition-colors
          `}
        >
          UNO!
        </button>
      </div>

      {showColorPicker && (
        <UnoColorPicker
          onColorSelect={handleColorSelect}
          onClose={() => {
            setShowColorPicker(false);
            setSelectedCard(null);
          }}
        />
      )}

      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification, index) => (
          <UnoNotification
            key={index}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default UnoGame;