import { SelectCountry } from "@/components/SelectCountry"

export default async function SelectCountryPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <SelectCountry />
    </div>
  )
}