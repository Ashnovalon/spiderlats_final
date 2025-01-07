const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const pubSub = require("./redisClient"); // CommonJS style import
const socketHandler = require("./socketHandler"); // CommonJS style import

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Redis message listener
pubSub.subscriber.on("message", (channel, message) => {
  console.log("Redis message received:", message);
  const parsedMessage = JSON.parse(message);

  if (parsedMessage.room && parsedMessage.newMessage) {
    console.log("Emitting message to room:", parsedMessage.room);
    io.to(parsedMessage.room).emit("message", parsedMessage.newMessage);
  } else {
    console.error("Invalid message format:", parsedMessage);
  }
});

// Socket connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socketHandler(socket, io);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
