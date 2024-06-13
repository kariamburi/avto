// components/Aviator.tsx
import React from "react";
import { motion } from "framer-motion";

// Function to generate points on a quadratic Bézier curve
const generateBezierCurvePoints = (
  start: any,
  control: any,
  end: any,
  numPoints: any
) => {
  const points = [];
  for (let t = 0; t <= 1; t += 1 / numPoints) {
    const x =
      (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x;
    const y =
      (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y;
    points.push({ x, y });
  }
  return points;
};

const start = { x: -500, y: 400 };
const end = { x: 200, y: 200 };
const control = { x: 0, y: 400 }; // Control point to create the downward curve
const pathPoints = generateBezierCurvePoints(start, control, end, 20);

const Aviator: React.FC = () => {
  return (
    <div style={{ position: "relative", width: "500px", height: "600px" }}>
      <svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width="500"
        height="600"
        viewBox="0 0 500 600"
      >
        <path
          d={`M${start.x + 250},${start.y} Q${control.x + 250},${control.y} ${
            end.x + 250
          },${end.y}`}
          stroke="red"
          strokeWidth="5"
          fill="transparent"
        />
      </svg>
      <motion.div
        initial={{ x: start.x + 250, y: start.y }}
        animate={{
          x: pathPoints.map((point) => point.x + 250),
          y: pathPoints.map((point) => point.y),
        }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{ position: "absolute" }}
      >
        <img src="/plane.png" alt="Aviator" height={100} width={100} />
      </motion.div>
    </div>
  );
};

export default Aviator;
