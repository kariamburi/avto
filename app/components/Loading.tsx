// components/Loading.tsx
const Loading: React.FC = () => {
  return (
    <div className="flex bg-gray-800 items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-400"></div>
    </div>
  );
};

export default Loading;
