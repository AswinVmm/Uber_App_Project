const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();
const db = require("../config/firebase");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "inr",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "PaymentIntent creation failed" });
    }
});

router.post("/confirm", async (req, res) => {

    const { rideId, paymentId } = req.body;

    try {

        await db.collection("rides").doc(rideId).update({
            paymentStatus: "paid",
            paymentId: paymentId,
            paidAt: new Date()
        });

        res.json({ success: true });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Payment update failed" });

    }

});

router.get("/receipt/:paymentIntentId", async (req, res) => {
    try {

        const paymentIntent = await stripe.paymentIntents.retrieve(
            req.params.paymentIntentId
        );

        const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
        );

        res.json({
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            receiptUrl: charge.receipt_url,
            paymentMethod: charge.payment_method_details.type,
            status: paymentIntent.status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch receipt" });
    }
});

module.exports = router;