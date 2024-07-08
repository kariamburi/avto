const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const next = require('next');
const crypto = require('crypto');

// Create a Next.js app
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

let players = [];
let crashPoint;
let gameInProgress = false;
let multiplier = 1.0;
let bettingPhase = false;
const houseEdge=0;
let currentGameStatus = 'waiting';
const clients = new Set();
let numberOfPlayers = 0;
function getCrashPoint() {
  const e = 2 ** 32;
  const h = crypto.randomInt(e);
  if (h % 25 === 0) {
    return 1;
  }
  return Math.floor((100 * e - h) / (e - h)) / 100;
}

const generateCrashPoint = () => {
  const h = Math.random();
  const p = Math.floor(h * 10);  // generates an integer between 0 and 9
  const r = h * (1 - houseEdge);

  if (p % 5 === 0) {
    return 1 + 0.1 + (0.2 - 0.1) * Math.random();
  }

  if (r <= 0.20) {
    return 1 + 0.1 + (0.3 - 0.1) * Math.random();
  } else if (r <= 0.60) {
    return 1 + Math.random();
  } else if (r <= 0.85) {
    return 2 + Math.random() * 3;
  } else if (r <= 0.95) {
    return 5 + Math.random() * 5;
  } else {
    return 10 + Math.random() * 10;
  }
};

const broadcastCurrentBets = () => {
  const currentBets = players.map(player => ({
    username: player.username,
    bet: player.bet,
    betno: player.betno,
    cashoutmultiplier: player.cashoutmultiplier,
    cashoutStatus: player.cashoutStatus,
    multiplier,
  }));
  clients.forEach(client => {
    client.send(JSON.stringify({ type: 'currentBets', currentBets }));
  //console.log(currentBets);
  });
};

const broadcastGameStatus = (status) => {
  currentGameStatus = status;
  clients.forEach(client => {
    client.send(JSON.stringify({ type: 'status', status }));
  });
};

const broadcastMultiplier = () => {
  clients.forEach(client => {
    client.send(JSON.stringify({ type: 'update', multiplier }));
  });
};

const startupdateserverPhase = () => {
  bettingPhase = true;
  broadcastGameStatus('updateserver');
  setTimeout(() => {
    startBettingPhase();
    addRandomPlayers();
  }, 2000);
};

const startBettingPhase = () => {
  broadcastGameStatus('bettingphase');
  setTimeout(() => {
    broadcastGameStatus('gameloop');
    bettingPhase = false;
    startGameLoop();
  }, 20000);
};
const generateRandomString = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const randomChar = () =>
    letters.charAt(Math.floor(Math.random() * letters.length));
  const firstChar = randomChar().toUpperCase();
  const secondChar = randomChar();
  return firstChar + secondChar;
};
const addRandomPlayers = () => {
  players = [];
  numberOfPlayers = Math.floor(Math.random() * (150 - 20 + 1)) + 20; // Random number of players between 20 and 150

  const addPlayerWithDelay = (i) => {
    if (i < numberOfPlayers) {
      const minBet = 10;
      const maxBet = 4000;

      const randomBetAmount = (
        Math.floor(Math.random() * ((maxBet - minBet) / 10 + 1)) * 10 +
        minBet
      ).toFixed(0);

      players.push({
        username: generateRandomString() + "***",
        bet: randomBetAmount,
        betno: i,
        cashoutmultiplier:1,
        cashoutStatus: false,
        auto: true,
      });

      // Broadcast after each player is added
      broadcastCurrentBets();

      // Set delay for the next player
      setTimeout(() => addPlayerWithDelay(i + 1), Math.random() * (30000/numberOfPlayers)); // Random delay between 0 and 1000ms
    }
  };

  addPlayerWithDelay(0); // Start adding players
};

const randomCashout = () => {
  const playerIndex = Math.floor(Math.random() * players.length); // Assuming players is your array of players
  if (playerIndex !== -1 && gameInProgress) {
    const player = players[playerIndex];

    if (!player.cashoutStatus && player.auto) {
      const payout = player.bet * multiplier;
      // Simulate delay before cashing out
      setTimeout(() => {
        player.cashoutStatus = true;
        player.cashoutmultiplier = multiplier;
       // player.ws.send(JSON.stringify({ type: 'cashout', payout }));
      }, Math.random() * 30000); // Random delay between 0 and 5000ms (adjust as needed)
    }
  }
};

const startGameLoop = () => {
  if (gameInProgress) return;
  gameInProgress = true;
  console.log('Starting game loop');
  crashPoint = generateCrashPoint();

  const interval = setInterval(() => {
    multiplier += 0.01;

    if (multiplier >= crashPoint) {
      clients.forEach(client => {
        client.send(JSON.stringify({ type: 'crash', multiplier }));
      });
      console.log('CRASHED: ' + multiplier);
      clearInterval(interval);
      gameInProgress = false;
      crashPoint = generateCrashPoint();
      multiplier = 1.0;
      players = [];
      startupdateserverPhase();
    } else {
      broadcastMultiplier(); 
    randomCashout(); // Randomly cashout players during the game loop
    }
    broadcastCurrentBets();
  }, 50);
};

app.prepare().then(async () => {
  const server = express();

  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from custom server!' });
  });

  const httpServer = http.createServer(server);

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);
    ws.send(JSON.stringify({ message: 'Welcome to WebSocket server!' }));

    ws.send(JSON.stringify({ type: 'status', status: currentGameStatus }));
    ws.send(JSON.stringify({ type: 'update', multiplier }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.type === 'bet') {
          if (!gameInProgress && bettingPhase) {
            players.push({ ws, username: data.username, bet: data.amount, betno: data.betno, cashoutmultiplier: data.cashoutmultiplier, cashoutStatus: false, auto: false });
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Game in progress or betting phase has ended. Please wait for the next round.' }));
          }
          broadcastCurrentBets();
        } else if (data.type === 'cancel') {
          const playerIndex = players.findIndex(player => player.ws === ws);
          if (playerIndex !== -1) {
            players.splice(playerIndex, 1);
          }
          broadcastCurrentBets();
        } else if (data.type === 'cashout') {
          const playerIndex = players.findIndex(player => player.ws === ws && player.betno === data.betno);
          if (playerIndex !== -1 && gameInProgress) {
            const player = players[playerIndex];
            if (!player.cashoutStatus) {
              const payout = player.bet * multiplier;
              player.cashoutStatus = true;
              player.cashoutmultiplier = multiplier;
              player.ws.send(JSON.stringify({ type: 'cashout', payout }));
            }
          }
          broadcastCurrentBets();
        }
      } catch (err) {
        console.error('Error processing message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
      players = players.filter(player => player.ws !== ws);
      broadcastCurrentBets();
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, async (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);

    // Fetch the house edge value
  
     
      // Start the initial betting phase after fetching house edge
      startupdateserverPhase();
    
  });
}).catch((err) => {
  console.error('Error preparing Next.js app:', err);
});
