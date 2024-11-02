import { JoinRoom } from "@/components/JoinRoom"

export default async function Join() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
      <JoinRoom />
    </div>
  )
}