'use client'

import { Card } from "@/components/ui/card"
import { PlayerCard } from "./PlayerCard"
import { GameControls } from "./GameControls"
import { GameLog } from "./GameLog"
import { GameHeader } from "./GameHeader"
import { Player } from "@/types/game"

interface GameBoardProps {
  playerName: string
  players: Player[]
  currentPlayer: string
  isCurrentPlayer: boolean
  playerMoney: number
  onAction: (action: string, target?: string) => void
  logs: string[]
}

export function GameBoard({
  playerName,
  players,
  currentPlayer,
  isCurrentPlayer,
  playerMoney,
  onAction,
  logs
}: GameBoardProps) {
  const currentPlayerName = players.find(p => p.socketID === currentPlayer)?.name

  const normalizedPlayers = players.map(player => ({
    ...player,
    money: player.money ?? 2,
    influences: player.influences ?? ['Unknown', 'Unknown'],
    isDead: player.isDead ?? false,
    color: player.color ?? '#ffffff'
  }))

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="mx-auto max-w-7xl">
        <GameHeader
          playerName={playerName}
          playerMoney={playerMoney}
          currentPlayer={currentPlayerName}
        />
        
        <div className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-9">
            <div className="grid grid-cols-3 gap-4">
              {normalizedPlayers.map((player) => (
                <PlayerCard
                  key={player.socketID}
                  player={player}
                />
              ))}
            </div>
            
            <GameControls
              onAction={onAction}
              isCurrentPlayer={isCurrentPlayer}
              playerMoney={playerMoney}
            />
          </div>
          
          <div className="col-span-3">
            <GameLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  )
}
