// components/ToggleSwitch.js
import React, { useState } from "react";

const ToggleSwitch = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
          isOn ? "bg-emerald-600" : "bg-gray-800"
        }`}
        onClick={toggleSwitch}
      >
        <div
          className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
            isOn ? "translate-x-8" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch;
