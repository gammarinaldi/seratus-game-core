import { JoinRoom } from "@/components/JoinRoom"

export default async function Join() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <JoinRoom />
    </div>
  )
}