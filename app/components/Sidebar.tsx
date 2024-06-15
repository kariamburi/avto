"use client";
import React, { useEffect, useState } from "react";

import { format, isToday, isYesterday } from "date-fns";
import UnreadmessagesPeruser from "./UnreadmessagesPeruser";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { usePathname } from "next/navigation";
import Link from "next/link";

type sidebarProps = {
  userId: string;
};

const Sidebar = ({ userId }: sidebarProps) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Function to get the last message in each conversation
    const getLastMessagesInConversations = async () => {
      try {
        // Initialize an empty object to store last messages
        const lastMessages: any = {};

        // Query all messages and order them by createdAt timestamp in descending order
        const messagesQuery = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc")
        );

        // Get all messages
        const querySnapshot = await getDocs(messagesQuery);

        // Iterate over each message to find the last message in each conversation
        querySnapshot.forEach((doc) => {
          const message = doc.data();

          // If the recipientUid is not already in the lastMessages object or the message is newer than the current last message,
          // update the last message for that recipientUid
          if (message.recipientUid === userId) {
            if (
              !lastMessages[message.recipientUid] ||
              message.createdAt.seconds >
                lastMessages[message.recipientUid].createdAt.seconds
            ) {
              lastMessages[message.recipientUid] = message;
            }
          }
        });

        // Convert object to array and return the last messages
        return Object.values(lastMessages);
      } catch (error) {
        console.error("Error getting last messages:", error);
        return []; // Return empty array in case of error
      }
    };

    // Example usage
    getLastMessagesInConversations()
      .then((lastMessages) => {
        console.log("Last messages:", lastMessages);
        setMessages(lastMessages);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [userId]);

  const pathname = usePathname();
  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "...";
    }
    return title;
  };

  return (
    <ul className="">
      {messages &&
        messages.map((messages) => {
          //countUnreadmessages({ senderId: messages.uid });
          const isActive = pathname === "/chat/" + messages.uid;
          let formattedCreatedAt = "";
          try {
            const createdAtDate = new Date(messages.createdAt.seconds * 1000); // Convert seconds to milliseconds

            // Get today's date
            const today = new Date();

            // Check if the message was sent today
            if (isToday(createdAtDate)) {
              formattedCreatedAt = "Today " + format(createdAtDate, "HH:mm"); // Set as "Today"
            } else if (isYesterday(createdAtDate)) {
              // Check if the message was sent yesterday
              formattedCreatedAt =
                "Yesterday " + format(createdAtDate, "HH:mm"); // Set as "Yesterday"
            } else {
              // Format the createdAt date with day, month, and year
              formattedCreatedAt = format(createdAtDate, "dd-MM-yyyy"); // Format as 'day/month/year'
            }

            // Append hours and minutes if the message is not from today or yesterday
            if (!isToday(createdAtDate) && !isYesterday(createdAtDate)) {
              formattedCreatedAt += " " + format(createdAtDate, "HH:mm"); // Append hours and minutes
            }
          } catch {
            // Handle error when formatting date
          }

          return (
            <li
              key={"/chat/" + messages.uid}
              className={`${
                isActive &&
                "bg-gradient-to-b from-emerald-900 to-emerald-950 text-white rounded-sm"
              } p-medium-16 whitespace-nowrap bg-emerald-50 rounded-sm`}
            >
              <Link href={"/chat/" + messages.uid}>
                <div className="hover:bg-emerald-100 hover:rounded-sm hover:text-emerald-600 p-3 mb-1 hover:cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-right my-auto">
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={messages.avatar}
                        alt="avatar"
                      />
                    </span>
                    <div className="text-xs">{messages.name}</div>
                  </div>
                  <div className="text-xs flex w-full justify-between">
                    <div className="flex gap-1 font-normal">
                      {truncateTitle(messages.text, 15)}
                      <UnreadmessagesPeruser
                        uid={messages.uid}
                        recipientUid={userId}
                      />
                    </div>
                    <div className="font-normal">{formattedCreatedAt}</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
    </ul>
  );
};

export default Sidebar;
