import React from "react";
import Placebet from "./Placebet";
import GameBackground from "./GameBackground";
import Waiting from "./Waiting";
import Crash from "./Crash";
type gameProps = {
  gameStatus: string;
  multiplier: number;
  sound: boolean;
};
const Gameanimation = ({ gameStatus, multiplier, sound }: gameProps) => {
  return (
    <div
      className={`mb-1 w-full h-72 rounded-lg flex items-center justify-center relative overflow-hidden ${
        gameStatus === "running" ? "bg-[#000000]" : "bg-[#000000]"
      }`}
    >
      {gameStatus === "running" ? (
        <>
          {multiplier === 1 ? (
            <>
              <Placebet />
            </>
          ) : (
            <GameBackground multiplier={multiplier.toFixed(2)} />
          )}
        </>
      ) : (
        <>
          {gameStatus === "waiting" ? (
            <>
              <Waiting />
            </>
          ) : (
            <Crash multiplier={multiplier.toFixed(2)} sound={sound} />
          )}
        </>
      )}
    </div>
  );
};

export default Gameanimation;
