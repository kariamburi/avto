import React from "react";
import Navbar from "../components/navbar";
import TermsAndConditions from "../components/TermsAndConditions";

const page = () => {
  return (
    <div className="bg-gray-800 p-0 min-h-screen rounded-lg shadow-lg">
      <Navbar />
      <div className="w-full mx-auto">
        <div className="p-0">
          <TermsAndConditions />
        </div>
      </div>
    </div>
  );
};

export default page;
