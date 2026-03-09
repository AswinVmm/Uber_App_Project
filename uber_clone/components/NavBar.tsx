import React from 'react'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/dist/client/link';

function NavBar() {
    return (
        <div className='flex justify-between p-2 px-10 border-b shadow-sm'>
            <div className='flex gap-10 items-center'>
                <Image src="/logo.png" alt="Uber Logo" width={120} height={60} />

                <div className='hidden md:flex gap-6'>
                    <Link href="/"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>Home</h2></Link>
                    <Link href="/dashboard/rider"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>Ride</h2></Link>
                    <Link href="/dashboard/driver"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>Drive</h2></Link>
                    <Link href="/history"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>History</h2></Link>
                    <Link href="/help"><h2 className='hover:bg-gray-400 p-2 px-5 rounded-md cursor-pointer transition-all'>Help</h2></Link>
                </div>
            </div>

            <SignedOut>
                <SignInButton />
            </SignedOut>

            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>

    )
}

export default NavBar