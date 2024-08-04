"use client";
import { useState, useEffect, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const Game = dynamic(() => import("../components/Game"), { ssr: false });

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const totalLoadingTime = 30000; // Total loading time in milliseconds
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
      {isLoading ? (
        <Loading progress={progress} />
      ) : (
        <Suspense
          fallback={
            <div className="flex items-center bg-gray-900 justify-center h-screen relative">
              <div className="absolute flex flex-col items-center justify-center">
                <div className="text-gray-400 mt-1 text-xs">
                  Loading game...
                </div>
              </div>
            </div>
          }
        >
          <Game />
        </Suspense>
      )}
      <Toaster />
    </main>
  );
}
