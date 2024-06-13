// components/Aviator.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const aviatorVariants = {
  initial: { y: 0 },
  animate: { y: -250, x: 400 },
  exit: { y: 0 },
};

const Placebet = () => {
  const takeoffSound = useRef<HTMLAudioElement | null>(null);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <div className="text-white">Connecting...</div>
        </div>
      </div>
      <audio ref={takeoffSound} src="/takeoff.mp3" />
      <style jsx>{`
        .loading-bar {
          animation: load 15s linear forwards;
        }

        @keyframes load {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Placebet;
