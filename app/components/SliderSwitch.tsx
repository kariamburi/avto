// components/SliderSwitch.js
import React, { useState } from "react";

const SliderSwitch = () => {
  const [isBet, setIsBet] = useState(true);

  const toggleSwitch = () => {
    setIsBet(!isBet);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-24 h-6 bg-gray-800  rounded-full cursor-pointer"
        onClick={toggleSwitch}
      >
        <div
          className={`absolute top-0.5 w-12 h-5 bg-white rounded-full flex items-center justify-center transition-transform ${
            isBet ? "bg-gray-800 translate-x-0" : "bg-gray-800 translate-x-full"
          }`}
          style={{ transform: isBet ? "translateX(0)" : "translateX(100%)" }}
        >
          <span className="text-xs font-bold text-gray-900">
            {isBet ? "Bet" : "Auto"}
          </span>
        </div>
        <div className="flex justify-between w-full text-xs items-center text-gray-400">
          <span className="pl-1 mt-1">Bet</span>
          <span className="pr-1 mt-1">Auto</span>
        </div>
      </div>
    </div>
  );
};

export default SliderSwitch;
