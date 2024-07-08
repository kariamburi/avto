import React from "react";
import Aviator from "./Aviator";
import styles from "./GameBackground.module.css";

interface GameBackgroundProps {
  multiplier: string;
}

const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 3;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    stars.push(
      <div
        key={i}
        className={styles.star}
        style={{
          width: size + "px",
          height: size + "px",
          top: top + "%",
          left: left + "%",
          animation: `twinkle ${Math.random() * 5 + 5}s infinite`,
        }}
      />
    );
  }
  return stars;
};

const GameBackground: React.FC<GameBackgroundProps> = ({ multiplier }) => {
  return (
    <div className={styles["bg-container"]}>
      {/* Cloud Layers */}
      <div className={`${styles.clouds} ${styles["cloud-layer-1"]}`}></div>
      <div className={`${styles.clouds} ${styles["cloud-layer-2"]}`}></div>
      {/* Airplane Animation */}
      <Aviator multiplier={multiplier} />
    </div>
  );
};

export default GameBackground;
