'use client'

import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Scroll, Sword, Coins, RefreshCcw, HandCoins, CoinsIcon, Skull } from 'lucide-react'

interface Player {
  name: string
  money: number
  influences: string[]
  color: string
  isDead: boolean
  isReady: boolean
}

interface GameProps {
  name: string
  socket: Socket
}

export default function Game({ name, socket }: GameProps) {
  const [action, setAction] = useState<any>(null)
  const [blockChallengeRes, setBlockChallengeRes] = useState<any>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerIndex, setPlayerIndex] = useState<number | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState('')
  const [isChooseAction, setIsChooseAction] = useState(false)
  const [revealingRes, setRevealingRes] = useState<any>(null)
  const [blockingAction, setBlockingAction] = useState<any>(null)
  const [isChoosingInfluence, setIsChoosingInfluence] = useState(false)
  const [exchangeInfluence, setExchangeInfluence] = useState<string[] | null>(null)
  const [winner, setWinner] = useState('')
  const [logs, setLogs] = useState<React.ReactNode[]>([])
  const [isDead, setIsDead] = useState(false)
  const [disconnected, setDisconnected] = useState(false)

  useEffect(() => {
    // Socket event handlers remain the same as before
    // ... (previous socket logic)
  }, [socket, name, players, playerIndex, isDead])

  if (disconnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Você foi desconectado</h1>
          <p>Por favor, recrie o jogo.</p>
          <p>Desculpe pelo inconveniente (シ_ _)シ</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Header */}
        <div className="col-span-3">
          <Image
            src="/assets/logo.png"
            alt="Coup Logo"
            width={150}
            height={80}
            className="mb-4"
          />
          <h2 className="text-xl font-serif">Olá, {name}</h2>
        </div>

        {/* Player Cards */}
        <div className="col-span-6">
          <div className="flex justify-center space-x-4">
            {players.map((player, index) => (
              <Card 
                key={index}
                className={`w-48 h-64 p-4 relative ${
                  player.isDead ? 'opacity-50' : ''
                }`}
              >
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  <Coins className="h-4 w-4" />
                  <span>{player.money}</span>
                </div>
                <h3 className="font-serif text-lg mb-2">{player.name}</h3>
                <div className="space-y-2">
                  {player.influences.map((influence, idx) => (
                    <div key={idx} className="w-full h-20 bg-gray-200 rounded-md">
                      <Image
                        src={`/assets/cards/${influence.toLowerCase() ?? "duque"}.png`}
                        alt={influence}
                        width={100}
                        height={140}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Events Log */}
        <div className="col-span-3">
          <Card className="h-full">
            <div className="p-4 border-b">
              <h3 className="font-serif text-lg">Eventos</h3>
            </div>
            <ScrollArea className="h-[300px] p-4">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    index === logs.length - 1 ? 'text-primary font-medium' : ''
                  }`}
                >
                  {log}
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="col-span-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-2">
                <Scroll className="mr-2 h-4 w-4" />
                Regras
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Regras do Jogo</SheetTitle>
                <SheetDescription>
                  {/* Add game rules content */}
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <Scroll className="mr-2 h-4 w-4" />
                Resumo
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Resumo das Ações</SheetTitle>
                <SheetDescription>
                  {/* Add action summary content */}
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        {/* Action Buttons */}
        <div className="col-span-9">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle income */}}
              disabled={!isChooseAction}
            >
              <Coins className="mr-2 h-4 w-4" />
              Renda
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle foreign aid */}}
              disabled={!isChooseAction}
            >
              <HandCoins className="mr-2 h-4 w-4" />
              Ajuda Externa
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle coup */}}
              disabled={!isChooseAction}
            >
              <Sword className="mr-2 h-4 w-4" />
              Coup
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle assassinate */}}
              disabled={!isChooseAction}
            >
              <Skull className="mr-2 h-4 w-4" />
              Assassinar
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle tax */}}
              disabled={!isChooseAction}
            >
              <CoinsIcon className="mr-2 h-4 w-4" />
              Taxar
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={() => {/* handle exchange */}}
              disabled={!isChooseAction}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Trocar
            </Button>
          </div>
        </div>
      </div>

      {/* Game State Modals */}
      {/* Add modals for various game states (reveal, challenge, block, etc.) */}
    </div>
  )
}
