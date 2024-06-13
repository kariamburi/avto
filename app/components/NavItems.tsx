"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { headerLinks } from "../constants";
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
import TextField from "@mui/material/TextField";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import RandomAvatar from "./RandomAvatar";
const NavItems = () => {
  const [username, setusername] = useState("");
  const [phonenumber, setphonenumber] = useState("");
  useEffect(() => {
    const user_id = sessionStorage.getItem("userID");
    if (user_id) {
      setphonenumber(user_id);
    }
    const username_id = sessionStorage.getItem("username");
    if (username_id) {
      setusername(username_id);
    }
  }, []);
  const handleLogout = () => {
    sessionStorage.setItem("username", "");
    sessionStorage.setItem("userID", "");
    // Reload the current page
    window.location.reload();
  };
  const [IsAlertDialogP, setIsAlertDialogP] = useState(false);

  const handleclickAlertDialog = () => {
    setIsAlertDialogP(false);
  };
  const handleSave = () => {};
  return (
    <div className="w-full">
      <AlertDialog open={IsAlertDialogP}>
        <AlertDialogTrigger
          onClick={() => {
            setIsAlertDialogP(true);
          }}
        >
          <div className="flex hover:bg-slate-100 hover:rounded-full hover:text-emerald-600 p-3 mb-1 hover:cursor-pointer">
            Profile
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="text-gray-900 font-bold">LOGIN</div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="p-3 w-full items-center">
                <div className="flex flex-col gap-1 mb-5 w-full">
                  <RandomAvatar />
                </div>
                <div className="flex flex-col gap-1 mb-5 w-full">
                  {username}
                </div>
                <div className="flex flex-col gap-1 mb-5 w-full">
                  {phonenumber}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleclickAlertDialog}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex hover:bg-slate-100 hover:rounded-full hover:text-emerald-600 p-3 mb-1 hover:cursor-pointer">
        Account
      </div>
      <div
        onClick={handleLogout}
        className="flex hover:bg-slate-100 hover:rounded-full hover:text-emerald-600 p-3 mb-1 hover:cursor-pointer"
      >
        Logout
      </div>
    </div>
  );
};

export default NavItems;
