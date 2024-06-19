// components/ChatWindow.js
"use client";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import SendMessage from "./SendMessage";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "./Sidebar";
interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUid: string;
  recipientUidName: string;
  senderId: string;
  senderName: string;
}

const supportChat: React.FC<ChatProps> = ({
  isOpen,
  recipientUid,
  recipientUidName,
  senderId,
  senderName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 lg:bottom-20 right-5 lg:right-10 bg-gray-900 border border-gray-300 rounded-lg shadow-lg w-[90%] sm:w-[400px] lg:w-[900px] z-30">
      <div className="flex justify-between bg-gray-900 text-white p-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <img
            className="w-8 h-8 rounded-full object-cover"
            src="/sender.png"
            alt="avatar"
          />
          <div className="text-xs text-gray-400 font-medium flex gap-5">
            <h3 className="font-bold text-lg">{recipientUidName}</h3>
          </div>
        </div>
        <div onClick={onClose} className="cursor-pointer text-white">
          <CloseOutlinedIcon />
        </div>
      </div>
      <div className="p-1">
        <div className="bg-gray-700 text-white flex flex-col">
          <div className="w-full bg-gray-900 flex p-1">
            <div className="flex-1">
              <div className="rounded-lg bg-gray-700 max-w-6xl mx-auto flex flex-col p-2 mt-0">
                <div className="p-0 ml-0 mr-0">
                  <ChatBox
                    displayName={senderName}
                    uid={senderId}
                    recipientUid={recipientUid}
                    player={false}
                  />
                  <SendMessage
                    displayName={senderName}
                    uid={senderId}
                    recipientUid={recipientUid}
                    player={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default supportChat;
