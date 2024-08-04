"use client";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import Loading from "../components/Loading";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const Game = dynamic(() => import("../components/Game"), { ssr: false });
//const Loading = dynamic(() => import("../components/Loading"), { ssr: false });

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const totalLoadingTime = 2000; // Total loading time in milliseconds
    const updateInterval = 100; // Update interval in milliseconds

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(
          prev + (updateInterval / totalLoadingTime) * 100,
          100
        );
        return newProgress;
      });
    }, updateInterval);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, totalLoadingTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  if (isLoading) {
    return <Loading progress={progress} />;
  }

  return (
    <main>
      <Game />
      <Toaster />
    </main>
  );
}
