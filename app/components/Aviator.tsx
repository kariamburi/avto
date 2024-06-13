import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const aviatorVariants_1 = {
  initial: { y: 0 },
  animate: { y: -200, x: 250 },
  exit: { y: -200 },
};

const aviatorVariants_2 = {
  initial: { y: -100 },
  animate: { y: -200 },
  exit: { y: -100 },
};

interface GameBackgroundProps {
  multiplier: string;
}

const Aviator = ({ multiplier }: GameBackgroundProps) => {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({
        ...aviatorVariants_1.animate,
        transition: { duration: 4 },
      });
      await controls.start({
        ...aviatorVariants_1.exit,
        transition: { duration: 4 },
      });
      controls.start({
        y: [
          aviatorVariants_2.animate.y,
          aviatorVariants_2.initial.y,
          aviatorVariants_2.animate.y,
        ],
        transition: { duration: 4, repeat: Infinity, repeatType: "loop" },
      });
    };

    sequence();
  }, [controls]); // Add controls to dependency array

  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl text-white font-bold z-30" id="multiplier">
        x{multiplier}
      </div>
      <motion.div
        initial={aviatorVariants_1.initial}
        animate={controls}
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <img src="/rocket.gif" alt="Aviator" height={150} width={150} />
      </motion.div>
    </div>
  );
};

export default Aviator;
