exports.createRide = async (req, res) => {
    const { pickup, drop, stops } = req.body;

    const coordinates = [
        [pickup.lng, pickup.lat],
        ...(stops || []).map(s => [s.lng, s.lat]),
        [drop.lng, drop.lat]
    ];

    const routeData = await mapsService.getRoute(coordinates);

    const distance =
        routeData.features[0].properties.summary.distance / 1000;

    const fare = rideService.calculateFare(distance);

    const ride = {
        riderId: req.userId,
        pickup,
        drop,
        stops,
        fare,
        status: "searching",
        createdAt: new Date()
    };

    const doc = await db.collection("rides").add(ride);

    io.emit("new-ride", { rideId: doc.id, ...ride });

    res.json({ rideId: doc.id, fare, route: routeData });
};