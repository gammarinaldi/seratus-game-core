import { Buzzer } from '@/components/Buzzer'

export default async function BuzzerPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
      <Buzzer />
    </div>
  )
}