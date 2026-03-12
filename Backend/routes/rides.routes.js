const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// =============================
// 🚗 CREATE RIDE
// =============================
router.post("/create", async (req, res) => {
    try {
        const { riderId, pickup, pickupCoords, drop, dropCoords, stops = [], distanceKm = 0, fare = 0 } = req.body;

        // Validate input
        if (!riderId) {
            return res.status(400).json({ error: "Rider ID is required" });
        }

        if (!pickup || !drop) {
            return res.status(400).json({ error: "Pickup and Drop locations are required" });
        }

        if (!pickupCoords?.lat || !pickupCoords?.lng) {
            return res.status(400).json({ error: "Pickup coordinates required" });
        }

        if (!dropCoords?.lat || !dropCoords?.lng) {
            return res.status(400).json({ error: "Drop coordinates required" });
        }

        if (!Array.isArray(stops)) {
            return res.status(400).json({ error: "Stops must be an array" });
        }

        const rideRef = db.collection("rides").doc();

        await rideRef.set({
            riderId,
            pickup,
            pickupCoords,
            stops,
            drop,
            dropCoords,
            distanceKm,
            fare,
            status: "requested",
            createdAt: new Date(),
        });

        res.status(201).json({
            message: "Ride created successfully",
            rideId: rideRef.id,
        });
        console.log({
            riderId,
            pickup,
            drop,
            stops
        });
    } catch (error) {
        console.error("CREATE RIDE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// =============================
// 📋 GET REQUESTED RIDES
// =============================
router.get("/available", async (req, res) => {
    try {
        const snapshot = await db
            .collection("rides")
            .where("status", "==", "requested")
            .get();

        const rides = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(rides);
    } catch (error) {
        console.error("AVAILABLE RIDES ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// =============================
// 🚘 DRIVER ACCEPT RIDE
// =============================
router.post("/accept", async (req, res) => {
    try {
        const { rideId, driverId } = req.body;

        if (!rideId || !driverId) {
            return res.status(400).json({ error: "Ride ID and Driver ID are required" });
        }

        const rideRef = db.collection("rides").doc(rideId);
        const rideSnap = await rideRef.get();

        if (!rideSnap.exists) {
            return res.status(404).json({ error: "Ride not found" });
        }

        if (rideSnap.data().status !== "requested") {
            return res.status(400).json({ error: "Ride already accepted or invalid" });
        }

        await rideRef.update({
            driverId,
            status: "accepted",
            acceptedAt: new Date(),
        });

        res.json({ message: "Ride accepted successfully" });

    } catch (error) {
        console.error("ACCEPT RIDE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// // =============================
// // ❌ DECLINE RIDE
// // =============================
// router.post("/decline", async (req, res) => {
//     try {
//         const { rideId, driverId } = req.body;

//         if (!rideId || !driverId) {
//             return res.status(400).json({ error: "Ride ID and Driver ID required" });
//         }

//         const rideRef = db.collection("rides").doc(rideId);

//         await rideRef.update({
//             declinedBy: db.FieldValue.arrayUnion(driverId)
//         });

//         res.json({ message: "Ride declined" });

//     } catch (error) {
//         console.error("DECLINE ERROR:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

router.post("/cancel", async (req, res) => {

    const { rideId } = req.body;

    await db.collection("rides").doc(rideId).update({
        status: "cancelled",
        cancelledAt: new Date()
    });

    res.json({ message: "Ride cancelled" });

});

// router.post("/cancel", async (req, res) => {

//     const { rideId } = req.body;

//     await db.collection("rides").doc(rideId).delete();

//     res.json({ message: "Ride cancelled" });

// });


// =============================
// 🏁 COMPLETE RIDE
// =============================
router.post("/complete", async (req, res) => {
    try {
        const { rideId, fare } = req.body;

        if (!rideId || !fare) {
            return res.status(400).json({ error: "Ride ID and Fare are required" });
        }

        const rideRef = db.collection("rides").doc(rideId);
        const rideSnap = await rideRef.get();

        if (!rideSnap.exists) {
            return res.status(404).json({ error: "Ride not found" });
        }

        if (rideSnap.data().status !== "accepted") {
            return res.status(400).json({ error: "Ride not in progress" });
        }

        // await rideRef.update({
        //     status: "completed",
        //     fare,
        //     completedAt: new Date(),
        // });
        await rideRef.update({
            status: "completed",
            fare,
            completedAt: new Date(),
            rideDuration: "...",
            paymentStatus: "paid"
        });

        res.json({ message: "Ride completed successfully" });

    } catch (error) {
        console.error("COMPLETE RIDE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// =============================
// 📜 GET RIDER HISTORY
// =============================
router.get("/history/:riderId", async (req, res) => {
    try {
        const { riderId } = req.params;

        if (!riderId) {
            return res.status(400).json({ error: "Rider ID required" });
        }

        const snapshot = await db
            .collection("rides")
            .where("riderId", "==", riderId)
            .get();

        const rides = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                pickup: data.pickup,
                drop: data.drop,
                stops: data.stops || [],
                fare: data.fare,
                distanceKm: data.distanceKm,
                status: data.status,
                createdAt: data.createdAt,
                completedAt: data.completedAt || null
            };
        }).sort((a, b) => {
            return b.createdAt?.seconds - a.createdAt?.seconds;
        });
        res.json(rides);

    } catch (error) {
        console.error("RIDER HISTORY ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// =============================
// 🚘 GET DRIVER HISTORY
// =============================
router.get("/driver-history/:driverId", async (req, res) => {
    try {

        const { driverId } = req.params;

        if (!driverId) {
            return res.status(400).json({ error: "Driver ID required" });
        }

        const snapshot = await db
            .collection("rides")
            .where("driverId", "==", driverId)
            .get();

        const rides = snapshot.docs
            // .map(doc => ({
            //     id: doc.id,
            //     ...doc.data()
            // }))
            .map(doc => {
                const data = doc.data();

                return {
                    id: doc.id,
                    pickup: data.pickup,
                    drop: data.drop,
                    stops: data.stops || [],
                    fare: data.fare,
                    distanceKm: data.distanceKm,
                    status: data.status,
                    createdAt: data.createdAt,
                    completedAt: data.completedAt || null
                };
            })
            .sort((a, b) => {
                return b.createdAt?.seconds - a.createdAt?.seconds;
            });

        res.json(rides);

    } catch (error) {

        console.error("DRIVER HISTORY ERROR:", error);
        res.status(500).json({ error: error.message });

    }
});

module.exports = router;