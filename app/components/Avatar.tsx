// components/RandomAvatar.tsx
import React from "react";
import Avatar from "react-avatar";
//import { Avatar } from "react-avatar";

const getRandomSeed = () => Math.floor(Math.random() * 10000).toString();

const RandomAvatar: React.FC = () => {
  const [seed, setSeed] = React.useState(getRandomSeed());

  const generateNewAvatar = () => {
    setSeed(getRandomSeed());
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Avatar name={seed} size="36" round={true} />
    </div>
  );
};

export default RandomAvatar;
