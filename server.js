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
let point = 1;

let currentGameStatus = 'waiting';
const clients = new Set();
function getCrashPoint() {
  const e = 2 ** 32;
  const h = crypto.randomInt(e);
  if (h % 5 === 0) {
    return 1;
  }
  return Math.floor((20 * e - h) / (e - h)) / 20;
}
const generateCrashPoint = () => {
  const h = Math.random();
  const p = Math.floor(h * 10);
  const r = h * (1 - houseEdge);

  if (p % 5 === 0 && levelA ===1) {
    return 1 + 0.1 + (0.2 - 0.1) * Math.random();
  }
  if (r <= 0.20 && levelB ===1) {
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
    cashoutStatus: player.cashoutStatus,
    multiplier,
  }));
  clients.forEach(client => {
    client.send(JSON.stringify({ type: 'currentBets', currentBets }));
  });
};

const broadcastGameStatus = (status) => {
  currentGameStatus = status;
  clients.forEach(client => {
    client.send(JSON.stringify({ type: 'status', status, houseEdge }));
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

const startGameLoop = () => {
  if (gameInProgress) return;
  gameInProgress = true;
 // console.log('Starting game loop');
 if(point === 1){
  crashPoint = generateCrashPoint();
 }else{
  crashPoint = getCrashPoint();
 }
  

  const interval = setInterval(() => {
    multiplier += 0.01;

    if (multiplier >= crashPoint) {
      clients.forEach(client => {
        client.send(JSON.stringify({ type: 'crash', multiplier }));
      });
     // console.log('CRASHED: ' + multiplier);
      clearInterval(interval);
      gameInProgress = false;
      if(point === 1){
        crashPoint = generateCrashPoint();
       }else{
        crashPoint = getCrashPoint();
       }
      multiplier = 1.0;
      players = [];
      startupdateserverPhase();
    } else {
      broadcastMultiplier(); 
    }
    broadcastCurrentBets();
  }, 50);
};

app.prepare().then(async () => {
  const server = express();

  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from custom server!' });
  });

  const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/aviatorgm.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/aviatorgm.com/fullchain.pem')
  };

  const httpsServer = https.createServer(sslOptions, server);

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
            players.push({ ws, username: data.username, bet: data.amount, betno: data.betno, cashoutStatus: false });
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
              ws.send(JSON.stringify({ type: 'cashout', payout }));
              player.cashoutStatus = true;  
            }
          }
          broadcastCurrentBets();
        }else if(data.type === 'houseEdge'){
          houseEdge = Number(data.value);
          levelB = Number(data.levelB);
          levelA = Number(data.levelA);
          point = Number(data.point);
          console.error('houseEdge:'+houseEdge+" levelA: "+levelA+" levelB: "+levelB+" Point: "+point);
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
