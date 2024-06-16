// components/FloatingChatIcon.js

import React from "react";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
interface FloatingChatIconProps {
  onClick: () => void;
}
const FloatingChatIcon: React.FC<FloatingChatIconProps> = ({ onClick }) => {
  return (
    <div
      className="fixed bottom-5 right-5 bg-gradient-to-b from-green-600 to-green-800 w-10 h-10 flex justify-center items-center rounded-full cursor-pointer z-10"
      onClick={onClick}
    >
      <QuestionAnswerOutlinedIcon />
    </div>
  );
};

export default FloatingChatIcon;
