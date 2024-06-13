import React, { useEffect, useState } from "react";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RandomAvatar from "./RandomAvatar";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import TextField from "@mui/material/TextField";
import { useToast } from "@/components/ui/use-toast";
type accountProps = {
  userID: string;
  username: string;
};
async function updateBalance(db: any, userID: string, newAmount: number) {
  const q = query(collection(db, "balance"), where("phone", "==", userID));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const docRef = doc.ref;

    // Update the amount field
    updateDoc(docRef, {
      amount: newAmount,
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  });
}

const Account = ({ userID, username }: accountProps) => {
  const [IsAlertDialogP, setIsAlertDialogP] = useState(false);
  const [bal, setBal] = useState(0);
  useEffect(() => {
    const loadbalance = async () => {
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setBal(userData.amount);
      }
    };
    loadbalance();
  }, []);
  const handleclickAlertDialogP = () => {
    setIsAlertDialogP(false);
  };
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [deposit, setdeposit] = useState("");
  const [payphone, setpayphone] = useState(userID);
  const [errordeposit, seterrordeposit] = useState("");
  const [errormpesaphone, seterrormpesaphone] = useState("");

  const [withdraw, setwithdraw] = useState("");
  const [sendphone, setsendphone] = useState(userID);
  const [errorwithdraw, seterrorwithdraw] = useState("");
  const [errorwithdrawphone, seterrorwithdrawphone] = useState("");

  const tabs = [
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

    try {
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        if (Number(userData.amount) >= Number(withdraw)) {
          const newAmount = Number(userData.amount) - Number(withdraw);

          updateBalance(db, userID, newAmount);

          await addDoc(collection(db, "withdraw"), {
            phone: userID,
            sendphone: sendphone,
            amount: Number(withdraw),
            status: "pending",
            createdAt: serverTimestamp(),
          });
          setBal(newAmount);
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
            className: "bg-emerald-600 text-white",
          });
          // window.location.reload();
        } else {
          setwithdraw("");
          toast({
            variant: "destructive",
            title: "Failed",
            description: "Insufficient Funds!",
            duration: 5000,
          });
        }
      } else {
        setwithdraw("");

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

    try {
      const userQuery = query(
        collection(db, "balance"),
        where("phone", "==", userID)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const newAmount = Number(userData.amount) + Number(deposit);

        updateBalance(db, userID, newAmount);

        await addDoc(collection(db, "deposit"), {
          phone: userID,
          payphone: payphone,
          amount: Number(deposit),
          mode: "mpesa",
          createdAt: serverTimestamp(),
        });
        setBal(newAmount);
        sessionStorage.setItem("balance", newAmount.toString());
        setdeposit("");
        setpayphone("");
        toast({
          title: "Successful",
          description: "Deposit of KES " + deposit + " Successful",
          duration: 5000,
          className: "bg-emerald-600 text-white",
        });
        //window.location.reload();
      } else {
        await addDoc(collection(db, "balance"), {
          phone: userID,
          amount: Number(deposit),
        });
        await addDoc(collection(db, "deposit"), {
          phone: userID,
          payphone: payphone,
          amount: Number(deposit),
          mode: "mpesa",
          createdAt: serverTimestamp(),
        });
        setBal(Number(deposit));
        sessionStorage.setItem("balance", deposit.toString());
        setdeposit("");
        setpayphone("");
        toast({
          title: "Successful",
          description: "Deposit of KES " + deposit + " Successful",
          duration: 5000,
          className: "bg-emerald-600 text-white",
        });
        //  window.location.reload();
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  return (
    <div
      className="p-[5px] rounded-full bg-white text-gray-900 tooltip tooltip-bottom hover:cursor-pointer"
      data-tip="Profile"
    >
      <AlertDialog open={IsAlertDialogP}>
        <AlertDialogTrigger
          onClick={() => {
            setIsAlertDialogP(true);
          }}
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
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex justify-between items-center">
                <div className="text-gray-900 font-bold">ACCOUNT</div>
                <div
                  onClick={handleclickAlertDialogP}
                  className="cursor-pointer"
                >
                  <CloseOutlinedIcon />
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="p-3 w-full items-center">
                <div className="flex flex-col items-center rounded-t-lg w-full p-1 bg-grey-50">
                  <div className="w-36 p-1">
                    <img
                      className="w-full h-full rounded-full object-cover"
                      src="/logo1.png"
                      alt="Profile Image"
                    />
                  </div>

                  <p className="text-lg font-bold text-gray-900">{username}</p>

                  <p className="text-lg font-bold text-gray-900">{userID}</p>

                  <p className="text-3xl text-green-600 font-bold p-2">
                    KES {bal.toFixed(2)}
                  </p>

                  <div className="gap-1 h-[350px] items-center w-full border rounded-lg">
                    <div className="flex bg-gray-900 rounded-lg p-1 w-full">
                      {tabs.map((tab, index) => (
                        <button
                          key={index}
                          className={`flex-1 text-sm py-1 px-0 rounded-lg text-center ${
                            activeTab === index
                              ? "text-gray-900 bg-white"
                              : "bg-gray-900 text-white"
                          }`}
                          onClick={() => setActiveTab(index)}
                        >
                          {tab.title}
                        </button>
                      ))}
                    </div>
                    <div className="p-2">
                      {activeTab === 0 && (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="text-lg p-1 font-bold text-gray-900">
                              Deposit via M-Pesa
                            </div>
                            <div className="flex flex-col gap-1 mb-5 w-full">
                              <TextField
                                id="outlined-password-input"
                                label="M-pesa Phone Number"
                                type="text"
                                value={payphone}
                                onChange={(e) => setpayphone(e.target.value)}
                              />
                              <div className="text-red-400">
                                {errormpesaphone}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 mb-5 w-full">
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
                              className="w-full bg-emerald-600 text-white hover:emerald-900 mt-2 p-2 rounded-lg shadow"
                            >
                              TopUp
                            </button>
                          </div>
                        </>
                      )}
                      {activeTab === 1 && (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="text-lg p-1 font-bold text-gray-900">
                              Withdraw via M-Pesa
                            </div>
                            <div className="flex flex-col gap-1 mb-5 w-full">
                              <TextField
                                id="outlined-password-input"
                                label="Send to Phone Number"
                                type="text"
                                value={sendphone}
                                onChange={(e) => setsendphone(e.target.value)}
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
                              className="w-full bg-emerald-600 text-white hover:emerald-900 mt-2 p-2 rounded-lg shadow"
                            >
                              Withdraw
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Account;
