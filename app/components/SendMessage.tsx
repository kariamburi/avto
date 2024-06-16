"use client";
//import { db, storage } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React from "react";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useToast } from "@/components/ui/use-toast";
import { db, storage } from "@/firebase";
type sidebarProps = {
  displayName: string;
  uid: string;
  recipientUid: string;
};
const SendMessage = ({ uid, displayName, recipientUid }: sidebarProps) => {
  const [value, setValue] = useState<string>("");
  const [image, setImg] = useState<File | null>(null);
  const [check, setcheck] = useState<boolean>(true);
  // const [recipientUid, setrecipientUid] = React.useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const welcome = async () => {
      const read = "1";
      const imageUrl = "";
      const userQuery = query(
        collection(db, "messages"),
        where("uid", "==", uid),
        where("recipientUid", "==", recipientUid),
        where(
          "text",
          "==",
          "Hello! Thank you for reaching out to our support team. We're here to assist you. Please feel free to ask any questions or let us know how we can help you today."
        )
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        await addDoc(collection(db, "messages"), {
          text: "Hello! Thank you for reaching out to our support team. We're here to assist you. Please feel free to ask any questions or let us know how we can help you today.",
          name: "Support Team",
          createdAt: serverTimestamp(),
          uid: recipientUid,
          recipientUid: uid,
          imageUrl,
          read,
        });
        setcheck(false);
      }
    };
    if (check) {
      welcome();
    }
  }, []);
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (value.trim() === "") {
      toast({
        variant: "destructive",
        title: "Failed!",
        description: "Enter your message!",
        duration: 5000,
      });
      return;
    }

    try {
      let imageUrl: string = "";
      if (image) {
        const date = new Date().getTime();
        const imageRef = ref(storage, `${uid + date}`);

        // Upload the image
        await uploadBytes(imageRef, image);

        // Get the download URL
        imageUrl = await getDownloadURL(imageRef);
      }
      const read = "1";
      await addDoc(collection(db, "messages"), {
        text: value,
        name: displayName,
        createdAt: serverTimestamp(),
        uid,
        recipientUid,
        imageUrl,
        read,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    setValue("");
    setImg(null);
  };

  return (
    <div className="w-full p-1 mt-2">
      <form onSubmit={handleSendMessage} className="px-0 containerWrap flex">
        {recipientUid ? (
          <>
            {image && (
              <div className="h-32 w-24 fixed bottom-40 bg-gray-600 shadow rounded-lg p-1">
                <button
                  onClick={(e) => setImg(null)}
                  className="focus:outline-none"
                >
                  <CloseIcon className="m-1" sx={{ fontSize: 24 }} />
                </button>
                <img
                  src={URL.createObjectURL(image)}
                  alt="image"
                  width={50}
                  height={50}
                  className="w-full object-center rounded-lg"
                />
              </div>
            )}
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input text-black text-sm w-full p-2 focus:outline-none bg-white rounded-r-none rounded-l-lg"
              type="text"
              placeholder="Enter your message..."
            />
            <button
              type="submit"
              className="w-auto bg-gradient-to-b from-green-600 to-green-700 text-white rounded-r-lg px-5 text-sm"
            >
              Send
            </button>
          </>
        ) : (
          <>
            <input
              value={value}
              disabled
              className="input w-full text-sm p-2 focus:outline-none bg-white rounded-r-none rounded-l-lg"
              type="text"
              placeholder="Enter your message..."
            />
            <button
              type="submit"
              disabled
              className="w-auto bg-gradient-to-b from-green-600 to-green-700 text-white rounded-r-lg px-5 text-sm"
            >
              Send
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default SendMessage;
