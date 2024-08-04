// components/ChatWindow.js
"use client";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import SendMessage from "./SendMessage";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "./Sidebar";
import Avatar from "./Avatar";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import TextField from "@mui/material/TextField";
import { updateBalance } from "@/lib/actions";
import { requeststkpush } from "@/lib/requeststkpush";
import { useToast } from "@/components/ui/use-toast";
import { format, isToday, isYesterday } from "date-fns";
interface accProps {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  username: string;
  balance: number;
}
function convertPhoneNumber(phoneNumber: string): string {
  // Check if the phone number starts with '254'
  if (phoneNumber.startsWith("254")) {
    // Replace '254' with '0'
    return "0" + phoneNumber.slice(3);
  } else {
    // Return the original number if it doesn't start with '254'
    return phoneNumber;
  }
}
async function fetchWithdraw(phone: string) {
  try {
    const betsRef = collection(db, "withdraw");
    const betsQuery = query(
      betsRef,
      where("phone", "==", phone)
      // limit(100)
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    let total = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bets.push({ id: doc.id, ...doc.data() });
      // Accumulate the total amount
      if (data.amount) {
        total += data.amount;
      }
    });

    //console.log("Total Amount:", total);
    return { bets, total };
  } catch (error) {
    console.error("Error fetching bets: ");
  }
}
const Account: React.FC<accProps> = ({
  isOpen,
  userID,
  username,
  balance,
  onClose,
}) => {
  //const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();
  useEffect(() => {
    const loadbalance = async () => {
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        //  setBalance(Number(userData.amount));
        sessionStorage.setItem("balance", userData.amount);
      }
    };
    loadbalance();
    const loadSettings = async () => {
      const userQuery = query(collection(db, "settings"));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setminwithdraw(userData.minwithdraw);
        setmaxwithdraw(userData.maxwithdraw);
        setmindeposit(userData.mindeposit);
        setmaxdeposit(userData.maxdeposit);

        setpaybill(userData.paybill);
      }
    };
    loadSettings();
  }, []);
  const [activeTabb, setActiveTabb] = useState(0);
  const [deposit, setdeposit] = useState("200");
  const [stkresponse, setstkresponse] = useState("");
  const [errorstkresponse, errorsetstkresponse] = useState("");
  const [payphone, setpayphone] = useState(convertPhoneNumber(userID));
  const [errordeposit, seterrordeposit] = useState("");
  const [errormpesaphone, seterrormpesaphone] = useState("");

  const [withdraw, setwithdraw] = useState("");
  const [sendphone, setsendphone] = useState(userID);
  const [errorwithdraw, seterrorwithdraw] = useState("");
  const [errorwithdrawphone, seterrorwithdrawphone] = useState("");
  const [minwithdraw, setminwithdraw] = useState("500");
  const [maxwithdraw, setmaxwithdraw] = useState("any");
  const [mindeposit, setmindeposit] = useState("10");
  const [maxdeposit, setmaxdeposit] = useState("any");

  const [paybill, setpaybill] = useState("155276");
  const [isSubmitting, setisSubmitting] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState("254"); // Default country code
  const formatPhoneNumber = (input: any) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, "");

    // Apply formatting based on length
    if (cleaned.length < 4) {
      return cleaned;
    } else if (cleaned.length < 7) {
      return `${cleaned.slice(0, 3)}${cleaned.slice(3)}`;
    } else if (cleaned.length < 11) {
      return `${cleaned.slice(0, 3)}${cleaned.slice(3, 6)}${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)}${cleaned.slice(3, 6)}${cleaned.slice(
        6,
        10
      )}`;
    }
  };
  function removeLeadingZero(numberString: string) {
    // Check if the first character is '0'
    if (numberString.charAt(0) === "0") {
      // If yes, return the string without the first character
      return numberString.substring(1);
    } else {
      // If no, return the original string
      return numberString;
    }
  }
  function removeLeadingPlus(numberString: string) {
    // Check if the first character is '0'
    if (numberString.charAt(0) === "+") {
      // If yes, return the string without the first character
      return numberString.substring(1);
    } else {
      // If no, return the original string
      return numberString;
    }
  }
  const tabss = [
    { title: "Deposit", content: "Deposit" },
    { title: "Withdraw", content: "Withdraw" },
  ];

  const handleWithdraw = async (e: any) => {
    e.preventDefault();

    if (sendphone.trim() === "") {
      seterrorwithdrawphone("Enter M-Pesa Phone Number to send to!");
      return;
    }
    if (withdraw.trim() === "") {
      seterrorwithdraw("Enter Withdraw Amount");
      return;
    }
    if (Number(withdraw.trim()) < Number(minwithdraw)) {
      seterrorwithdraw("Minimum withdraw amount is KES " + minwithdraw);
      return;
    }
    if (
      maxwithdraw !== "any" &&
      Number(withdraw.trim()) > Number(maxwithdraw)
    ) {
      seterrorwithdraw("Maximum withdraw amount is KES " + maxwithdraw);
      return;
    }
    try {
      setisSubmitting(true);
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        if (Number(userData.amount) >= Number(withdraw)) {
          const newAmount = Number(userData.amount) - Number(withdraw);

          updateBalance(userID, newAmount);

          await addDoc(collection(db, "withdraw"), {
            phone: userID,
            mame: username,
            sendphone: countryCode + removeLeadingZero(sendphone),
            amount: Number(withdraw),
            status: "pending",
            createdAt: serverTimestamp(),
          });
          //  setBalance(newAmount);
          sessionStorage.setItem("balance", newAmount.toString());
          setwithdraw("");
          setsendphone("");
          toast({
            title: "Successful",
            description:
              "Withdraw of KES " +
              withdraw +
              " to " +
              sendphone +
              " Successful pending Approval",
            duration: 5000,
            className: "bg-green-600 text-white",
          });
          setisSubmitting(false);
          // window.location.reload();
        } else {
          setwithdraw("");
          toast({
            variant: "destructive",
            title: "Failed",
            description: "Insufficient Funds!",
            duration: 5000,
          });
          setisSubmitting(false);
        }
      } else {
        setwithdraw("");
        setisSubmitting(false);
        toast({
          variant: "destructive",
          title: "Failed",
          description: "Insufficient Funds!",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleTopup = async (e: any) => {
    e.preventDefault();

    if (payphone.trim() === "") {
      seterrormpesaphone("Enter M-Pesa Phone Number");
      return;
    }
    if (deposit.trim() === "") {
      seterrordeposit("Enter Deposit Amount");
      return;
    }
    if (Number(deposit.trim()) < Number(mindeposit)) {
      seterrordeposit("Minimum deposit amount is KES " + mindeposit);
      return;
    }
    if (maxdeposit !== "any" && Number(deposit.trim()) > Number(maxdeposit)) {
      seterrordeposit("Maximum deposit amount is KES " + maxdeposit);
      return;
    }
    try {
      setisSubmitting(true);
      const response = await requeststkpush(
        userID,
        removeLeadingPlus(countryCode) + removeLeadingZero(payphone),
        Number(deposit)
      );

      if (response === "success") {
        // console.log("RESPONSE    " + response);
        setstkresponse(
          "STK PUSH sent to your phone, Check Mpesa prompt, Enter your pin to complete deposit"
        );
        setdeposit("");
        setpayphone("");
        setisSubmitting(false);
        //  window.location.reload();
      } else {
        setisSubmitting(false);
        errorsetstkresponse("Error sending mpesa stk push");
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const [Withdraw, setWithdraw] = useState<any[]>([]);
  const [totalWithdraw, settotalWithdraw] = useState<number>(0);
  const [activeTabW, setActiveTabW] = useState(0);
  const tabW = [
    { title: "Withdraw", content: "withdraw" },
    { title: "History", content: "history" },
  ];
  const handleWH = async (index: number) => {
    setActiveTabW(index);

    if (index === 1) {
      fetchWithdraw(userID).then((result) => {
        const bets = result?.bets ?? [];
        const total = result?.total ?? 0;

        setWithdraw(bets);
        settotalWithdraw(total);
      });
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed w-full bg-gray-900 border border-gray-300 h-screen shadow-lg z-30">
      <div className="flex justify-between bg-gray-900 text-white p-2 rounded-t-lg">
        <div className="rounded-full overflow-hidden">
          <img className="w-24" src="/logo1.png" alt="avatar" />
          <div className="text-xs text-gray-400 font-medium flex gap-5"></div>
        </div>
        <div onClick={onClose} className="cursor-pointer text-white">
          <CloseOutlinedIcon />
        </div>
      </div>
      <div className="p-1">
        <div className="p-1 bg-gray-800 rounded-md shadow-md max-w-3xl mx-auto mb-2">
          <div className="p-0 w-full items-center">
            <div className="flex flex-col items-center rounded-t-lg w-full p-1 bg-grey-50">
              <div className="flex justify-between w-full items-center">
                <div className="flex gap-1 items-center">
                  {" "}
                  <div className="p-1">
                    <Avatar />
                  </div>
                  <div className="flex flex-col">
                    {" "}
                    <p className="text-sm font-bold text-white">{username}</p>
                    <p className="text-sm font-bold text-white">{userID}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-3xl text-green-600 font-bold p-2">
                    KES {balance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="gap-1 h-[450px] mt-2 items-center w-full bg-gray-400 rounded-lg">
                <div className="flex bg-gray-900 rounded-t-lg w-full">
                  {tabss.map((tab, index) => (
                    <button
                      key={index}
                      className={`flex-1 font-bold rounded-t-lg p-2 text-center ${
                        activeTabb === index
                          ? "text-gray-900 bg-gray-400"
                          : "bg-gray-900 text-white"
                      }`}
                      onClick={() => setActiveTabb(index)}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
                <div className="p-2 bg-gray-400 rounded-b-lg">
                  {activeTabb === 0 && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="flex flex-col rounded-lg bg-gray-100 p-2 mb-2 w-full">
                          <div className="text-lg p-1 text-gray-900">
                            Deposit via MPESA EXPRESS
                          </div>
                          <div className="flex flex-col gap-1 mb-4 w-full">
                            <TextField
                              id="outlined-password-input"
                              label="M-pesa Phone Number"
                              type="text"
                              value={payphone}
                              onChange={(e) =>
                                setpayphone(formatPhoneNumber(e.target.value))
                              }
                            />
                            <div className="text-red-400">
                              {errormpesaphone}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 mb-4 w-full">
                            <TextField
                              id="outlined-password-input"
                              label="Amount"
                              type="text"
                              value={deposit}
                              onChange={(e) => setdeposit(e.target.value)}
                            />
                            <div className="text-red-400">{errordeposit}</div>
                          </div>
                          <button
                            onClick={handleTopup}
                            disabled={isSubmitting}
                            className="w-full bg-emerald-600 text-white hover:emerald-900 mt-2 p-2 rounded-lg shadow"
                          >
                            {isSubmitting ? "Sending request..." : `Deposit`}
                          </button>
                          {stkresponse && (
                            <div className="mt-2 text-green-800 text-sm bg-green-100 rounded-lg w-full p-2 items-center">
                              {stkresponse}
                            </div>
                          )}
                          {errorstkresponse && (
                            <div className="mt-1 text-red-800 text-sm bg-red-100 rounded-lg w-full p-2 items-center">
                              {errorstkresponse}
                            </div>
                          )}
                        </div>
                        {/*<div className="flex flex-col rounded-lg bg-gray-100 w-full p-2 mb-2">
                          <div className="text-lg p-1 text-gray-900">
                            2. Deposit Via Paybill No
                          </div>
                          <div className="text-sm p-1 font-bold text-gray-900">
                            <ul className="w-full text-sm">
                              <li className="flex gap-2">
                                <div className="text-xl text-gray-600">
                                  Paybill:
                                </div>{" "}
                                <div className="font-bold text-xl text-green-600">
                                  {paybill}
                                </div>
                              </li>
                              <li className="flex gap-2">
                                <div className="text-xl text-gray-600">
                                  Account:
                                </div>{" "}
                                <div className="font-bold text-xl text-green-600">
                                  {userID}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                        */}
                      </div>
                    </>
                  )}
                  {activeTabb === 1 && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="flex bg-gray-600 w-full rounded-t-lg p-1">
                          {tabW.map((tab, index) => (
                            <button
                              key={index}
                              className={`flex-1 text-sm py-1 px-0 rounded-t-lg text-center ${
                                activeTabW === index
                                  ? "bg-gray-200 text-black"
                                  : "bg-gray-600 text-white"
                              }`}
                              onClick={() => handleWH(index)}
                            >
                              {tab.title}
                            </button>
                          ))}
                        </div>
                        {activeTabW === 0 && (
                          <>
                            <div className="flex flex-col rounded-b-lg bg-gray-100 p-2 mb-2 w-full">
                              <div className="text-lg p-1 font-bold text-gray-900">
                                Withdraw via M-Pesa
                              </div>
                              <div className="flex flex-col gap-1 mb-5 w-full">
                                <TextField
                                  id="outlined-password-input"
                                  label="Send to Phone Number"
                                  type="text"
                                  value={sendphone}
                                  onChange={(e) =>
                                    setsendphone(
                                      formatPhoneNumber(e.target.value)
                                    )
                                  }
                                />
                                <div className="text-red-400">
                                  {errorwithdrawphone}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 mb-5 w-full">
                                <TextField
                                  id="outlined-password-input"
                                  label="Amount to withdraw"
                                  type="text"
                                  value={withdraw}
                                  onChange={(e) => setwithdraw(e.target.value)}
                                />
                                <div className="text-red-400">
                                  {errorwithdraw}
                                </div>
                              </div>
                              <button
                                onClick={handleWithdraw}
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 text-white hover:emerald-900 mt-2 p-2 rounded-lg shadow"
                              >
                                {isSubmitting
                                  ? "Sending request..."
                                  : `Withdraw`}
                              </button>
                            </div>
                          </>
                        )}
                        {activeTabW === 1 && (
                          <>
                            <div className="flex flex-col rounded-b-lg bg-gray-100 p-2 mb-2 w-full">
                              <div className="m-1 flex gap-2 text-sm justify-between items-center">
                                <div className="flex flex-col">
                                  <div className="text-lg font-bold text-black">
                                    Withdraw
                                  </div>

                                  <div className="text-gray-600 font-bold">
                                    KES. {totalWithdraw.toFixed(2)}
                                  </div>
                                </div>
                                <div></div>
                              </div>

                              <div className="border-gray-900 border w-full mb-1"></div>
                              <div className="grid grid-cols-4 text-gray-600 text-xs">
                                <div className="justify-center items-center flex flex-col">
                                  Status
                                </div>

                                <div className="justify-center items-center flex flex-col">
                                  Send to
                                </div>
                                <div className="justify-center items-center flex flex-col">
                                  Amount KES
                                </div>
                                <div className="justify-center items-center flex flex-col">
                                  Date
                                </div>
                                <div></div>
                              </div>
                              <ScrollArea className="h-[300px]">
                                <ul className="w-full">
                                  {Withdraw.map((bet: any, index) => {
                                    let formattedCreatedAt = "";
                                    try {
                                      const createdAtDate = new Date(
                                        bet.createdAt.seconds * 1000
                                      ); // Convert seconds to milliseconds

                                      // Get today's date
                                      const today = new Date();

                                      // Check if the message was sent today
                                      if (isToday(createdAtDate)) {
                                        formattedCreatedAt =
                                          "Today " +
                                          format(createdAtDate, "HH:mm"); // Set as "Today"
                                      } else if (isYesterday(createdAtDate)) {
                                        // Check if the message was sent yesterday
                                        formattedCreatedAt =
                                          "Yesterday " +
                                          format(createdAtDate, "HH:mm"); // Set as "Yesterday"
                                      } else {
                                        // Format the createdAt date with day, month, and year
                                        formattedCreatedAt = format(
                                          createdAtDate,
                                          "dd-MM-yyyy"
                                        ); // Format as 'day/month/year'
                                      }

                                      // Append hours and minutes if the message is not from today or yesterday
                                      if (
                                        !isToday(createdAtDate) &&
                                        !isYesterday(createdAtDate)
                                      ) {
                                        formattedCreatedAt +=
                                          " " + format(createdAtDate, "HH:mm"); // Append hours and minutes
                                      }
                                    } catch {
                                      // Handle error when formatting date
                                    }

                                    return (
                                      <li
                                        className="w-full text-gray-600"
                                        key={index}
                                      >
                                        <div
                                          className={`p-1 mt-1 rounded-sm grid grid-cols-4 gap-1 w-full items-center text-xs`}
                                        >
                                          <div className="justify-center items-center flex flex-col">
                                            <div
                                              className={`flex flex-col p-1 justify-center items-center w-[70px] rounded-full ${
                                                bet.status === "pending"
                                                  ? "text-yellow-600"
                                                  : bet.status === "failed"
                                                  ? "text-red-600 "
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {bet.status}
                                            </div>
                                          </div>

                                          <div className="justify-center items-center flex flex-col">
                                            {bet.sendphone}
                                          </div>

                                          <div className="justify-center items-center flex flex-col">
                                            KES {bet.amount.toFixed(2)}
                                          </div>
                                          <div className="justify-center items-center flex flex-col">
                                            {formattedCreatedAt}
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </ScrollArea>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
