'use client';

import { useTicTacToe } from '@/context/TicTacToeContext';

export default function TicTacToe() {
  const { 
    gameActive, 
    gameBoard, 
    currentPlayer, 
    currentUser, 
    opponent, 
    gameResult, 
    makeMove 
  } = useTicTacToe();

  if (!gameActive && !gameResult) {
    return null;
  }

  const renderSquare = (index: number) => {
    return (
      <button
        className={`w-20 h-20 bg-white border border-gray-300 text-3xl font-bold flex items-center justify-center
          ${currentPlayer === currentUser && gameBoard[index] === null ? 'hover:bg-gray-100 cursor-pointer' : ''}
          ${gameBoard[index] === 'X' ? 'text-red-600' : ''}
          ${gameBoard[index] === 'O' ? 'text-blue-600' : ''}`}
        onClick={() => makeMove(index)}
        disabled={currentPlayer !== currentUser || gameBoard[index] !== null}
      >
        {gameBoard[index]}
      </button>
    );
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center text-black">Jogo da Velha</h2>
      
      {gameResult ? (
        <div className="text-center mb-4 p-2 bg-blue-100 rounded">
          <p className="font-bold">{gameResult}</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Jogar Novamente
          </button>
        </div>
      ) : (
        <div className="text-center mb-4 text-black">
          <p>Jogando contra: <span className="font-bold">{opponent}</span></p>
          <p className="mt-1">
            {currentPlayer === currentUser 
              ? "Sua vez de jogar" 
              : "Aguardando jogada do oponente.."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 mx-auto w-max">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}