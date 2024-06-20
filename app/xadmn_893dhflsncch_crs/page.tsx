"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { format, isToday, isYesterday } from "date-fns";
import RandomAvatar from "../components/RandomAvatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { requestpay } from "@/lib/requestpay";
import { StringToBoolean } from "class-variance-authority/types";
import { DeleteConfirmation } from "../components/DeleteConfirmation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import useWebSocket from "../hooks/useWebSocket";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
interface Bet {
  id: string;
  phone: string;
  name: string;
  sendphone: string;
  status: string;
  amount: number;
  createdAt: {
    seconds: number;
  };
}
const fetchBetsDates = async (startDate: Date, endDate: Date) => {
  try {
    const betsCollection = collection(db, "bets");

    const startTimestamp = Timestamp.fromDate(startDate); // Convert Date to Firestore Timestamp
    const endTimestamp = Timestamp.fromDate(endDate); // Convert Date to Firestore Timestamp

    const betsQuery = query(
      betsCollection,
      orderBy("createdAt", "desc"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp)
      //orderBy("cashout", "desc") // Uncomment if you need to order by cashout
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any[] = [];
    let totalBet = 0;
    let totalCashout = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bets.push({ id: doc.id, ...data });
      // Accumulate the total amounts
      if (!data.auto) {
        if (data.bet) {
          totalBet += data.bet;
        }
        if (data.cashout) {
          totalCashout += Number(data.cashout);
        }
      }
    });

    console.log("Total Bet Amount:", totalBet);
    console.log("Total Cashout Amount:", totalCashout);
    return { bets, totalBet, totalCashout };
  } catch (error) {
    console.error("Error fetching bets: ", error);
    throw error;
  }
};

// Example usage:

const fetchDeposit = async (startDateDep: Date, endDateDep: Date) => {
  try {
    const betsCollection = collection(db, "deposit");

    const startTimestamp = Timestamp.fromDate(startDateDep); // Convert Date to Firestore Timestamp
    const endTimestamp = Timestamp.fromDate(endDateDep); // Convert Date to Firestore Timestamp

    const betsQuery = query(
      betsCollection,
      orderBy("createdAt", "desc"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp)
      //orderBy("cashout", "desc") // Uncomment if you need to order by cashout
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    let total = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bets.push({ id: doc.id, ...data });
      // Accumulate the total amounts
      if (data.amount) {
        total += data.amount;
      }
    });

    return { bets, total };
  } catch (error) {
    console.error("Error fetching bets: ", error);
    throw error;
  }
};

const fetchWithdraw = async (startDateWith: Date, endDateWith: Date) => {
  try {
    //  alert("startDateWith: " + startDateWith + " endDateWith: " + endDateWith);
    const betsCollection = collection(db, "withdraw");

    const startTimestamp = Timestamp.fromDate(startDateWith); // Convert Date to Firestore Timestamp
    const endTimestamp = Timestamp.fromDate(endDateWith); // Convert Date to Firestore Timestamp

    const betsQuery = query(
      betsCollection,
      orderBy("createdAt", "desc"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp)
      // orderBy("cashout", "desc") // Uncomment if you need to order by cashout
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    let total = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bets.push({ id: doc.id, ...data });
      // Accumulate the total amounts
      if (data.amount) {
        total += data.amount;
      }
    });

    return { bets, total };
  } catch (error) {
    console.error("Error fetching bets: ", error);
    throw error;
  }
};
async function fetchPlayers() {
  try {
    const betsRef = collection(db, "aviator_users");
    const betsQuery = query(
      betsRef,
      orderBy("createdAt", "desc")
      // limit(100)
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    querySnapshot.forEach((doc) => {
      bets.push({ id: doc.id, ...doc.data() });
    });

    return bets;
  } catch (error) {
    console.error("Error fetching bets: ");
  }
}
async function fetchBalance() {
  try {
    const betsRef = collection(db, "balance");
    const betsQuery = query(
      betsRef,
      orderBy("amount", "desc")
      // limit(100)
    );

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    let total = 0; // Use let instead of const to allow re-assignment

    const fetchName = async (phone: string): Promise<string> => {
      try {
        const betsRef_ = collection(db, "aviator_users");
        const betsQuery_ = query(
          betsRef_,
          where("phone", "==", phone)
          // limit(100)
        );

        const querySnapshot_ = await getDocs(betsQuery_);

        let name = "";
        querySnapshot_.forEach((doc) => {
          const data_ = doc.data();
          name = data_.name;
        });
        return name;
      } catch (error) {
        console.error("Error fetching name for phone:", phone, error);
        return ""; // Return an empty string if there's an error
      }
    };

    // Create an array of promises to fetch names
    const fetchPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      if (data.amount) {
        total += data.amount;
      }
      const name = await fetchName(data.phone);
      return { id: doc.id, ...data, name };
    });

    // Wait for all promises to resolve
    const betsWithNames = await Promise.all(fetchPromises);
    bets.push(...betsWithNames);

    //console.log("Total Amount:", total);
    return { bets, total };
  } catch (error) {
    console.error("Error fetching bets:", error);
  }
}

async function updateSettings(
  minwithdraw: string,
  maxwithdraw: string,
  mindeposit: string,
  maxdeposit: string,
  minbet: string,
  maxbet: string,
  houseEdge: string,
  levelA: string,
  levelB: string,
  paybill: string
) {
  const q = query(collection(db, "settings"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const docRef = doc.ref;

    // Update the amount field
    updateDoc(docRef, {
      minwithdraw: minwithdraw,
      maxwithdraw: maxwithdraw,
      mindeposit: mindeposit,
      maxdeposit: maxdeposit,
      minbet: minbet,
      maxbet: maxbet,
      houseEdge: houseEdge,
      levelA: levelA,
      levelB: levelB,
      paybill: paybill,
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  });
}
function validateHouseEdge(houseEdge: string): boolean {
  if (houseEdge.trim() === "") {
    alert("Enter houseEdge!");
    return false;
  }

  const edgeNumber = parseFloat(houseEdge);
  if (isNaN(edgeNumber) || edgeNumber < 0 || edgeNumber > 1) {
    alert("House edge must be a number between 0 and 1.");
    return false;
  }

  return true;
}
const page = () => {
  const { houseEdgeValue } = useWebSocket();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const tabs = [
    { title: "Balance", content: "Balance" },
    { title: "Deposit", content: "Deposit" },
    { title: "Withdraw", content: "Withdraw" },
    { title: "Bets", content: "bets" },
    { title: "Players", content: "bets" },
    { title: "Settings", content: "setting" },
    { title: "Chats", content: "chat" },
  ];

  const [startDate, setStartDate] = useState<Date | null>(
    new Date("2024-01-01")
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date("2024-12-31"));
  const [startDateDep, setStartDateDep] = useState<Date | null>(
    new Date("2024-01-01")
  );
  const [endDateDep, setEndDateDep] = useState<Date | null>(
    new Date("2024-12-31")
  );
  const [startDateWith, setStartDateWith] = useState<Date | null>(
    new Date("2024-01-01")
  );
  const [endDateWith, setEndDateWith] = useState<Date | null>(
    new Date("2024-12-31")
  );
  const [allbalance, setallbalance] = useState<any[]>([]);
  const [totalbalance, settotalbalance] = useState<number>(0);
  const [sentstatus, setsentstatus] = useState<string>("");
  const [sentstatusbets, setsentstatusbets] = useState<string>("");
  const [Deposit, setDeposit] = useState<any[]>([]);
  const [totalDeposit, settotalDeposit] = useState<number>(0);
  const [Withdraw, setWithdraw] = useState<any[]>([]);
  const [totalWithdraw, settotalWithdraw] = useState<number>(0);
  const [Bets, setBets] = useState<any[]>([]);
  const [totalbet, settotalbet] = useState<number>(0);
  const [totalcashout, settotalcashout] = useState<number>(0);
  const [Players, setPlayers] = useState<any[]>([]);
  const handleMybets = async (index: number) => {
    setActiveTab(index);

    if (index === 0) {
      fetchBalance().then((result) => {
        const bets = result?.bets ?? [];
        const total = result?.total ?? 0;
        setallbalance(bets);
        settotalbalance(total);
      });
    } else if (index === 1) {
      if (startDateDep && endDateDep) {
        fetchDeposit(startDateDep, endDateDep)
          .then((result) => {
            const bets = result?.bets ?? [];
            const total = result?.total ?? 0;
            setDeposit(bets);
            settotalDeposit(total); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
          })
          .catch((error) => {
            console.error("Error fetching bets:", error);
            // Handle error state or display error message to the user
          });
      }
    } else if (index === 2) {
      if (startDateWith && endDateWith) {
        fetchWithdraw(startDateWith, endDateWith)
          .then((result) => {
            const bets = result?.bets ?? [];
            const total = result?.total ?? 0;
            setWithdraw(bets);
            settotalWithdraw(total); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
          })
          .catch((error) => {
            console.error("Error fetching bets:", error);
            // Handle error state or display error message to the user
          });
      }
    } else if (index === 3) {
      if (startDate && endDate) {
        fetchBetsDates(startDate, endDate)
          .then((result) => {
            const bets = result?.bets ?? [];
            const bet = result?.totalBet ?? 0; // Adjust according to your actual property names
            const cashout = result?.totalCashout ?? 0; // Adjust according to your actual property names
            setBets(bets);
            settotalbet(bet);
            settotalcashout(cashout); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
          })
          .catch((error) => {
            console.error("Error fetching bets:", error);
            // Handle error state or display error message to the user
          });
      }
    } else if (index === 4) {
      fetchPlayers().then((ply) => {
        //  console.log("Bets for phone number:", bets);
        setPlayers(ply);
      });
    } else if (index === 5) {
      fetchPlayers().then((ply) => {
        //  console.log("Bets for phone number:", bets);
        setPlayers(ply);
      });
    }
  };
  const handleFetchDep = async () => {
    if (startDateDep && endDateDep) {
      fetchDeposit(startDateDep, endDateDep)
        .then((result) => {
          const bets = result?.bets ?? [];
          const total = result?.total ?? 0;
          setDeposit(bets);
          settotalDeposit(total); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
        })
        .catch((error) => {
          console.error("Error fetching bets:", error);
          // Handle error state or display error message to the user
        });
    }
  };
  const handleFetchWith = async () => {
    if (startDateWith && endDateWith) {
      fetchWithdraw(startDateWith, endDateWith)
        .then((result) => {
          const bets = result?.bets ?? [];
          const total = result?.total ?? 0;
          setWithdraw(bets);
          settotalWithdraw(total); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
        })
        .catch((error) => {
          console.error("Error fetching bets:", error);
          // Handle error state or display error message to the user
        });
    }
  };
  const handleFetchBets = async () => {
    if (startDate && endDate) {
      fetchBetsDates(startDate, endDate)
        .then((result) => {
          const bets = result?.bets ?? [];
          const bet = result?.totalBet ?? 0; // Adjust according to your actual property names
          const cashout = result?.totalCashout ?? 0; // Adjust according to your actual property names
          setBets(bets);
          settotalbet(bet);
          settotalcashout(cashout); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
        })
        .catch((error) => {
          console.error("Error fetching bets:", error);
          // Handle error state or display error message to the user
        });
    }
  };
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

  useEffect(() => {
    //const startDate = new Date("2024-01-01");
    // const endDate = new Date("2024-12-31");
    if (startDate && endDate) {
      fetchBetsDates(startDate, endDate)
        .then((result) => {
          const bets = result?.bets ?? [];
          const bet = result?.totalBet ?? 0; // Adjust according to your actual property names
          const cashout = result?.totalCashout ?? 0; // Adjust according to your actual property names
          setBets(bets);
          settotalbet(bet);
          settotalcashout(cashout); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
        })
        .catch((error) => {
          console.error("Error fetching bets:", error);
          // Handle error state or display error message to the user
        });
    }
  }, [sentstatusbets]);

  useEffect(() => {
    if (startDateWith && endDateWith) {
      fetchWithdraw(startDateWith, endDateWith)
        .then((result) => {
          const bets = result?.bets ?? [];
          const total = result?.total ?? 0;
          setWithdraw(bets);
          settotalWithdraw(total); // Ensure your state variable and setter match (settotalcashout -> setTotalCashout)
        })
        .catch((error) => {
          console.error("Error fetching bets:", error);
          // Handle error state or display error message to the user
        });
    }
  }, [sentstatus]);

  useEffect(() => {
    const status_id = sessionStorage.getItem("status");
    if (status_id !== "admin") {
      router.push(`/`);
    }
    fetchBalance().then((result) => {
      const bets = result?.bets ?? [];
      const total = result?.total ?? 0;
      setallbalance(bets);
      settotalbalance(total);
    });
    const loadSettings = async () => {
      const userQuery = query(collection(db, "settings"));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setminwithdraw(userData.minwithdraw);
        setmaxwithdraw(userData.maxwithdraw);
        setmindeposit(userData.mindeposit);
        setmaxdeposit(userData.maxdeposit);
        setminbet(userData.minbet);
        setmaxbet(userData.maxbet);
        sethouseEdge(userData.houseEdge);
        setlevelA(userData.levelA);
        setlevelB(userData.levelB);
      }
    };
    loadSettings();
  }, []);
  const [selectedItems, setSelectedItems] = useState<Bet[]>([]);
  const [payitems, setpayitems] = useState("");
  const [betsitems, setbetsitems] = useState("");
  const [selectedItemsbets, setSelectedItemsbets] = useState<Bet[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    if (selectedItems.length > 0) {
      let total = 0;
      for (let i = 0; i < selectedItems.length; i++) {
        // console.log(selectedItems[i]);
        if (selectedItems[i].status === "pending") {
          total = total + selectedItems[i].amount;
        }
      }
      setpayitems("(" + selectedItems.length + "," + total + ")");
    } else {
      setpayitems("");
    }

    if (selectedItemsbets.length > 0) {
      setbetsitems("(" + selectedItemsbets.length + ")");
    } else {
      setbetsitems("");
    }
  }, [selectedItems, selectedItemsbets]);

  const handleCheckboxChange = (event: any, bet: any) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedItems([...selectedItems, bet]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== bet));
    }
  };

  const handleCheckboxChangebets = (event: any, bet: any) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedItemsbets([...selectedItemsbets, bet]);
    } else {
      setSelectedItemsbets(selectedItemsbets.filter((item) => item !== bet));
    }
  };
  const handleDeleteBet = async (e: any) => {
    e.preventDefault();

    if (selectedItemsbets.length === 0) {
      console.log("No items selected for deletion.");
      return;
    }

    for (let i = 0; i < selectedItemsbets.length; i++) {
      const id = selectedItemsbets[i].id;
      try {
        await deleteDoc(doc(db, "bets", id));
        console.log(`Document with ID ${id} successfully deleted!`);
      } catch (error) {
        console.error(`Error deleting document with ID ${id}: `, error);
      }
    }
    setsentstatusbets("1");
    setSelectedItemsbets([]);
    setbetsitems("");
    alert("Deleted");
  };

  const handlePay = async (e: any) => {
    e.preventDefault();

    for (let i = 0; i < selectedItems.length; i++) {
      console.log(selectedItems[i]);
      if (selectedItems[i].status === "pending") {
        const response = await requestpay(
          selectedItems[i].sendphone,
          selectedItems[i].amount
        );

        if (response === "success") {
          updateSent(selectedItems[i].id);
        }
      }
    }

    setSelectedItems([]);
    setpayitems("");
    setsentstatus("1");
    alert("Done");
  };

  const updateSent = async (id: string) => {
    try {
      // Get a reference to the message document
      const messageRef = doc(db, "withdraw", id);

      // Update the read field to 1 (indicating read status)
      await updateDoc(messageRef, {
        status: "sent",
      });

      console.log("sent successfully.");
    } catch (error) {
      console.error("Error updating paid status: ", error);
    }
  };
  const [minwithdraw, setminwithdraw] = useState("500");
  const [maxwithdraw, setmaxwithdraw] = useState("any");
  const [mindeposit, setmindeposit] = useState("10");
  const [maxdeposit, setmaxdeposit] = useState("any");
  const [minbet, setminbet] = useState("5");
  const [maxbet, setmaxbet] = useState("5000");
  const [houseEdge, sethouseEdge] = useState("0.1");
  const [levelA, setlevelA] = useState("1");
  const [levelB, setlevelB] = useState("1");
  const [paybill, setpaybill] = useState("155276");
  const handleSettings = async (e: any) => {
    e.preventDefault();

    if (minwithdraw.trim() === "") {
      alert("Enter min withdraw amount!");
      return;
    }
    if (maxwithdraw.trim() === "") {
      alert("Enter max withdraw amount!");
      return;
    }
    if (mindeposit.trim() === "") {
      alert("Enter min deposit amount!");
      return;
    }
    if (maxdeposit.trim() === "") {
      alert("Enter max deposit amount!");
      return;
    }
    if (minbet.trim() === "") {
      alert("Enter min bet amount!");
      return;
    }
    if (maxbet.trim() === "") {
      alert("Enter max bet amount!");
      return;
    }
    if (!validateHouseEdge(houseEdge)) {
      alert("Enter houseEdge!");
      return;
    }
    if (levelA.trim() === "") {
      alert("Enter levelA!");
      return;
    }
    if (levelB.trim() === "") {
      alert("Enter levelB!");
      return;
    }
    if (paybill.trim() === "") {
      alert("Enter Paybill!");
      return;
    }
    try {
      const userQuery = query(collection(db, "settings"));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        updateSettings(
          minwithdraw,
          maxwithdraw,
          mindeposit,
          maxdeposit,
          minbet,
          maxbet,
          houseEdge,
          levelA,
          levelB,
          paybill
        );
        houseEdgeValue(Number(houseEdge), Number(levelA), Number(levelB));
        toast({
          title: "Successful",
          description: "Updated Successfully",
          duration: 5000,
          className: "bg-emerald-600 text-white",
        });
        // window.location.reload();
      } else {
        await addDoc(collection(db, "settings"), {
          minwithdraw: minwithdraw,
          maxwithdraw: maxwithdraw,
          mindeposit: mindeposit,
          maxdeposit: maxdeposit,
          minbet: minbet,
          maxbet: maxbet,
          houseEdge: houseEdge,
          levelA: levelA,
          levelB: levelB,
          paybill: paybill,
          createdAt: serverTimestamp(),
        });
        houseEdgeValue(Number(houseEdge), Number(levelA), Number(levelB));
        toast({
          title: "Successful",
          description: "Created settings record successfully",
          duration: 5000,
          className: "bg-emerald-600 text-white",
        });
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleClick = () => {
    for (let i = 0; i < 10; i++) {
      const minBet = 500;
      const maxBet = 4000;

      const randomBetAmount = (
        Math.floor(Math.random() * ((maxBet - minBet) / 10 + 1)) * 10 +
        minBet
      ).toFixed(0);

      const minBetNo = 4;
      const maxBetNo = 15;
      const randomBetNo = Math.random() * (maxBetNo - minBetNo + 1) + minBetNo;
      0;
      const cashout = Number(randomBetNo.toFixed(2)) * Number(randomBetAmount);
      const randomTwoLetters = generateRandomString();
      const randomPhone = generateRandomPhone();
      const randomTimestampToday = generateRandomTimestampToday();
      addDoc(collection(db, "bets"), {
        phone: randomPhone,
        name: randomTwoLetters,
        bet: Number(randomBetAmount),
        betno: 1,
        multiplier: Number(randomBetNo.toFixed(2)),
        cashout: Number(cashout),
        status: "Win",
        createdAt: randomTimestampToday,
        auto: "yes",
      });
    }
    alert("Done");
  };

  const generateRandomString = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const randomChar = () =>
      letters.charAt(Math.floor(Math.random() * letters.length));
    const firstChar = randomChar().toUpperCase();
    const secondChar = randomChar();
    return firstChar + secondChar;
  };
  const generateRandomPhone = () => {
    const countryCode = "254";
    const randomNineDigits = Math.floor(Math.random() * 900000000) + 100000000; // Generates a 9-digit number
    return countryCode + randomNineDigits.toString();
  };
  const generateRandomTimestampToday = () => {
    const now = new Date();

    // Set the time to midnight to start from the beginning of the day
    now.setHours(0, 0, 0, 0);

    // Generate a random hour between 0 and 23
    const randomHour = Math.floor(Math.random() * 24);

    // Create a new date with the random hour
    const randomDate = new Date(now);
    randomDate.setHours(randomHour);

    // Convert the random date to a Firestore Timestamp
    const randomTimestamp = Timestamp.fromDate(randomDate);

    return randomTimestamp;
  };
  const [isChatOpenPlayer, setChatOpenPlay] = useState("");
  const toggleChatPlayer = (id: string) => {
    setChatOpenPlay(id);
  };
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
        <div className="m-1 lg:m-5">
          <div className="flex bg-gray-900 rounded-full p-1">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex-1 text-sm py-1 px-0 rounded-full text-center ${
                  activeTab === index
                    ? "bg-gray-800 text-white"
                    : "bg-gray-900 text-gray-500"
                }`}
                onClick={() => handleMybets(index)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="p-0 w-full">
            <ScrollArea className="h-[500px]">
              {activeTab === 0 && (
                <>
                  <div className="">
                    <div className="m-1 flex flex-col text-white text-sm">
                      <div className="text-lg font-bold">BALANCE</div>
                      <div className="text-gray-400">
                        No. {allbalance.length}
                      </div>
                      <div className="text-gray-400 font-bold">
                        KES. {totalbalance.toFixed(2)}
                      </div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="grid grid-cols-4 text-gray-400 text-xs">
                      <div className="justify-center items-center flex flex-col">
                        Account
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Name
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Balance KES
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        id
                      </div>
                    </div>
                    <ul className="w-full">
                      {allbalance.map((bet: any, index) => {
                        // settotalbalance(totalbalance + bet.amount);
                        return (
                          <li className="w-full" key={index}>
                            <div
                              className={`p-1 mt-1 rounded-sm grid grid-cols-4 gap-1 w-full items-center text-xs bg-gray-900`}
                            >
                              <div className="gap-1 justify-center items-center flex">
                                <RandomAvatar /> {bet.phone}
                              </div>
                              <div className="gap-1 justify-center items-center flex">
                                {bet.name}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                KES {bet.amount.toFixed(2)}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.id}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              {activeTab === 1 && (
                <>
                  <div>
                    <div className="m-1 flex flex-col text-white text-sm">
                      <div className="text-lg font-bold">Deposit</div>
                      <div className="text-gray-400">No. {Deposit.length}</div>
                      <div className="text-gray-400 font-bold">
                        KES. {totalDeposit.toFixed(2)}
                      </div>
                      <div className="flex gap-2 items-center mt-2 mb-2">
                        <div>
                          <label htmlFor="start-date">Start Date: </label>
                          <DatePicker
                            id="start-date"
                            className="text-black rounded-lg p-1"
                            selected={startDateDep}
                            onChange={(date: Date | null) =>
                              setStartDateDep(date)
                            }
                            dateFormat="yyyy-MM-dd"
                          />
                        </div>
                        <div>
                          <label htmlFor="end-date">End Date: </label>
                          <DatePicker
                            id="end-date"
                            className="text-black rounded-lg p-1"
                            selected={endDateDep}
                            onChange={(date: Date | null) =>
                              setEndDateDep(date)
                            }
                            dateFormat="yyyy-MM-dd"
                          />
                        </div>
                        <button
                          className="w-[150px] bg-orange-600 text-white hover:orange-900 p-1 rounded-full"
                          onClick={handleFetchDep}
                        >
                          Fetch Deposits
                        </button>
                      </div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="grid grid-cols-9 text-gray-400 text-xs">
                      <div className="justify-center items-center flex flex-col">
                        id
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Phone
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Name
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Mode
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Amount KES
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Tran No
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Org Bal
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Date
                      </div>
                      <div></div>
                    </div>
                    <ul className="w-full">
                      {Deposit.map((bet: any, index) => {
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
                              "Today " + format(createdAtDate, "HH:mm"); // Set as "Today"
                          } else if (isYesterday(createdAtDate)) {
                            // Check if the message was sent yesterday
                            formattedCreatedAt =
                              "Yesterday " + format(createdAtDate, "HH:mm"); // Set as "Yesterday"
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
                          <li className="w-full" key={index}>
                            <div
                              className={`p-1 mt-1 rounded-sm grid grid-cols-9 gap-1 w-full items-center text-xs bg-gray-900`}
                            >
                              <div className="justify-center items-center flex flex-col">
                                {bet.id}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.phone}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.name}
                              </div>

                              <div className="justify-center items-center flex flex-col">
                                {bet.mode}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                KES {bet.amount.toFixed(2)}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.receiptno}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                KES {bet.org_balance.toFixed(2)}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {formattedCreatedAt}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                <DeleteConfirmation
                                  id={bet.id}
                                  record={"deposit"}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              {activeTab === 2 && (
                <>
                  <div>
                    <div className="m-1 flex gap-2 text-white text-sm justify-between items-center">
                      <div className="flex flex-col">
                        <div className="text-lg font-bold">Withdraw</div>
                        <div className="text-gray-400">{Withdraw.length}</div>
                        <div className="text-gray-400 font-bold">
                          KES. {totalWithdraw.toFixed(2)}
                        </div>
                        <div className="flex gap-2 items-center mt-2 mb-2">
                          <div>
                            <label htmlFor="start-date">Start Date: </label>
                            <DatePicker
                              id="start-date"
                              className="text-black rounded-lg p-1"
                              selected={startDateWith}
                              onChange={(date: Date | null) =>
                                setStartDateWith(date)
                              }
                              dateFormat="yyyy-MM-dd"
                            />
                          </div>
                          <div>
                            <label htmlFor="end-date">End Date: </label>
                            <DatePicker
                              id="end-date"
                              className="text-black rounded-lg p-1"
                              selected={endDateWith}
                              onChange={(date: Date | null) =>
                                setEndDateWith(date)
                              }
                              dateFormat="yyyy-MM-dd"
                            />
                          </div>
                          <button
                            className="w-[150px] bg-orange-600 text-white hover:orange-900 p-1 rounded-full"
                            onClick={handleFetchWith}
                          >
                            Fetch Withdraws
                          </button>
                        </div>
                      </div>
                      <div>
                        {" "}
                        <button
                          onClick={handlePay}
                          className="w-[150px] bg-emerald-600 text-white hover:emerald-900 p-1 rounded-full"
                        >
                          Pay {payitems}
                        </button>
                      </div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="grid grid-cols-8 text-gray-400 text-xs">
                      <div className="justify-center items-center flex flex-col">
                        id
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Status
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Phone
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Name
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
                              "Today " + format(createdAtDate, "HH:mm"); // Set as "Today"
                          } else if (isYesterday(createdAtDate)) {
                            // Check if the message was sent yesterday
                            formattedCreatedAt =
                              "Yesterday " + format(createdAtDate, "HH:mm"); // Set as "Yesterday"
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
                          <li className="w-full" key={index}>
                            <div
                              className={`p-1 mt-1 rounded-sm grid grid-cols-8 gap-1 w-full items-center text-xs bg-gray-900`}
                            >
                              <div className="gap-1 flex items-center">
                                <input
                                  type="checkbox"
                                  onChange={(e) => handleCheckboxChange(e, bet)}
                                />
                                {bet.id}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                <div
                                  className={`flex flex-col p-1 justify-center items-center w-[70px] rounded-full ${
                                    bet.status === "pending"
                                      ? "bg-yellow-600"
                                      : bet.status === "failed"
                                      ? "bg-red-600 "
                                      : "bg-green-600"
                                  }`}
                                >
                                  {bet.status}
                                </div>
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.phone}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.name}
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
                              <div className="justify-center items-center flex flex-col">
                                <DeleteConfirmation
                                  id={bet.id}
                                  record={"withdraw"}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              {activeTab === 3 && (
                <>
                  <div>
                    <div className="m-1 flex flex-col text-white text-sm">
                      <div className="text-lg font-bold">TOP BETS</div>
                      <div className="text-gray-400">No. {Bets.length}</div>
                      <div className="text-gray-400">
                        Bets KES. {totalbet.toFixed(2)}
                      </div>
                      <div className="text-gray-400">
                        Cashout KES. {totalcashout.toFixed(2)}
                      </div>
                      <div>
                        {totalbet - totalcashout < 0 ? (
                          <div className="text-red-600 font-bold">
                            Loss KES. {(totalbet - totalcashout).toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-green-600 font-bold">
                            Profit KES. {(totalbet - totalcashout).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 items-center mt-2 mb-2">
                        <div>
                          <label htmlFor="start-date">Start Date: </label>
                          <DatePicker
                            id="start-date"
                            className="text-black rounded-lg p-1"
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                          />
                        </div>
                        <div>
                          <label htmlFor="end-date">End Date: </label>
                          <DatePicker
                            id="end-date"
                            className="text-black rounded-lg p-1"
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            dateFormat="yyyy-MM-dd"
                          />
                        </div>
                        <button
                          className="w-[150px] bg-orange-600 text-white hover:orange-900 p-1 rounded-full"
                          onClick={handleFetchBets}
                        >
                          Fetch Bets
                        </button>
                        <button
                          onClick={handleDeleteBet}
                          className="w-[150px] bg-emerald-600 text-white hover:emerald-900 p-1 rounded-full"
                        >
                          Delete {betsitems}
                        </button>
                        <button
                          onClick={handleClick}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Generate and Post Random Bets
                        </button>
                      </div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="grid grid-cols-8 text-gray-400 text-xs">
                      <div className="justify-center items-center flex flex-col">
                        id
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        User
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Status
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Bet KES
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Multiplier
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Cashout
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Date
                      </div>

                      <div className="justify-center items-center flex flex-col">
                        Action
                      </div>
                    </div>
                    <ul className="w-full">
                      {Bets.map((bet: any, index) => {
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
                              "Today " + format(createdAtDate, "HH:mm"); // Set as "Today"
                          } else if (isYesterday(createdAtDate)) {
                            // Check if the message was sent yesterday
                            formattedCreatedAt =
                              "Yesterday " + format(createdAtDate, "HH:mm"); // Set as "Yesterday"
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
                        const cashoutmultiplier = bet.multiplier;
                        const bgColor =
                          cashoutmultiplier >= 6
                            ? "text-[#9F1C90]"
                            : cashoutmultiplier >= 2
                            ? "text-[#4490CC]"
                            : cashoutmultiplier >= 1
                            ? "text-[#7848B6]"
                            : "text-[#29aa08]";
                        return (
                          <li className="w-full" key={index}>
                            <div
                              className={`p-1 mt-1 rounded-sm grid grid-cols-8 gap-1 w-full items-center text-xs ${
                                bet.status === "Win"
                                  ? "bg-[#103408] border border-[#4D6936]"
                                  : "bg-gray-900 "
                              }`}
                            >
                              <div className="gap-1 flex items-center">
                                <input
                                  type="checkbox"
                                  onChange={(e) =>
                                    handleCheckboxChangebets(e, bet)
                                  }
                                />
                                {bet.id}
                              </div>
                              <div className="flex gap-1 items-center">
                                <RandomAvatar />{" "}
                                {bet.name
                                  ? bet.name.substring(0, 2) + "***"
                                  : "***"}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.status}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                KES {Number(bet.bet).toFixed(0)}
                              </div>
                              <div
                                className={`flex flex-col p-1 justify-center items-center bg-gray-900 rounded-full ${bgColor}`}
                              >
                                {bet.multiplier}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                KES {Number(bet.cashout).toFixed(0)}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {formattedCreatedAt}
                              </div>

                              <div className="justify-center items-center flex flex-col">
                                <DeleteConfirmation
                                  id={bet.id}
                                  record={"bets"}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              {activeTab === 4 && (
                <>
                  <div className="w-full">
                    <div className="m-1 flex flex-col text-white text-sm">
                      <div className="text-lg font-bold">Players</div>
                      <div className="text-gray-400">No. {Players.length}</div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="grid grid-cols-3 text-gray-400 text-xs">
                      <div className="justify-center items-center flex flex-col">
                        Name
                      </div>
                      <div className="justify-center items-center flex flex-col">
                        Account
                      </div>

                      <div className="justify-center items-center flex flex-col">
                        id
                      </div>
                    </div>
                    <ul className="w-full">
                      {Players.map((bet: any, index) => {
                        //  totalb = totalb + bet.amount;
                        //  settotalbalance(totalb);
                        return (
                          <li className="w-full" key={index}>
                            <div
                              className={`p-1 mt-1 rounded-sm grid grid-cols-3 gap-1 w-full items-center text-xs bg-gray-900`}
                            >
                              <div className="flex gap-1 items-center">
                                <RandomAvatar /> {bet.name}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.phone}
                              </div>
                              <div className="justify-center items-center flex flex-col">
                                {bet.id}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              {activeTab === 5 && (
                <>
                  <div className="w-full">
                    <div className="m-1 flex flex-col text-white text-sm">
                      <div className="text-lg font-bold">Settings</div>
                    </div>

                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="items-center flex flex-col justify-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground p-2">
                          Game settings.
                        </p>
                      </div>
                      <div className="grid gap-2 bg-gray-700 rounded-lg p-5 w-full lg:w-[800px]">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Min. Deposit (KES)</Label>
                          <Input
                            id="mindeposit"
                            value={mindeposit}
                            onChange={(e) => setmindeposit(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Max. Deposit (KES)</Label>
                          <Input
                            id="maxdeposit"
                            value={maxdeposit}
                            onChange={(e) => setmaxdeposit(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Min. Withdraw (KES)</Label>
                          <Input
                            id="minwithdraw"
                            value={minwithdraw}
                            onChange={(e) => setminwithdraw(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxHeight">Max. Withdraw (KES)</Label>
                          <Input
                            id="maxwithdraw"
                            value={maxwithdraw}
                            onChange={(e) => setmaxwithdraw(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxWidth">Min. Bet (KES)</Label>
                          <Input
                            id="minbet"
                            value={minbet}
                            onChange={(e) => setminbet(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxWidth">Max. Bet (KES)</Label>
                          <Input
                            id="maxbet"
                            value={maxbet}
                            onChange={(e) => setmaxbet(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">
                            houseEdge %(recommended 0.1)
                          </Label>
                          <Input
                            id="houseEdge"
                            value={houseEdge}
                            onChange={(e) => sethouseEdge(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">level A (p % 5 === 0)</Label>
                          <Input
                            id="levelA"
                            value={levelA}
                            onChange={(e) => setlevelA(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Level B (r = 0.20)</Label>
                          <Input
                            id="levelB"
                            value={levelB}
                            onChange={(e) => setlevelB(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Paybill</Label>
                          <Input
                            id="paybill"
                            value={paybill}
                            onChange={(e) => setpaybill(e.target.value)}
                            className="col-span-2 h-8 text-gray-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <button
                            onClick={handleSettings}
                            className="w-[150px] bg-emerald-600 text-white hover:emerald-900 p-1 rounded-full"
                          >
                            Save settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 6 && (
                <>
                  <div className="w-full">
                    <div className="border-gray-900 border w-full mb-1"></div>
                    <div className="items-center flex flex-col justify-center">
                      <Chat senderId={senderId} senderName={senderName} />
                    </div>
                  </div>
                </>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default page;
