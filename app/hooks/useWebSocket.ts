import { useEffect, useState, useRef } from 'react';

const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [currentBets, setCurrentBets] = useState([]);
  const [betstatus, setBetstatus] = useState("betting");
  const [house, sethouse] = useState("0");
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
   // const ws = new WebSocket('ws://localhost:3000/ws');
    const ws = new WebSocket('wss://aviatorgm.com:3000/ws');
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Try to reconnect after a delay
      setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    };

    ws.onerror = (error) => {
      console.error('WebSocket error', error);
      setIsConnected(false);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.type === 'update') {
          const receivedMultiplier = parseFloat(data.multiplier);
          setMultiplier(receivedMultiplier);
          setGameStatus('running');
        } else if (data.type === 'crash') {
          const receivedMultiplier = parseFloat(data.multiplier);
          setMultiplier(receivedMultiplier);
          setGameStatus('crashed');
        } else if (data.type === 'currentBets') {
          setCurrentBets(data.currentBets);
        } else if (data.type === 'status') {
          setBetstatus(data.status);
          sethouse(data.houseEdge);
        } else if (data.type === 'error') {
          console.error('Server error:', data.message);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const removeBet = (amount: number, betno: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: 'cancel', amount, betno }));
    }
  };

  const placeBet = (amount: number, username: string, betno: number, cashoutmultiplier: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: 'bet', amount, username, betno, cashoutmultiplier }));
    }
  };

  const cashOut = (username: string, betno: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: 'cashout', username, betno }));
    }
  };

  const houseEdgeValue = (value: number, levelA: number, levelB: number, range1: number, range2: number, range3: number, range4: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: 'houseEdge', value, levelA, levelB, range1, range2, range3, range4 }));
    }
  };

  return { house, isConnected, multiplier, gameStatus, currentBets, betstatus, placeBet, cashOut, removeBet, houseEdgeValue };
};

export default useWebSocket;
