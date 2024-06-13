// components/MovingDots.tsx

import { useEffect } from "react";

const MovingDots: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById("movingDotsContainer")!;
    // Add the ! operator here -----^
    // This assures TypeScript that container will not be null

    function createDot(index: number) {
      const dot = document.createElement("div");
      dot.classList.add("dot", "bg-red-500");
      dot.style.animationDelay = `${index * 0.5}s`;
      dot.style.left = `${Math.random() * 100}%`; // Randomize initial horizontal position
      container.appendChild(dot);
    }

    function animateDots() {
      const dots = document.getElementsByClassName("dot");

      Array.from(dots).forEach((dot) => {
        const startPosition = Math.random() * window.innerHeight;
        let position = startPosition;

        const animation = () => {
          position += 1;
          dot.style.top = position + "px";

          if (position >= window.innerHeight) {
            position = startPosition;
          }

          requestAnimationFrame(animation);
        };

        animation();
      });
    }

    for (let i = 0; i < 10; i++) {
      createDot(i);
    }

    animateDots();
  }, []);

  return (
    <div id="movingDotsContainer" className="relative h-screen">
      {/* Dots will be appended here */}
      <style jsx>{`
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          animation: moveVertical 2s infinite alternate;
        }

        @keyframes moveVertical {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default MovingDots;
