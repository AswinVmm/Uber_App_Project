"use client";
import { useState } from "react";
import axios from "../../lib/axios";
import AutoCompleteAddress from './AutoCompleteAddress'
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import Cards from "./Cards";

interface BookingProps {
    setPickupCoords: (coords: [number, number]) => void;
    setDropCoords: (coords: [number, number]) => void;
    rideId: string;
    setRideId: (id: string) => void;
    distanceKm?: number;
    fare?: number;
    driverDistance?: number | null;
    driverDuration?: number | null;
    rideConfirmed: boolean;
    stops: { name: string; coords: [number, number] | null }[];
    setStops: React.Dispatch<
        React.SetStateAction<{ name: string; coords: [number, number] | null }[]>
    >;
    setRideConfirmed: (value: boolean) => void;
};

function Booking({ rideId, setPickupCoords, setDropCoords, setRideId, distanceKm, fare, stops, setStops, driverDistance,
    driverDuration, setRideConfirmed, rideConfirmed }: BookingProps) {
    const { user, isSignedIn } = useUser();
    const router: any = useRouter();
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [pickupCoords, setLocalPickupCoords] = useState<[number, number] | null>(null);
    const [dropCoords, setLocalDropCoords] = useState<[number, number] | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<any>(null);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [paymentTimeout, setPaymentTimeout] = useState<NodeJS.Timeout | null>(null);

    const vehicles = [
        {
            id: "bike",
            name: "Bike",
            image: "/icons/bike.png",
            rate: 10, // ₹ per km
        },
        {
            id: "auto",
            name: "Auto",
            image: "/icons/auto.png",
            rate: 15,
        },
        {
            id: "car",
            name: "Car",
            image: "/icons/car1.png",
            rate: 18,
        },
    ];
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
    const selectVehicle = (vehicle: any) => {
        setSelectedVehicle(vehicle);

        if (distanceKm) {
            const fare = distanceKm * vehicle.rate;
            setCalculatedFare(fare);
        }
    };
    const addStop = () => {
        setStops([...stops, { name: "", coords: null }]);
    };

    const updateStop = (index: number, lat: number, lon: number, name: string) => {
        const updatedStops = [...stops];
        updatedStops[index] = {
            name,
            coords: [Number(lat), Number(lon)],
        };
        setStops(updatedStops);
    };


    const bookRide = async () => {

        if (!isSignedIn) {
            router.push("/sign-in");
            return;
        }

        // Check if locations filled
        if (!pickup || !drop) {
            alert("Please select pickup and destination");
            return;
        }

        const validStops = stops
            .filter((s) => s.coords !== null)
            .map((s) => ({
                name: s.name,
                coords: s.coords
            }));

        const res = await axios.post("/api/rides/create", {
            riderId: user?.id,
            pickup,
            pickupCoords: pickupCoords
                ? { lat: pickupCoords[0], lng: pickupCoords[1] }
                : null,
            drop,
            dropCoords: dropCoords
                ? { lat: dropCoords[0], lng: dropCoords[1] }
                : null,
            stops: validStops.map(s => ({
                name: s.name,
                coords: s.coords
                    ? { lat: s.coords[0], lng: s.coords[1] }
                    : null
            })),
            distanceKm,
            fare: totalFare.toFixed(2),

        });
        socket.emit("new-ride-request", {
            rideId: res.data.rideId
        });
        setRideId(res.data.rideId);
        alert("Ride Confirmed successfully!");
        return res.data.rideId;

    };

    const cancelRide = async () => {

        if (!rideId) return;

        await axios.post("/api/rides/cancel", { rideId });

        socket.emit("ride-cancelled", { rideId });

        alert("Ride cancelled");

        // stop payment navigation
        if (paymentTimeout) {
            clearTimeout(paymentTimeout);
        }

        setRideConfirmed(false);
        setRideId("");
        setPickup("");
        setDrop("");
        setStops([]);

    };

    const totalFare = (fare ?? 0) + (calculatedFare ?? 0);

    return (
        <div className='p-2'>
            <h2 className='text-[20px] font-bold'>Booking</h2>
            <div className='border p-2 rounded-md h-[83vh]'>
                <label htmlFor="" className='text-gray-400'>Where From?</label>
                <AutoCompleteAddress
                    placeholder="Enter Pickup Location"
                    onSelect={(lat, lon, name) => {
                        setPickup(name);
                        const coords: [number, number] = [Number(lat), Number(lon)];
                        setLocalPickupCoords(coords);
                        setPickupCoords(coords);
                        localStorage.setItem(
                            "pickupCoords",
                            JSON.stringify({ lat: coords[0], lng: coords[1] })
                        );
                    }}
                />
                <label htmlFor="" className='text-gray-400'>Where To?</label>
                <AutoCompleteAddress
                    placeholder="Enter Destination"
                    onSelect={(lat, lon, name) => {
                        setDrop(name);
                        const coords: [number, number] = [Number(lat), Number(lon)];
                        setLocalDropCoords(coords);
                        setDropCoords(coords);
                    }}
                />

                {/* Dynamic Stops */}
                {stops.map((stop, index) => (
                    <div key={index} className="mt-3">
                        <label className="text-gray-400">Stop {index + 1}</label>
                        <AutoCompleteAddress
                            placeholder="Enter Stop Location"
                            onSelect={(lat, lon, name) =>
                                updateStop(index, lat, lon, name)
                            }
                        />
                    </div>
                ))}

                <button
                    onClick={addStop}
                    className="mt-3 text-blue-600 font-semibold"
                >
                    + Add Stop
                </button>
                {/* Vehicle Selection */}
                <div className="mt-3">
                    <h3 className="text-lg font-semibold mb-3">Choose Vehicle</h3>

                    <div className="grid grid-cols-3 gap-4">

                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => selectVehicle(vehicle)}
                                className={`border rounded-lg p-3 cursor-pointer hover:shadow-lg transition ${selectedVehicle?.id === vehicle.id ? "border-black" : ""}`}>
                                <img
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                    className="w-full h-20 object-contain"
                                />

                                <p className="text-center font-semibold mt-2">
                                    {vehicle.name}
                                </p>

                                {distanceKm && (
                                    <p className="text-center text-green-600 text-sm">
                                        ₹{(distanceKm * vehicle.rate).toFixed(0)}
                                    </p>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
                <Cards onSelect={(method: any) => setPaymentMethod(method)} />
                <button
                    className="bg-black text-white px-4 py-2 rounded-lg mr-14"
                    disabled={waitingForDriver}
                    onClick={async () => {
                        const id = await bookRide(); // existing API call
                        setRideConfirmed(true);
                        setWaitingForDriver(true);
                        const timeout = setTimeout(() => {
                            if (pickup && drop && selectedVehicle && paymentMethod) {
                                router.push(`/payment?fare=${totalFare.toFixed(2)}&rideId=${id}&method=${paymentMethod?.name}`);
                            }
                        }, 5000);
                        setPaymentTimeout(timeout);
                    }}
                >
                    {/* Confirm Ride */}{waitingForDriver ? "Searching for driver..." : "Confirm Ride"}
                </button>
                <button
                    className="bg-red-600 text-white px-4 py-2 mt-3 rounded ml-40"
                    onClick={cancelRide}
                >
                    Cancel Ride
                </button>
                {distanceKm !== undefined && distanceKm > 0 && (
                    <p className="mt-3 text-lg font-semibold">
                        Distance: {distanceKm.toFixed(2)} km
                    </p>
                )}
                {totalFare > 0 && (
                    <p className="text-lg font-bold text-green-600">
                        Total Fare: ₹{totalFare.toFixed(2)}
                    </p>
                )}
                {rideConfirmed && driverDistance && driverDuration && (
                    <div className="mt-3 text-blue-600 text-[16px]  font-semibold">

                        Driver is {driverDistance.toFixed(2)} km away
                        <br />
                        Arrival in {Math.ceil(driverDuration)} mins
                    </div>
                )}
            </div>

        </div >
    )
}

export default Booking