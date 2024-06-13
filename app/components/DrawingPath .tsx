import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const generateTrajectoryPoints = (numPoints) => {
  const points = [];
  const xIncrement = 30;
  const yIncrement = -10;
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: i * xIncrement + 50,
      y: 450 + i * yIncrement,
    });
  }
  return points;
};

const generateAxisTicks = (numTicks, axisLength) => {
  const ticks = [];
  const increment = axisLength / numTicks;
  for (let i = 0; i <= numTicks; i++) {
    const position = i * increment;
    ticks.push(position);
  }
  return ticks;
};

const TrajectoryDrawing = () => {
  const trajectoryPoints = generateTrajectoryPoints(10); // Generate 10 points
  const [position, setPosition] = useState(trajectoryPoints[0]);
  const [trajectory, setTrajectory] = useState([trajectoryPoints[0]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const numTicks = 10; // Number of ticks on each axis
  const axisLength = 500;

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < trajectoryPoints.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        clearInterval(interval);
      }
    }, 1000); // Adjust the interval as needed

    return () => clearInterval(interval);
  }, [currentIndex, trajectoryPoints.length]);

  useEffect(() => {
    setPosition(trajectoryPoints[currentIndex]);
    setTrajectory((prev) => [...prev, trajectoryPoints[currentIndex]]); // Add current position to trajectory
  }, [currentIndex, trajectoryPoints]);

  const generatePathData = () => {
    if (trajectory.length < 2) return "";
    let path = `M ${trajectory[0].x} ${trajectory[0].y}`;
    for (let i = 1; i < trajectory.length; i++) {
      path += ` L ${trajectory[i].x} ${trajectory[i].y}`;
    }
    return path;
  };

  const xTicks = generateAxisTicks(numTicks, axisLength);
  const yTicks = generateAxisTicks(numTicks, axisLength);

  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "500px",
        border: "1px solid black",
      }}
    >
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        {/* X-axis */}
        <line
          x1="0"
          y1="250"
          x2="500"
          y2="250"
          stroke="black"
          strokeWidth="1"
        />
        {xTicks.map((tick, index) => (
          <line
            key={index}
            x1={tick}
            y1="245"
            x2={tick}
            y2="255"
            stroke="black"
            strokeWidth="1"
          />
        ))}
        {/* Y-axis */}
        <line
          x1="250"
          y1="0"
          x2="250"
          y2="500"
          stroke="black"
          strokeWidth="1"
        />
        {yTicks.map((tick, index) => (
          <line
            key={index}
            x1="245"
            y1={tick}
            x2="255"
            y2={tick}
            stroke="black"
            strokeWidth="1"
          />
        ))}
        {/* Trajectory path */}
        <path d={generatePathData()} fill="none" stroke="red" strokeWidth="2" />
      </svg>
      <motion.div
        animate={{
          top: position.y,
          left: position.x,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "blue",
          position: "absolute",
        }}
      />
    </div>
  );
};

export default TrajectoryDrawing;
