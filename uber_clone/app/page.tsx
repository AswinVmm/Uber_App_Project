"use client";

import { useEffect, useState } from "react";

const images = [
  "/slider/app.jpg",
  "/slider/carside.jpg",
  "/slider/feat.png",
  "/slider/user.jpg",
];

export default function HomePage() {

  const [current, setCurrent] = useState(0);
  const [reviews, setReviews] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const submitReview = () => {
    if (!comment.trim()) return;
    setReviews([...reviews, comment]);
    setComment("");
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO IMAGE SLIDER */}
      <div className="relative w-full h-[60vh] overflow-hidden">

        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        {/* Overlay Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4  text-green-500 font-semibold">
            Ride Anywhere
          </h1>
          <p className="text-lg md:text-xl text-green-400 font-semibold">
            Safe • Fast • Reliable
          </p>
        </div>

      </div>

      {/* SERVICES SECTION */}
      <section className="py-16 px-8 grid md:grid-cols-3 gap-10 text-center">

        <div className="p-6 border rounded-xl bg-yellow-300 shadow transition-all duration-300 transform hover:scale-110 hover:bg-blue-400 hover:text-white cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Easy Booking</h2>
          <p>Book rides quickly with real-time driver tracking.</p>
        </div>

        <div className="p-6 border rounded-xl bg-yellow-300 shadow transition-all duration-300 transform hover:scale-110 hover:bg-blue-400 hover:text-white cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Multiple Vehicles</h2>
          <p>Choose from Bike, Auto, or Car depending on your needs.</p>
        </div>

        <div className="p-6 border rounded-xl bg-yellow-300 shadow transition-all duration-300 transform hover:scale-110 hover:bg-blue-400 hover:text-white cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Safe Rides</h2>
          <p>SOS support and verified drivers ensure passenger safety.</p>
        </div>

      </section>

      {/* FLOATING REVIEW BOX */}
      <div className="fixed bottom-24 right-6 bg-white w-72 shadow-xl border rounded-lg p-4">

        <h3 className="font-bold mb-2">Leave a Review</h3>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback..."
          className="w-full border rounded p-2 text-sm mb-2"
        />

        <button
          onClick={submitReview}
          className="bg-black text-white px-3 py-1 rounded w-full"
        >
          Submit
        </button>

        <div className="mt-3 max-h-32 overflow-y-auto text-sm">
          {reviews.map((r, i) => (
            <p key={i} className="border-b py-1">
              {r}
            </p>
          ))}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-auto bg-black text-white p-10">

        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <h2 className="font-bold mb-2">About</h2>
            <p>
              Our ride platform provides safe and affordable transportation
              with real-time tracking and emergency SOS support.
            </p>
          </div>

          <div>
            <h2 className="font-bold mb-2">Contact</h2>
            <p>Email: support@rideapp.com</p>
            <p>Phone: +91 9876543210</p>
            <p>Location: Kerala, India</p>
          </div>

          <div>
            <h2 className="font-bold mb-2">Follow Us</h2>
            <p>Instagram</p>
            <p>Twitter</p>
            <p>LinkedIn</p>
          </div>

        </div>

        <p className="text-center mt-8 text-gray-400">
          © 2026 Ride App. All rights reserved.
        </p>

      </footer>

    </div>
  );
}