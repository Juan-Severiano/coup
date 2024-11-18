import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { RulesSheet } from "@/components/game/RulesSheet"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">Welcome to Coup</h1>
        <p className="text-lg text-muted-foreground">A game of deduction and deception</p>
      </div>

      <Image
        src="/assets/chicken.svg"
        alt="Coup Logo"
        width={200}
        height={200}
        className="h-auto w-auto"
      />

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

      <footer className="fixed bottom-4 text-sm text-muted-foreground">
        <p>Made by <a href="https://github.com/cheneth" target="_blank" rel="noopener noreferrer" className="underline">Ethan Chen</a></p>
        <p className="text-xs">Beta v0.9</p>
      </footer>
    </div>
  )
} 