'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlayerList } from "@/components/game/PlayerList"
import { useGameConnection } from "@/hooks/use-game-connection"
import { ClientOnly } from "@/components/ClientOnly"

export default function JoinGamePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const { joinGame, isLoading } = useGameConnection()

  const handleJoinGame = async () => {
    if (!name) {
      setError('Please enter a name')
      return
    }

    if (!roomCode) {
      setError('Please enter a room code')
      return
    }

    if (name.length > 10) {
      setError('Name must be less than 11 characters')
      return
    }

    try {
      await joinGame(name, roomCode)
      router.push(`/game/${roomCode}`)
    } catch (err: any) {
      setError(err.message || 'Error joining game')
    }
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <Card className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Join Game</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                maxLength={10}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Room Code
              </label>
              <Input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase())
                  setError('')
                }}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button 
              onClick={handleJoinGame}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </Button>
          </div>

          <PlayerList />
        </Card>
      </div>
    </ClientOnly>
  )
} 