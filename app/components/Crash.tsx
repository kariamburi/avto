import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAnimation } from "framer-motion";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

type CrashProps = {
  multiplier: string;
  sound: boolean;
};

const aviatorVariants = {
  initial: { y: 0 },
  animate: { y: -250 },
  exit: { y: 0 },
};

const Aviator = ({ multiplier, sound }: CrashProps) => {
  const takeoffSound = useRef<HTMLAudioElement | null>(null);
  const [displayMessage, setDisplayMessage] = useState("flewAway");
  const controls = useAnimation();
  let timer: any;

  useEffect(() => {
    if (takeoffSound.current && sound) {
      takeoffSound.current.play();
    }

    timer = setTimeout(() => {
      setDisplayMessage("loadingNextRound");
    }, 5000); // Switch message after 5 seconds

    controls.start("animate"); // Start animation only once on mount

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []); // Removed controls from dependencies to prevent re-renders

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
            <MotionDiv
              variants={aviatorVariants}
              initial="initial"
              animate={controls}
              exit="exit"
              transition={{ duration: 1, ease: "easeInOut" }}
              className="relative"
            >
              <img src="/rocket.gif" alt="Aviator" height={150} width={150} />
            </MotionDiv>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
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
