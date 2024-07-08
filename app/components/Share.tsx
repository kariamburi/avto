import React, { useState } from "react";
import { FaShareAlt, FaFacebook, FaWhatsapp, FaTwitter } from "react-icons/fa";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  EmailIcon,
  EmailShareButton,
  RedditShareButton,
  RedditIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "next-share";

const Share: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const shareTitle = "Rocket Aviator Bets!";
  const shareDescription =
    "Bet, Win, Repeat! Fly High with Rocket Aviator Bets! With just 100 bob, you can make KES 5,000 daily!";
  const shareUrl = "https://aviatorgm.com";
  const appDownloadLink =
    "Download our Android app here: https://aviatorgm.com/download/aviator-game.apk";

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle} - ${shareDescription} - ${appDownloadLink}`;
        break;
      // case "twitter":
      //   url = `https://twitter.com/share?url=${shareUrl}&text=${shareTitle} - ${shareDescription} - ${appDownloadLink}`;
      //   break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          shareTitle +
            "\n" +
            shareDescription +
            "\n" +
            shareUrl +
            "\n" +
            appDownloadLink
        )}`;
        break;
      default:
        break;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="p-1 gap-1 text-xs text-gray-200 rounded-full bg-[#273445] ring-1 ring-gray-500"
      >
        <ShareOutlinedIcon sx={{ fontSize: 14 }} />
        Share
      </button>
      {isOpen && (
        <div className="absolute text-gray-400 right-0 mt-2 w-48 bg-[#273445] rounded-md shadow-lg z-10">
          <div className="flex items-center justify-between text-white p-1">
            <h3 className="text-sm text-gray-100">Share</h3>

            <div onClick={toggleDropdown} className="cursor-pointer text-white">
              <CloseOutlinedIcon />
            </div>
          </div>

          <div
            onClick={() => handleShare("whatsapp")}
            className="flex items-center px-4 py-2 hover:bg-gray-900 cursor-pointer"
          >
            <WhatsappIcon size={18} round className="mr-2" />
            WhatsApp
          </div>
          <div
            onClick={() => handleShare("facebook")}
            className="flex items-center px-4 py-2 hover:bg-gray-900 cursor-pointer"
          >
            <FacebookIcon size={18} round className="mr-2" /> Facebook
          </div>
          {/*<div
            onClick={() => handleShare("twitter")}
            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            <FaTwitter className="mr-2" /> Twitter
          </div>*/}
        </div>
      )}
    </div>
  );
};

export default Share;
