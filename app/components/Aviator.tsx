import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimationControls,
  Variants,
  motion,
  useAnimation,
} from "framer-motion";

interface GameBackgroundProps {
  multiplier: string;
}

const Aviator = ({ multiplier }: GameBackgroundProps) => {
  const controls: AnimationControls = useAnimation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark the component as mounted
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Sequence of animations
      const sequence = async () => {
        try {
          await controls.start("center");
          await controls.start("upAndDown");
        } catch (error) {
          //console.error("Animation error:", error);
        }
      };

      sequence();
    }
  }, [mounted, controls]);

  const aviatorVariants: Variants = {
    initial: { bottom: 0, left: 0 },
    center: {
      bottom: "50%", // Center vertically
      left: "50%", // Center horizontally
      translateX: "-50%", // Adjust to center the element itself
      translateY: "-50%", // Adjust to center the element itself
      transition: { duration: 3, ease: "easeInOut" },
    },
    pause: {
      transition: { delay: 0.5 }, // Pause for 0.5 seconds
    },
    upAndDown: {
      y: ["0px", "40px"], // Define the up-and-down motion
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 2,
          ease: "easeInOut",
        },
      },
    },
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="ml-20 w-[250px]">
            <div
              className="absolute text-6xl text-white font-bold z-10"
              id="multiplier"
            >
              x{multiplier}
            </div>
          </div>
          <div className="absolute z-[0] w-[250px] h-[250px] rounded-full gradient-animation" />
        </div>
        <motion.div
          initial="initial"
          animate={controls}
          variants={aviatorVariants}
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <Image src="/rocket.gif" width={150} height={150} alt="Aviator" />
        </motion.div>
      </div>
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background: linear-gradient(135deg, #ff7e5f, #feb47b);
          }
          50% {
            background: linear-gradient(135deg, #86a8e7, #7f7fd5);
          }
          100% {
            background: linear-gradient(135deg, #43cea2, #185a9d);
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
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #214d76 100%
            );
            filter: blur(40px);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          20% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #7d007d 100%
            );
            filter: blur(40px);
            opacity: 1;
          }
          30% {
            opacity: 0.5;
          }
          40% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #4490cc 100%
            );
            filter: blur(40px);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          60% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #9f1c90 100%
            );
            filter: blur(40px);
            opacity: 1;
          }

          70% {
            opacity: 0.5;
          }

          80% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #7848b6 100%
            );
            filter: blur(40px);
            opacity: 1;
          }

          90% {
            opacity: 0.5;
          }

          100% {
            background: linear-gradient(
              180deg,
              rgba(188, 165, 255, 0) 0%,
              #9f1c90 100%
            );
            filter: blur(40px);
            opacity: 1;
          }
        }

        .gradient-animation {
          animation: gradientShift 6s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Aviator;
