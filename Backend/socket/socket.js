const db = require("../config/firebase");
console.log("Firestore DB:", db ? "CONNECTED" : "NOT CONNECTED");
module.exports = (io) => {

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Driver joins ride room
        socket.on("join-ride-room", (rideId) => {
            socket.join(rideId);
        });

        socket.on("driver-location-update", async ({ rideId, lat, lng }) => {

            await db.collection("rides").doc(rideId).update({
                driverLocation: { lat, lng }
            });

            io.to(rideId).emit("update-driver-location", { lat, lng });

        });

        // DRIVER LOCATION UPDATE
        // socket.on("driver-location-update", async (data) => {
        //     // const { rideId, lat, lng } = data;

        //     // // Update Firestore (optional but recommended)
        //     // await db.collection("rides").doc(rideId).update({
        //     //     driverLocation: { lat, lng }
        //     // });

        //     // Emit only to rider in that ride
        //     io.to(data.rideId).emit("update-driver-location", {
        //         lat: data.lat,
        //         lng: data.lng
        //     });
        // });

        socket.on("new-ride-request", (data) => {

            io.emit("ride-requested", data);

        });

        // DRIVER ACCEPT RIDE
        socket.on("accept-ride", async ({ rideId, driverId }) => {
            try {
                // Update ride in Firestore
                await db.collection("rides").doc(rideId).update({
                    driverId,
                    status: "accepted",
                    acceptedAt: new Date()
                });

                // Notify rider that ride is accepted
                io.emit("ride-accepted", {
                    rideId,
                    driverId
                });

                console.log("Ride accepted:", rideId);

            } catch (error) {
                console.error(error);
            }
        });

        socket.on("ride-cancelled", ({ rideId }) => {

            io.emit("ride-cancelled", { rideId });

            console.log("Ride cancelled:", rideId);

        });

        socket.on("driver-reached-pickup", ({ rideId }) => {

            io.emit("driver-arrived", { rideId });

            console.log("Driver reached pickup:", rideId);

        });

        // socket.on("ride-cancelled", async ({ rideId }) => {

        //     await db.collection("rides").doc(rideId).delete();

        //     io.emit("ride-cancelled", { rideId });

        // });

        // socket.on("ride-completed", (data) => {

        //     if (data.rideId === rideId) {
        //         alert("Ride completed");
        //     }
        //     io.emit("ride-completed", { rideId });
        // });
        socket.on("ride-completed", async ({ rideId }) => {

            // await db.collection("rides").doc(rideId).delete();

            io.emit("ride-completed", { rideId });

            console.log("Ride completed:", rideId);

        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

    });

};