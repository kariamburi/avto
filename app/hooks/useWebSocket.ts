import { useEffect, useState } from 'react';

const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentBets, setCurrentBets] = useState([]);
  const [betstatus, setBetstatus] = useState("betting");
  const [house, sethouse] = useState("0");
  
  useEffect(() => {
    //const ws = new WebSocket('wss://23.227.167.127:3000/ws');
    const ws = new WebSocket('wss://aviatorgm.com:3000/ws');
    //const ws = new WebSocket('ws://localhost:3000/ws');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error', error);
      setIsConnected(false);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
       // console.log('WebSocket message received:', data);
       // console.log('Received:', data);
        if (data.type === 'update') {
          setMultiplier(data.multiplier);
          setGameStatus('running');
        } else if (data.type === 'crash') {
          setMultiplier(data.multiplier);
          setGameStatus('crashed');
       }else if (data.type === 'currentBets') {
        setCurrentBets(data.currentBets);
      //  console.log(data.currentBets)
      } else if (data.type === 'status') {
        setBetstatus(data.status);
        sethouse(data.houseEdge)
      } else if (data.type === 'error') {
          console.error('Server error:', data.message);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    return () => ws.close();
   
  }, []);

  const removeBet = (amount: number, betno: number) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type: 'cancel', amount, betno }));
    }
  };

  const placeBet = (amount: number, username:string, betno: number, cashoutmultiplier:number) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type: 'bet', amount, username, betno, cashoutmultiplier}));
    }
  };

  const cashOut = ( username:string, betno: number) => {
    if (socket && isConnected) {
  
      socket.send(JSON.stringify({ type: 'cashout', username, betno})); // Send current multiplier
    }
  };
  const houseEdgeValue = (value: number, levelA:number, levelB:number, range1:number, range2:number, range3:number, range4:number) => {
    if (socket && isConnected) {
  
      socket.send(JSON.stringify({ type: 'houseEdge', value, levelA, levelB, range1, range2, range3, range4})); // Send current multiplier
    }
  };

  return { house,isConnected, multiplier, gameStatus, currentBets,betstatus, placeBet, cashOut,removeBet,houseEdgeValue };
};

export default useWebSocket;
