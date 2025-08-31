const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {}; // userId -> ws

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    let data = JSON.parse(msg);

    if (data.type === "login") {
      clients[data.userId] = ws;
      console.log("User connected:", data.userId);
    }

    if (data.type === "message") {
      const { from, to, text } = data;

      // сохраняем в БД
      await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)",
        [from, to, text]
      );

      // отправляем получателю
      if (clients[to]) {
        clients[to].send(JSON.stringify({ from, text }));
      }
    }
  });

  ws.on("close", () => {
    for (let u in clients) {
      if (clients[u] === ws) delete clients[u];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
