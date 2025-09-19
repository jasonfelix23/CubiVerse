"use client";
import { useEffect, useState } from "react";
interface ViewPoint {
  x: number;
  y: number;
}
export default function ConnectionLanding() {
  const [paths, setPaths] = useState<string[]>([]);
  const connections: ViewPoint[] = [
    { x: 70, y: 200 },
    { x: 95, y: 180 },
    { x: 95, y: 220 },
    { x: 110, y: 160 },
    { x: 110, y: 240 },
    { x: 430, y: 200 },
    { x: 415, y: 180 },
    { x: 415, y: 220 },
    { x: 400, y: 160 },
    { x: 400, y: 240 },
  ];

  const centerX = 250;
  const centerY = 200;

  // Generate curved path for each connection
  const generateCurvePath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const midX1 = ((startX + endX) * 1) / 3;
    const midY1 = ((startY + endY) * 1) / 3;

    const midX2 = ((startX + endX) * 2) / 3;
    const midY2 = ((startY + endY) * 2) / 3;

    // Create control points for curve
    const controlX1 = midX1 + (Math.random() - 0.5) * 60;
    const controlY1 = midY1 + (Math.random() - 0.5) * 60;

    const controlX2 = midX2 + (Math.random() - 0.5) * 60;
    const controlY2 = midY2 + (Math.random() - 0.5) * 60;

    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  };

  const handleGlobeClick = () => {
    const newPaths = connections.map(({ x, y }) =>
      generateCurvePath(centerX, centerY, x, y)
    );
    setPaths(newPaths);
  };

  useEffect(() => {
    const newPaths = connections.map(({ x, y }) =>
      generateCurvePath(centerX, centerY, x, y)
    );
    setPaths(newPaths);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-8">
      <style jsx>{`
        @keyframes flowDot {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes pointScale {
          0% {
            transform: scale(1);
          }
          95% {
            transform: scale(1);
          }
          97.5% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes cubeAnim {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(360deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        .flow-dot {
          animation: flowDot 4s ease-in-out infinite;
        }

        .scale-point {
          animation: pointScale 4s ease-in-out infinite;
          transform-origin: center;
        }

        .cube {
          animation: cubeAnim 24s linear infinite;
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }
      `}</style>

      <div className="mx-auto w-full h-full">
        <svg viewBox="0 0 500 400" className="block mx-auto">
          {/* Gradient Definitions */}
          <defs>
            <radialGradient id="globeGradient" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
          </defs>

          {/* Curved Connection Lines */}
          {paths.map((d, index) => {
            return (
              <g key={index}>
                <path
                  id={d}
                  d={d}
                  stroke="#9ca3af"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />

                {/* Flowing dot animation */}
                <circle
                  r="2"
                  fill="#3194f6"
                  className="flow-dot"
                  style={{
                    animationDelay: `${index * 0.4}s`,
                    offsetPath: `path('${d}')`,
                  }}
                />
              </g>
            );
          })}

          {/* Cuboid in the center */}
          <g className="cube" onClick={handleGlobeClick}>
            {/* Central Globe */}
            <circle
              cx={centerX}
              cy={centerY}
              r="30"
              fill="url(#globeGradient)"
              stroke="#6b7280"
              strokeWidth="1"
            />
            {/* Globe Grid Lines */}
            <circle
              cx={centerX}
              cy={centerY}
              r="30"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx="30"
              ry="10"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx="10"
              ry="30"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx="30"
              ry="20"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx="20"
              ry="30"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <line
              x1={centerX - 30}
              y1={centerY}
              x2={centerX + 30}
              y2={centerY}
              stroke="#9ca3af"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </g>
          {/* Left face lines */}

          {/* Connection Points - Simple Circles with Scale Animation */}
          {connections.map((connection, index) => (
            <circle
              key={index}
              cx={connection.x}
              cy={connection.y}
              r="4"
              fill="#6b7280"
              opacity="0.8"
              className="scale-point"
              style={{
                animationDelay: `${index * 0.4}s`,
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
