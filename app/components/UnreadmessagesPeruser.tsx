"use client";

import { db } from "@/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
type unreadprop = {
  recipientUid: string;
  uid: string;
};
const UnreadmessagesPeruser = ({ recipientUid, uid }: unreadprop) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  useEffect(() => {
    const getLastMessagesInConversations = async () => {
      try {
        // Initialize an empty object to store last messages
        const unreadMessages: any = {};

        // Query all messages and order them by createdAt timestamp in descending order
        const messagesQuery = query(
          collection(db, "messages"),
          where("recipientUid", "==", recipientUid),
          where("uid", "==", uid),
          where("read", "==", "1")
        );

        // Get all messages
        const querySnapshot = await getDocs(messagesQuery);
        let k: number = 0;
        querySnapshot.forEach((doc) => {
          const message = doc.data();
          // unreadMessages[message.id] = message;
          k = k + 1;
        });
        // alert(k);
        return k;
      } catch (error) {
        console.error("Error getting last messages:", error);
        return 0; // Return empty array in case of error
      }
    };

    getLastMessagesInConversations()
      .then((k) => {
        //console.log("No messages:", lastMessages.length);
        setUnreadCount(k);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    //console.log("sm:" + unreadCount);
  }, []);
  return (
    <div>
      {unreadCount > 0 && (
        <div className="bg-rose-600 rounded-full pl-1 pr-1 text-xs justify-center text-white">
          {unreadCount}
        </div>
      )}
    </div>
  );
};

export default UnreadmessagesPeruser;
