"use client";
import React, { useState, useEffect, useRef } from "react";
import Crash from "../components/Crash";
import { useToast } from "@/components/ui/use-toast";
import RandomAvatar from "./RandomAvatar";
import { format, isToday, isYesterday } from "date-fns";
import Aviator from "./Aviator";
import GameBackground from "./GameBackground";
import ToggleSwitch from "./ToggleSwitch";
import SliderSwitch from "./SliderSwitch";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import MobileNav from "./MobileNav";
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Waiting from "./Waiting";
import Placebet from "./Placebet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomToast from "./CustomToast";
import { toast } from "react-toastify";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
//import TextField from "@mui/material/TextField";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  Timestamp,
  onSnapshot,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import Balance from "./Balance";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteBet, updateBalance, updateBets } from "@/lib/actions";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { AnyPtrRecord } from "dns";
import Gameanimation from "./Gameanimation";
import { requeststkpush } from "@/lib/requeststkpush";
import useWebSocket from "../hooks/useWebSocket";
import Button from "@mui/material/Button";
import Link from "next/link";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AppRegistrationOutlinedIcon from "@mui/icons-material/AppRegistrationOutlined";
import Share from "./Share";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import ChatWindow from "./ChatWindow";
import FloatingChatIcon from "./FloatingChatIcon";
import Avatar from "./Avatar";
import Termspopup from "./termspopup";
import Account from "./Account";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import TextField from "@mui/material/TextField/TextField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Scroll from "./Scroll";
import {
  getUserIDFromCookie,
  removeUserIDFromCookie,
  setUserIDInCookie,
} from "./cookies";
interface userData {
  name: string;
  phone: string;
  createdAt: Timestamp; // Assuming createdAt is a Firestore timestamp
}
interface Betsdata {
  phone: string;
  bet: number;
  betno: number;
  multiplier: number;
  cashout: number;
  createdAt: Timestamp; // Assuming createdAt is a Firestore timestamp
  status: string;
}

async function fetchBetsByPhone(phone: string) {
  try {
    // Create a reference to the "bets" collection
    const betsRef = collection(db, "bets");

    // Create a query against the collection
    const betsQuery = query(
      betsRef,
      where("phone", "==", phone),
      limit(100)
      // Note: We're not using orderBy here
    );

    // Execute the query
    const querySnapshot = await getDocs(betsQuery);

    // Process the results
    const bets: any = [];
    querySnapshot.forEach((doc) => {
      bets.push({ id: doc.id, ...doc.data() });
    });

    // Sort bets by createdAt field in descending order
    bets.sort(
      (a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis()
    );

    return bets;
  } catch (error) {
    console.error("Error fetching bets: ");
  }
}
async function fetchTopBets() {
  try {
    const betsRef = collection(db, "bets");
    const betsQuery = query(betsRef, orderBy("cashout", "desc"), limit(200));

    const querySnapshot = await getDocs(betsQuery);

    const bets: any = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "Win" && data.cashout > 500) {
        bets.push({ id: doc.id, ...doc.data() });
      }
    });

    return bets;
  } catch (error) {
    console.error("Error fetching bets: ");
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
const Game: React.FC = () => {
  const {
    house,
    multiplier,
    gameStatus,
    isConnected,
    currentBets,
    betstatus,
    placeBet,
    cashOut,
    removeBet,
    houseEdgeValue,
  } = useWebSocket();

  const [bet, setBet] = useState<number>(10);
  const [betValue, setbetValue] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  //const [balance, setBalance] = useState(() => {
  //const savedBalance = sessionStorage.getItem("balance");
  //return savedBalance !== null ? parseFloat(savedBalance) : 0;
  //});
  const [multipliers, setMultipliers] = useState<number[]>([]);
  const [cashoutmultiplier, setcashoutMultiplier] = useState<number>(1);
  const [cashoutmultiplier2, setcashoutMultiplier2] = useState<number>(1);
  const [userID, setuserID] = useState("");
  const [userstatus, setuserstatus] = useState("");
  const [username, setusername] = useState("");
  const [phonenumber, setphonenumber] = useState("");
  const [password, setpassword] = useState("");
  const [passwordconfirm, setpasswordconfirm] = useState("");

  const placeBetSound = useRef<HTMLAudioElement | null>(null);
  const CancelSound = useRef<HTMLAudioElement | null>(null);
  const cashOutSound = useRef<HTMLAudioElement | null>(null);

  const [updateserver, setupdateserver] = useState<boolean>(false);
  const [isMusicPlaying1, setIsMusicPlaying1] = useState<boolean>(true);
  const [isSubmitting, setisSubmitting] = useState<boolean>(false);

  // const [betearns, setbetearns] = useState<number>(0); // Example initial balance
  const [autoCashoutMultipler, setautoCashoutMultipler] = useState("1.1");
  const [autoCashoutMultipler2, setautoCashoutMultipler2] = useState("1.1");
  // const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [BetMode, setBetMode] = useState(true);

  const handleBet = async () => {
    if (gameStatus === "running" && betValue > 0 && BetMode === false) {
      //setBalance(balance + bet * multiplier);
      sessionStorage.setItem(
        "balance",
        (balance + bet * multiplier).toString()
      );
      setBalance(balance + bet * multiplier);
      setBetMode(true);
      setbetValue(0);
      setcashoutMultiplier(multiplier);
      cashOut(username, 1);
      setisbetOn(true);
      if (cashOutSound.current && isMusicPlaying1) {
        cashOutSound.current.play();
      }

      //update server cashout
      try {
        const userQuery = query(
          collection(db, "balance"),
          where("phone", "==", userID)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const bal = Number(userData.amount) + Number(bet * multiplier);

          const betno = 1;
          const cashout = Number(bet * multiplier);
          const status = "Win";
          updateBalance(userID, bal);
          updateBets(userID, bet, betno, multiplier, cashout, status);
          toast({
            title: "Win!",
            description: "Cashout KES " + (bet * multiplier).toFixed(2),
            duration: 5000,
            className: "bg-green-600 text-white",
          });
        }
      } catch (error) {
        console.error("Error connecting server: ", error);
      }
      //update server cashout

      // Switch back to place bet mode
    } else {
      if (gameStatus === "running" && multiplier === 1) {
        toast({
          variant: "destructive",
          title: "Connecting...",
          description: "Please wait!",
          duration: 5000,
        });
      } else {
        if (bet > 0) {
          if (
            BetMode === false &&
            betValue > 0 &&
            betstatus === "bettingphase"
          ) {
            sessionStorage.setItem("balance", (balance + bet).toString());
            setBalance(balance + bet);
            setbetValue(0);
            setBetMode(true);
            removeBet(bet, 1);
            setisbetOn(true);
            if (CancelSound.current && isMusicPlaying1) {
              CancelSound.current.play();
            }
            //cancel bet
            try {
              const userQuery = query(
                collection(db, "balance"),
                where("phone", "==", userID)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                if (Number(userData.amount) >= Number(bet)) {
                  const bal = Number(userData.amount) + Number(bet);
                  updateBalance(userID, bal);
                  deleteBet(userID, bet, 1, "placed");
                }
              }
            } catch (error) {
              console.error("Error connecting server: ", error);
            }
            //cancel bet
          } else {
            if (balance > bet) {
              if (
                gameStatus === "crashed" &&
                BetMode === true &&
                betValue === 0 &&
                betstatus === "bettingphase"
              ) {
                if (bet < Number(minbet)) {
                  toast({
                    title: "Minimum bet KES: " + minbet,
                    description: "Kindly increase your Bet amount!",
                    className: "bg-orange-400 text-gray-900",
                    duration: 5000,
                  });
                  return;
                }
                if (bet > Number(maxbet)) {
                  toast({
                    title: "Maximum bet KES: " + maxbet,
                    description: "Kindly lower your Bet amount!",
                    className: "bg-orange-400 text-gray-900",
                    duration: 5000,
                  });
                  return;
                }
                sessionStorage.setItem("balance", (balance - bet).toString());
                setBalance(balance - bet);
                setBet(bet);
                setbetValue(bet);
                setBetMode(false);
                placeBet(bet, username.substring(0, 2) + "***", 1, 1);
                setisbetOn(false);
                //  alert("bety" + bet);
                // setbetearns(bet);
                if (placeBetSound.current && isMusicPlaying1) {
                  placeBetSound.current.play();
                }

                //update server
                try {
                  const userQuery = query(
                    collection(db, "balance"),
                    where("phone", "==", userID)
                  );
                  const userSnapshot = await getDocs(userQuery);
                  if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();

                    const bal = Number(userData.amount) - Number(bet);
                    updateBalance(userID, bal);
                    await addDoc(collection(db, "bets"), {
                      phone: userID,
                      name: username,
                      bet: Number(bet),
                      betno: 1,
                      multiplier: 1,
                      cashout: 0,
                      status: "placed",
                      createdAt: serverTimestamp(),
                    });
                  }
                } catch (error) {
                  console.error("Error connecting server: ", error);
                }
                //update server
              } else {
                setBetMode(true);
                toast({
                  variant: "destructive",
                  title: "Wait Placing Time",
                  description: "Place your bet in the next round!",
                  duration: 5000,
                });
              }
            } else {
              setBetMode(true);
              toast({
                variant: "destructive",
                title: "Failed",
                description: "Insufficient Funds!",
                duration: 5000,
              });
            }
          }
        } else {
          toast({
            variant: "destructive",
            title: "No Bet Amount!",
            description: "Please enter your bet!",
            duration: 5000,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (gameStatus === "crashed") {
      setMultipliers((prevMultipliers) => [...prevMultipliers, multiplier]);
      // console.log("crashed att " + multiplier);
      setisbetOn(true);
      setisbetOn2(true);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (
      isOnCashout &&
      BetMode === false &&
      betValue > 0 &&
      gameStatus === "running" &&
      multiplier.toFixed(2) >= parseFloat(autoCashoutMultipler).toFixed(2)
    ) {
      //alert("isOnCashout");
      setBalance(balance + bet * parseFloat(autoCashoutMultipler));
      sessionStorage.setItem(
        "balance",
        (balance + bet * parseFloat(autoCashoutMultipler)).toString()
      );

      setBetMode(true);
      setbetValue(0);
      setcashoutMultiplier(parseFloat(autoCashoutMultipler));
      cashOut(username, 1);
      setisbetOn(true);

      const bal = balance + bet * parseFloat(autoCashoutMultipler);
      const cashout = bet * parseFloat(autoCashoutMultipler);
      updateBalance(userID, bal);
      const status = "Win";
      updateBets(
        userID,
        bet,
        1,
        parseFloat(autoCashoutMultipler),
        cashout,
        status
      );
      toast({
        title: "Win!",
        description:
          "Cashout KES " + (bet * parseFloat(autoCashoutMultipler)).toFixed(2),
        duration: 5000,
        className: "bg-green-600 text-white",
      });

      if (cashOutSound.current && isMusicPlaying1) {
        cashOutSound.current.play();
      }
    }

    if (
      isOnCashout2 &&
      BetMode2 === false &&
      betValue2 > 0 &&
      gameStatus === "running" &&
      multiplier.toFixed(2) >= parseFloat(autoCashoutMultipler2).toFixed(2)
    ) {
      setBalance(balance + bet2 * parseFloat(autoCashoutMultipler2));
      sessionStorage.setItem(
        "balance",
        (balance + bet2 * parseFloat(autoCashoutMultipler2)).toString()
      );
      setBetMode2(true);
      setbetValue2(0);
      setcashoutMultiplier2(parseFloat(autoCashoutMultipler2));
      cashOut(username, 2);
      setisbetOn2(true);
      const bal = balance + bet2 * parseFloat(autoCashoutMultipler2);
      const cashout = bet2 * parseFloat(autoCashoutMultipler2);
      updateBalance(userID, bal);
      const status = "Win";
      updateBets(
        userID,
        bet2,
        2,
        parseFloat(autoCashoutMultipler2),
        cashout,
        status
      );
      toast({
        title: "Win!",
        description:
          "Cashout KES " +
          (bet2 * parseFloat(autoCashoutMultipler2)).toFixed(2),
        duration: 5000,
        className: "bg-green-600 text-white",
      });

      if (cashOutSound.current && isMusicPlaying1) {
        cashOutSound.current.play();
      }
    }
    //  alert(currentBets);
  }, [multiplier, currentBets]);
  const [minwithdraw, setminwithdraw] = useState("500");
  const [maxwithdraw, setmaxwithdraw] = useState("any");
  const [mindeposit, setmindeposit] = useState("10");
  const [maxdeposit, setmaxdeposit] = useState("any");
  const [minbet, setminbet] = useState("5");
  const [maxbet, setmaxbet] = useState("5000");
  const [houseEdge, sethouseEdge] = useState("0");
  const [levelA, setlevelA] = useState("1");
  const [levelB, setlevelB] = useState("1");
  const [range1, setrange1] = useState("0.2");
  const [range2, setrange2] = useState("0.6");
  const [range3, setrange3] = useState("0.85");
  const [range4, setrange4] = useState("0.95");
  const [paybill, setpaybill] = useState("155276");
  const [message, setmessage] = useState([]);
  useEffect(() => {
    const user_id = sessionStorage.getItem("userID");

    if (user_id) {
      setuserID(user_id);
      const loadbalance = async () => {
        const userQuery = query(
          collection(db, "balance"),
          where("phone", "==", user_id)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();

          setBalance(Number(userData.amount));
          sessionStorage.setItem("balance", userData.amount);
        }
      };
      loadbalance();
    }
    const username_id = sessionStorage.getItem("username");
    if (username_id) {
      setusername(username_id);
    }

    const status_id = sessionStorage.getItem("status");
    if (status_id) {
      setuserstatus(status_id);
    }

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
        setrange1(userData.range1);
        setrange2(userData.range2);
        setrange3(userData.range3);
        setrange4(userData.range4);
        setpaybill(userData.paybill);
        const messages = userData.message
          .split("*")
          .map((msg: any) => `<p>${msg}</p>`);
        setmessage(messages);
      }
    };
    loadSettings();
  }, []);
  // Effect to run when balance changes

  useEffect(() => {
    setupdateserver(true);
    if (gameStatus === "crashed" && betstatus === "bettingphase") {
      setupdateserver(true);
    }
    if (
      gameStatus === "crashed" &&
      betstatus === "updateserver" &&
      updateserver
    ) {
      //((prevMultipliers) => [...prevMultipliers, multiplier]);
      //console.log("crashed at " + multiplier);
      // setisbetOn(true);
      // setisbetOn2(true);
      // const scrollToBottom = () => {
      // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // };
      // scrollToBottom();
      if (userID !== "") {
        const loadbalance = async () => {
          const userQuery = query(
            collection(db, "balance"),
            where("phone", "==", userID)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();

            setBalance(Number(userData.amount));
            sessionStorage.setItem("balance", userData.amount);
          }
        };
        loadbalance();

        //if (Number(house) !== Number(houseEdge) && Number(houseEdge) > 0) {
        houseEdgeValue(
          Number(houseEdge),
          Number(levelA),
          Number(levelB),
          Number(range1),
          Number(range2),
          Number(range3),
          Number(range4)
        );

        //}
      }
      setupdateserver(false);
    }
    if (
      BetMode === false &&
      gameStatus === "crashed" &&
      betValue > 0 &&
      betstatus === "updateserver"
    ) {
      updateBets(userID, bet, 1, 0, 0, "Loss");
      setbetValue(0);
      setBetMode(true);
    }
    if (
      BetMode2 === false &&
      gameStatus === "crashed" &&
      betValue2 > 0 &&
      betstatus === "updateserver"
    ) {
      updateBets(userID, bet2, 2, 0, 0, "Loss");
      setbetValue2(0);
      setBetMode2(true);
    }
    if (
      BetMode === true &&
      isOnBet &&
      gameStatus === "crashed" &&
      betstatus === "bettingphase"
    ) {
      if (bet > 0) {
        const bl = sessionStorage.getItem("balance");
        if (Number(bl) >= bet) {
          const bal = Number(bl) - bet;
          // alert(bet + "-" + bal);
          setBalance(bal);
          sessionStorage.setItem("balance", bal.toString());
          placeBet(bet, username.substring(0, 2) + "***", 1, 1);
          setbetValue(bet);
          setBetMode(false);
          setisbetOn(false);

          if (placeBetSound.current && isMusicPlaying1) {
            placeBetSound.current.play();
          }
          //update server
          const placebetServer = async () => {
            try {
              const userQuery = query(
                collection(db, "balance"),
                where("phone", "==", userID)
              );

              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();

                const bal = Number(userData.amount) - Number(bet);
                updateBalance(userID, bal);
                await addDoc(collection(db, "bets"), {
                  phone: userID,
                  name: username,
                  bet: Number(bet),
                  betno: 1,
                  multiplier: 1,
                  cashout: 0,
                  status: "placed",
                  createdAt: serverTimestamp(),
                });
              }
            } catch (error) {
              console.error("Error connecting server: ", error);
            }
          };
          placebetServer();
          //update server
        }
      }
    }

    if (
      BetMode2 === true &&
      isOnBet2 &&
      gameStatus === "crashed" &&
      betstatus === "bettingphase"
    ) {
      if (bet2 > 0) {
        const bl = sessionStorage.getItem("balance");
        if (Number(bl) >= bet2) {
          const bal = Number(bl) - bet2;
          // alert(bet2 + "-" + bal);
          setBalance(bal);
          sessionStorage.setItem("balance", bal.toString());
          placeBet(bet2, username.substring(0, 2) + "***", 2, 1);
          setbetValue2(bet2);
          setBetMode2(false);
          setisbetOn2(false);

          if (placeBetSound.current && isMusicPlaying1) {
            placeBetSound.current.play();
          }
          //update server
          const placebetServer = async () => {
            try {
              const userQuery = query(
                collection(db, "balance"),
                where("phone", "==", userID)
              );

              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();

                const bal = Number(userData.amount) - Number(bet2);
                updateBalance(userID, bal);
                await addDoc(collection(db, "bets"), {
                  phone: userID,
                  name: username,
                  bet: Number(bet2),
                  betno: 2,
                  multiplier: 1,
                  cashout: 0,
                  status: "placed",
                  createdAt: serverTimestamp(),
                });
              }
            } catch (error) {
              console.error("Error connecting server: ", error);
            }
          };
          placebetServer();
          //update server
        }
        // setBetMode2(false);
      }
    }

    // console.log(`Balance changed: ${balance}`);
    // Perform any other actions you want to take on balance change

    const user_id = sessionStorage.getItem("userID");
    if (user_id) {
      setuserID(user_id);
    }
    const username_id = sessionStorage.getItem("username");
    if (username_id) {
      setusername(username_id);
    }

    const status_id = sessionStorage.getItem("status");
    if (status_id) {
      setuserstatus(status_id);
    }
  }, [gameStatus, balance, username, userID, betstatus]);

  const [BetMode2, setBetMode2] = useState(true);
  //const [betearns2, setbetearns2] = useState<number>(0); // Example initial balance
  const [bet2, setBet2] = useState<number>(10);
  const [betValue2, setbetValue2] = useState<number>(0);
  const handleBet2 = async () => {
    if (gameStatus === "running" && betValue2 > 0 && BetMode2 === false) {
      //setBalance(balance + bet * multiplier);
      sessionStorage.setItem(
        "balance",
        (balance + bet2 * multiplier).toString()
      );
      setBalance(balance + bet2 * multiplier);
      setBetMode2(true);
      setbetValue2(0);
      setcashoutMultiplier2(multiplier);
      cashOut(username, 2);
      setisbetOn2(true);
      if (cashOutSound.current && isMusicPlaying1) {
        cashOutSound.current.play();
      }

      //update server cashout
      try {
        const userQuery = query(
          collection(db, "balance"),
          where("phone", "==", userID)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const bal = Number(userData.amount) + Number(bet2 * multiplier);

          const betno = 2;
          const cashout = Number(bet2 * multiplier);
          const status = "Win";
          updateBalance(userID, bal);
          updateBets(userID, bet2, betno, multiplier, cashout, status);
          toast({
            title: "Win!",
            description: "Cashout KES " + (bet2 * multiplier).toFixed(2),
            duration: 5000,
            className: "bg-green-600 text-white",
          });
        }
      } catch (error) {
        console.error("Error connecting server: ", error);
      }
      //update server cashout

      // Switch back to place bet mode
    } else {
      if (gameStatus === "running" && multiplier === 1) {
        toast({
          variant: "destructive",
          title: "Connecting...",
          description: "Please wait!",
          duration: 5000,
        });
      } else {
        if (bet2 > 0) {
          if (
            BetMode2 === false &&
            betValue2 > 0 &&
            betstatus === "bettingphase"
          ) {
            sessionStorage.setItem("balance", (balance + bet2).toString());
            setBalance(balance + bet2);
            setbetValue2(0);
            setBetMode2(true);
            removeBet(bet2, 2);
            setisbetOn2(true);
            if (CancelSound.current && isMusicPlaying1) {
              CancelSound.current.play();
            }
            //cancel bet
            try {
              const userQuery = query(
                collection(db, "balance"),
                where("phone", "==", userID)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                if (Number(userData.amount) >= Number(bet2)) {
                  const bal = Number(userData.amount) + Number(bet2);
                  updateBalance(userID, bal);
                  deleteBet(userID, bet2, 2, "placed");
                }
              }
            } catch (error) {
              console.error("Error connecting server: ", error);
            }
            //cancel bet
          } else {
            if (balance > bet2) {
              if (
                gameStatus === "crashed" &&
                BetMode2 === true &&
                betValue2 === 0 &&
                betstatus === "bettingphase"
              ) {
                if (bet2 < Number(minbet)) {
                  toast({
                    title: "Minimum bet KES: " + minbet,
                    description: "Kindly increase your Bet amount!",
                    className: "bg-orange-400 text-gray-900",
                    duration: 5000,
                  });
                  return;
                }
                if (bet2 > Number(maxbet)) {
                  toast({
                    title: "Maximum bet KES: " + maxbet,
                    description: "Kindly lower your Bet amount!",
                    className: "bg-orange-400 text-gray-900",
                    duration: 5000,
                  });
                  return;
                }
                sessionStorage.setItem("balance", (balance - bet2).toString());
                setBalance(balance - bet2);
                setBet2(bet2);
                setbetValue2(bet2);
                setBetMode2(false);
                setisbetOn2(false);
                placeBet(bet2, username.substring(0, 2) + "***", 2, 1);
                //  alert("bety" + bet);
                // setbetearns(bet);
                if (placeBetSound.current && isMusicPlaying1) {
                  placeBetSound.current.play();
                }

                //update server
                try {
                  const userQuery = query(
                    collection(db, "balance"),
                    where("phone", "==", userID)
                  );
                  const userSnapshot = await getDocs(userQuery);
                  if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();

                    const bal = Number(userData.amount) - Number(bet2);
                    updateBalance(userID, bal);
                    await addDoc(collection(db, "bets"), {
                      phone: userID,
                      name: username,
                      bet: Number(bet2),
                      betno: 2,
                      multiplier: 1,
                      cashout: 0,
                      status: "placed",
                      createdAt: serverTimestamp(),
                    });
                  }
                } catch (error) {
                  console.error("Error connecting server: ", error);
                }
                //update server
              } else {
                setBetMode2(true);
                toast({
                  variant: "destructive",
                  title: "Wait Placing Time",
                  description: "Place your bet in the next round!",
                  duration: 5000,
                });
              }
            } else {
              setBetMode2(true);
              toast({
                variant: "destructive",
                title: "Failed",
                description: "Insufficient Funds!",
                duration: 5000,
              });
            }
          }
        } else {
          toast({
            variant: "destructive",
            title: "No Bet Amount!",
            description: "Please enter your bet!",
            duration: 5000,
          });
        }
      }
    }
  };
  const [isBet, setIsBet] = useState(true);
  const toggleSwitch = () => {
    setIsBet(!isBet);
    if (isBet === false) {
      setIsOnCashout(false);
      setIsOnBet(false);
    }
  };
  const [isOnCashout, setIsOnCashout] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const toggleSwitchcashout = () => {
    setIsOnCashout(!isOnCashout);
    if (!isOnCashout && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const [isOnBet, setIsOnBet] = useState(false);
  const toggleSwitchbet = () => {
    setIsOnBet(!isOnBet);
    if (bet < Number(minbet)) {
      toast({
        title: "Minimum bet KES: " + minbet,
        description: "Kindly increase your Bet amount!",
        className: "bg-orange-400 text-gray-900",
        duration: 5000,
      });
      setIsOnBet(false);
    }
    if (bet > Number(maxbet)) {
      toast({
        title: "Maximum bet KES: " + maxbet,
        description: "Kindly lower your Bet amount!",
        className: "bg-orange-400 text-gray-900",
        duration: 5000,
      });
      setIsOnBet(false);
    }
    if (isBet === false) {
      setBetMode(true);
      setbetValue(0);
    }
  };

  const [isBet2, setIsBet2] = useState(true);
  const toggleSwitch2 = () => {
    setIsBet2(!isBet2);
    if (isBet2 === false) {
      setIsOnCashout2(false);
      setIsOnBet2(false);
    }
  };
  const [isOnCashout2, setIsOnCashout2] = useState(false);
  const toggleSwitchcashout2 = () => {
    setIsOnCashout2(!isOnCashout2);
    if (!isOnCashout2 && inputRef2.current) {
      inputRef2.current.focus();
    }
  };

  const [isOnBet2, setIsOnBet2] = useState(false);

  const toggleSwitchbet2 = () => {
    setIsOnBet2(!isOnBet2);
    if (bet2 < Number(minbet)) {
      toast({
        title: "Minimum bet KES: " + minbet,
        description: "Kindly increase your Bet amount!",
        className: "bg-orange-400 text-gray-900",
        duration: 5000,
      });
      setIsOnBet2(false);
    }
    if (bet2 > Number(maxbet)) {
      toast({
        title: "Maximum bet KES: " + maxbet,
        description: "Kindly lower your Bet amount!",
        className: "bg-orange-400 text-gray-900",
        duration: 5000,
      });
      setIsOnBet2(false);
    }
    if (isBet2 === false) {
      setBetMode2(true);
      setbetValue2(0);
    }
  };

  const getButtonClass = () => {
    if (!BetMode) {
      if (gameStatus === "running" && betValue > 0) {
        return "bg-orange-500";
      }
      return "bg-red-500";
    }
    return "bg-emerald-600";
  };
  const getButtonClass2 = () => {
    if (!BetMode2) {
      if (gameStatus === "running" && betValue2 > 0) {
        return "bg-orange-500";
      }
      return "bg-red-500";
    }
    return "bg-emerald-600";
  };
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: "All Bets", content: "all bets." },
    { title: "My Bets", content: "my bets" },
    { title: "Top", content: "top bets" },
  ];

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const delay = 100; // Delay in milliseconds (e.g., 2000ms = 2 seconds)

  useEffect(() => {
    let audio: any;
    if (soundEnabled) {
      // Create the audio element
      audio = new Audio("/backgroundMusic.mp3");
      audio.loop = false; // Disable native looping

      // Add an event listener to handle the end of the audio playback
      audio.addEventListener("ended", () => {
        // Add a delay before playing again
        setTimeout(() => {
          audio.play();
        }, delay);
      });

      // Play the audio initially with a delay
      setTimeout(() => {
        audio.play();
      }, delay);

      setAudioElement(audio);
    } else {
      // Stop the audio and clear the audio element if sound is disabled
      if (audioElement) {
        audioElement.pause();
        audioElement.removeEventListener("ended", () => {});
      }
      setAudioElement(null);
    }

    // Cleanup function to remove the event listener when the component unmounts or soundEnabled changes
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener("ended", () => {});
      }
    };
  }, [soundEnabled]);
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleToggleMusic1 = () => {
    setIsMusicPlaying1(!isMusicPlaying1);
  };
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
  const handleCountryCodeChange = (e: any) => {
    setCountryCode(e.target.value);
  };
  const handleInputChange = (e: any) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setphonenumber(formatted);
  };

  const [errorusername, seterrorusername] = useState(""); // Default country code
  const [errorphonenumber, seterrorphonenumber] = useState(""); // Default country code
  const [errorpassword, seterrorpassword] = useState(""); // Default country code
  const [errorpasswordconfirm, seterrorpasswordconfirm] = useState(""); // Default country code
  const [errorphonenumberL, seterrorphonenumberL] = useState(""); // Default country code
  const [errorpasswordL, seterrorpasswordL] = useState(""); // Default country code
  const [isChecked, setIsChecked] = useState(false);
  const [errorterms, seterrorterms] = useState(""); // Default country code

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    if (username.trim() === "") {
      seterrorusername("Enter Your Name");
      return;
    }
    if (phonenumber.trim() === "") {
      seterrorphonenumber("Enter Your Phone Number");
      return;
    }
    if (password.trim() === "") {
      seterrorpassword("Enter Your Password");
      return;
    }
    if (password.trim() !== passwordconfirm.trim()) {
      seterrorpasswordconfirm("Password don't match!");
      return;
    }
    if (!isChecked) {
      seterrorterms("Please accept the terms and conditions.");
      return;
    }
    try {
      const userQuery = query(
        collection(db, "aviator_users"),
        where(
          "phone",
          "==",
          removeLeadingPlus(countryCode) + removeLeadingZero(phonenumber)
        )
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Failed!",
          description:
            "You have already registered with: " +
            removeLeadingPlus(countryCode) +
            removeLeadingZero(phonenumber),
          duration: 5000,
        });
      } else {
        await addDoc(collection(db, "aviator_users"), {
          name: username,
          phone:
            removeLeadingPlus(countryCode) + removeLeadingZero(phonenumber),
          password: password,
          status: "user",
          createdAt: serverTimestamp(),
        });
        setuserID(
          removeLeadingPlus(countryCode) + removeLeadingZero(phonenumber)
        );
        setusername(username);
        setuserstatus("user");
        sessionStorage.setItem("username", username);
        sessionStorage.setItem(
          "userID",
          removeLeadingPlus(countryCode) + removeLeadingZero(phonenumber)
        );
        sessionStorage.setItem("status", "user");
        sessionStorage.setItem("balance", "0");
        setBalance(0);
        toast({
          title: "Successful",
          description: "You have registered successfully",
          duration: 5000,
          className: "bg-green-600 text-white",
        });
        setIsAlertDialog(false);
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    // setValue("");
  };
  const [IsAlertDialog, setIsAlertDialog] = useState(false);

  const handleclickAlertDialog = () => {
    setIsAlertDialog(false);
  };
  const [IsAlertDialogL, setIsAlertDialogL] = useState(false);

  const handleclickAlertDialogL = () => {
    setIsAlertDialogL(false);
  };
  const handleLoginRegister = () => {
    setIsAlertDialogL(false);
    setIsAlertDialog(true);
  };
  const handleRegisterLogin = () => {
    setIsAlertDialog(false);
    setIsAlertDialogL(true);
  };
  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (phonenumber.trim() === "") {
      seterrorphonenumberL("Enter Your Phone Number");
      return;
    }
    if (password.trim() === "") {
      seterrorpasswordL("Enter Your Password");
      return;
    }

    try {
      const userQuery = query(
        collection(db, "aviator_users"),
        where(
          "phone",
          "==",
          removeLeadingPlus(countryCode) + removeLeadingZero(phonenumber)
        ),
        where("password", "==", password)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Failed!",
          description: "Invalid login details!!",
          duration: 5000,
        });
      } else {
        const userData = userSnapshot.docs[0].data();

        sessionStorage.setItem("username", userData.name);
        sessionStorage.setItem("userID", userData.phone);
        sessionStorage.setItem("status", userData.status);

        setuserID(userData.phone);
        setusername(userData.name);
        setuserstatus(userData.status);
        setUserIDInCookie(userData.phone);

        //check balance

        const balQuery = query(
          collection(db, "balance"),
          where("phone", "==", userData.phone)
        );
        const balSnapshot = await getDocs(balQuery);
        if (!balSnapshot.empty) {
          const balData = balSnapshot.docs[0].data();
          sessionStorage.setItem("balance", balData.amount);
          setBalance(Number(balData.amount));
        }
        //balance
        // setuserID(countryCode + removeLeadingZero(phonenumber));

        setIsAlertDialogL(false);
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    // setValue("");
  };
  useEffect(() => {
    const userIDFromCookie = getUserIDFromCookie();

    if (userIDFromCookie) {
      const loadsession = async () => {
        try {
          const userQuery = query(
            collection(db, "aviator_users"),
            where("phone", "==", userIDFromCookie)
          );
          const userSnapshot = await getDocs(userQuery);
          if (userSnapshot.empty) {
          } else {
            const userData = userSnapshot.docs[0].data();

            sessionStorage.setItem("username", userData.name);
            sessionStorage.setItem("userID", userData.phone);
            sessionStorage.setItem("status", userData.status);

            setuserID(userData.phone);
            setusername(userData.name);
            setuserstatus(userData.status);

            //check balance

            const balQuery = query(
              collection(db, "balance"),
              where("phone", "==", userData.phone)
            );
            const balSnapshot = await getDocs(balQuery);
            if (!balSnapshot.empty) {
              const balData = balSnapshot.docs[0].data();
              sessionStorage.setItem("balance", balData.amount);
              setBalance(Number(balData.amount));
            }
            //balance
          }
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      };
      loadsession();
    }
  }, []);
  const handleLogout = () => {
    removeUserIDFromCookie();
    sessionStorage.setItem("username", "");
    sessionStorage.setItem("userID", "");
    sessionStorage.setItem("status", "");
    sessionStorage.setItem("balance", "0");

    setuserID("");
    setusername("");
    setuserstatus("");

    // Reload the current page
    //window.location.reload();
  };

  //ACOUNT
  const [IsAlertDialogP, setIsAlertDialogP] = useState(false);

  const handleclickAlertDialogP = () => {
    setIsAlertDialogP(false);
  };

  const [activeTabb, setActiveTabb] = useState(0);
  const [deposit, setdeposit] = useState("");
  const [stkresponse, setstkresponse] = useState("");
  const [errorstkresponse, errorsetstkresponse] = useState("");
  const [payphone, setpayphone] = useState(userID);
  const [errordeposit, seterrordeposit] = useState("");
  const [errormpesaphone, seterrormpesaphone] = useState("");

  const [withdraw, setwithdraw] = useState("");
  const [sendphone, setsendphone] = useState(userID);
  const [errorwithdraw, seterrorwithdraw] = useState("");
  const [errorwithdrawphone, seterrorwithdrawphone] = useState("");

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
          setBalance(newAmount);
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
  //ACCOUNT
  const [mybets, setmybets] = useState<any[]>([]);
  const [topbets, settopbets] = useState<any[]>([]);
  const handleMybets = async (index: number) => {
    setActiveTab(index);
    if (index === 1) {
      fetchBetsByPhone(userID).then((bets) => {
        //  console.log("Bets for phone number:", bets);
        setmybets(bets);
      });
    } else if (index === 2) {
      //fetchTopBets().then((bets) => {
      //  console.log("Bets for phone number:", bets);
      // settopbets(bets);
      // });
      RandomTopPlayers();
    }
  };
  const RandomTopPlayers = () => {
    const players = [];
    const numberOfPlayers = Math.floor(Math.random() * (150 - 20 + 1)) + 20; // Random number of players between 20 and 150

    for (let i = 0; i < numberOfPlayers; i++) {
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
      players.push({
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
    settopbets(players);
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
    const now: any = new Date();
    const startOfDay: any = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Calculate the total minutes from the start of the day to the current time
    const totalMinutes = Math.floor((now - startOfDay) / 1000 / 60);

    // Generate a random number of minutes within the range from the start of the day to the current time
    const randomMinutes = Math.floor(Math.random() * totalMinutes);

    // Create a new date with the random minutes added to the start of the day
    const randomDate = new Date(startOfDay);
    randomDate.setMinutes(randomDate.getMinutes() + randomMinutes);

    // Convert the random date to a Firestore Timestamp (assuming you are using Firebase)
    const randomTimestamp = Timestamp.fromDate(randomDate);

    return randomTimestamp;
  };

  const [isPopover, setisPopover] = useState<boolean>(false);
  const handleclickPopover = () => {
    setisPopover(false);
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const [isOpen1, setIsOpen1] = useState(false);

  const toggleMenu1 = () => {
    setIsOpen1(!isOpen1);
  };

  const [isOpenAccount, setisOpenAccount] = useState(false);
  const toggleAccount = () => {
    setisOpenAccount(!isOpenAccount);
    setIsAlertDialog(false);
  };

  const [isOpenAcc, setisOpenAcc] = useState(false);
  const toggleAcc = () => {
    setisOpenAcc(!isOpenAcc);
    const loadbalance = async () => {
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        setBalance(Number(userData.amount));
        sessionStorage.setItem("balance", userData.amount);
      }
    };
    loadbalance();
  };

  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const toggleMenuHistory = () => {
    setIsOpenHistory(!isOpenHistory);
  };

  const [isOpen2, setIsOpen2] = useState(false);
  const toggleMenu2 = () => {
    setIsOpen2(!isOpen2);
  };
  const [isChatOpen, setChatOpen] = useState(false);
  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };
  const [isbetOn, setisbetOn] = useState(true);
  const [isbetOn2, setisbetOn2] = useState(true);

  const downloadUrl = "https://aviatorgm.com/download/aviator-game.apk";
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
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <section className="bg-gray-800 p-2 rounded-lg shadow-lg container mx-auto">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex gap-3 p-1 items-center">
              <div className="rounded-full overflow-hidden hidden lg:inline">
                <Image
                  src="/logo1.png"
                  width={100}
                  height={24}
                  alt="game logo"
                />
              </div>
              <div className="rounded-full overflow-hidden lg:hidden">
                <Image
                  src="/logo1.png"
                  width={100}
                  height={24}
                  alt="game logo"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center text-xs">
            {/* Second Betting Area  <p>Server: {isConnected ? "Connected" : "Disconnected"}</p>
              <div className="text-xs text-gray-600">
              <p>
                {isConnected ? "Connected" : "Disconnected"}{" "}
                <FontAwesomeIcon
                  icon={isConnected ? faCircle : faCircleNotch}
                  className={isConnected ? "text-green-500" : "text-red-500"}
                />
              </p>
            </div>
            <div className="text-xs">
              Game status:{gameStatus}-{betstatus}
            </div>
             */}

            <div className="flex gap-2 items-center">
              <Popover open={isPopover}>
                <PopoverTrigger
                  asChild
                  onClick={() => {
                    setisPopover(true);
                  }}
                >
                  <div className="flex p-1 cursor-pointer text-xs text-gray-900 bg-orange-400 items-center rounded-full hover:bg-orange-500">
                    <div className="hidden lg:inline">
                      <div className="flex gap-1 items-center ">
                        <div className="">How to play</div>
                        <div>
                          <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center lg:hidden">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex gap-1 items-center">
                              <div>
                                <HelpOutlineOutlinedIcon
                                  sx={{ fontSize: 16 }}
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>How to play</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 lg:w-[400px] bg-gray-900">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <div className="text-orange-400 font-bold">
                        How to Play
                      </div>
                      <div
                        onClick={handleclickPopover}
                        className="cursor-pointer text-white"
                      >
                        <CloseOutlinedIcon />
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="p-2">
                        <h3 className="font-medium leading-none text-white mb-2">
                          1. Understanding the Game Interface:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            <strong>Rocket Display:</strong> The main display
                            shows a rocket taking off.
                          </li>
                          <li>
                            <strong>Multiplier Display:</strong> A multiplier
                            value (e.g., 1.00x, 1.50x) that increases as the
                            rocket continues to fly.
                          </li>
                          <li>
                            <strong>Betting Panel:</strong> Where you place your
                            bets and cash out.
                          </li>
                        </ul>

                        <h3 className="font-medium leading-none text-white mb-2">
                          2. Placing a Bet:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            <strong>Choose Bet Amount:</strong> Select the
                            amount you want to bet. This can usually be done by
                            entering a value or using predefined buttons
                            (e.g.,KES 100, KES 500, KES 1000).
                          </li>
                          <li>
                            <strong>Confirm Bet:</strong> Once the amount is
                            set, confirm your bet before the rocket takes off.
                          </li>
                          <li>
                            <strong>Auto Bet:</strong> You can enable auto bet
                            feature, allowing you to place your bet
                            automatically based on the amount set.
                          </li>
                        </ul>
                        <h3 className="font-medium leading-none text-white mb-2">
                          3. Watching the Flight:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            The rocket takes off, and the multiplier begins to
                            increase from 1.00x upwards.
                          </li>
                          <li>
                            The longer the rocket flies, the higher the
                            multiplier.
                          </li>
                        </ul>
                        <h3 className="font-medium leading-none text-white mb-2">
                          4. Cash Out:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            <strong>Manual Cash Out:</strong> You can cash out
                            at any time by clicking the "Cash Out" button. Your
                            winnings are calculated as Bet Amount x Multiplier
                            at the time you cash out.
                          </li>
                          <li>
                            <strong>Auto Cash Out:</strong> You can enable auto
                            cash-out feature, allowing you to set a specific
                            multiplier at which you automatically cash out.
                          </li>
                        </ul>
                        <h3 className="font-medium leading-none text-white mb-2">
                          5. Avoiding a Crash:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            If the rocket crashes before you cash out, you lose
                            your bet. The timing of the crash is random and can
                            happen at any point.
                          </li>
                        </ul>
                        <h3 className="font-medium leading-none text-white mb-2">
                          6. Game Rounds:
                        </h3>
                        <ul className="mb-4 text-xs w-full text-gray-400">
                          <li>
                            Each game round is relatively short, typically
                            lasting a few seconds to a minute.
                          </li>
                          <li>
                            After a crash, a new round starts, and you can place
                            a new bet.
                          </li>
                        </ul>
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>

              {userID !== "" ? (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1 items-center">
                    <div
                      onClick={toggleAcc}
                      className="flex cursor-pointer bg-gray-700 pl-2 pr-2 rounded-full gap-1 items-center"
                    >
                      <div className="text-xs text-gray-400">KES:</div>{" "}
                      <div className="text-lg font-bold text-green-600">
                        {balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {/*ACCOUNT*/}
                  <div className="relative lg:hidden">
                    <button
                      onClick={toggleMenu}
                      className="p-2 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="absolute right-0 mt-2 p-2 w-48 bg-[#273445] rounded-md shadow-xl z-20">
                        <div className="flex items-center justify-between text-white p-1">
                          <h3 className="text-sm text-gray-400"></h3>

                          <div
                            onClick={toggleMenu}
                            className="cursor-pointer text-white"
                          >
                            <CloseOutlinedIcon />
                          </div>
                        </div>

                        <div
                          onClick={toggleAcc}
                          className="flex text-lg cursor-pointer items-center gap-1 block px-4 py-2  text-gray-400 hover:bg-gray-900 hover:rounded-full"
                        >
                          <PersonOutlineOutlinedIcon /> Account
                        </div>
                        <div
                          onClick={handleLogout}
                          className="flex text-lg cursor-pointer items-center gap-1 block px-4 py-2  text-gray-400 hover:bg-gray-900 hover:rounded-full"
                        >
                          <LockOutlinedIcon />
                          Logout
                        </div>
                        {userstatus === "admin" && (
                          <>
                            <div
                              onClick={() =>
                                router.push("/xadmn_893dhflsncch_crs")
                              }
                              className="flex text-lg cursor-pointer items-center gap-1 block px-4 py-2  text-gray-400 hover:bg-gray-900 hover:rounded-full"
                            >
                              <AdminPanelSettingsOutlinedIcon /> Admin
                            </div>
                          </>
                        )}
                        <a href={downloadUrl} download>
                          <button className="bg-emerald-600 text-sm text-white hover:bg-emerald-900 p-2 w-full mt-2 rounded-full">
                            Download App
                          </button>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:inline">
                    <div className="flex gap-2">
                      <div
                        className="p-[5px] rounded-full bg-[#273445] text-gray-100 tooltip tooltip-bottom hover:cursor-pointer"
                        data-tip="Profile"
                        onClick={toggleAcc}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PersonOutlineOutlinedIcon />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Account</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {/*ACCOUNT*/}

                      {userstatus === "admin" && (
                        <>
                          <div
                            className="p-[5px] rounded-full bg-[#273445] text-gray-100 tooltip tooltip-bottom hover:cursor-pointer"
                            data-tip="admin"
                            onClick={() =>
                              router.push("/xadmn_893dhflsncch_crs")
                            }
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AdminPanelSettingsOutlinedIcon />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Admin</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </>
                      )}

                      <div
                        className="p-[5px] rounded-full bg-[#273445] text-gray-100 tooltip tooltip-bottom hover:cursor-pointer"
                        data-tip="Logout"
                        onClick={handleLogout}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <LockOutlinedIcon />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Logout</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1">
                  <div className="relative lg:hidden">
                    <button
                      onClick={toggleMenu1}
                      className="p-2 text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                    {isOpen1 && (
                      <div className="absolute right-0 mt-2 p-2 w-48 bg-[#273445] rounded-md shadow-xl z-20">
                        <div className="flex items-center justify-between text-white p-1">
                          <h3 className="text-sm text-gray-400"></h3>

                          <div
                            onClick={toggleMenu1}
                            className="cursor-pointer text-white"
                          >
                            <CloseOutlinedIcon />
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            setIsAlertDialogL(true);
                          }}
                          className="flex text-lg cursor-pointer items-center gap-1 block px-4 py-2 text-gray-400 hover:bg-gray-900 hover:rounded-full"
                        >
                          <LoginOutlinedIcon /> Login
                        </div>

                        <div
                          onClick={() => {
                            setIsAlertDialog(true);
                          }}
                          className="flex text-lg cursor-pointer items-center gap-1 block px-4 py-2 text-gray-400 hover:bg-gray-900 hover:rounded-full"
                        >
                          <AppRegistrationOutlinedIcon /> Register
                        </div>

                        <a href={downloadUrl} download>
                          <button className="bg-emerald-600 text-sm text-white hover:bg-emerald-900 p-2 w-full mt-2 rounded-full">
                            Download App
                          </button>
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:inline">
                    <div className="flex gap-1">
                      <AlertDialog open={IsAlertDialogL}>
                        <AlertDialogTrigger
                          onClick={() => {
                            setIsAlertDialogL(true);
                          }}
                        >
                          <button className="w-[70px] lg:w-[100px] text-gray-100 bg-[#273445] font-bold p-1 items-center rounded-full hover:bg-gray-900">
                            Login
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              <div className="p-1 flex flex-col justify-center items-center w-full">
                                <div className="rounded-full overflow-hidden">
                                  <Image
                                    src="/logo1.png"
                                    width={100}
                                    height={24}
                                    alt="game logo"
                                  />
                                </div>
                                <div className="text-green-600 mt-2 font-bold">
                                  LOGIN
                                </div>
                              </div>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="p-1 w-full items-center">
                                <div className="flex text-gray-400  mb-5 items-center gap-3">
                                  <div className="flex w-full gap-1">
                                    <select
                                      className="text-sm bg-gray-800 text-gray-200 p-1 border ml-0 rounded-sm w-[120px]"
                                      value={countryCode}
                                      onChange={handleCountryCodeChange}
                                    >
                                      <option value="+254">Kenya (+254)</option>
                                      <option value="+213">
                                        Algeria (+213)
                                      </option>
                                      <option value="+244">
                                        Angola (+244)
                                      </option>
                                      <option value="+229">Benin (+229)</option>
                                      <option value="+267">
                                        Botswana (+267)
                                      </option>
                                      <option value="+226">
                                        Burkina Faso (+226)
                                      </option>
                                      <option value="+257">
                                        Burundi (+257)
                                      </option>
                                      <option value="+237">
                                        Cameroon (+237)
                                      </option>
                                      <option value="+238">
                                        Cape Verde (+238)
                                      </option>
                                      <option value="+236">
                                        Central African Republic (+236)
                                      </option>
                                      <option value="+235">Chad (+235)</option>
                                      <option value="+269">
                                        Comoros (+269)
                                      </option>
                                      <option value="+243">
                                        Democratic Republic of the Congo (+243)
                                      </option>
                                      <option value="+253">
                                        Djibouti (+253)
                                      </option>
                                      <option value="+20">Egypt (+20)</option>
                                      <option value="+240">
                                        Equatorial Guinea (+240)
                                      </option>
                                      <option value="+291">
                                        Eritrea (+291)
                                      </option>
                                      <option value="+268">
                                        Eswatini (+268)
                                      </option>
                                      <option value="+251">
                                        Ethiopia (+251)
                                      </option>
                                      <option value="+241">Gabon (+241)</option>
                                      <option value="+220">
                                        Gambia (+220)
                                      </option>
                                      <option value="+233">Ghana (+233)</option>
                                      <option value="+224">
                                        Guinea (+224)
                                      </option>
                                      <option value="+245">
                                        Guinea-Bissau (+245)
                                      </option>
                                      <option value="+225">
                                        Ivory Coast (+225)
                                      </option>
                                      <option value="+266">
                                        Lesotho (+266)
                                      </option>
                                      <option value="+231">
                                        Liberia (+231)
                                      </option>
                                      <option value="+218">Libya (+218)</option>
                                      <option value="+261">
                                        Madagascar (+261)
                                      </option>
                                      <option value="+265">
                                        Malawi (+265)
                                      </option>
                                      <option value="+223">Mali (+223)</option>
                                      <option value="+222">
                                        Mauritania (+222)
                                      </option>
                                      <option value="+230">
                                        Mauritius (+230)
                                      </option>
                                      <option value="+212">
                                        Morocco (+212)
                                      </option>
                                      <option value="+258">
                                        Mozambique (+258)
                                      </option>
                                      <option value="+264">
                                        Namibia (+264)
                                      </option>
                                      <option value="+227">Niger (+227)</option>
                                      <option value="+234">
                                        Nigeria (+234)
                                      </option>
                                      <option value="+242">
                                        Republic of the Congo (+242)
                                      </option>
                                      <option value="+250">
                                        Rwanda (+250)
                                      </option>
                                      <option value="+239">
                                        Sao Tome and Principe (+239)
                                      </option>
                                      <option value="+221">
                                        Senegal (+221)
                                      </option>
                                      <option value="+248">
                                        Seychelles (+248)
                                      </option>
                                      <option value="+232">
                                        Sierra Leone (+232)
                                      </option>
                                      <option value="+252">
                                        Somalia (+252)
                                      </option>
                                      <option value="+27">
                                        South Africa (+27)
                                      </option>
                                      <option value="+211">
                                        South Sudan (+211)
                                      </option>
                                      <option value="+249">Sudan (+249)</option>
                                      <option value="+255">
                                        Tanzania (+255)
                                      </option>
                                      <option value="+228">Togo (+228)</option>
                                      <option value="+216">
                                        Tunisia (+216)
                                      </option>
                                      <option value="+256">
                                        Uganda (+256)
                                      </option>
                                      <option value="+260">
                                        Zambia (+260)
                                      </option>
                                      <option value="+263">
                                        Zimbabwe (+263)
                                      </option>
                                    </select>
                                    <Input
                                      id="phone"
                                      placeholder="Phone Number"
                                      value={phonenumber}
                                      onChange={handleInputChange}
                                      className="p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                    />
                                  </div>
                                </div>
                                <div className="text-red-400">
                                  {errorphonenumberL}
                                </div>

                                <div className="flex text-gray-400 mb-5 items-center">
                                  <div className="flex flex-col gap-1 w-full relative">
                                    <Input
                                      id="password"
                                      type={showPassword ? "text" : "password"}
                                      value={password}
                                      placeholder="Password"
                                      onChange={(e) =>
                                        setpassword(e.target.value)
                                      }
                                      className="w-full p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                    />
                                    <div
                                      onClick={togglePasswordVisibility}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                    >
                                      {showPassword ? (
                                        <FaEyeSlash />
                                      ) : (
                                        <FaEye />
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-red-400">
                                    {errorpasswordL}
                                  </div>
                                </div>

                                <div
                                  onClick={handleLoginRegister}
                                  className="text-xs flex flex-col gap-1 mb-5 w-full text-gray-500 hover:text-green-600 cursor-pointer"
                                >
                                  Don't have account? Register
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={handleclickAlertDialogL}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogin}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog open={IsAlertDialog}>
                        <AlertDialogTrigger
                          onClick={() => {
                            setIsAlertDialog(true);
                          }}
                        >
                          <button className="w-[70px] lg:w-[100px] text-gray-100 p-1 font-bold items-center rounded-full bg-[#273445] mr-3 hover:bg-gray-900">
                            Register
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              <div className="p-1 flex flex-col justify-center items-center w-full">
                                <div className="rounded-full overflow-hidden">
                                  <Image
                                    src="/logo1.png"
                                    width={100}
                                    height={24}
                                    alt="game logo"
                                  />
                                </div>
                                <div className="text-green-600 mt-2 font-bold">
                                  REGISTER
                                </div>
                              </div>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="p-1 w-full items-center">
                                <div className="flex text-gray-400  mb-5 items-center gap-3">
                                  <Input
                                    id="name"
                                    value={username}
                                    placeholder="Name"
                                    onChange={(e) =>
                                      setusername(e.target.value)
                                    }
                                    className="p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                  />
                                </div>
                                <div className="text-red-400">
                                  {errorusername}
                                </div>

                                <div className="flex text-gray-400  mb-5 items-center gap-3">
                                  <div className="flex w-full gap-1">
                                    <select
                                      className="text-sm bg-gray-800 text-gray-200 p-1 border ml-0 rounded-sm w-[120px]"
                                      value={countryCode}
                                      onChange={handleCountryCodeChange}
                                    >
                                      <option value="+254">Kenya (+254)</option>
                                      <option value="+213">
                                        Algeria (+213)
                                      </option>
                                      <option value="+244">
                                        Angola (+244)
                                      </option>
                                      <option value="+229">Benin (+229)</option>
                                      <option value="+267">
                                        Botswana (+267)
                                      </option>
                                      <option value="+226">
                                        Burkina Faso (+226)
                                      </option>
                                      <option value="+257">
                                        Burundi (+257)
                                      </option>
                                      <option value="+237">
                                        Cameroon (+237)
                                      </option>
                                      <option value="+238">
                                        Cape Verde (+238)
                                      </option>
                                      <option value="+236">
                                        Central African Republic (+236)
                                      </option>
                                      <option value="+235">Chad (+235)</option>
                                      <option value="+269">
                                        Comoros (+269)
                                      </option>
                                      <option value="+243">
                                        Democratic Republic of the Congo (+243)
                                      </option>
                                      <option value="+253">
                                        Djibouti (+253)
                                      </option>
                                      <option value="+20">Egypt (+20)</option>
                                      <option value="+240">
                                        Equatorial Guinea (+240)
                                      </option>
                                      <option value="+291">
                                        Eritrea (+291)
                                      </option>
                                      <option value="+268">
                                        Eswatini (+268)
                                      </option>
                                      <option value="+251">
                                        Ethiopia (+251)
                                      </option>
                                      <option value="+241">Gabon (+241)</option>
                                      <option value="+220">
                                        Gambia (+220)
                                      </option>
                                      <option value="+233">Ghana (+233)</option>
                                      <option value="+224">
                                        Guinea (+224)
                                      </option>
                                      <option value="+245">
                                        Guinea-Bissau (+245)
                                      </option>
                                      <option value="+225">
                                        Ivory Coast (+225)
                                      </option>
                                      <option value="+266">
                                        Lesotho (+266)
                                      </option>
                                      <option value="+231">
                                        Liberia (+231)
                                      </option>
                                      <option value="+218">Libya (+218)</option>
                                      <option value="+261">
                                        Madagascar (+261)
                                      </option>
                                      <option value="+265">
                                        Malawi (+265)
                                      </option>
                                      <option value="+223">Mali (+223)</option>
                                      <option value="+222">
                                        Mauritania (+222)
                                      </option>
                                      <option value="+230">
                                        Mauritius (+230)
                                      </option>
                                      <option value="+212">
                                        Morocco (+212)
                                      </option>
                                      <option value="+258">
                                        Mozambique (+258)
                                      </option>
                                      <option value="+264">
                                        Namibia (+264)
                                      </option>
                                      <option value="+227">Niger (+227)</option>
                                      <option value="+234">
                                        Nigeria (+234)
                                      </option>
                                      <option value="+242">
                                        Republic of the Congo (+242)
                                      </option>
                                      <option value="+250">
                                        Rwanda (+250)
                                      </option>
                                      <option value="+239">
                                        Sao Tome and Principe (+239)
                                      </option>
                                      <option value="+221">
                                        Senegal (+221)
                                      </option>
                                      <option value="+248">
                                        Seychelles (+248)
                                      </option>
                                      <option value="+232">
                                        Sierra Leone (+232)
                                      </option>
                                      <option value="+252">
                                        Somalia (+252)
                                      </option>
                                      <option value="+27">
                                        South Africa (+27)
                                      </option>
                                      <option value="+211">
                                        South Sudan (+211)
                                      </option>
                                      <option value="+249">Sudan (+249)</option>
                                      <option value="+255">
                                        Tanzania (+255)
                                      </option>
                                      <option value="+228">Togo (+228)</option>
                                      <option value="+216">
                                        Tunisia (+216)
                                      </option>
                                      <option value="+256">
                                        Uganda (+256)
                                      </option>
                                      <option value="+260">
                                        Zambia (+260)
                                      </option>
                                      <option value="+263">
                                        Zimbabwe (+263)
                                      </option>
                                    </select>
                                    <Input
                                      id="phone"
                                      value={phonenumber}
                                      placeholder="Phone Number"
                                      onChange={handleInputChange}
                                      className="p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                    />
                                  </div>
                                </div>
                                <div className="text-red-400">
                                  {errorphonenumber}
                                </div>

                                <div className="flex text-gray-400  mb-5 items-center gap-3">
                                  <Input
                                    id="password"
                                    value={password}
                                    placeholder="Password"
                                    onChange={(e) =>
                                      setpassword(e.target.value)
                                    }
                                    className="p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                  />
                                </div>
                                <div className="text-red-400">
                                  {errorpassword}
                                </div>

                                <div className="flex text-gray-400  mb-5 items-center gap-3">
                                  <Input
                                    id="passwordconfirm"
                                    value={passwordconfirm}
                                    placeholder="Confirm Password"
                                    onChange={(e) =>
                                      setpasswordconfirm(e.target.value)
                                    }
                                    className="p-3 ring-0 bg-gray-800 border border-gray-400 text-gray-400"
                                  />
                                </div>

                                <div className="text-red-400">
                                  {errorpasswordconfirm}
                                </div>

                                <div className="flex flex-col w-full">
                                  <div className="flex items-center mb-10 w-full gap-1 text-gray-400">
                                    <div className="flex items-center w-full gap-1 text-gray-400">
                                      <div>
                                        <input
                                          type="checkbox"
                                          id="terms"
                                          checked={isChecked}
                                          onChange={() =>
                                            setIsChecked(!isChecked)
                                          }
                                          className="mr-2"
                                        />
                                      </div>
                                      <div>
                                        <label
                                          htmlFor="terms"
                                          className="text-gray-400"
                                        ></label>
                                      </div>
                                      <div> I accept the</div>
                                      <div
                                        className="cursor-pointer text-gray-400 hover:text-green-600"
                                        onClick={toggleAccount}
                                      >
                                        terms and conditions
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-red-400">
                                    {errorterms}
                                  </div>
                                </div>
                                <div
                                  onClick={handleRegisterLogin}
                                  className="text-xs flex flex-col gap-1 mb-5 w-full text-gray-500 hover:text-green-600 cursor-pointer"
                                >
                                  I have account? Login
                                </div>
                                <div
                                  onClick={handleRegisterLogin}
                                  className="text-xs items-center flex gap-1 mt-2 mb-5 w-full text-gray-100"
                                >
                                  Age 18 and above only.
                                  <div className="rounded-full">
                                    <Image
                                      src="/18.png"
                                      width={20}
                                      height={20}
                                      alt="over 18"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleclickAlertDialog}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleRegister}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <main className="flex-grow container mx-auto p-1 lg:p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg space-y-6 hidden lg:inline">
          <div className="flex justify-between rounded-full p-1 mb-2">
            <div></div>
            <Share />
          </div>
          <div className="w-full max-w-xl mx-auto mt-2">
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
            <div className="p-0">
              <ScrollArea className="h-[500px]">
                {activeTab === 0 && (
                  <>
                    <div className="w-full">
                      <div className="m-1 flex flex-col text-white text-sm">
                        <div>ALL BETS</div>
                        <div>{currentBets.length}</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-4 text-gray-400 text-xs">
                        <div>User</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cash out KES</div>
                      </div>
                      <ul className="w-full">
                        {currentBets
                          .slice()
                          .reverse()
                          .map((bet: any, index) => {
                            const bgColor =
                              bet.cashoutmultiplier >= 6
                                ? "text-[#9F1C90]"
                                : bet.cashoutmultiplier >= 2
                                ? "text-[#4490CC]"
                                : bet.cashoutmultiplier >= 1
                                ? "text-[#7848B6]"
                                : "text-[#29aa08]";

                            return (
                              <li className="w-full" key={index}>
                                <div
                                  className={`p-1 mt-1 rounded-sm grid grid-cols-4 gap-1 w-full items-center text-xs ${
                                    bet.cashoutStatus === true
                                      ? "bg-[#103408] border border-[#4D6936]"
                                      : "bg-gray-900 "
                                  }`}
                                >
                                  <div className="flex gap-1 items-center">
                                    <RandomAvatar /> {bet.username}
                                  </div>
                                  <div>KES {bet.bet}</div>
                                  <div>
                                    {bet.cashoutStatus === false ? (
                                      <>{bet.multiplier.toFixed(2)}</>
                                    ) : (
                                      <div
                                        className={`flex flex-col p-1 justify-center items-center w-[70px] bg-gray-900 rounded-full ${bgColor}`}
                                      >
                                        {bet.cashoutmultiplier.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    {bet.cashoutStatus === false ? (
                                      <>
                                        KES{" "}
                                        {(bet.bet * bet.multiplier).toFixed(0)}
                                      </>
                                    ) : (
                                      <>
                                        KES{" "}
                                        {(
                                          bet.bet * bet.cashoutmultiplier
                                        ).toFixed(0)}
                                      </>
                                    )}
                                  </div>
                                  <div></div>
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
                        <div>MY BETS</div>
                        <div>{mybets.length}</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-5 text-gray-400 text-xs">
                        <div>Status</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cash out KES</div>
                        <div>Date</div>
                      </div>
                      <ul className="w-full">
                        {mybets.map((bet: any, index) => {
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
                                className={`p-1 mt-1 rounded-sm grid grid-cols-5 gap-1 w-full items-center text-xs ${
                                  bet.status === "Win"
                                    ? "bg-[#103408] border border-[#4D6936]"
                                    : "bg-gray-900 "
                                }`}
                              >
                                <div>{bet.status}</div>
                                <div>KES {bet.bet}</div>
                                <div
                                  className={`flex flex-col p-1 justify-center items-center bg-gray-900 rounded-full ${bgColor}`}
                                >
                                  {bet.multiplier}
                                </div>
                                <div>KES {bet.cashout}</div>
                                <div>{formattedCreatedAt}</div>

                                <div></div>
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
                      <div className="m-1 flex flex-col text-white text-sm">
                        <div>TOP BETS</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-6 text-gray-400 text-xs">
                        <div>User</div>
                        <div>Status</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cashout</div>
                        <div>Date</div>
                      </div>
                      <ul className="w-full">
                        {topbets.map((bet: any, index) => {
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
                          const bgColor =
                            multiplier >= 6
                              ? "text-[#9F1C90]"
                              : multiplier >= 2
                              ? "text-[#4490CC]"
                              : multiplier >= 1
                              ? "text-[#7848B6]"
                              : "text-[#29aa08]";
                          return (
                            <li className="w-full" key={index}>
                              <div
                                className={`p-1 mt-1 rounded-sm grid grid-cols-6 gap-1 w-full items-center text-xs ${
                                  bet.status === "Win"
                                    ? "bg-[#103408] border border-[#4D6936]"
                                    : "bg-gray-900 "
                                }`}
                              >
                                <div className="flex gap-1 col-span-1 items-center">
                                  <RandomAvatar />{" "}
                                  {bet.name
                                    ? bet.name.substring(0, 2) + "***"
                                    : "***"}
                                </div>
                                <div>{bet.status}</div>
                                <div>KES {Number(bet.bet).toFixed(0)}</div>
                                <div
                                  className={`flex flex-col p-1 justify-center items-center bg-gray-900 rounded-full ${bgColor}`}
                                >
                                  {bet.multiplier}
                                </div>
                                <div>KES {Number(bet.cashout).toFixed(0)}</div>
                                <div>{formattedCreatedAt}</div>

                                <div></div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-full gap-2 flex justify-between items-center mb-2">
            <div className="relative">
              <button
                onClick={toggleMenu2}
                className="p-1 gap-1 flex text-xs text-gray-200 rounded-full ring-1 bg-[#273445] ring-gray-500"
              >
                <VolumeUpOutlinedIcon sx={{ fontSize: 14 }} />
                Sound
              </button>
              {isOpen2 && (
                <div className="absolute left-0 mt-2 py-2 w-56 bg-[#273445] rounded-md shadow-xl z-20">
                  <div className="flex items-center justify-between text-white p-1">
                    <h3 className="text-sm text-gray-100">Sound</h3>
                    <div
                      onClick={toggleMenu2}
                      className="cursor-pointer text-white"
                    >
                      <CloseOutlinedIcon />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-1 mb-2">
                    <label className="block text-xs text-gray-400">
                      {soundEnabled
                        ? "Pause background music"
                        : "Play background music"}
                    </label>
                    <div
                      className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                        soundEnabled ? "bg-[#DE3D26]" : "bg-gray-400"
                      }`}
                      onClick={toggleSound}
                    >
                      <div
                        className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          soundEnabled ? "translate-x-8" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex flex justify-between items-center p-1">
                    <label className="block text-xs text-gray-400">
                      {isMusicPlaying1
                        ? "Pause Sound Effect"
                        : "Play Sound Effect"}
                    </label>
                    <div
                      className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                        isMusicPlaying1 ? "bg-[#DE3D26]" : "bg-gray-400"
                      }`}
                      onClick={handleToggleMusic1}
                    >
                      <div
                        className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          isMusicPlaying1 ? "translate-x-8" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="w-full">
              <div className="flex w-full p-0">
                <ul className="flex gap-1 text-sm">
                  {multipliers
                    .slice()
                    .reverse()
                    .map((multiplier: number, index: number) => {
                      const bgColor =
                        multiplier >= 6
                          ? "text-[#9F1C90]"
                          : multiplier >= 2
                          ? "text-[#4490CC]"
                          : multiplier >= 1
                          ? "text-[#7848B6]"
                          : "text-[#29aa08]";

                      return (
                        <li
                          key={index}
                          className={`flex flex-col p-1 justify-center items-center w-[70px] bg-gray-900 rounded-full ${bgColor}`}
                        >
                          x{multiplier.toFixed(2)}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </ScrollArea>

            <div className="relative">
              <button
                onClick={toggleMenuHistory}
                className="p-1 gap-1 W-[100px] text-xs text-gray-200 rounded-full ring-1 bg-[#273445] ring-gray-500"
              >
                <div className="flex gap-2 items-center">
                  <RestoreOutlinedIcon sx={{ fontSize: 14 }} />
                  <ArrowDropDownOutlinedIcon sx={{ fontSize: 14 }} />
                </div>
              </button>
              {isOpenHistory && (
                <div className="absolute right-0 mt-2 py-2 w-[330px] bg-[#273445] rounded-md shadow-xl z-20">
                  <div className="flex items-center justify-between text-white p-1">
                    <h3 className="text-sm text-gray-200">History</h3>

                    <div
                      onClick={toggleMenuHistory}
                      className="cursor-pointer text-white"
                    >
                      <CloseOutlinedIcon />
                    </div>
                  </div>

                  <ScrollArea className="max-h-[400px] p-2">
                    <div className="w-full">
                      <div className="bg-[#273445] grid grid-cols-5 p-1">
                        {multipliers
                          .slice()
                          .reverse()
                          .map((multiplier, index) => {
                            const bgColor =
                              multiplier >= 6
                                ? "text-[#9F1C90]"
                                : multiplier >= 2
                                ? "text-[#4490CC]"
                                : multiplier >= 1
                                ? "text-[#7848B6]"
                                : "text-[#29aa08]";

                            return (
                              <li
                                key={index}
                                className={`flex flex-col m-1 p-1 text-xs justify-center items-center w-[60px] bg-gray-900 rounded-full ${bgColor}`}
                              >
                                x{multiplier.toFixed(2)}
                              </li>
                            );
                          })}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          <Gameanimation
            gameStatus={gameStatus}
            multiplier={multiplier}
            sound={isMusicPlaying1}
          />
          {/*    <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee">
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
              <div className="h-2 w-2 bg-white rounded-full inline-block mx-1"></div>
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .animate-marquee {
                display: inline-block;
                animation: marquee 6s linear infinite;
              }
            `}</style>
          </div> */}
          <div className="p-1 w-full overflow-hidden">
            <div className="inline-block w-full animate-marquee">
              <Scroll messages={message} />
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .animate-marquee {
                display: flex; /* Use flexbox to handle inline content */
                animation: marquee 25s linear infinite;
                white-space: nowrap; /* Prevent line breaks */
              }
            `}</style>
          </div>

          <div className="w-full lg:flex gap-2 items-center justify-center space-y-0">
            <div className="flex w-full p-1 flex-col bg-gray-700 mb-2 lg:mb-0 rounded-lg shadow-lg items-center justify-center">
              <div className="bg-gray-70 mt-2 p-2 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative w-24 h-6 bg-gray-800  rounded-full cursor-pointer"
                    onClick={toggleSwitch}
                  >
                    <div
                      className={`absolute top-0.5 w-12 h-5 bg-white rounded-full flex items-center justify-center transition-transform ${
                        isBet
                          ? "bg-gray-800 translate-x-0"
                          : "bg-gray-800 translate-x-full"
                      }`}
                      style={{
                        transform: isBet ? "translateX(0)" : "translateX(100%)",
                      }}
                    >
                      <span className="text-xs font-bold text-gray-900">
                        {isBet ? "Bet" : "Auto"}
                      </span>
                    </div>
                    <div className="flex justify-between w-full text-xs items-center text-gray-400">
                      <span className="pl-1 mt-1">Bet</span>
                      <span className="pr-1 mt-1">Auto</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex p-3 gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex mb-1 bg-gray-800 rounded-full p-1 h-[30px] justify-between items-center text-white gap-1">
                    <RemoveCircleOutlineOutlinedIcon
                      className="cursor-pointer"
                      onClick={
                        isbetOn === false
                          ? (e) => null
                          : (e) => setBet(bet > 0 ? bet - 1 : 0)
                      }
                      // onClick={(e) => setBet(bet > 0 ? bet - 1 : 0)}
                    />
                    <input
                      type="text"
                      className="w-[100px] bg-gray-800 text-sm p-1 focus:outline-none text-center"
                      value={bet}
                      disabled={!isbetOn}
                      onChange={(e) => setBet(Number(e.target.value))}
                      placeholder="Enter bet amount"
                      // disabled={gameStatus === "running"}
                    />
                    <AddCircleOutlineOutlinedIcon
                      className="cursor-pointer"
                      onClick={
                        isbetOn === false ? (e) => null : (e) => setBet(bet + 1)
                      }
                      //  onClick={(e) => setBet(bet + 1)}
                    />
                  </div>
                  <div className="grid grid-cols-2">
                    <div
                      //  onClick={(e) => setBet(bet + 100)}
                      onClick={
                        isbetOn === false
                          ? (e) => null
                          : (e) => setBet(bet + 100)
                      }
                      className="mt-2 mr-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        100
                      </span>
                    </div>
                    <div
                      // onClick={(e) => setBet(bet + 200)}
                      onClick={
                        isbetOn === false
                          ? (e) => null
                          : (e) => setBet(bet + 200)
                      }
                      className="mt-2 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        200
                      </span>
                    </div>
                    <div
                      //  onClick={(e) => setBet(bet + 500)}
                      onClick={
                        isbetOn === false
                          ? (e) => null
                          : (e) => setBet(bet + 500)
                      }
                      className="mt-1 mr-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        500
                      </span>
                    </div>
                    <div
                      //onClick={(e) => setBet(bet + 1000)}
                      onClick={
                        isbetOn === false
                          ? (e) => null
                          : (e) => setBet(bet + 1000)
                      }
                      className="mt-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        1000
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {BetMode === false && (
                    <>
                      {gameStatus === "running" && betValue > 0 ? (
                        <></>
                      ) : (
                        <div className="flex flex-col w-full items-center text-gray-400 text-xs p-1">
                          Waiting next round
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={
                      userID !== "" ? handleBet : () => setIsAlertDialogL(true)
                    }
                    className={`${getButtonClass()} text-white rounded-lg font-bold py-2 px-4 w-[120px] h-[100px]`}
                  >
                    {BetMode === false ? (
                      <>
                        {gameStatus === "running" && betValue > 0 ? (
                          <>Cashout ${(bet * multiplier).toFixed(2)}</>
                        ) : (
                          <div className="flex flex-col w-full items-center">
                            <div>Cancel</div>
                            <div>BET</div> <div>KES {bet}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col w-full items-center">
                          <div>BET</div> <div>KES {bet}</div>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!isBet && (
                <div className="bg-gray-70 w-full p-1 rounded-lg flex items-center justify-center">
                  <div className="flex mb-1  p-1 h-[30px] justify-between items-center text-white gap-1">
                    <div className="flex items-center mr-6 gap-1">
                      <label className="block text-xs text-gray-400">
                        Auto bet
                      </label>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                            isOnBet ? "bg-emerald-600" : "bg-gray-800"
                          }`}
                          onClick={
                            userID !== ""
                              ? toggleSwitchbet
                              : () => setIsAlertDialogL(true)
                          }
                        >
                          <div
                            className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              isOnBet ? "translate-x-8" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <div>
                        <label className="block text-xs text-gray-400">
                          Auto cashout
                        </label>
                      </div>
                      <div>
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                              isOnCashout ? "bg-emerald-600" : "bg-gray-800"
                            }`}
                            onClick={
                              userID !== ""
                                ? toggleSwitchcashout
                                : () => setIsAlertDialogL(true)
                            }
                          >
                            <div
                              className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                isOnCashout ? "translate-x-8" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          ref={inputRef}
                          className="w-[70px] bg-gray-800 rounded-full text-sm p-1 focus:outline-none text-center"
                          value={autoCashoutMultipler}
                          onChange={(e) =>
                            setautoCashoutMultipler(e.target.value)
                          }
                          disabled={!isOnCashout}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Second Betting Area */}
            <div className="flex w-full p-1 flex-col bg-gray-700 mb-2 rounded-lg shadow-lg items-center justify-center">
              <div className="bg-gray-70 w-full mt-2 p-2 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative w-24 h-6 bg-gray-800  rounded-full cursor-pointer"
                    onClick={toggleSwitch2}
                  >
                    <div
                      className={`absolute top-0.5 w-12 h-5 bg-white rounded-full flex items-center justify-center transition-transform ${
                        isBet
                          ? "bg-gray-800 translate-x-0"
                          : "bg-gray-800 translate-x-full"
                      }`}
                      style={{
                        transform: isBet2
                          ? "translateX(0)"
                          : "translateX(100%)",
                      }}
                    >
                      <span className="text-xs font-bold text-gray-900">
                        {isBet2 ? "Bet" : "Auto"}
                      </span>
                    </div>
                    <div className="flex justify-between w-full text-xs items-center text-gray-400">
                      <span className="pl-1 mt-1">Bet</span>
                      <span className="pr-1 mt-1">Auto</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex p-3 gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex mb-1 bg-gray-800 rounded-full p-1 h-[30px] justify-between items-center text-white gap-1">
                    <RemoveCircleOutlineOutlinedIcon
                      className="cursor-pointer"
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 > 0 ? bet2 - 1 : 0)
                      }
                      //onClick={(e) => setBet2(bet2 > 0 ? bet2 - 1 : 0)}
                    />
                    <input
                      type="text"
                      className="w-[100px] bg-gray-800 text-sm p-1 focus:outline-none text-center"
                      value={bet2}
                      disabled={!isbetOn2}
                      onChange={(e) => setBet2(Number(e.target.value))}
                      placeholder="Enter bet 2 amount"
                      // disabled={gameStatus === "running"}
                    />
                    <AddCircleOutlineOutlinedIcon
                      className="cursor-pointer"
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 + 1)
                      }
                      //onClick={(e) => setBet2(bet2 + 1)}
                    />
                  </div>
                  <div className="grid grid-cols-2">
                    <div
                      // onClick={(e) => setBet2(bet2 + 100)}
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 + 100)
                      }
                      className="mt-2 mr-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        100
                      </span>
                    </div>
                    <div
                      //onClick={(e) => setBet2(bet2 + 200)}
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 + 200)
                      }
                      className="mt-2 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        200
                      </span>
                    </div>
                    <div
                      // onClick={(e) => setBet2(bet2 + 500)}
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 + 500)
                      }
                      className="mt-1 mr-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        500
                      </span>
                    </div>
                    <div
                      //onClick={(e) => setBet2(bet2 + 1000)}
                      // disabled={!isbetOn}
                      onClick={
                        isbetOn2 === false
                          ? (e) => null
                          : (e) => setBet2(bet2 + 1000)
                      }
                      className="mt-1 cursor-pointer w-[60px] h-[25px] bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-gray-400">
                        1000
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {BetMode2 === false && (
                    <>
                      {" "}
                      {gameStatus === "running" && betValue2 > 0 ? (
                        <></>
                      ) : (
                        <div className="flex flex-col w-full items-center text-gray-400 text-xs p-1">
                          Waiting next round
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={
                      userID !== "" ? handleBet2 : () => setIsAlertDialogL(true)
                    }
                    className={`${getButtonClass2()} text-white rounded-lg font-bold py-2 px-4 w-[120px] h-[100px]`}
                  >
                    {BetMode2 === false ? (
                      <>
                        {gameStatus === "running" && betValue2 > 0 ? (
                          <>Cashout ${(bet2 * multiplier).toFixed(2)}</>
                        ) : (
                          <div className="flex flex-col w-full items-center">
                            <div>Cancel</div>
                            <div>BET</div> <div>KES {bet2}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col w-full items-center">
                          <div>BET</div> <div>KES {bet2}</div>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!isBet2 && (
                <div className="bg-gray-70 w-full p-1 rounded-lg flex items-center justify-center">
                  <div className="flex mb-1  p-1 h-[30px] justify-between items-center text-white gap-1">
                    <div className="flex items-center mr-6 gap-1">
                      <label className="block text-xs text-gray-400">
                        Auto bet
                      </label>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                            isOnBet2 ? "bg-emerald-600" : "bg-gray-800"
                          }`}
                          onClick={
                            userID !== ""
                              ? toggleSwitchbet2
                              : () => setIsAlertDialogL(true)
                          }
                        >
                          <div
                            className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              isOnBet2 ? "translate-x-8" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <div>
                        <label className="block text-xs text-gray-400">
                          Auto cashout
                        </label>
                      </div>
                      <div>
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`relative w-12 h-5 rounded-full cursor-pointer transition-colors ${
                              isOnCashout2 ? "bg-emerald-600" : "bg-gray-800"
                            }`}
                            onClick={
                              userID !== ""
                                ? toggleSwitchcashout2
                                : () => setIsAlertDialogL(true)
                            }
                          >
                            <div
                              className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                isOnCashout2 ? "translate-x-8" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          ref={inputRef2}
                          className="w-[70px] bg-gray-800 rounded-full text-sm p-1 focus:outline-none text-center"
                          value={autoCashoutMultipler2}
                          onChange={(e) =>
                            setautoCashoutMultipler2(e.target.value)
                          }
                          disabled={!isOnCashout2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <audio ref={placeBetSound}>
          <source src="/placeBet.mp3" type="audio/mpeg" />
        </audio>
        <audio ref={cashOutSound}>
          <source src="/cashOut.mp3" type="audio/mpeg" />
        </audio>
        <audio ref={CancelSound}>
          <source src="/cancel.mp3" type="audio/mpeg" />
        </audio>
      </main>
      <section className="p-1 container mx-auto lg:hidden">
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg space-y-6">
          <div className="w-full max-w-xl mx-auto mt-2">
            <div className="flex justify-between rounded-full p-1 mb-2">
              <div></div>
              <Share />
            </div>
            <div className="flex bg-gray-900 rounded-full p-1">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`flex-1 py-1 px-0 text-sm rounded-full text-center ${
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
            <div className="p-0">
              <ScrollArea className="h-[500px]">
                {activeTab === 0 && (
                  <>
                    <div className="w-full">
                      <div className="m-1 flex flex-col text-white text-sm">
                        <div>ALL BETS</div>
                        <div>{currentBets.length}</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-4 text-gray-400 text-xs">
                        <div>User</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cash out KES</div>
                      </div>
                      <ul className="w-full">
                        {currentBets
                          .slice()
                          .reverse()
                          .map((bet: any, index) => {
                            const bgColor =
                              bet.cashoutmultiplier >= 6
                                ? "text-[#9F1C90]"
                                : bet.cashoutmultiplier >= 2
                                ? "text-[#4490CC]"
                                : bet.cashoutmultiplier >= 1
                                ? "text-[#7848B6]"
                                : "text-[#29aa08]";

                            return (
                              <li className="w-full" key={index}>
                                <div
                                  className={`p-1 mt-1 rounded-sm grid grid-cols-4 gap-1 w-full items-center text-xs ${
                                    bet.cashoutStatus === true
                                      ? "bg-[#103408] border border-[#4D6936]"
                                      : "bg-gray-900 "
                                  }`}
                                >
                                  <div className="flex gap-1 items-center">
                                    <RandomAvatar /> {bet.username}
                                  </div>
                                  <div>KES {bet.bet}</div>
                                  <div>
                                    {bet.cashoutStatus === false ? (
                                      <>{bet.multiplier.toFixed(2)}</>
                                    ) : (
                                      <div
                                        className={`flex flex-col p-1 justify-center items-center w-[70px] bg-gray-900 rounded-full ${bgColor}`}
                                      >
                                        {bet.cashoutmultiplier.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    {bet.cashoutStatus === false ? (
                                      <>
                                        KES{" "}
                                        {(bet.bet * bet.multiplier).toFixed(0)}
                                      </>
                                    ) : (
                                      <>
                                        KES{" "}
                                        {(
                                          bet.bet * bet.cashoutmultiplier
                                        ).toFixed(0)}
                                      </>
                                    )}
                                  </div>
                                  <div></div>
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
                        <div>MY BETS</div>
                        <div>{mybets.length}</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-5 text-gray-400 text-xs">
                        <div>Status</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cash out KES</div>
                        <div>Date</div>
                      </div>
                      <ul className="w-full">
                        {mybets.map((bet: any, index) => {
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
                                className={`p-1 mt-1 rounded-sm grid grid-cols-5 gap-1 w-full items-center text-xs ${
                                  bet.status === "Win"
                                    ? "bg-[#103408] border border-[#4D6936]"
                                    : "bg-gray-900 "
                                }`}
                              >
                                <div>{bet.status}</div>
                                <div>KES {bet.bet}</div>
                                <div
                                  className={`flex flex-col p-1 justify-center items-center bg-gray-900 rounded-full ${bgColor}`}
                                >
                                  {bet.multiplier}
                                </div>
                                <div>KES {bet.cashout}</div>
                                <div>{formattedCreatedAt}</div>

                                <div></div>
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
                      <div className="m-1 flex flex-col text-white text-sm">
                        <div>TOP BETS</div>
                      </div>

                      <div className="border-gray-900 border w-full mb-1"></div>
                      <div className="grid grid-cols-6 text-gray-400 text-xs">
                        <div>User</div>
                        <div>Status</div>
                        <div>Bet KES</div>
                        <div>Multiplier</div>
                        <div>Cashout</div>
                        <div>Date</div>
                      </div>
                      <ul className="w-full">
                        {topbets.map((bet: any, index) => {
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
                          const bgColor =
                            multiplier >= 6
                              ? "text-[#9F1C90]"
                              : multiplier >= 2
                              ? "text-[#4490CC]"
                              : multiplier >= 1
                              ? "text-[#7848B6]"
                              : "text-[#29aa08]";
                          return (
                            <li className="w-full" key={index}>
                              <div
                                className={`p-1 mt-1 rounded-sm grid grid-cols-6 gap-1 w-full items-center text-xs ${
                                  bet.status === "Win"
                                    ? "bg-[#103408] border border-[#4D6936]"
                                    : "bg-gray-900 "
                                }`}
                              >
                                <div className="flex gap-1 col-span-1 items-center">
                                  <RandomAvatar />{" "}
                                  {bet.name
                                    ? bet.name.substring(0, 2) + "***"
                                    : "***"}
                                </div>
                                <div>{bet.status}</div>
                                <div>KES {Number(bet.bet).toFixed(0)}</div>
                                <div
                                  className={`flex flex-col p-1 justify-center items-center bg-gray-900 rounded-full ${bgColor}`}
                                >
                                  {bet.multiplier}
                                </div>
                                <div>KES {Number(bet.cashout).toFixed(0)}</div>
                                <div>{formattedCreatedAt}</div>

                                <div></div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </section>
      {userID !== "" && (
        <>
          <FloatingChatIcon onClick={toggleChat} />
          <ChatWindow
            isOpen={isChatOpen}
            onClose={toggleChat}
            senderId={userID}
            senderName={username}
            recipientUid={"254728820092"}
          />
        </>
      )}
      ;
      <Termspopup isOpen={isOpenAccount} onClose={toggleAccount} />
      <Account
        isOpen={isOpenAcc}
        userID={userID}
        username={username}
        onClose={toggleAcc}
        balance={balance}
      />
    </div>
  );
};

export default Game;
