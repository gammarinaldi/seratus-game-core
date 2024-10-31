import { PricingPlan } from "@/components/PricingPlan"

export default async function Pricing() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
      <PricingPlan message={""} />
    </div>
  )
}