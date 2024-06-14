import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

type CrashProps = {
  multiplier: string;
  sound: boolean;
};

const aviatorVariants = {
  initial: { y: 0 },
  animate: { y: -250, x: 400 },
  exit: { y: 0 },
};

const Aviator = ({ multiplier, sound }: CrashProps) => {
  const takeoffSound = useRef<HTMLAudioElement | null>(null);
  const [displayMessage, setDisplayMessage] = useState("flewAway");
  const controls = useAnimation();

  useEffect(() => {
    if (takeoffSound.current && sound === true) {
      takeoffSound.current.play();
    }

    const timer = setTimeout(() => {
      setDisplayMessage("loadingNextRound");
    }, 5000); // Switch message after 5 seconds
    try {
      controls.start("animate"); // Start animation
    } catch (error) {
      console.error("Animation error:", error);
    }

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [controls]);

  return (
    <>
      <div className="flex flex-col items-center">
        {displayMessage === "flewAway" ? (
          <>
            <div className="text-white">FLEW AWAY</div>
            <div className="text-6xl text-red-500 font-bold" id="multiplier">
              x{multiplier}
            </div>
            <motion.div
              variants={aviatorVariants}
              initial="initial"
              animate={controls}
              exit="exit"
              transition={{ duration: 1.5 }}
              className="relative"
            >
              <img src="/rocket.gif" alt="Aviator" height={150} width={150} />
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
              {" "}
              <img src="/rocket-icon.png" alt="logo" className="w-20 ml-1" />
              <div className="text-3xl font-bold text-white">
                BETTING TIME...
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-[#DE3D26] h-2.5 rounded-full loading-bar"></div>
            </div>
          </div>
        )}
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

export default Aviator;
