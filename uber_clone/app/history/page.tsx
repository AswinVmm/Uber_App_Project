"use client";

import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useUser } from "@clerk/nextjs";

interface Ride {
    id: string;
    pickup: string;
    drop: string;
    fare: number;
    status: string;
    createdAt: any;
    completedAt?: any;
}

export default function HistoryPage() {

    const { user } = useUser();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!user?.id) return;

        const fetchHistory = async () => {
            try {

                const res = await axios.get(`/api/rides/history/${user.id}`);
                setRides(res.data);

            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        };

        fetchHistory();

    }, [user]);

    if (loading) return <p className="p-5">Loading rides...</p>;

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">Ride History</h1>

            {rides.length === 0 && (
                <p>No rides found</p>
            )}

            <div className="space-y-4">

                {rides.map((ride) => (

                    <div
                        key={ride.id}
                        className="border rounded-lg p-4 shadow-sm"
                    >

                        <p className="font-semibold">
                            {ride.pickup} → {ride.drop}
                        </p>

                        <p className="text-gray-600">
                            Fare: ₹{ride.fare}
                        </p>

                        <p className="text-gray-600">
                            Status: {ride.status}
                        </p>

                        <p className="text-sm text-gray-500">
                            {ride.createdAt?.seconds
                                ? new Date(ride.createdAt.seconds * 1000).toLocaleString()
                                : ""}
                        </p>

                    </div>

                ))}

            </div>

        </div>
    );
}