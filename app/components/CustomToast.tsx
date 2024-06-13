// components/CustomToast.tsx
import React from "react";

type CustomToastProps = {
  title: string;
  description: string;
  bet: number;
  multiplier: number;
};

const CustomToast: React.FC<CustomToastProps> = ({
  title,
  description,
  bet,
  multiplier,
}) => {
  return (
    <div className="flex gap-1 p-0 items-center justify-between bg-emerald-600 text-white">
      <p>You have crashed at {multiplier.toFixed(2)}</p>
      <div className="w-[150px] flex flex-col items-center mt-2 p-2 bg-green-600 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold">{title}</h3>
        <p>${(bet * multiplier).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CustomToast;
