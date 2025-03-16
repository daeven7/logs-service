import express from "express";
import dotenv from "dotenv";
import { wss } from "./queue/events";
import uploadLogs from "./api/uploadLogs";
import stats from "./api/stats";
import queueStatus from "./api/queueStatus";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const cors = require("cors");

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

console.log("Node env", process.env.NODE_ENV);

if (process.env.NODE_ENV !== "test") {
  app.use("/api", authenticateToken);
}

app.use("/api", uploadLogs);
app.use("/api", stats);
app.use("/api", queueStatus);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/api/live-stats") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
}

export default app;
