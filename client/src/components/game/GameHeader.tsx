import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollText } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface GameHeaderProps {
  playerName: string
  playerMoney?: number
  currentPlayer?: string
}

export function GameHeader({ playerName, playerMoney = 0, currentPlayer }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Image
          src="/assets/logo.png"
          alt="Coup Logo"
          width={120}
          height={60}
          className="h-auto w-auto"
        />
        
        <Card className="p-4">
          <p className="text-sm font-medium">Player: {playerName}</p>
          <p className="text-sm">Coins: {playerMoney}</p>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        {currentPlayer && (
          <p className="text-sm">
            Current Player: <span className="font-medium">{currentPlayer}</span>
          </p>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <ScrollText className="mr-2 h-4 w-4" />
              Rules
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Game Rules</SheetTitle>
              <SheetDescription>
                {/* Add game rules content */}
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
} 