"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import React from "react";
import Message from "./Message";

type sidebarProps = {
  displayName: string;
  uid: string;
  recipientUid: string;
  player: boolean;
};
type propmess = {
  messageId: string;
};
const ChatBox = ({ uid, displayName, recipientUid, player }: sidebarProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchMessages = () => {
      const senderMessagesQuery = query(
        collection(db, "messages"),
        where("uid", "==", uid),
        where("recipientUid", "==", recipientUid),
        limit(50)
      );

      const recipientMessagesQuery = query(
        collection(db, "messages"),
        where("uid", "==", recipientUid),
        where("recipientUid", "==", uid),
        limit(50)
      );

      const unsubscribeSender = onSnapshot(senderMessagesQuery, (snapshot) => {
        const senderMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages((prevMessages) =>
          [
            ...prevMessages.filter((msg) => msg.uid !== uid), // Filter out previous messages from current user
            ...senderMessages,
          ].sort((a, b) => a.createdAt - b.createdAt)
        );
      });

      const unsubscribeRecipient = onSnapshot(
        recipientMessagesQuery,
        (snapshot) => {
          const recipientMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages((prevMessages) =>
            [
              ...prevMessages.filter((msg) => msg.uid !== recipientUid), // Filter out previous messages from recipient user
              ...recipientMessages,
            ].sort((a, b) => a.createdAt - b.createdAt)
          );
        }
      );

      return () => {
        unsubscribeSender();
        unsubscribeRecipient();
      };
    };
    setMessages([]);
    fetchMessages();
  }, [uid, recipientUid]);

  // Function to update the read status of a message

  const updateMessageReadStatus = async ({ messageId }: propmess) => {
    try {
      // Get a reference to the message document
      const messageRef = doc(db, "messages", messageId);

      // Update the read field to 1 (indicating read status)
      await updateDoc(messageRef, {
        read: 0,
      });

      console.log("Message read status updated successfully.");
    } catch (error) {
      console.error("Error updating message read status: ", error);
    }
  };

  // Call the function to update the read status of the message

  return (
    <div className="">
      <ScrollArea className="h-[350px] w-full bg-white rounded-md border p-1">
        {messages.map((message: any) => (
          <>
            <Message
              key={message.id}
              message={message}
              displayName={displayName}
              uid={uid}
              recipientUid={recipientUid}
              imageUrl={message.imageUrl}
              player={player}
            />
            {message.uid !== uid &&
              message.read == 1 &&
              updateMessageReadStatus({ messageId: message.id })}
          </>
        ))}
        <div ref={messagesEndRef}></div>
      </ScrollArea>
    </div>
  );
};

export default ChatBox;
