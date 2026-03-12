"use client"
import React, { useEffect, useContext, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import CheckOutForm from '@/components/Payment/CheckOutForm';
import { Elements } from '@stripe/react-stripe-js';
import { useSearchParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
function Payment() {
    const [clientSecret, setClientSecret] = useState("");
    const searchParams = useSearchParams();
    const fare = searchParams.get("fare");
    const method = searchParams.get("method");
    console.log("Fare from URL:", fare);
    console.log("Method from URL:", method);
    useEffect(() => {
        if (!fare) return;
        fetch("http://localhost:4000/api/payment/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: Number(fare) }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("stripe response", data);
                setClientSecret(data.clientSecret);

            });
    }, [fare]);
    const options = {
        clientSecret,
    };
    if (!clientSecret) return <div>Loading...</div>;
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-3">Payment</h2>

            <p className="mb-2">Payment Method: <b>{method}</b></p>
            <p className="mb-5">Amount: ₹{fare}</p>

            <Elements stripe={stripePromise} options={options}>
                <CheckOutForm />
            </Elements>
        </div>
    )
}

export default Payment;