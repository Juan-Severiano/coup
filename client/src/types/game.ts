export interface Player {
  id?: string
  name: string
  socketID: string
  isReady: boolean
  isLeader?: boolean
  money?: number
  influences?: string[]
  isDead?: boolean
  color?: string
}

export interface GameAction {
  action: string
  target?: string
  source?: string
}

export interface GameState {
  players: Player[]
  currentPlayer: string
  gameStarted: boolean
  winner: string | null
  logs: string[]
}

export interface CounterAction {
  counterAction: string
  claim: string
  source: string
}

export interface GameEvent {
  action?: GameAction
  counterAction?: CounterAction
  target?: string
  source?: string
  isBlocking?: boolean
  isChallenging?: boolean
} 