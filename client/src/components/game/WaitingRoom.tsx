'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy } from 'lucide-react'
import { ReactSortable } from "react-sortablejs"
import { Player } from "@/types/game"

interface WaitingRoomProps {
  players: Player[]
  isLeader: boolean
  isReady: boolean
  roomCode: string
  onStartGame: () => void
  onReady: () => void
  onReorderPlayers?: (players: Player[]) => void
}

export function WaitingRoom({ 
  players, 
  isLeader, 
  isReady,
  roomCode, 
  onStartGame,
  onReady,
  onReorderPlayers 
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)
  const canStartGame = players.length >= 2 && players.every(p => p.isReady)

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sortablePlayers = players.map(p => ({
    ...p,
    id: p.socketID
  }))

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Waiting Room</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{roomCode}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {copied && (
          <p className="mb-4 text-sm text-center text-muted-foreground">
            Room code copied to clipboard!
          </p>
        )}

        {isLeader && players.length > 1 && (
          <p className="mb-4 text-sm text-muted-foreground">
            You can drag to re-arrange the players in a specific turn order!
          </p>
        )}

        <div className="space-y-2">
          {isLeader ? (
            <ReactSortable
              list={sortablePlayers}
              setList={(newState) => onReorderPlayers?.(newState)}
              animation={150}
              className="space-y-2"
            >
              {sortablePlayers.map((player, index) => (
                <Card 
                  key={player.id}
                  className={`p-3 cursor-move ${
                    player.isReady ? "bg-emerald-500/10" : "bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {index + 1}. {player.name}
                      {player.isLeader && " (Leader)"}
                    </span>
                    <span className={`text-sm ${
                      player.isReady ? "text-emerald-500" : "text-destructive"
                    }`}>
                      {player.isReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </Card>
              ))}
            </ReactSortable>
          ) : (
            <div className="space-y-2">
              {players.map((player, index) => (
                <Card 
                  key={player.socketID}
                  className={`p-3 ${
                    player.isReady ? "bg-emerald-500/10" : "bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {index + 1}. {player.name}
                      {player.isLeader && " (Leader)"}
                    </span>
                    <span className={`text-sm ${
                      player.isReady ? "text-emerald-500" : "text-destructive"
                    }`}>
                      {player.isReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {!isLeader && !isReady && (
            <Button 
              onClick={onReady}
              className="w-full"
              variant="secondary"
            >
              Ready
            </Button>
          )}

          {isLeader && (
            <Button
              onClick={onStartGame}
              disabled={!canStartGame}
              className="w-full"
            >
              Start Game {!canStartGame && '(Waiting for players to be ready)'}
            </Button>
          )}

          {!isLeader && (
            <p className="text-center text-sm text-muted-foreground">
              {isReady 
                ? "Waiting for other players and leader to start..." 
                : "Click Ready when you're prepared to start"}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
} 