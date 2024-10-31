import PaymentError from '@/components/PaymentError'

export default async function PaymentErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-background p-4">
      <PaymentError orderId={''} />
    </div>
  )
}
