"use client";
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NavBar() {
    const router = useRouter();
    const { user } = useUser();

    const role = user?.publicMetadata?.role;

    const [mode, setMode] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        localStorage.removeItem("mode"); // clear ride/drive mode
        localStorage.removeItem("pickupCoords");
        await signOut(() => router.push("/"));
    };

    useEffect(() => {

        const savedMode = localStorage.getItem("mode");
        if (savedMode) setMode(savedMode);

        const email = user?.primaryEmailAddress?.emailAddress;

        if (email === "aswina002@gmail.com") {
            setIsAdmin(true);
        }

    }, [user]);

    useEffect(() => {

        if (role === "admin") router.push("/admin");

    }, [role]);

    const selectMode = (type: string) => {
        setMode(type);
        localStorage.setItem("mode", type);
    };
    const goToSOS = () => {

        const savedCoords = localStorage.getItem("pickupCoords");

        if (!savedCoords) {
            alert(" location not selected");
            router.push("/sos");
            return;
        }

        const coords = JSON.parse(savedCoords);

        router.push(`/sos?lat=${coords.lat}&lng=${coords.lng}`);
    };
    return (
        <div className='flex justify-between p-2 px-10 border-b shadow-sm bg-taupe-300'>
            <div className='flex gap-10 items-center'>
                <Image src="/logo.png" alt="Uber Logo" width={120} height={60} />
            </div>
            {/* Mode selector */}
            <SignedIn>
                <div className='hidden md:flex gap-6'>
                    <Link href="/"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>Home</h2></Link>
                    {/* ADMIN sees everything */}
                    {isAdmin && (
                        <>
                            <Link href="/dashboard/rider"><h2 className='hover:bg-gray-400 p-2 px-5'>Ride</h2></Link>
                            <Link href="/dashboard/driver"><h2 className='hover:bg-gray-400 p-2 px-5'>Drive</h2></Link>
                            <Link href="/history"><h2 className='hover:bg-gray-400 p-2 px-5'>History</h2></Link>
                            <Link href="/dashboard/driver/history"><h2 className='hover:bg-gray-400 p-2 px-5'>Driver History</h2></Link>
                            <h2 onClick={goToSOS} className='hover:bg-gray-400 p-2 px-5 cursor-pointer'>Help</h2>
                        </>
                    )}
                    {/* RIDER MODE */}
                    {!isAdmin && mode === "ride" && (
                        <>
                            <Link href="/dashboard/rider"><h2 className='hover:bg-gray-400 p-2 px-5'>Ride</h2></Link>
                            <Link href="/history"><h2 className='hover:bg-gray-400 p-2 px-5'>History</h2></Link>
                            <h2 onClick={goToSOS} className='hover:bg-gray-400 p-2 px-5 cursor-pointer'>Help</h2>
                        </>
                    )}

                    {/* DRIVER MODE */}
                    {!isAdmin && mode === "drive" && (
                        <>
                            <Link href="/dashboard/driver"><h2 className='hover:bg-gray-400 p-2 px-5'>Drive</h2></Link>
                            <Link href="/dashboard/driver/history"><h2 className='hover:bg-gray-400 p-2 px-5'>Driver History</h2></Link>
                        </>
                    )}

                </div>
                {!isAdmin && !mode && (
                    <div className="flex gap-3 items-center">

                        <button
                            onClick={() => selectMode("ride")}
                            className="bg-black text-white px-3 py-1 rounded"
                        >
                            Ride
                        </button>

                        <button
                            onClick={() => selectMode("drive")}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                            Drive
                        </button>

                    </div>
                )}
                <div className="flex items-center gap-3">
                    <UserButton />
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Sign Out
                    </button>
                </div>

            </SignedIn>

            <SignedOut>
                <SignInButton />
            </SignedOut>
        </div>

    )
}

export default NavBar