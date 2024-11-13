import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Variants } from "framer-motion";

// Dynamically import `motion.div` from Framer Motion
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

interface GameBackgroundProps {
  multiplier: string;
}

const Aviator = ({ multiplier }: GameBackgroundProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const aviatorVariants: Variants = {
    initial: { bottom: 0, left: 0 },
    center: {
      bottom: "50%",
      left: "50%",
      translateX: "-50%",
      translateY: "-50%",
      transition: { duration: 3, ease: "easeInOut" },
    },
    upAndDown: {
      y: ["0px", "40px"],
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
        <MotionDiv
          initial="initial"
          animate={mounted ? ["center", "upAndDown"] : "initial"}
          variants={aviatorVariants}
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <Image
            src="/rocket.gif"
            width={150}
            height={150}
            alt="Aviator"
            unoptimized
          />
        </MotionDiv>
      </div>
      <style jsx>{`
        .gradient-animation {
          animation: gradientShift 6s ease infinite;
        }

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
    </>
  );
};

export default Aviator;
