"use client";
import { useState, useEffect } from "react";
import Game from "../components/Game";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import Loading from "../components/Loading";

export default function Home() {
  //  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  // Simulate loading time or wait for components to finish loading
  // const timer = setTimeout(() => {
  //    setIsLoading(false);
  // }, 2000); // Adjust the timeout duration as needed

  // return () => clearTimeout(timer); // Cleanup timeout on component unmount
  //}, []);

  //if (isLoading) {
  //  return <Loading />;
  //}

  return (
    <main>
      <Game />
      <Toaster />
    </main>
  );
}
