// components/Loading.tsx
import Image from "next/image";
const Loading: React.FC = () => {
  return (
    <div className="flex items-center bg-gray-900 justify-center h-screen relative">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-400"></div>
      <div className="absolute flex flex-col items-center justify-center">
        <div className="">
          <Image src="/logo1.png" width={100} height={24} alt="game logo" />
        </div>
        <div className="text-gray-400 mt-1 text-xs">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
