"use client";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import socket from "@/lib/socket";
import "leaflet/dist/leaflet.css";

interface LatLng {
    lng: number;
    lat: number;

}

interface MapProps {
    rideId?: string; // or number, depending on your usage
    pickupCoords: [number, number] | null;
    dropCoords: [number, number] | null;
    stops: [number, number][];
    setDistanceKm: (value: number) => void;
    setFare: (value: number) => void;
    rideConfirmed: boolean;
    setDriverDistance?: (value: number | null) => void;
    setDriverDuration?: (value: number | null) => void;
}

export default function Map({ rideId, pickupCoords, dropCoords, stops, setDistanceKm, setFare, rideConfirmed, setDriverDistance, setDriverDuration }: MapProps) {

    const driverLocation = {
        lat: 10.7867,
        lng: 76.6548

    };

    const [rideRoute, setRideRoute] = useState<LatLng[]>([]);
    const [localDriverDistance, setLocalDriverDistance] = useState<number | null>(null);
    const [driverRoute, setDriverRoute] = useState<LatLng[]>([]);
    const driverIcon = new L.Icon({
        iconUrl: "/icons/auto.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    const pickupIcon = new L.Icon({
        iconUrl: "/icons/pickup.png",
        iconSize: [60, 40],
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
    const [duration, setDuration] = useState<number | null>(null);


    useEffect(() => {
        if (!pickupCoords || !dropCoords) return;
        const pickup = { lat: pickupCoords[0], lng: pickupCoords[1] };
        const drop = { lat: dropCoords[0], lng: dropCoords[1] };
        const formattedStops = stops.map((s) => ({
            lat: s[0],
            lng: s[1],
        }));
        axios
            .post("http://localhost:4000/api/maps/route", {
                pickup,
                drop,
                stops: formattedStops,
            })
            .then((res) => {
                if (!res.data?.features?.length) {
                    console.error("No route found");
                    return;
                }

                const data = res.data.features[0];
                const coords = data.geometry.coordinates;

                const formatted = coords.map((c: number[]) => ({
                    lat: c[1],
                    lng: c[0],
                }));

                // setRoute(formatted);
                setRideRoute(formatted);

                // 🔥 Distance
                const distanceMeters = data.properties.summary.distance;
                const km = distanceMeters / 1000;
                setDistanceKm(km);

                // 🔥 Fare Calculation
                const baseFare = 30;
                const stopCharge = stops.length * 10;
                // baseFare + km * perKmRate + stopCharge;
                const totalFare = baseFare + stopCharge;

                setFare(Math.round(totalFare));
            })
            .catch((err) => {
                console.error("Route fetch error:", err);
            });
    }, [pickupCoords, dropCoords, stops]);


    // 🗺 Auto Zoom
    function FitRoute({ coordinates }: { coordinates: LatLng[] }) {
        const map = useMap();

        useEffect(() => {
            if (coordinates.length > 0) {
                const bounds = coordinates.map((c) => [c.lat, c.lng] as [number, number]);
                map.fitBounds(bounds);
            }
        }, [coordinates, map]);

        return null;
    }

    // 📡 Live driver tracking
    useEffect(() => {
        const getDriverRoute = async () => {
            try {
                if (!rideConfirmed) return;
                if (!pickupCoords) return;

                console.log("Fetching driver route...");

                const res = await axios.get(
                    `http://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${pickupCoords[1]},${pickupCoords[0]}?overview=full&geometries=geojson`
                );

                const data = res.data.routes[0];
                const driverRoute = data.geometry.coordinates.map((c: number[]) => ({
                    lat: c[1],
                    lng: c[0],
                }));
                // setRoute(driverRoute);
                setDriverRoute(driverRoute);

                const distance = data.distance / 1000;
                const duration = data.duration / 60;

                setLocalDriverDistance(distance);

                if (setDriverDistance) setDriverDistance(distance);
                if (setDriverDuration) setDriverDuration(duration);
            } catch (err) {
                console.error("Driver route error:", err);
            }
        };

        getDriverRoute();

    }, [rideConfirmed, pickupCoords, driverLocation]);

    useEffect(() => {

        socket.on("driver-arrived", (data: { rideId: string }) => {

            if (data.rideId === rideId) {

                setDriverRoute([]);
                setLocalDriverDistance(null);


                if (setDriverDistance) setDriverDistance(null);
                if (setDriverDuration) setDriverDuration(null);

            }

        });

    }, [rideId]);

    return (
        <div>
            <MapContainer
                center={[10.7867, 76.6548]} // palakkad default
                zoom={13}
                className="h-185 w-full rounded-xl border-2"
            >
                <TileLayer className="h-80"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Driver */}
                {rideConfirmed && (
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
                )}

                {/* Pickup Marker */}
                {pickupCoords && (
                    <Marker position={{ lat: pickupCoords[0], lng: pickupCoords[1] }} icon={pickupIcon}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {/* Stops */}
                {stops.map((stop, index) => (
                    <Marker key={index} position={stop} icon={stopIcon}>
                        <Popup>Stop {index + 1}</Popup>
                    </Marker>
                ))}

                {/* Drop Marker */}
                {dropCoords && (
                    <Marker position={{ lat: dropCoords[0], lng: dropCoords[1] }} icon={dropIcon}>
                        <Popup>Drop Location</Popup>
                    </Marker>
                )}

                {/* Route Line */}
                {driverRoute.length > 0 && (
                    <Polyline positions={driverRoute} color="green" />
                )}

                {rideRoute.length > 0 && (
                    <>
                        <Polyline positions={rideRoute} color="blue" />
                        <FitRoute coordinates={rideRoute} />
                    </>
                )}

            </MapContainer>
        </div>
    );
}