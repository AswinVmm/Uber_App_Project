"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function Success() {
    const params = useSearchParams();

    const paymentIntent = params.get("payment_intent");
    const rideId = params.get("rideId");
    const [date, setDate] = useState("");
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true)
    const status = params.get("redirect_status");



    useEffect(() => {
        setDate(new Date().toLocaleString())
    }, [])

    useEffect(() => {

        if (!paymentIntent) {
            setLoading(false)
            return;
        }

        fetch(`http://localhost:4000/api/payment/receipt/${paymentIntent}`)
            .then(res => res.json())
            .then(data => {
                setReceipt(data)
                setLoading(false)
            })
            .catch(() => setLoading(false));

    }, [paymentIntent]);

    useEffect(() => {

        if (rideId && paymentIntent) {

            axios.post("http://localhost:4000/api/payment/confirm", {
                rideId,
                paymentId: paymentIntent
            });

        }

    }, [rideId, paymentIntent]);

    if (loading) return <div className="p-6">Loading receipt...</div>
    if (!paymentIntent) {
        return <div className="p-6 text-red-500">Payment not found</div>
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold text-green-600">
                Payment Successful
            </h1>
            <p>Ride ID: {rideId}</p>
            <p className="mt-3">Transaction ID:{paymentIntent}</p>
            {receipt && (
                <>
                    <p>Amount Paid: ₹{receipt.amount}</p>
                    <p>Payment Method: {receipt.paymentMethod}</p>
                    <p>Status: {receipt.status}</p>

                    <a
                        href={receipt.receiptUrl}
                        target="_blank"
                        className="text-blue-600 underline mt-3 block"
                    >
                        View Stripe Receipt
                    </a>
                </>
            )}
            <p className="mt-3">Transaction Time: {date}</p>

        </div>
    );
}