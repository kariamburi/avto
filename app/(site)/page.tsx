import Game from "../components/Game";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
export default async function Home() {
  return (
    <main>
      <Game />
      <Toaster />
    </main>
  );
}
