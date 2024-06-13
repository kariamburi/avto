import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
type balProps = {
  userID: string;
};

const Balance = ({ userID }: balProps) => {
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
        //sessionStorage.setItem("balance", userData.amount);
      }
    };
    loadbalance();
  }, []);
  return (
    <div className="flex gap-1 items-center">
      <div className="text-gray-400 text-xs">Balance:</div>
      <div className="text-lg font-bold text-green-600 rounded-lg p-1">
        KES {bal.toFixed(2)}
      </div>
    </div>
  );
};

export default Balance;
