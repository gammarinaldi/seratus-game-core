import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {    
    try {
        const { planName, amount } = await req.json();
        const orderId = planName === "Pro" ? "pro-" + uuidv4().slice(-12) : "pre-" + uuidv4().slice(-12);
        const parameters = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: {
                id: planName + " plan",
                name: planName + " plan",
                price: amount,
                quantity: 1,
                merchant_name: "Seratus Quiz App"
            }
        };

        const response = await fetch(process.env.NEXT_PUBLIC_API!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SECRET + ':').toString('base64')
            },
            body: JSON.stringify(parameters)
        });

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Server response:', response.status, errorText)
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/payment-gateway/midtrans API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
