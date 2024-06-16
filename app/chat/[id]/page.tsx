"use client";
import { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
//import { auth } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/app/components/navbar";
import ChatBox from "@/app/components/ChatBox";
import SendMessage from "@/app/components/SendMessage";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import Navbarchat from "@/app/components/navbarchat";
type chatProps = {
  params: {
    id: string;
  };
};
const pagechat = ({ params: { id } }: chatProps) => {
  // const user = await getUserById(id);
  const router = useRouter();
  //  const userEmail = sessionClaims?.userEmail as string;
  const senderImage = "";
  const recipientUid = id;
  const [senderId, setsenderId] = useState("");
  const [senderName, setsenderName] = useState("");
  const [status, setstatus] = useState("");
  useEffect(() => {
    const user_id = sessionStorage.getItem("userID");
    if (user_id) {
      setsenderId(user_id);
    } else {
      router.push(`/`);
    }
    const username_id = sessionStorage.getItem("username");
    if (username_id) {
      setsenderName(username_id);
    }
    const status_id = sessionStorage.getItem("status");
    if (status_id) {
      setstatus(status_id);
    }
  }, []);

  // console.log(senderId);
  return (
    <>
      <div className="bg-gray-900 text-white items-center min-h-screen flex flex-col">
        <div className="bg-gray-900 fixed z-10 top-0 w-full">
          <div className="p-3">
            <Navbarchat />
          </div>
        </div>
        <div className="w-full bg-gray-900 flex mt-20 mb-0 p-1">
          <div className="hidden lg:inline mr-5">
            <div className="bg-gray-800 w-full lg:w-[300px] rounded-lg p-0">
              <ScrollArea className="max-h-[400px] w-full rounded-md p-4">
                <div className="w-full items-center justify-center">
                  <span className="logo font-bold text-orange-600">Chat</span>
                  <p className=" text-center sm:text-left">Latest chats</p>
                </div>
                <Sidebar userId={"254728820092"} />
              </ScrollArea>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg lg:hidden">
              <ScrollArea className="max-h-[400px] w-full bg-gray-800 rounded-md p-4 mb-2 mt-10 lg:mt-10">
                <div className="w-full items-center justify-center">
                  <span className="logo font-bold text-orange-600">Chat</span>
                  <p className=" text-center sm:text-left">Latest chats</p>
                </div>
                <Sidebar userId={"254728820092"} />
              </ScrollArea>
            </div>
            <div className="rounded-lg bg-gray-700 max-w-6xl mx-auto flex flex-col p-2 mt-0">
              <div className="lg:flex-1 p-0 ml-0 mr-0">
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
                />
                <Toaster />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default pagechat;
