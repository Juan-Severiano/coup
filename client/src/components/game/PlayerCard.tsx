import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Coins } from 'lucide-react'
import { Player } from "@/types/game"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className={`relative overflow-hidden ${player.isDead ? 'opacity-50' : ''}`}>
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        <Coins className="h-4 w-4" />
        <span>{player.money ?? 2}</span>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg">{player.name}</h3>
        
        <div className="mt-4 space-y-2">
          {(player.influences ?? ['Unknown', 'Unknown']).map((influence, idx) => (
            <div key={idx} className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-black/20">
              <Image
                src={`/assets/cards/${influence.toLowerCase()}.png`}
                alt={influence}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 