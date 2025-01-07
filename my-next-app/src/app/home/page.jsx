"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

const RoomSelection = () => {
  const [room, setRoom] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
    if (room.trim()) {
      router.push(`/chat/${room}`); // Redirect to the chat room page
    }
  };

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "loading") return; // Avoid redirecting while session is loading
    if (!session) {
      router.push("/"); // Redirect to login page if not authenticated
    }
  }, [session, status, router]);

  // If session is still loading, you might want to show a loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If session is not available, this will return null and trigger the redirect
  if (!session) {
    return null;
  }

  return (
    <div className="room-selection">
      <h1>Select a Room {session.user.name}</h1>
      <input
        type="text"
        placeholder="Enter room name"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="input-box"
      />
      <button onClick={handleJoinRoom} className="join-button">
        Join Room
      </button>
      <style jsx>{`
        .room-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          background-color: #f4f4f9;
        }
        .input-box {
          padding: 10px;
          margin: 10px 0;
          width: 300px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .join-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .join-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default RoomSelection;
