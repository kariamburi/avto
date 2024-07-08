import { useState, useEffect } from "react";
interface accProps {
  multiplier: number;
}
const Multiplier = ({ multiplier }: accProps) => {
  // const [multiplier, setMultiplier] = useState(1.0);

  //useEffect(() => {
  // const interval = setInterval(() => {
  //   setMultiplier((prev) => prev + 0.01);
  // }, 100);

  // return () => clearInterval(interval);
  //}, []);

  const color = `#${Math.floor((multiplier * 10) % 256)
    .toString(16)
    .padStart(2, "0")}0000`;

  return (
    <div
      className="flex items-center justify-center h-screen transition-colors duration-500"
      style={{
        background: `linear-gradient(45deg, ${color}, #0000${Math.floor(
          (multiplier * 10) % 256
        )
          .toString(16)
          .padStart(2, "0")})`,
      }}
    >
      <div className="text-center p-5 bg-opacity-10 bg-white rounded-lg">
        <div className="text-6xl text-white">{multiplier.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default Multiplier;
