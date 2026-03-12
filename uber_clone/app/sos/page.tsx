"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SOSPage() {

    const { user } = useUser();
    const searchParams = useSearchParams();

    const pickupLat = searchParams.get("lat");
    const pickupLng = searchParams.get("lng");

    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<any>(null);
    const [message, setMessage] = useState("");

    const triggerSOS = async () => {

        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }
        if (!pickupLat || !pickupLng) {
            alert(" location not available");
            return;
        }

        const loc = {
            lat: Number(pickupLat),
            lng: Number(pickupLng)
        };

        setLocation(loc);
        setLoading(true);

        try {

            await axios.post("/api/sos/alert", {
                riderId: user?.id,
                location: loc
            });

            setMessage("🚨 SOS Alert Sent! Emergency contacts notified.");

        } catch (error) {

            console.error(error);
            setMessage("Failed to send SOS alert");

        }

        setLoading(false);

    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">

            <h1 className="text-3xl font-bold mb-6">
                Emergency SOS
            </h1>

            <p className="text-gray-600 mb-8 text-center max-w-md">
                Press the SOS button if you are in danger. Your live location
                will be shared with emergency contacts and authorities.
            </p>

            <button
                onClick={triggerSOS}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white text-2xl font-bold px-16 py-10 rounded-full shadow-xl transition"
            >
                {loading ? "Sending..." : "SOS"}
            </button>

            {location && (
                <div className="mt-8 text-center">

                    <p className="font-semibold">Live Location Sent:</p>

                    <p>
                        Lat: {location.lat} | Lng: {location.lng}
                    </p>

                    <a
                        href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                        target="_blank"
                        className="text-blue-600 underline"
                    >
                        View on Google Maps
                    </a>

                </div>
            )}

            {message && (
                <p className="mt-6 text-green-600 font-semibold">
                    {message}
                </p>
            )}

        </div>
    );
}