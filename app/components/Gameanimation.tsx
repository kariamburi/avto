import React from "react";
import Placebet from "./Placebet";
import GameBackground from "./GameBackground";
import Waiting from "./Waiting";
import Crash from "./Crash";
type gameProps = {
  gameStatus: string;
  multiplier: number;
};
const Gameanimation = ({ gameStatus, multiplier }: gameProps) => {
  return (
    <div
      className={`mb-2 w-full h-72 rounded-lg flex items-center justify-center relative overflow-hidden ${
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
            <Crash multiplier={multiplier.toFixed(2)} />
          )}
        </>
      )}
    </div>
  );
};

export default Gameanimation;
