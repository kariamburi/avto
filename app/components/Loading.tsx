// components/Loading.tsx
const Loading: React.FC = () => {
  return (
    <div className="flex items-center bg-gray-900 justify-center h-screen relative">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-400"></div>
      <div className="absolute text-gray-400 text-xs">Game loading...</div>
    </div>
  );
};

export default Loading;
