export interface TicTacToeContextType {
  gameActive: boolean;
  gameBoard: Array<string | null>;
  currentPlayer: string;
  currentUser: string;
  opponent: string;
  gameResult: string | null;
  pendingInvitation: string | null;
  playersInGame: string[];
  inviteToGame: (opponent: string) => void;
  acceptGameInvitation: () => void;
  declineGameInvitation: () => void;
  makeMove: (position: number) => void;
}
