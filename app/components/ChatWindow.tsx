// components/ChatWindow.js
"use client";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import SendMessage from "./SendMessage";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUid: string;
  senderId: string;
  senderName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  recipientUid,
  senderId,
  senderName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-10 bg-gray-900 border border-gray-300 rounded-lg shadow-lg w-80 z-30">
      <div className="flex justify-between bg-gray-900 text-white p-2 rounded-t-lg">
        <h3 className="font-semibold">Chat Support</h3>

        <div onClick={onClose} className="cursor-pointer text-white">
          <CloseOutlinedIcon />
        </div>
      </div>
      <div className="p-1">
        <div className="rounded-lg bg-gray-700 flex flex-col p-1 mt-0">
          <div className="lg:flex-1 p-0 ml-0 mr-0">
            <ChatBox
              displayName={senderName}
              uid={senderId}
              recipientUid={recipientUid}
              player={true}
            />

            <SendMessage
              displayName={senderName}
              uid={senderId}
              recipientUid={recipientUid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
