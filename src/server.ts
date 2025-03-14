import express from 'express';
import dotenv from 'dotenv';
import { wss } from './queue/events';
import uploadLogs from './api/uploadLogs';
import stats from './api/stats';
import queueStatus from './api/queueStatus';
import cookieParser from 'cookie-parser';
import { authenticateToken } from './middleware';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const cors = require('cors');

app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000' , credentials:true}));

app.use("/api", authenticateToken)
app.use('/api', uploadLogs);
app.use('/api', stats);
app.use('/api', queueStatus);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


server.on('upgrade', (request, socket, head) => {
  console.log(`Upgrade request received: ${request.url}`);
  if (request.url === '/api/live-stats') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('WebSocket connection established');
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
    console.log('Unknown upgrade request, connection destroyed');
  }
});
