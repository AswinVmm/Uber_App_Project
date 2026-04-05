const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

router.post("/alert", async (req, res) => {

    try {

        const { riderId, location } = req.body;

        if (!riderId || !location) {
            return res.status(400).json({ error: "Invalid request" });
        }

        await db.collection("sos_alerts").add({
            riderId,
            location,
            createdAt: new Date(),
            status: "active"
        });

        console.log("🚨 SOS ALERT:", riderId, location);

        res.json({ message: "SOS alert sent successfully" });

    } catch (error) {

        console.error("SOS ERROR:", error);
        res.status(500).json({ error: error.message });

    }

});

module.exports = router;