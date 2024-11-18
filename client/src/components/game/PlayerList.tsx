'use client'

import { ReactSortable } from "react-sortablejs"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  name: string
  isReady: boolean
}

interface PlayerListProps {
  players?: Player[]
  onReorder?: (players: Player[]) => void
  className?: string
}

export function PlayerList({ 
  players = [], 
  onReorder,
  className 
}: PlayerListProps) {
  return (
    <div className={cn("mt-6", className)}>
      <h2 className="mb-4 text-lg font-medium">Players</h2>
      
      {players.length > 0 ? (
        <ReactSortable
          list={players}
          setList={onReorder}
          animation={150}
          className="space-y-2"
        >
          {players.map((player, index) => (
            <Card 
              key={player.id}
              className={cn(
                "p-3 cursor-move",
                player.isReady ? "bg-emerald-500/10" : "bg-destructive/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span>
                  {index + 1}. {player.name}
                </span>
                <span className={cn(
                  "text-sm",
                  player.isReady ? "text-emerald-500" : "text-destructive"
                )}>
                  {player.isReady ? "Ready" : "Not Ready"}
                </span>
              </div>
            </Card>
          ))}
        </ReactSortable>
      ) : (
        <p className="text-sm text-muted-foreground">
          No players have joined yet
        </p>
      )}
    </div>
  )
} 