// components/ChatWindow.js
"use client";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import SendMessage from "./SendMessage";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "./Sidebar";
interface termsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Termspopup: React.FC<termsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed w-full bg-gray-900 border border-gray-300 h-screen shadow-lg z-30">
      <div className="flex justify-between bg-gray-900 text-white p-2 rounded-t-lg">
        <div className="rounded-full overflow-hidden">
          <img className="w-24" src="/logo1.png" alt="avatar" />
          <div className="text-xs text-gray-400 font-medium flex gap-5"></div>
        </div>
        <div onClick={onClose} className="cursor-pointer text-white">
          <CloseOutlinedIcon />
        </div>
      </div>
      <div className="p-1">
        <div className="p-6 bg-gray-800 rounded-md shadow-md max-w-3xl mx-auto mb-2">
          <ScrollArea className="h-[500px]">
            <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
            <p className="mb-4">
              Welcome to Rocket Crash Aviator prediction game (the "Game").
              These Terms and Conditions ("Terms") govern your use of the Game
              provided by Aviatorgm Ltd ("Company", "we", "our", or "us"). By
              accessing or using the Game, you agree to be bound by these Terms.
              If you do not agree to these Terms, please do not use the Game.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Eligibility</h2>
            <p className="mb-4">
              1. You must be at least 18 years old to participate in the Game.
              <br />
              2. The Game is not available to users who are prohibited from
              participating by the laws of their country of residence.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Account Registration
            </h2>
            <p className="mb-4">
              1. To play the Game, you must create an account by providing
              accurate and complete information.
              <br />
              2. You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Game Rules</h2>
            <p className="mb-4">
              1. The Game involves predicting the outcome of a rocket crash (the
              "Prediction").
              <br />
              2. Players place bets on their Predictions using in-game currency
              or real money, as applicable.
              <br />
              3. Winnings are determined based on the accuracy of your
              Prediction and the amount wagered.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Betting and Winnings
            </h2>
            <p className="mb-4">
              1. All bets must be placed before the start of each round.
              <br />
              2. Winnings are calculated based on the odds and the amount
              wagered.
              <br />
              3. Winnings are credited to your account balance and can be
              withdrawn in accordance with our withdrawal policy.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Responsible Gaming
            </h2>
            <p className="mb-4">
              1. We encourage responsible gaming and provide tools to help you
              manage your gaming activity, including deposit limits and
              self-exclusion options.
              <br />
              2. If you believe you have a gambling problem, please seek help
              from a professional organization.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Prohibited Activities
            </h2>
            <p className="mb-4">
              1. You agree not to engage in any of the following prohibited
              activities:
              <br />
              - Using automated systems or software to cheat or exploit the
              Game.
              <br />
              - Engaging in fraudulent activities, including using stolen
              payment information.
              <br />
              - Harassing, threatening, or abusing other players.
              <br />
              2. Violation of these prohibitions may result in the suspension or
              termination of your account.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Intellectual Property
            </h2>
            <p className="mb-4">
              1. All content and materials in the Game, including but not
              limited to text, graphics, logos, and software, are the property
              of the Company or its licensors and are protected by intellectual
              property laws.
              <br />
              2. You are granted a limited, non-exclusive, non-transferable
              license to use the Game for personal, non-commercial purposes.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Privacy</h2>
            <p className="mb-4">
              1. We collect and use your personal information in accordance with
              our Privacy Policy, which is incorporated by reference into these
              Terms.
              <br />
              2. By using the Game, you consent to the collection and use of
              your personal information as described in our Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Limitation of Liability
            </h2>
            <p className="mb-4">
              1. The Game is provided on an "as is" and "as available" basis. We
              make no warranties, express or implied, regarding the Game.
              <br />
              2. To the maximum extent permitted by law, the Company shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising out of or in connection with your use of the Game.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Termination</h2>
            <p className="mb-4">
              1. We may terminate or suspend your account and access to the Game
              at any time, with or without cause or notice, including for any
              violation of these Terms.
              <br />
              2. Upon termination, all provisions of these Terms which by their
              nature should survive termination shall survive, including
              ownership provisions, warranty disclaimers, indemnity, and
              limitations of liability.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of Kenya, without regard to its conflict of law
              principles.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">
              Changes to Terms
            </h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will
              notify you of any changes by posting the new Terms on our website.
              Your continued use of the Game after such changes constitutes your
              acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at
              [Contact Information].
            </p>

            <p className="mt-6">
              Aviatorgm Ltd
              <br />
              support@aviatorgm.com
            </p>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Termspopup;
