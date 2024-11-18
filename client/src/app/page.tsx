import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { RulesSheet } from "@/components/game/RulesSheet"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">Welcome to Coup</h1>
        <p className="text-lg text-muted-foreground">A game of deduction and deception</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/create">
          <Button className="w-full" size="lg">
            Create Game
          </Button>
        </Link>
        
        <Link href="/join">
          <Button className="w-full" variant="outline" size="lg">
            Join Game
          </Button>
        </Link>

        <RulesSheet />
      </div>
    </div>
  )
}
