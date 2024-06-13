// utils/generateCrashPoint.ts

export const generateCrashPoint = (): number => {
    // Generate a uniform random number between 0 and 1
    const r = Math.random();
    
    // Determine the crash point based on the cumulative distribution
    if (r <= 0.50) {
      // Crash point between 1x and 2x
      return 1 + Math.random(); // Equivalent to random.uniform(1, 2)
    } else if (r <= 0.80) {
      // Crash point between 2x and 5x
      return 2 + Math.random() * 3; // Equivalent to random.uniform(2, 5)
    } else if (r <= 0.95) {
      // Crash point between 5x and 10x
      return 5 + Math.random() * 5; // Equivalent to random.uniform(5, 10)
    } else {
      // Crash point between 10x and 20x
      return 10 + Math.random() * 10; // Equivalent to random.uniform(10, 20)
    }
  };
  