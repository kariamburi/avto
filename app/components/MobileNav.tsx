import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
//import { Separator } from "../ui/separator";
//import NavItems from "./NavItems";
//import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import NavItems from "./NavItems";

const MobileNav = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleclicklink = () => {
    setIsSheetOpen(false);
  };
  return (
    <nav className="">
      <Sheet open={isSheetOpen}>
        <SheetTrigger
          className="align-middle"
          onClick={() => {
            setIsSheetOpen(true);
          }}
        >
          <div
            className="mr-5 rounded-full text-white tooltip tooltip-bottom hover:cursor-pointer"
            data-tip="Menu"
          >
            <MenuIcon />
          </div>
        </SheetTrigger>
        <SheetContent
          className="flex flex-col gap-6 bg-gray-200"
          onClick={handleclicklink}
        >
          <SheetTitle>
            <div className="flex gap-2 items-center">
              <div className="rounded-full overflow-hidden">
                <img
                  src="/logo1.png"
                  alt="logo"
                  className="w-24 ml-1 hover:cursor-pointer"
                />
              </div>
            </div>
          </SheetTitle>
          <Separator className="border border-gray-100" />
          <NavItems />
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
