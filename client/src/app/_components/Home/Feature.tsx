// src/app/_components/FeatureSection.tsx
"use client";

import Image from "next/image";
import React from "react";
import { Feature } from "@/core/types";

const features: Feature[] = [
  {
    title: "Real-time Chat",
    description:
      "Seamlessly communicate with teammates in the same virtual room.",
    imagePath: "/Manila/Feature/Designer-Thinking--Streamline-Manila.png",
  },
  {
    title: "Avatar Customization",
    description: "Choose and personalize your character to stand out.",
    imagePath: "/Manila/Feature/Problem-Solving--Streamline-Manila.png",
  },
  {
    title: "Zone-based Events",
    description: "Trigger actions or media when entering designated areas.",
    imagePath: "/Manila/Feature/Competitor-Analysis--Streamline-Manila.png",
  },
  {
    title: "Video Conferencing",
    description: "Instant video calls when you meet colleagues on the map.",
    imagePath: "/Manila/Feature/Video-Conference-1--Streamline-Manila.png",
  },
  {
    title: "Admin Controls",
    description: "Moderate rooms, manage users, and keep spaces safe.",
    imagePath: "/Manila/Feature/Team-Coding--Streamline-Manila.png",
  },
];

export default function FeatureSection() {
  return (
    <section className="min-h-screen bg-gray-100 px-8 py-16" id="features">
      <div className="text-center pt-16 mb-6 animate-fadeInUp">
        <h4 className="text-5xl font-bold">Key Features</h4>
        <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
          Explore the core capabilities that make Cubiverse an engaging and
          interactive <span className="text-cubi">2D collaboration</span>{" "}
          platform.
        </p>
      </div>

      {/* Lower part: Feature cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 transform transition duration-700 hover:scale-105 animate-featureFadeIn"
            style={{
              animationDelay: `${0.15 * index}s`,
              gridColumn: index >= 3 ? "span 3" : "span 2",
            }}
          >
            {/* Placeholder for icon */}
            <div className="mb-4 w-full h-32 relative">
              <Image
                src={feature.imagePath}
                alt={feature.title}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
            </div>
            <h5 className="text-xl font-medium mb-2">{feature.title}</h5>
            <p className="text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Tailwind custom animation definitions */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out both;
        }

        @keyframes featureFadeIn {
          from {
            opacity: 0.4;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-featureFadeIn {
          animation: featureFadeIn 0.6s ease-out both;
        }
      `}</style>
    </section>
  );
}
