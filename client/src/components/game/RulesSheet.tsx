import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollText } from 'lucide-react'

export function RulesSheet() {
  return (
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
          <SheetDescription className="space-y-4">
            <div>
              <h3 className="font-medium">Basic Rules</h3>
              <p>2-6 players compete to be the last player with influence remaining.</p>
            </div>

            <div>
              <h3 className="font-medium">Actions</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Income:</strong> Take 1 coin from the treasury</li>
                <li><strong>Foreign Aid:</strong> Take 2 coins (can be blocked by Duke)</li>
                <li><strong>Coup:</strong> Pay 7 coins to force another player to lose influence</li>
                <li><strong>Tax:</strong> Take 3 coins (Duke)</li>
                <li><strong>Assassinate:</strong> Pay 3 coins to assassinate another player (Assassin)</li>
                <li><strong>Steal:</strong> Take 2 coins from another player (Captain)</li>
                <li><strong>Exchange:</strong> Exchange cards with the Court deck (Ambassador)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Challenges</h3>
              <p>Players can challenge any action that requires a specific character card. If the challenge succeeds, the challenged player loses an influence. If it fails, the challenger loses an influence.</p>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
} 