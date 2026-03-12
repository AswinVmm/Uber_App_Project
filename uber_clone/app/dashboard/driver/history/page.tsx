"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useUser } from "@clerk/nextjs";

interface Ride {
    id: string;
    pickup: string;
    drop: string;
    fare: number;
    status: string;
    createdAt: any;
}

export default function DriverHistoryPage() {

    const { user } = useUser();
    const [rides, setRides] = useState<Ride[]>([]);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {

        if (!user?.id) return;

        const fetchDriverHistory = async () => {

            try {

                const res = await axios.get(`/api/rides/driver-history/${user.id}`);

                setRides(res.data);

                const total = res.data.reduce((sum: number, ride: Ride) => {
                    return sum + Number(ride.fare || 0);
                }, 0);

                setTotalEarnings(total);

            } catch (error) {
                console.error(error);
            }

        };

        fetchDriverHistory();

    }, [user]);

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                Driver Ride History
            </h1>

            <h2 className="text-lg mb-6">
                Total Earnings: ₹{totalEarnings.toFixed(2)}
            </h2>

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
                            Fare Earned: ₹{ride.fare}
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