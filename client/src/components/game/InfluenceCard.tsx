import Image from 'next/image'

interface InfluenceCardProps {
  influence: string
  revealed?: boolean
  className?: string
}

export function InfluenceCard({ influence, revealed = true, className = '' }: InfluenceCardProps) {
  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg ${className}`}>
      <Image
        src={revealed ? `/assets/cards/${influence.toLowerCase() ?? "duque"}.png` : '/assets/cards/duque.png'}
        alt={revealed ? influence : 'Card Back'}
        fill
        className="object-cover"
      />
    </div>
  )
} 