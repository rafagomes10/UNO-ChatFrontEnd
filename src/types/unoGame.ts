export type UnoCardColor = 'red' | 'blue' | 'green' | 'yellow' | null;
export type UnoCardType = 'number' | 'action' | 'special';
export type UnoGameStatus = 'idle' | 'creating_room' | 'in_room' | 'active' | 'finished';

export interface UnoCard {
    type: UnoCardType;
    value: string;
    color: UnoCardColor;
}

export interface UnoRoom {
    id: string;
    players: string[];
    owner: string;
    status: 'waiting' | 'playing';
}

interface AvailableRoom {
  id: string;
  owner: string;
  players: string[];
}

export interface UnoGameState {
    gameStatus: 'idle' | 'waiting' | 'active' | 'finished';
    players: string[];
    hand: UnoCard[];
    topCard: UnoCard | null;
    currentPlayer: string | null;
    currentColor: UnoCardColor | null;
    roomCode: string | null;
    opponentHandSize: Record<string, number>;
    isRoomOwner: boolean;
    unoCalled: boolean;
    error: string | null;
    availableRooms: AvailableRoom[]; // Add this line
}

export interface UnoGameContextType extends UnoGameState {
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    startGame: () => void;
    playCard: (cardIndex: number, chosenColor?: UnoCardColor) => void;
    drawCard: () => void;
    callUno: () => void;
    getRooms: () => void;
}