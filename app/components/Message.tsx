//import { UserAuth } from "../context/AuthContext";

import { format, isToday, isYesterday } from "date-fns";
import RandomAvatar from "./RandomAvatar";

interface MessageProps {
  message: {
    uid: string;
    recipientUid: string;
    imageUrl: string;
    createdAt: {
      seconds: number;
      nanoseconds: number;
    }; // Assuming createdAt is a Timestamp object
    name: string;
    text: string;
  };
  displayName: string;
  uid: string;
  imageUrl: string;
  recipientUid: string | null;
  player: boolean;
}

const Message = ({
  message,
  displayName,
  uid,
  recipientUid,
  imageUrl,
  player,
}: MessageProps) => {
  // Convert Timestamp to Date object
  let formattedCreatedAt = "";
  try {
    const createdAtDate = new Date(message.createdAt.seconds * 1000); // Convert seconds to milliseconds

    // Get today's date
    const today = new Date();

    // Check if the message was sent today
    if (isToday(createdAtDate)) {
      formattedCreatedAt = "Today " + format(createdAtDate, "HH:mm"); // Set as "Today"
    } else if (isYesterday(createdAtDate)) {
      // Check if the message was sent yesterday
      formattedCreatedAt = "Yesterday " + format(createdAtDate, "HH:mm"); // Set as "Yesterday"
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

  //console.log(message);
  return (
    <div className="">
      <div
        className={`flex items-start ${
          message.uid === uid ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex-shrink-0 mr-2">
          {message.uid === uid ? (
            // If the message is sent by the current user, display the user's avatar
            <>
              {" "}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src="/receiver.png"
                  alt="avatar"
                />
                <div className="text-xs text-black font-medium flex gap-5">
                  {message.name}
                  <div className="text-xs text-gray-500">
                    {formattedCreatedAt}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div
                  className={`max-w-xs mx-2 my-1 p-3 rounded-lg  ${
                    message.uid === uid
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Image"
                      className="mb-2 object-cover"
                    />
                  )}
                  <div
                    className={`text-sm ${player === true ? "w-[150px]" : ""}`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // If the message is sent by someone else, display the recipient's avatar
            <>
              {" "}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src="/sender.png"
                  alt="avatar"
                />
                <div className="text-xs text-black font-medium flex gap-3">
                  Support Team
                  <div className="text-xs text-gray-500">
                    {formattedCreatedAt}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div
                  className={`max-w-xs mx-2 my-1 p-3 rounded-lg  ${
                    message.uid === uid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Image"
                      className="mb-2 object-cover"
                    />
                  )}
                  <div
                    className={`text-sm ${player === true ? "w-[150px]" : ""}`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
