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
  let timer: any;
  useEffect(() => {
    try {
      if (takeoffSound.current && sound === true) {
        takeoffSound.current.play();
      }

      timer = setTimeout(() => {
        setDisplayMessage("loadingNextRound");
      }, 5000); // Switch message after 5 seconds

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
            <div className="relative flex items-center justify-center">
              <div className="absolute flex flex-col items-center w-[250px]">
                <div className="mt-10 text-white">FLEW AWAY</div>
                <div
                  className="text-6xl text-white font-bold z-10"
                  id="multiplier"
                >
                  x{multiplier}
                </div>
              </div>
              <div className="absolute z-[0] w-[250px] h-[250px] rounded-full blue__gradient" />
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
              <div className="text-3xl font-bold text-white">PLACE NOW...</div>
            </div>
            <div className="w-full bg-gray-200 h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-[#DE3D26] h-2.5 loading-bar"></div>
            </div>
          </div>
        )}
      </div>
      <audio ref={takeoffSound}>
        <source src="/takeoff.mp3" type="audio/mpeg" />
      </audio>

      <style jsx>{`
        .loading-bar {
          animation: load 15s linear forwards;
        }

        @keyframes load {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
      <style jsx>{`
        .blue__gradient {
          background: linear-gradient(
            180deg,
            rgba(188, 165, 255, 0) 0%,
            #214d76 100%
          );
          filter: blur(40px);
        }
      `}</style>
    </>
  );
};

export default Aviator;
