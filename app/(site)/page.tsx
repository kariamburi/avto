"use client";
import { useState, useEffect, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";
//import Game from "../components/Game";

//const Game = dynamic(() => import("../components/Game"), { ssr: false });
// Dynamically import SomeComponent
const Game = dynamic(() => import("../components/Game"), {
  ssr: false, // Set this to true or false based on whether you want the component to be server-side rendered or not
  loading: () => <p>Loading...</p>, // Optionally provide a loading component or message
});
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

  return (
    <main>
      {isLoading ? <Loading progress={progress} /> : <Game />}
      <Toaster />
    </main>
  );
}
