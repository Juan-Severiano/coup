'use client'

import { useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GameLogProps {
  logs: React.ReactNode[]
}

export function GameLog({ logs }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="h-[calc(100vh-2rem)]">
      <div className="p-4 border-b">
        <h3 className="font-medium">Game Log</h3>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)] p-4">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`text-sm ${
                index === logs.length - 1 ? 'text-primary font-medium' : ''
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
} 