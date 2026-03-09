
"use client";
import Booking from "@/components/Booking/Booking";
import socket from "@/lib/socket";
// import Map from "@/components/Map";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
});
import { useEffect, useState } from "react";

export default function RidePage() {
    const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
    const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
    const [rideId, setRideId] = useState<string>("");
    const [stops, setStops] = useState<
        { name: string; coords: [number, number] | null }[]
    >([]);
    const [distanceKm, setDistanceKm] = useState<number>(0);
    const [fare, setFare] = useState<number>(0);
    const [driverDistance, setDriverDistance] = useState<number | null>(null);
    const [driverDuration, setDriverDuration] = useState<number | null>(null);
    const [rideConfirmed, setRideConfirmed] = useState(false);

    useEffect(() => {

        socket.on("ride-cancelled", (data: { rideId: string }) => {

            if (data.rideId === rideId) {

                alert("Ride cancelled");

                setRideConfirmed(false);
                setDriverDistance(null);
                setDriverDuration(null);

            }

        });

    }, [rideId]);

    useEffect(() => {

        socket.on("ride-accepted", (data: { rideId: string }) => {

            if (data.rideId === rideId) {
                alert("Driver accepted your ride");
            }

        });

    }, [rideId]);

    useEffect(() => {

        socket.on("driver-arrived", (data: { rideId: string }) => {

            if (data.rideId === rideId) {
                alert("Driver has reached your location");

                setDriverDistance(null);
                setDriverDuration(null);
            }

        });

    }, [rideId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="">
                <Booking
                    rideId={rideId}
                    setPickupCoords={setPickupCoords}
                    setDropCoords={setDropCoords}
                    setRideId={setRideId}
                    distanceKm={distanceKm}
                    fare={fare}
                    stops={stops}
                    setStops={setStops}
                    driverDistance={driverDistance}
                    driverDuration={driverDuration}
                    rideConfirmed={rideConfirmed}
                    setRideConfirmed={setRideConfirmed}
                />

            </div>
            <div className="col-span-2 pr-2">
                <Map pickupCoords={pickupCoords}
                    dropCoords={dropCoords} rideId={rideId}
                    stops={stops
                        .filter((s) => s.coords !== null)
                        .map((s) => s.coords as [number, number])}
                    setDistanceKm={setDistanceKm}
                    setFare={setFare}
                    setDriverDistance={setDriverDistance}
                    setDriverDuration={setDriverDuration}
                    rideConfirmed={rideConfirmed}
                />
            </div>
        </div>
    );
}