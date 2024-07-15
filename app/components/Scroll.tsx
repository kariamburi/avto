// components/Scroll.tsx
interface ScrollProps {
  messages: string[];
}

const Scroll: React.FC<ScrollProps> = ({ messages }) => {
  return (
    <div className="flex w-full gap-40 text-xs">
      {/* Adjust gap as needed */}
      {messages.map((message, index) => (
        <span key={index} dangerouslySetInnerHTML={{ __html: message }} />
      ))}
    </div>
  );
};

export default Scroll;
