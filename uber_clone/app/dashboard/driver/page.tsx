
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import socket from "@/lib/socket";
import dynamic from "next/dynamic";
const DriverMap = dynamic(() => import("@/components/DriverMap"), { ssr: false });

interface Ride {
    id: string;
    pickup: string;
    drop: string;
    pickupCoords: { lat: number; lng: number };
    dropCoords: { lat: number; lng: number };
    stops?: any[];
    distanceKm: number;
    fare: number;
    status: string;
    riderId: string;
}

export default function DriverDashboard() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [activeRide, setActiveRide] = useState<Ride | null>(null);
    const [reachedPickup, setReachedPickup] = useState(false);

    useEffect(() => {

        socket.on("ride-cancelled", (data: { rideId: string }) => {

            if (activeRide?.id === data.rideId) {
                alert("Rider cancelled ride");
                setActiveRide(null);
            }

            fetchRides();

        });

    }, [activeRide]);

    // 🔥 Fetch available rides
    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        const res = await axios.get("/api/rides/available");
        setRides(res.data);
    };

    // 🚘 Accept Ride
    const acceptRide = async (rideId: string) => {
        const driverId = "driver_123"; // replace with auth later

        await axios.post("/api/rides/accept", {
            rideId,
            driverId,
        });

        const ride = rides.find((r) => r.id === rideId);
        setActiveRide(ride || null);
        socket.emit("accept-ride", {
            rideId,
            driverId
        });

        alert("Ride Accepted!");
    };

    // 📡 Send Driver Location
    useEffect(() => {
        if (!activeRide) return;

        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;

            socket.emit("driver-location-update", {
                rideId: activeRide.id,
                lat: latitude,
                lng: longitude,
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [activeRide]);

    const reachPickup = () => {

        if (!activeRide) return;

        socket.emit("driver-arrived", {
            rideId: activeRide.id
        });

        setReachedPickup(true);
    };

    useEffect(() => {

        socket.on("ride-requested", () => {
            fetchRides();
        });

    }, []);

    // 🏁 Complete Ride
    const completeRide = async () => {
        if (!activeRide) return;

        const fare = 250; // you can fetch from DB later

        await axios.post("/api/rides/complete", {
            rideId: activeRide.id,
            fare,
        });

        alert("Ride Completed!");

        setActiveRide(null);
        fetchRides();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>
            {/* <DriverDashboard /> */}

            {!activeRide && (
                <>
                    <h2 className="text-xl mb-4">Available Rides</h2>

                    {rides.length === 0 && <p>No rides available</p>}

                    {rides.map((ride) => (
                        <div
                            key={ride.id}
                            className="border p-4 rounded-lg mb-4 shadow"
                        >
                            <p><strong>Pickup:</strong> {ride.pickup}</p>
                            <p><strong>Stops:</strong> {ride.stops?.length || 0}</p>
                            <p><strong>Drop:</strong> {ride.drop}</p>
                            <p><strong>Distance:</strong> {ride.distanceKm?.toFixed(2)} km</p>
                            <p><strong>Fare:</strong> ₹{ride.fare}</p>

                            <button
                                onClick={() => acceptRide(ride.id)}
                                className="bg-green-600 text-white px-4 py-2 mt-3 rounded"
                            >
                                Accept Ride
                            </button>
                        </div>
                    ))}
                </>
            )}

            {activeRide && (
                <div className="border p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Active Ride</h2>

                    <p><strong>Pickup:</strong> {activeRide.pickup}</p>
                    <p><strong>Stops:</strong> {activeRide.stops?.length || 0}</p>
                    <p><strong>Drop:</strong> {activeRide.drop}</p>
                    <p><strong>Distance:</strong> {activeRide.distanceKm?.toFixed(2)} km</p>
                    <p><strong>Fare:</strong> ₹{activeRide.fare}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span><img src="/icons/auto.png" alt="Driver" height={40} width={30} />Driver</span>
                        <span><img src="/icons/drop.png" alt="Drop" height={40} width={30} />Destination</span>
                        <span><img src="/icons/pickup.png" alt="Pickup" height={50} width={40} />Pickup location</span>
                        <span><img src="/icons/stop.png" alt="Stop" height={40} width={30} />Stop</span>
                    </div>

                    <DriverMap ride={activeRide} reachedPickup={reachedPickup} />

                    <button
                        onClick={completeRide}
                        className="bg-black text-white px-4 py-2 mt-4 rounded"
                    >
                        Complete Ride
                    </button>
                    <button
                        onClick={() => reachPickup()}
                        className="bg-yellow-500 text-white px-4 py-2 mt-3 rounded"
                    >
                        Reached Pickup
                    </button>
                </div>
            )}
        </div>
    );
}