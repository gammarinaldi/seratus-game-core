import RoomCreated from "@/components/RoomCreated";

export default async function Room({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
      <RoomCreated params={{ roomCode: params.id }} />
    </div>
  )
}
