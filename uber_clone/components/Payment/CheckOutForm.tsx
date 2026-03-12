"use client";
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useSearchParams } from "next/navigation";

function CheckOutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const params = useSearchParams();
    const rideId = params.get("rideId");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!stripe || !elements) {
            console.log("Stripe not loaded");
            return;
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
            console.log(submitError.message);
            return;
        }

        const { error } = await stripe.confirmPayment({

            elements,
            confirmParams: {
                return_url: `http://localhost:3000/payment/success?rideId=${rideId}`,
            },
        });
        if (error) {
            console.log(error.message);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button type="submit" disabled={!stripe || !elements} className="bg-black text-white px-4 py-2 rounded">Pay</button>
        </form>
    )
}

export default CheckOutForm;