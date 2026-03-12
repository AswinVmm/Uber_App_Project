import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import "leaflet/dist/leaflet.css";


const geistSans = Geist({
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uber Clone App",
  description: "A functional ride booking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      afterSignInUrl="/dashboard/rider"
      afterSignUpUrl="/dashboard/rider">
      <html lang="en">
        <body className={outfit.className}>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
