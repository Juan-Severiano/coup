'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useGameConnection } from "@/hooks/use-game-connection"
import { ClientOnly } from "@/components/ClientOnly"
import { Player } from "@/types/game"

export default function CreateGamePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { createGame, isLoading, roomCode, socket } = useGameConnection()

  useEffect(() => {
    if (!socket) return

    const handleLeader = () => {
      console.log('You are the leader')
    }

    const handlePartyUpdate = (updatedPlayers: Player[]) => {
      console.log('Party update:', updatedPlayers)
    }

    const handleGameStart = () => {
      console.log('Game starting, redirecting to game page')
      if (roomCode) {
        router.push(`/game/${roomCode}`)
      }
    }

    const handleStartGameError = (errorMessage: string) => {
      console.error('Start game error:', errorMessage)
      setError(errorMessage)
    }

    socket.on('leader', handleLeader)
    socket.on('partyUpdate', handlePartyUpdate)
    socket.on('gameStart', handleGameStart)
    socket.on('startGameError', handleStartGameError)

    return () => {
      socket.off('leader', handleLeader)
      socket.off('partyUpdate', handlePartyUpdate)
      socket.off('gameStart', handleGameStart)
      socket.off('startGameError', handleStartGameError)
    }
  }, [socket, roomCode, router])

  const handleCreateGame = async () => {
    if (!name) {
      setError('Please enter a name')
      return
    }

    if (name.length > 10) {
      setError('Name must be less than 11 characters')
      return
    }

    try {
      const code = await createGame(name)
      console.log('Game created with code:', code)
    } catch (err) {
      console.error('Create game error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error creating game')
      }
    }
  }

  if (roomCode) {
    localStorage.setItem("isLeaderWithCode", roomCode)
    return (
      router.push(`/game/${roomCode}`)
    )
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <Card className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Create Game</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your name
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
              {error && (
                <p className="mt-1 text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button 
              onClick={handleCreateGame}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </Card>
      </div>
    </ClientOnly>
  )
} 