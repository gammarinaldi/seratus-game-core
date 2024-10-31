import RoomCreated from "@/components/RoomCreated";

export default async function Room({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <RoomCreated params={{ roomCode: params.id }} />
    </div>
  )
}
