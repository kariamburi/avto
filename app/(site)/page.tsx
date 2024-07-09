"use client";
import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Game from "../components/Game";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import Loading from "../components/Loading";

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    NProgress.start();

    const updateProgress = () => {
      setProgress(NProgress.status ? NProgress.status * 100 : 0);
    };

    const interval = setInterval(updateProgress, 100);

    // Simulate a loading process or replace with real data fetching
    const loadData = async () => {
      try {
        // Simulate data fetching or other asynchronous operations
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a 2-second loading time
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
        NProgress.done();
      }
    };

    loadData();

    return () => {
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
};

export default Home;
