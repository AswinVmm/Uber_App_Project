"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "@/lib/socket";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
    ride: any;
    reachedPickup?: boolean;
}

export default function DriverMap({ ride, reachedPickup }: Props) {
    // ✅ DEFAULT DRIVER LOCATION (Palakkad area)
    const [driverLocation] = useState({
        lat: 10.7867,
        lng: 76.6548,
    });
    const [routeCoords, setRouteCoords] = useState<any[]>([]);
    const [showDriver, setShowDriver] = useState(true);
    const route = [
        [driverLocation.lat, driverLocation.lng], // driver → rider
        [ride.pickupCoords.lat, ride.pickupCoords.lng],
        ...(ride.stops?.map((s: any) => [
            s.coords.lat,
            s.coords.lng
        ]) || []),
        [ride.dropCoords.lat, ride.dropCoords.lng],
    ];
    const driverIcon = new L.Icon({
        iconUrl: "/icons/auto.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    const pickupIcon = new L.Icon({
        iconUrl: "/icons/pickup.png",
        iconSize: [50, 50],
        iconAnchor: [17, 35],
    });

    const dropIcon = new L.Icon({
        iconUrl: "/icons/drop.png",
        iconSize: [35, 35],
        iconAnchor: [17, 35],
    });

    const stopIcon = new L.Icon({
        iconUrl: "/icons/stop.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
    useEffect(() => {

        socket.on("driver-arrived", (data: { rideId: string }) => {

            if (data.rideId === ride.id) {
                setShowDriver(false);
            }

        });

    }, []);

    useEffect(() => {
        if (!ride?.pickupCoords || !ride?.dropCoords) return;

        const fetchRoute = async () => {
            try {
                const coordsArray = [
                    `${driverLocation.lng},${driverLocation.lat}`,
                    `${ride.pickupCoords.lng},${ride.pickupCoords.lat}`,
                    ...(ride.stops?.map((s: any) =>
                        `${s.coords.lng},${s.coords.lat}`
                    ) || []),
                    `${ride.dropCoords.lng},${ride.dropCoords.lat}`,
                ];

                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordsArray.join(
                        ";"
                    )}?overview=full&geometries=geojson`
                );

                const data = await response.json();

                const geometry = data.routes[0].geometry.coordinates;

                // Convert [lng, lat] → [lat, lng]
                const formatted = geometry.map((coord: any) => [
                    coord[1],
                    coord[0],
                ]);

                setRouteCoords(formatted);
            } catch (err) {
                console.error("Route fetch error:", err);
            }
        };

        fetchRoute();
    }, [ride]);

    return (
        <MapContainer
            center={[10.7867, 76.6548]}
            zoom={13}
            className="h-96 w-full mt-4"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* 🚘 Driver Marker */}
            {!reachedPickup && showDriver && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
            )}
            {/* <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
            {!reachedPickup && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
            )}
            {showDriver && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
            )} */}

            {/* 🧍 Rider Pickup */}
            <Marker position={[ride.pickupCoords.lat, ride.pickupCoords.lng]} icon={pickupIcon} />
            {ride.pickupCoords && (
                <Marker
                    position={[ride.pickupCoords.lat, ride.pickupCoords.lng]}
                    icon={reachedPickup ? driverIcon : pickupIcon}
                />
            )}

            {/* 🛑 Stops */}
            {ride.stops?.map((s: any, index: number) => (
                <Marker
                    key={index}
                    position={[s.coords.lat, s.coords.lng]}
                    icon={stopIcon}
                />
            ))}

            {/* 🏁 Drop */}
            <Marker position={[ride.dropCoords.lat, ride.dropCoords.lng]} icon={dropIcon} />

            {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="green" />
            )}

        </MapContainer>
    );
}