// components/ChatWindow.js

import React from "react";
interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}
const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-10 bg-white border border-gray-300 rounded-lg shadow-lg w-80 z-2">
      <div className="flex justify-between bg-emerald-950 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">Chat Support</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="p-4">Chat content goes here...</div>
    </div>
  );
};

export default ChatWindow;
