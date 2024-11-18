'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ClientOnly } from "@/components/ClientOnly"
import { GameBoard } from "@/components/game/GameBoard"
import { WaitingRoom } from "@/components/game/WaitingRoom"
import { useGameConnection } from "@/hooks/use-game-connection"
import { ActionDialog } from "@/components/game/ActionDialog"
import { Player, GameState, GameAction, GameEvent } from "@/types/game"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const { socket, connectToRoom, error, isLoading } = useGameConnection(code)
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayer: '',
    gameStarted: false,
    winner: null,
    logs: []
  })

  const [isLeader, setIsLeader] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  const [actionDialog, setActionDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: '',
    target: ''
  })

  useEffect(() => {
    const storedName = localStorage.getItem('playerName')
    const stored = localStorage.getItem('isLeaderWithCode')

    if (stored) {
      setIsLeader(true)
      setIsReady(true)
    }
    
    if (!storedName) {
      router.push('/')
      return
    }

    if (!socket && code) {
      connectToRoom(storedName, code).catch((error) => {
        console.error('Connection failed:', error)
      })
    }
  }, [code, socket, router, connectToRoom])

  useEffect(() => {
    if (!socket) return

    socket.on('leader', () => {
      console.log('You are the leader')
      setIsLeader(true)
      setIsReady(true)
    })

    socket.on('readyConfirm', () => {
      console.log('Ready confirmed')
      setIsReady(true)
    })

    socket.on('partyUpdate', (players) => {
      console.log('Party update:', players)
      setGameState(prev => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        players: players.map((p: any) => ({
          ...p,
          money: p.money || 2,
          influences: p.influences || ['Unknown', 'Unknown'],
          isDead: false,
          color: p.color || '#ffffff'
        }))
      }))
    })

    socket.on('gameStart', (initialState) => {
      console.log('Game started:', initialState)
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        currentPlayer: initialState.currentPlayer,
        logs: [...prev.logs, 'Game started!']
      }))
    })

    socket.on('gameStateUpdate', (newState) => {
      setGameState(prev => ({
        ...prev,
        players: newState.players,
        currentPlayer: newState.currentPlayer,
        logs: [...prev.logs, newState.lastAction]
      }))
    })

    socket.on('g-addLog', (log) => {
      setGameState(prev => ({
        ...prev,
        logs: [...prev.logs, log]
      }))
    })

    socket.on('gameOver', (winner) => {
      setGameState(prev => ({
        ...prev,
        winner,
        logs: [...prev.logs, `Game Over! ${winner} wins!`]
      }))
    })

    return () => {
      socket.off('leader')
      socket.off('readyConfirm')
      socket.off('partyUpdate')
      socket.off('gameStart')
      socket.off('gameStateUpdate')
      socket.off('g-addLog')
      socket.off('gameOver')
    }
  }, [socket])

  const handleReady = () => {
    if (!socket) return
    console.log('Setting ready state')
    socket.emit('setReady', true)
  }

  const handleReorderPlayers = (newOrder: Player[]) => {
    if (!socket || !isLeader) return
    socket.emit('reorderPlayers', newOrder)
  }

  const handleStartGame = () => {
    if (!socket || !isLeader) return
    console.log('Emitting startGameSignal')
    socket.emit('startGameSignal')
  }

  const handleAction = (action: string, target?: string) => {
    if (!socket) return

    const gameAction: GameAction = { 
      action, 
      target,
      source: gameState.players.find(p => p.socketID === socket.id)?.name 
    }

    switch (action) {
      case 'coup':
      case 'assassinate':
      case 'steal':
        setActionDialog({
          open: true,
          title: `Choose target for ${action}`,
          description: 'Select a player to target with this action',
          action,
          target: target || ''
        })
        break
      
      default:
        socket.emit('action', { action: gameAction } as GameEvent)
        break
    }
  }

  const handleActionConfirm = () => {
    if (!socket) return

    const gameAction: GameAction = {
      action: actionDialog.action,
      target: actionDialog.target,
      source: gameState.players.find(p => p.socketID === socket.id)?.name
    }
    
    socket.emit('action', { action: gameAction } as GameEvent)
    setActionDialog(prev => ({ ...prev, open: false }))
  }

  const currentPlayerData = gameState.players.find(p => p.socketID === socket?.id)

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Erro de Conexão</h1>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Voltar para a página inicial</Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Conectando...</h1>
          <p>Por favor, aguarde enquanto nos conectamos ao jogo.</p>
        </Card>
      </div>
    )
  }

  return (
    <ClientOnly>
      {!gameState.gameStarted ? (
        <WaitingRoom
          players={gameState.players}
          isLeader={isLeader}
          isReady={isReady}
          roomCode={code}
          onStartGame={handleStartGame}
          onReady={handleReady}
          onReorderPlayers={handleReorderPlayers}
        />
      ) : (
        <>
          <GameBoard
            playerName={currentPlayerData?.name || ''}
            players={gameState.players}
            currentPlayer={gameState.currentPlayer}
            isCurrentPlayer={currentPlayerData?.socketID === gameState.currentPlayer}
            playerMoney={currentPlayerData?.money || 0}
            onAction={handleAction}
            logs={gameState.logs}
          />

          <ActionDialog
            open={actionDialog.open}
            title={actionDialog.title}
            description={actionDialog.description}
            onConfirm={handleActionConfirm}
            onCancel={() => setActionDialog(prev => ({ ...prev, open: false }))}
          />
        </>
      )}
    </ClientOnly>
  )
}
