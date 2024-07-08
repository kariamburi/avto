"use client";
import { usePathname, useRouter } from "next/navigation";
import MobileNav from "./MobileNav";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Image from "next/image";
export default function Navbar() {
  // const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();
  // Get the params of the User
  const pathname = usePathname();
  //console.log("userId: " + userId);
  // Help check if the user is logged in and help redirect if they are not
  //const session: any = useSession<any | null | undefined>();

  // console.log(unreadCount);
  return (
    <div className="flex bg-gray-800 shadow-lg py-1 w-full items-center">
      <div className="flex-1 my-auto">
        <div className="flex gap-2 p-2 items-center">
          <div className="rounded-full overflow-hidden hidden lg:inline">
            <Image src="/logo1.png" width={100} height={24} alt="game logo" />
          </div>
          <div className="rounded-full overflow-hidden lg:hidden">
            <Image src="/logo1.png" width={100} height={24} alt="game logo" />
          </div>
        </div>
      </div>

      <div
        className="p-[5px] rounded-full bg-white text-gray-900 tooltip tooltip-bottom hover:cursor-pointer mr-2"
        data-tip="home"
        onClick={() => router.push("/")}
      >
        <HomeOutlinedIcon />
      </div>
    </div>
  );
}
