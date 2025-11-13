// src/pages/Messages.jsx
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const BASE_URL = "http://127.0.0.1:5175"; // Use your backend URL

export default function Messages({ userId }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // 1️⃣ Get or create chat with the user
    const fetchChat = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/chats/user/${userId}/admin`);
        const data = await res.json();
        setChat(data);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch chat:", err);
      }
    };

    fetchChat();

    // 2️⃣ Connect to Socket.IO
    const socket = io(BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Admin connected to chat socket");
      if (chat?._id) {
        socket.emit("joinChat", { chatId: chat._id });
      }
    });

    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    socket.on("message", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Admin disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, chat?._id]);

  const sendMessage = async () => {
    if (!input.trim() || !chat?._id) return;

    const message = {
      sender: "Admin", // You can replace with admin ID if you have users collection
      content: input,
    };

    // 1️⃣ Emit Socket.IO event
    socketRef.current.emit("sendMessage", { chatId: chat._id, ...message });

    // 2️⃣ Persist message to backend
    try {
      await fetch(`${BASE_URL}/api/chats/${chat._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    setInput("");
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">
        💬 Chat with User
      </h2>

      <div className="border h-80 overflow-y-auto p-3 bg-slate-50 rounded mb-3">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong className="text-slate-700">{msg.sender}:</strong>{" "}
            <span className="text-slate-600">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2 outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
