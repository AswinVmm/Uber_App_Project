const express = require("express");
const axios = require("axios");
const router = express.Router();


router.get("/search", async (req, res) => {
    const { q } = req.query;
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q,
                    format: "json",
                    addressdetails: 1,
                },
                headers: {
                    "User-Agent": "uber-clone-app",
                },
            }
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});


router.post("/route", async (req, res) => {
    try {
        const { pickup, drop, stops = [] } = req.body;

        const coordinates = [
            [pickup.lng, pickup.lat],
            ...stops.map((stop) => [stop.lng, stop.lat]),
            [drop.lng, drop.lat],
        ];

        const response = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                coordinates: coordinates,
            },
            {
                headers: {
                    Authorization: process.env.ORS_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Pickup:", pickup);
        console.log("Drop:", drop);
        console.log("ORS response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Route fetch failed" });
    }
});


module.exports = router;