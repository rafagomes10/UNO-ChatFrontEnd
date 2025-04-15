import React from 'react';

interface UnoOpponentsProps {
  opponents: Record<string, number>;
  currentPlayer: string | null;
  onChallengeUno: (targetPlayer: string) => void;
}

const UnoOpponents: React.FC<UnoOpponentsProps> = ({ opponents, currentPlayer, onChallengeUno }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {Object.entries(opponents).map(([player, cardCount]) => (
        <div
          key={player}
          className={`
            p-4 rounded-lg shadow-md
            ${currentPlayer === player ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'}
            transition-all duration-300
          `}
        >
          <div className="text-center">
            <div className="font-semibold mb-2">{player}</div>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: Math.min(cardCount, 7) }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-6 bg-red-600 rounded-sm transform -rotate-12"
                  style={{
                    transform: `rotate(${(i - 3) * 5}deg)`,
                    marginLeft: i > 0 ? '-8px' : '0'
                  }}
                />
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {cardCount} {cardCount === 1 ? 'carta' : 'cartas'}
            </div>
            {cardCount === 1 && (
              <button
                onClick={() => onChallengeUno(player)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                Desafiar UNO!
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnoOpponents;