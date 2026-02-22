const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 🔧 Replace with your GitHub Pages domain, e.g. "https://yourname.github.io"
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.get("/", (req, res) => res.send("CHATTR backend is live."));
app.get("/health", (req, res) => res.json({ status: "ok", connections: io.engine.clientsCount }));

// Track connected users
const connectedUsers = new Map(); // socketId → user info

io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // User announces themselves
  socket.on("join", (user) => {
    connectedUsers.set(socket.id, user);
    broadcastOnlineCount();
    console.log(`[join] ${user.name} (${user.uid})`);
  });

  // Relay message to everyone
  socket.on("send_message", (data) => {
    if (!data.text || data.text.trim().length === 0) return;
    if (data.text.length > 500) return; // basic guard

    const payload = {
      uid: data.uid,
      name: data.name,
      photo: data.photo,
      text: data.text.trim(),
      timestamp: null // client uses local time for real-time; Firestore has server timestamp
    };

    io.emit("receive_message", payload);
    console.log(`[msg] ${data.name}: ${data.text.substring(0, 60)}`);
  });

  // Relay typing events (except back to sender)
  socket.on("typing", (data) => {
    socket.broadcast.emit("user_typing", data);
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) console.log(`[-] ${user.name} disconnected`);
    connectedUsers.delete(socket.id);
    broadcastOnlineCount();
  });
});

function broadcastOnlineCount() {
  io.emit("online_count", connectedUsers.size);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CHATTR backend running on port ${PORT}`));
