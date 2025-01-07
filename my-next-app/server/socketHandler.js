const pubSub = require("./redisClient");
const prisma = require("./db");

module.exports = (socket, io) => {
  const subscribedRooms = new Set();

  // Listen for the 'joinRoom' event
  socket.on("joinRoom", async (room) => {
    const roomSettings = await prisma.roomSettings.findUnique({
      where: { roomName: room },
    });

    // If no settings found for the room, create one with default settings
    if (!roomSettings) {
      await prisma.roomSettings.create({
        data: { roomName: room, showHistory: true },
      });
    }

    // Emit the current history visibility setting to the client
    socket.emit(
      "historyVisibility",
      roomSettings ? roomSettings.showHistory : true
    );

    // Add the user to the room

    socket.join(room); // Join the socket to the room in Socket.IO
    console.log(`User joined room: ${room}`);

    // Subscribe to the Redis channel for the room if not already subscribed
    if (!subscribedRooms.has(room)) {
      console.log(`Subscribing to Redis channel for room: ${room}`);

      // Subscribe to the Redis channel for the specific room
      pubSub.subscriber.subscribe(room, (err, count) => {
        if (err) {
          console.error("Error subscribing to room:", err);
        } else {
          console.log(`Successfully subscribed to room ${room}.`);
          subscribedRooms.add(room); // Mark this room as subscribed
        }
      });
    }
  });

  socket.on("toggleHistory", async ({ room, showHistory }) => {
    const updatedSettings = await prisma.roomSettings.upsert({
      where: { roomName: room },
      update: { showHistory },
      create: { roomName: room, showHistory },
    });

    // Emit the updated setting to all clients in the room
    io.to(room).emit("historyVisibility", updatedSettings.showHistory);
  });

  // Listen for the 'sendMessage' event
  socket.on("sendMessage", async ({ room, newMessage }) => {
    console.log("Received message from client:", { room, newMessage });

    // Validate message format
    if (!room || !newMessage || !newMessage.text || !newMessage.senderName) {
      console.error("Invalid message format received:", { room, newMessage });
      return;
    }

    try {
      await prisma.message.create({
        data: {
          room,
          senderName: newMessage.senderName,
          text: newMessage.text,
        },
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }

    // Publish the message to Redis
    const messageData = JSON.stringify({ room, newMessage });
    console.log("Publishing message to Redis:", messageData);

    // Publish the message to Redis channel (using the publisher)
    pubSub.publisher.publish(room, messageData);
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Optionally clean up resources or handle user disconnections
    subscribedRooms.clear(); // Clear any stored room subscriptions
  });
};
