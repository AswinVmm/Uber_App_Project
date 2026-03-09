"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import dynamic from "next/dynamic";

const DriverMap = dynamic(() => import("./DriverMap"), { ssr: false });

interface Ride {
    id: string;
    pickup: string;
    drop: string;
    stops?: any[];
    distanceKm: number;
    fare: number;
    status: string;
}

export default function DriverDashboard() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [activeRide, setActiveRide] = useState<Ride | null>(null);

    const driverId = "driver_123";

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        const res = await axios.get("/api/rides/available");
        setRides(res.data);
    };

    const acceptRide = async (rideId: string) => {
        await axios.post("/api/rides/accept", {
            rideId,
            driverId,
        });

        const ride = rides.find((r) => r.id === rideId);
        setActiveRide(ride || null);
    };

    const declineRide = async (rideId: string) => {
        await axios.post("/api/rides/decline", {
            rideId,
            driverId,
        });

        fetchRides();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

            {!activeRide && (
                <>
                    {rides.map((ride) => (
                        <div key={ride.id} className="border p-4 rounded-lg mb-4 shadow">
                            <p><strong>Pickup:</strong> {ride.pickup}</p>
                            <p><strong>Drop:</strong> {ride.drop}</p>
                            <p><strong>Distance:</strong> {ride.distanceKm?.toFixed(2)} km</p>
                            <p><strong>Fare:</strong> ₹{ride.fare}</p>

                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => acceptRide(ride.id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Accept
                                </button>

                                <button
                                    onClick={() => declineRide(ride.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {activeRide && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Active Ride</h2>

                    <p><strong>Pickup:</strong> {activeRide.pickup}</p>
                    <p><strong>Drop:</strong> {activeRide.drop}</p>
                    <p><strong>Fare:</strong> ₹{activeRide.fare}</p>

                    <DriverMap ride={activeRide} />

                    <button className="mt-4 bg-black text-white px-4 py-2 rounded">
                        Complete Ride
                    </button>
                </div>
            )}
        </div>
    );
}