import React, { useEffect, useState } from "react";
import {
  AnimationControls,
  Variants,
  motion,
  useAnimation,
} from "framer-motion";

const aviatorVariants_1 = {
  //initial: { y: 0 },
  //animate: { y: -200, x: 250 },
  // exit: { y: -200 },

  initial: { bottom: 0, left: 0 },
  animate: {
    bottom: "50%", // Center vertically
    left: "50%", // Center horizontally
    translateX: "-50%", // Adjust to center the element itself
    translateY: "-50%", // Adjust to center the element itself
    transition: { duration: 2 },
  },
};

const aviatorVariants_2 = {
  initial: { y: "0px" },
  animate: { y: "0px", transition: { duration: 2 } },
};

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
          console.error("Animation error:", error);
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
    <div className="flex flex-col items-center">
      <div className="text-6xl text-white mt-20 font-bold z-30" id="multiplier">
        x{multiplier}
      </div>
      <motion.div
        initial="initial"
        animate={controls}
        variants={aviatorVariants}
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <img src="/rocket.gif" alt="Aviator" height={150} width={150} />
      </motion.div>
    </div>
  );
};

export default Aviator;
