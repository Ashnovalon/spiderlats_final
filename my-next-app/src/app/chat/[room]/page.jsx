"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const ChatRoom = () => {
  const { room } = useParams();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?room=${room}`);
      if (response.ok) {
        const data = await response.json();
        const reversedMessages = data.reverse();
        setMessages(reversedMessages);
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    }
    if (session.user.email === "admin@admin.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  useEffect(() => {
    console.log("Attempting to connect to WebSocket...");
    const newSocket = io("http://localhost:3001");
    //const newSocket = io("http://localhost/socket.io/"); if were using nginx proxy

    newSocket.on("connect", () => {
      console.log(`WebSocket connected! Socket ID: ${newSocket.id}`);

      if (room) {
        console.log(`Rejoining room: ${room} after reconnect`);
        newSocket.emit("joinRoom", room);
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket Connection Error:", err.message);
    });

    newSocket.on("historyVisibility", (show) => {
      setShowHistory(show);
      if (show) {
        fetchMessages();
      } else {
        setMessages([]);
      }
    });

    setSocket(newSocket);

    console.log(`Joining room: ${room}`);
    newSocket.emit("joinRoom", room);

    newSocket.on("previousMessages", (prevMessages) => {
      console.log("Previous messages received:", prevMessages);
      setMessages(prevMessages);
    });

    newSocket.on("message", (newMessage) => {
      console.log("Raw message received:", JSON.stringify(newMessage, null, 2));

      if (newMessage && newMessage.senderName && newMessage.text) {
        console.log("Messageonola received:", newMessage);
        setMessages((prev) => {
          console.log("Previous messages:", prev);
          console.log("New state after update:", [...prev, newMessage]);
          return [...prev, newMessage];
        });
      } else {
        console.warn("Invalid message format received:", newMessage);
      }
    });

    newSocket.on("disconnect", () => {
      console.warn("WebSocket disconnected!");
    });

    return () => {
      console.log("Closing socket connection...");
      newSocket.close();
    };
  }, [room]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      const newMessage = {
        senderName: session.user.name,
        text: message,
      };
      console.log(`Sendingaloo message to room ${room}:`, newMessage);
      socket.emit("sendMessage", { room, newMessage });
      setMessage("");
    } else {
      console.warn("Cannot send empty message or socket not connected.");
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowPicker(false);
  };

  const toggleHistoryVisibility = () => {
    if (socket) {
      console.log("gomma");
      socket.emit("toggleHistory", { room, showHistory: !showHistory });
    } else {
      console.log("gaamma");
    }
  };

  const leaveroom = () => {
    router.push("/home");
  };

  return (
    <div className="chat-room">
      <h1>Room: {room}</h1>
      {isAdmin && (
        <button onClick={toggleHistoryVisibility}>
          {showHistory ? "Hide" : "Show"} Message History
        </button>
      )}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <p key={index} className="message">
            {msg.senderName}:{msg.text}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={() => setShowPicker(!showPicker)}>😊</button>
        {showPicker && (
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            disableSearchBar={true}
          />
        )}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-box"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
        <button onClick={leaveroom} className="send-button">
          Leave
        </button>
      </div>
      <style jsx>{`
        .chat-room {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .messages-container {
          width: 100%;
          max-width: 500px;
          height: 400px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          margin: 10px 0;
          background: #f9f9f9;
        }
        .message {
          padding: 5px;
          margin: 5px 0;
          border-bottom: 1px solid #ddd;
        }
        .input-box {
          padding: 10px;
          width: 300px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .send-button {
          padding: 10px 20px;
          margin-left: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .send-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;
