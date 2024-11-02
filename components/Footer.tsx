import NextLink from "next/link"

export default function Footer() {
    return (
        <div className="py-4 text-center text-sm mr-5 ml-5">
            Dengan menggunakan layanan ini, Anda telah menyetujui <NextLink href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</NextLink> dan telah membaca <NextLink href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</NextLink> kami.
        </div>
    )
}