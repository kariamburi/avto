"use client";
import { useEffect, useState } from "react";

import Navbar from "../components/navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";

const pagechat = () => {
  const [senderId, setsenderId] = useState("");
  const [senderName, setsenderName] = useState("");
  //  const userEmail = sessionClaims?.userEmail as string;
  const senderImage = "";
  const recipientUid = senderId;
  // console.log(senderId);
  const router = useRouter();
  useEffect(() => {
    const user_id = sessionStorage.getItem("userID");
    if (user_id) {
      setsenderId(user_id);
      if (user_id === "254728820092") {
        setsenderId("TR658DYD6R6");
      }
    } else {
      router.push(`/`);
    }
    const username_id = sessionStorage.getItem("username");
    if (username_id) {
      setsenderName(username_id);
    }
  }, []);

  return (
    <>
      <div className="bg-gray-900 items-center text-white min-h-screen flex flex-col">
        <div className="bg-gray-900 fixed z-10 top-0 w-full">
          <div className="p-3">
            <Navbar />
          </div>
        </div>
        <div className="w-full lg:w-[500px] bg-gray-900 flex mt-20 mb-0 p-1">
          <div className="hidden lg:inline mr-5"></div>

          <div className="flex-1">
            <div className="rounded-lg max-w-6xl mx-auto flex flex-col p-0 mt-0">
              <div className="lg:flex-1 p-0 ml-0 mr-0">
                <ScrollArea className="max-h-[400px] w-full bg-gray-600 rounded-md p-4">
                  <div className="w-full items-center justify-center">
                    <span className="logo font-bold text-orange-600">
                      Messages
                    </span>
                    <p className=" text-center sm:text-left">Latest chats</p>
                  </div>
                  <Sidebar userId={senderId} />
                </ScrollArea>
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
