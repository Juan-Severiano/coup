import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { GameEvent, Player, GameState } from '@/types/game'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface ServerToClientEvents {
  joinSuccess: () => void
  joinFailed: (error: string) => void
  leader: () => void
  readyConfirm: () => void
  partyUpdate: (players: Player[]) => void
  gameStart: (initialState: { currentPlayer: string, players: Player[] }) => void
  gameStateUpdate: (newState: { 
    players: Player[]
    currentPlayer: string
    lastAction: string 
  }) => void
  'g-addLog': (log: string) => void
  gameOver: (winner: string) => void
  leaderDisconnect: () => void
  startGameError: (error: string) => void
  privateState: (state: { influences: string[] }) => void
}

interface ClientToServerEvents {
  setName: (name: string) => void
  setReady: (isReady: boolean) => void
  reorderPlayers: (players: Player[]) => void
  startGameSignal: () => void
  action: (event: GameEvent) => void
}

export function useGameConnection(initialRoomCode?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode || '')
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayer: '',
    gameStarted: false,
    winner: null,
    logs: []
  })
  const [error, setError] = useState<string | null>(null)

  const connectToRoom = useCallback(async (playerName: string, code: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // const { data } = await axios.get(`${BASE_URL}/exists/${code}`)
      // if (!data.exists) {
      //   throw new Error('Invalid room code')
      // }

      if (socket) {
        socket.disconnect()
      }

      console.log('Connecting to room:', code)
      const newSocket = io(`${BASE_URL}/${code}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        query: { playerName }
      })

      return new Promise((resolve, reject) => {
        const cleanup = () => {
          newSocket.off('connect')
          newSocket.off('connect_error')
          newSocket.off('disconnect')
          newSocket.off('joinSuccess')
          newSocket.off('joinFailed')
        }

        newSocket.on('connect', () => {
          console.log('Socket connected, setting name:', playerName)
          newSocket.emit('setName', playerName)
        })

        newSocket.on('joinSuccess', () => {
          console.log('Join successful')
          cleanup()
          setSocket(newSocket)
          setRoomCode(code)
          localStorage.setItem('playerName', playerName)
          setIsLoading(false)
          resolve(newSocket)
        })

        newSocket.on('joinFailed', (error) => {
          console.error('Join failed:', error)
          cleanup()
          newSocket.disconnect()
          setError(error)
          setIsLoading(false)
          reject(new Error(error))
        })

        newSocket.on('connect_error', (error) => {
          console.error('Connection error:', error)
          cleanup()
          newSocket.disconnect()
          setError('Failed to connect to server')
          setIsLoading(false)
          reject(new Error('Failed to connect to server'))
        })

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected')
          cleanup()
          setError('Disconnected from server')
          setIsLoading(false)
        })

        setTimeout(() => {
          if (!newSocket.connected) {
            cleanup()
            newSocket.disconnect()
            setError('Connection timeout')
            setIsLoading(false)
            reject(new Error('Connection timeout'))
          }
        }, 10000)
      })
    } catch (error) {
      console.error('Connection error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setIsLoading(false)
      throw error
    }
  }, [socket])

  useEffect(() => {
    const storedName = localStorage.getItem('playerName')
    if (initialRoomCode && storedName && !socket) {
      console.log('Auto-connecting with stored name:', storedName)
      connectToRoom(storedName, initialRoomCode).catch((error) => {
        console.error('Auto-connect failed:', error)
        setError(error.message)
      })
    }
  }, [initialRoomCode, socket, connectToRoom])

  const createGame = async (playerName: string) => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`${BASE_URL}/createNamespace`)
      const namespace = data.namespace
      console.log('Namespace created:', namespace)
      
      await connectToRoom(playerName, namespace)
      setIsLoading(false)
      return namespace
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const joinGame = async (playerName: string, code: string) => {
    setIsLoading(true)
    try {
      await connectToRoom(playerName, code)
      setIsLoading(false)
      return code
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  useEffect(() => {
    if (!socket) return

    socket.on('privateState', (state) => {
      console.log('Received private state:', state)
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.socketID === socket.id 
            ? { ...p, influences: state.influences }
            : { ...p, influences: ['Unknown', 'Unknown'] }
        )
      }))
    })

    return () => {
      socket.off('privateState')
    }
  }, [socket])

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  return {
    socket,
    roomCode,
    isLoading,
    gameState,
    setGameState,
    createGame,
    joinGame,
    connectToRoom,
    error
  }
}
