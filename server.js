const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const next = require('next');
const fs = require('fs');
const crypto = require('crypto');

// Create a Next.js app
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

let players = [];
let crashPoint;
let gameInProgress = false;
let multiplier = 1.0;
let bettingPhase = false;
let houseEdge = 0;
let levelA = 1;
let levelB = 1;
let range1 = 0.2;
let range2 = 0.6;
let range3 = 0.85;
let range4 = 0.95;
let currentGameStatus = 'waiting';
const clients = new Set();

const generateCrashPoint = () => {
  const h = Math.random();
  const p = Math.floor(h * 10);
  const r = h * (1 - houseEdge);
  if (p % 5 === 0 && levelA === 1) {
   // return 1 + 0.01 + (0.02 - 0.01) * Math.random();
    return 1.00;
  }
  if (r <= range1 && levelB === 1) {
   // console.error("2  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
    return 1 + 0.1 + (0.3 - 0.1) * Math.random();
  } else if (r <= range2) {
   // console.error("3  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
    return 1 + Math.random();
  } else if (r <= range3) {
 //   console.error("4  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
    return 2 + Math.random() * 3;
  } else if (r <= range4) {
    //console.error("5  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
    return 5 + Math.random() * 5;
  } else {
  //  console.error("6  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
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
  console.log(currentBets);
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
  let intervalId = setInterval(() => {
    broadcastGameStatus('updateserver');
  }, 100);

  setTimeout(() => {
    clearInterval(intervalId); // Stop the interval
    startBettingPhase();
    addRandomPlayers();
  }, 2000);
};

const startBettingPhase = () => {
  // Broadcast 'bettingphase' immediately
  broadcastGameStatus('bettingphase');
  
  // Create a variable to store the interval ID
  let intervalId = setInterval(() => {
    broadcastGameStatus('bettingphase');
  }, 1000);

  // Set a timeout to stop the interval after 20 seconds
  setTimeout(() => {
    clearInterval(intervalId); // Stop the interval
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
 // console.log('Starting game loop');
  crashPoint = generateCrashPoint();

  const interval = setInterval(() => {
    multiplier += 0.01;

    if (multiplier >= crashPoint) {
      broadcastMultiplier(); 
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
//  ssl_certificate     /home/aviator/conf/web/aviatorgm.com/ssl/aviatorgm.com.pem;
 // ssl_certificate_key /home/aviator/conf/web/aviatorgm.com/ssl/aviatorgm.com.key;

 //const sslOptions = {
 //  key: fs.readFileSync('/home/aviator/conf/web/aviatorgm.com/ssl/aviatorgm.com.key'),
 //  cert: fs.readFileSync('/home/aviator/conf/web/aviatorgm.com/ssl/aviatorgm.com.pem')
 // };

 // const httpsServer = https.createServer(sslOptions, server);
  const httpsServer = http.createServer(server);

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
       // console.log('Received:', data);

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
        }else if(data.type === 'houseEdge'){
          houseEdge = Number(data.value);
          levelB = Number(data.levelB);
          levelA = Number(data.levelA);
          range1 = Number(data.range1);
          range2 = Number(data.range2);
          range3 = Number(data.range3);
          range4 = Number(data.range4);
          console.error('houseEdge:'+houseEdge+" levelA: "+levelA+" levelB: "+levelB+"  range1: "+range1+" range2: "+range2+" range3:"+range3+" range4:"+range4);
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

  httpsServer.on('upgrade', (request, socket, head) => {
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
  httpsServer.listen(PORT, async (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${PORT}`);

    // Fetch the house edge value
    // houseEdge = await fetchhouseEdge();
    // console.log(`House Edge: ${houseEdge}`);

    // Start the initial betting phase after fetching house edge
    startupdateserverPhase();
  });
}).catch((err) => {
  console.error('Error preparing Next.js app:', err);
});
