"use client";
import ConnectionLanding from "./_components/ConnectionLanding";
export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32">
      <div className="absolute inset-0 flex justify-center items-center">
        {/*SVG*/}
        <ConnectionLanding />
      </div>

      <div className="text-center z-20 mt-64 lg:mt-96">
        <h1 className="text-5xl font-bold">
          All-in-one{" "}
          <span className="text-cubi animate-pulse">Team Building</span> app
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Cubiverse is a modern all-in-one platform designed to perfectly fit
          your business needs.
        </p>
        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-400 to-black text-white rounded-full shadow-lg">
          Join a room
        </button>
      </div>
    </section>
  );
}
