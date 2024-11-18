'use client'

import { Button } from "@/components/ui/button"
import { 
  Coins, 
  Sword, 
  HandCoins, 
  RefreshCcw, 
  CoinsIcon, 
  Skull 
} from 'lucide-react'

interface GameControlsProps {
  onAction: (action: string, target?: string) => void
  isCurrentPlayer: boolean
  playerMoney: number
}

export function GameControls({ onAction, isCurrentPlayer, playerMoney }: GameControlsProps) {
  const canCoup = playerMoney >= 7
  const canAssassinate = playerMoney >= 3
  const mustCoup = playerMoney >= 10

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-medium">Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={() => onAction('income')}
          disabled={!isCurrentPlayer || mustCoup}
        >
          <Coins className="mr-2 h-4 w-4" />
          Income
        </Button>

        <Button
          variant="secondary"
          onClick={() => onAction('foreign_aid')}
          disabled={!isCurrentPlayer || mustCoup}
        >
          <HandCoins className="mr-2 h-4 w-4" />
          Foreign Aid
        </Button>

        <Button
          variant="secondary"
          onClick={() => onAction('coup')}
          disabled={!isCurrentPlayer || !canCoup}
        >
          <Sword className="mr-2 h-4 w-4" />
          Coup
        </Button>

        <Button
          variant="secondary"
          onClick={() => onAction('assassinate')}
          disabled={!isCurrentPlayer || !canAssassinate || mustCoup}
        >
          <Skull className="mr-2 h-4 w-4" />
          Assassinate
        </Button>

        <Button
          variant="secondary"
          onClick={() => onAction('tax')}
          disabled={!isCurrentPlayer || mustCoup}
        >
          <CoinsIcon className="mr-2 h-4 w-4" />
          Tax
        </Button>

        <Button
          variant="secondary"
          onClick={() => onAction('exchange')}
          disabled={!isCurrentPlayer || mustCoup}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Exchange
        </Button>
      </div>
    </div>
  )
} 