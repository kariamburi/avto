// components/Loading.tsx
import Image from "next/image";
interface LoadingProps {
  progress: number;
}
const Loading: React.FC<LoadingProps> = ({ progress }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as "column",
      alignItems: "center" as "center",
      justifyContent: "center" as "center",
      height: "100vh",
    },
    progressBarContainer: {
      width: "80px",
      height: "10px",
      backgroundColor: "#e0e0e0",
      borderRadius: "5px",
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#DE3D26",
    },
  };
  return (
    <div className="flex items-center bg-gray-900 justify-center h-screen relative">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-400"></div>
      <div className="absolute flex flex-col items-center justify-center">
        <div className="">
          <Image src="/logo1.png" width={100} height={24} alt="game logo" />
        </div>
        <div className="flex flex-col items-center">
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
          </div>
          <div className="text-gray-400 mt-1 text-xs">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
