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
    <div className="flex bg-gray-800 shadow-lg py-1 w-full h-20 items-center">
      <div className="flex-1 my-auto">
        <div className="flex gap-2 p-4 items-center">
          <div className="rounded-full overflow-hidden">
            <img
              src="/logo1.png"
              alt="logo"
              onClick={() => router.push("/")}
              className="w-24 ml-1 hover:cursor-pointer"
            />
          </div>
          <h1 className="text-lg text-white font-bold text-center">
            Admin Panel
          </h1>
        </div>
      </div>
      <div
        className="p-[5px] rounded-full bg-white text-gray-900 tooltip tooltip-bottom hover:cursor-pointer mr-2"
        data-tip="home"
        onClick={() => router.push("/site")}
      >
        <HomeOutlinedIcon />
      </div>
    </div>
  );
}
