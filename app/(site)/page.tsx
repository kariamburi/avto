"use client";
import { useState, useEffect } from "react";
import Game from "../components/Game";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import Loading from "../components/Loading";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    NProgress.start();
    const totalLoadingTime = 2000; // Total loading time in milliseconds
    const updateInterval = 100; // Update interval in milliseconds

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(
          prev + (updateInterval / totalLoadingTime) * 100,
          100
        );
        NProgress.set(newProgress / 100);
        return newProgress;
      });
    }, updateInterval);

    const timer = setTimeout(() => {
      setIsLoading(false);
      NProgress.done();
    }, totalLoadingTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      NProgress.done(); // Ensure NProgress is stopped on unmount
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
