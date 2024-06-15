"use client";
import { usePathname, useRouter } from "next/navigation";
import MobileNav from "./MobileNav";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
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
            <img
              src="/logo1.png"
              alt="logo"
              onClick={() => router.push("/")}
              className="w-24 hover:cursor-pointer"
            />
          </div>
          <div className="rounded-full overflow-hidden lg:hidden">
            <img
              src="/logo1.png"
              alt="logo"
              onClick={() => router.push("/")}
              className="h-8 hover:cursor-pointer"
            />
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
