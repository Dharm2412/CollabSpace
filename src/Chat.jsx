import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getAIResponse } from "./utils/gemini";
import RoomSidebar from "./components/RoomSidebar";
import { toast } from "react-hot-toast";
import { useSocket } from "./context/SocketContext";
import { ref, onValue, onDisconnect, set } from "firebase/database";
import { rtdb } from "./firebase";


// Replace with your actual webhook URL for your AI agent
const WEBHOOK_URL =
  "https://dharm.app.n8n.cloud/webhook/0d13ae90-e612-407b-848b-bf4f45c94d24";
const SESSION_KEY = "chat_session";

const parseAIResponse = (text) => {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeContent = [];
  let listCounter = 0;
  const elements = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${index}`}
            className="my-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden transform transition-all hover:scale-[1.02]"
          >
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
              Code Snippet
            </div>
            <pre className="p-4 text-gray-100 text-base font-mono leading-relaxed overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-800">
              <code>{codeContent.join("\n")}</code>
            </pre>
          </div>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeContent.push(line);
    } else if (line.trim().startsWith("# ")) {
      elements.push(
        <h2
          key={`heading-${index}`}
          className="text-3xl font-extrabold text-teal-800 mt-8 mb-4 pb-2 border-b-2 border-teal-400 bg-gradient-to-r via-teal-50 to-transparent rounded-t-md"
        >
          {line.replace(/^#\s*/, "")}
        </h2>
      );
    } else if (line.trim().startsWith("## ")) {
      elements.push(
        <h3
          key={`heading-${index}`}
          className="text-2xl font-bold text-teal-700 mt-6 mb-3 pb-1 border-b border-teal-300"
        >
          {line.replace(/^##\s*/, "")}
        </h3>
      );
    } else if (line.trim().startsWith("### ")) {
      elements.push(
        <h4
          key={`heading-${index}`}
          className="text-xl font-semibold text-teal-600 mt-4 mb-2 italic"
        >
          {line.replace(/^###\s*/, "")}
        </h4>
      );
    } else if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      listCounter++;
      elements.push(
        <div
          key={`list-${index}`}
          className="flex items-start text-teal-900 my-4 ml-6 group"
        >
          <span className="mr-3 text-teal-600 font-extrabold text-lg leading-none transition-transform group-hover:scale-110">
            {listCounter}.
          </span>
          <span className="text-lg leading-relaxed font-medium">
            {line.replace(/^[*|-]\s*/, "")}
          </span>
        </div>
      );
    } else if (line.trim().startsWith("**") && line.trim().endsWith("**")) {
      elements.push(
        <p
          key={`bold-${index}`}
          className="text-lg font-bold text-teal-800 leading-relaxed my-4 bg-teal-50 px-3 py-1 rounded-md shadow-sm"
        >
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.trim()) {
      elements.push(
        <p
          key={`para-${index}`}
          className="text-lg text-teal-900 leading-loose my-4 font-normal tracking-wide"
        >
          {line}
        </p>
      );
    } else {
      listCounter = 0;
    }
  });

  if (inCodeBlock && codeContent.length > 0) {
    elements.push(
      <div
        key={`code-end`}
        className="my-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden transform transition-all hover:scale-[1.02]"
      >
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
          Code Snippet
        </div>
        <pre className="p-4 text-gray-100 text-base font-mono leading-relaxed overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-800">
          <code>{codeContent.join("\n")}</code>
        </pre>
      </div>
    );
  }

  return elements.length > 0 ? (
    <div className="space-y-4">{elements}</div>
  ) : (
    <p className="text-lg text-teal-900 leading-loose font-normal tracking-wide">
      {text}
    </p>
  );
};

function Chat() {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [step, setStep] = useState("join");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [roomId, setRoomId] = useState(
    JSON.parse(localStorage.getItem(SESSION_KEY))?.roomId || ""
  );
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [userId] = useState(
    JSON.parse(localStorage.getItem(SESSION_KEY))?.userId || crypto.randomUUID()
  );

  const messagesEndRef = useRef(null);
  const usernameRef = useRef(username);
  const roomIdRef = useRef(roomId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    usernameRef.current = username;
    roomIdRef.current = roomId;
  }, [username, roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    };

    const handleUserJoined = (user) => {
      setUsers((prev) => {
        if (!prev.includes(user.username)) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now() + Math.random().toString(36).substr(2, 9),
              type: "system",
              content: `${user.username} joined the room`,
              timestamp: new Date().toISOString(),
            },
          ]);
          return [...prev, user.username];
        }
        return prev;
      });
      toast.success(`${user.username} joined the room`);
    };

    const handleUserLeft = (user) => {
      setUsers((prev) => prev.filter((u) => u !== user.username));
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          type: "system",
          content: `${user.username} left the room`,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.error(`${user.username} left the room`);
    };

    const handleRoomData = ({ messages: roomMessages, users: roomUsers }) => {
      setMessages(roomMessages);
      setUsers([...new Set(roomUsers)]);
      scrollToBottom();
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("room-data", handleRoomData);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("room-data", handleRoomData);
    };
  }, [socket, roomId, scrollToBottom]);

  useEffect(() => {
    if (urlRoomId) setRoomId(urlRoomId);
  }, [urlRoomId]);

  useEffect(() => {
    if (roomId && username) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username, roomId, userId, messages })
      );
    }
  }, [roomId, username, userId, messages]);

  useEffect(() => {
    const chatRef = ref(rtdb, `chats/${roomId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data);
        setMessages(messagesArray);
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ username, roomId, userId, messages: messagesArray })
        );
      }
    });

    const presenceRef = ref(rtdb, `presence/${roomId}/${userId}`);
    onDisconnect(presenceRef).remove();
    set(presenceRef, true);

    return () => unsubscribe();
  }, [roomId, userId]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Please enter a username");
      return;
    }

    const newRoomId =
      urlRoomId ||
      roomId.trim() ||
      Math.random().toString(36).substr(2, 6).toUpperCase();

    socket.emit("join-room", { roomId: newRoomId, username: trimmedUsername });

    if (!urlRoomId && !roomId) {
      setMessages((prev) => [
        ...prev,
        {
          id: "room-created",
          type: "system",
          content: `Room ${newRoomId} created!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setStep("chat");
    navigate(`/chat/${newRoomId}`);
    const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    if (savedSession.roomId === newRoomId)
      setMessages(savedSession.messages || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (trimmedMessage.startsWith("@ai")) {
      const prompt = trimmedMessage.replace(/^@ai\s*/, "").trim();
      if (!prompt) return;

      setIsAgentLoading(true);
      const userMessage = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: trimmedMessage,
        sender: usernameRef.current,
        timestamp: new Date().toISOString(),
        isAgentRequest: true,
      };
      const loadingMessage = {
        id: Date.now() + Math.random().toString(36).substr(2, 10),
        text: "Waiting for AI Agent response...",
        sender: "agent-loading",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage, loadingMessage]);

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            roomId: roomIdRef.current,
            username: usernameRef.current,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Webhook request failed: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("AI Agent Response:", data); // Log the full response to console

        // Extract the 'output' field from the first element of the array
        const agentText =
          Array.isArray(data) && data.length > 0 && data[0].output
            ? data[0].output
            : "No valid response text received";

        const agentChatMessage = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          text: agentText,
          sender: "ai-agent",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) =>
          prev
            .filter((msg) => msg.sender !== "agent-loading")
            .concat(agentChatMessage)
        );
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching AI Agent response:", error);
        toast.error(`Failed to get AI Agent response: ${error.message}`);
        setMessages((prev) =>
          prev.filter((msg) => msg.sender !== "agent-loading")
        );
      } finally {
        setIsAgentLoading(false);
        setMessage("");
      }
    } else {
      const newMessage = {
        text: trimmedMessage,
        sender: usernameRef.current,
        timestamp: new Date().toISOString(),
      };

      socket.emit("send-message", {
        roomId: roomIdRef.current,
        message: newMessage,
      });
      setMessage("");
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isAILoading) return;

    setIsAILoading(true);
    try {
      let aiText;
      if (
        /(who('s|s)\s+(your\s+)?(boss|creator|sir)|(boss|sir|creator)\s+name|who\s+(made|created|built|is))/i.test(
          trimmedMessage
        )
      ) {
        aiText = "Dharm Patel";
      } else {
        aiText = await getAIResponse(trimmedMessage);
      }
      const aiResponse = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: aiText,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setMessage("");
      scrollToBottom();
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", {
      roomId: roomIdRef.current,
      username: usernameRef.current,
    });
    localStorage.removeItem(SESSION_KEY);
    setStep("join");
    setRoomId("");
    setUsername("");
    setUsers([]);
    setMessages([]);
    navigate("/chat");
  };

  const handleVideoCall = () => {
    navigate(`/video-call/${roomId}`);
  };

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (
      container &&
      container.scrollHeight - container.scrollTop - container.clientHeight <
        100
    ) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  if (step === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Join a Chat Room
          </h2>
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {urlRoomId ? "Room ID" : "Room ID (optional)"}
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Leave empty to create new room"
                readOnly={!!urlRoomId}
                disabled={!!urlRoomId}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
            >
              {urlRoomId ? "Join Room" : "Create or Join Room"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-indigo-600 to-teal-600 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-xl font-bold">
              Chat Room: {roomId}
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleVideoCall}
              className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Start Video Call
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <RoomSidebar roomId={roomId} users={users} onLeave={handleLeaveRoom} />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
            {messages.map((message) => {
              if (message.type === "system") {
                const isJoinMessage = message.content.includes("joined");
                const isLeaveMessage = message.content.includes("left");
                const isRoomCreated = message.content.includes("created");

                return (
                  <div
                    key={message.id}
                    className="text-center my-3 animate-fade-in-up"
                  >
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm shadow-md border ${
                        isJoinMessage
                          ? "bg-green-100 border-green-300 text-green-800"
                          : isLeaveMessage
                          ? "bg-red-100 border-red-300 text-red-800"
                          : isRoomCreated
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isJoinMessage && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {isLeaveMessage && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {isRoomCreated && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 11H5a1 1 0 110-2h2.586l-1.293-1.293a1 1 0 010-1.414z" />
                          </svg>
                        )}
                        <span className="font-medium">{message.content}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              const isAI = message.sender === "ai";
              const isAgent = message.sender === "ai-agent";
              const isUser = message.sender === username;
              const isAgentLoading = message.sender === "agent-loading";
              const isAgentRequest = message.isAgentRequest;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-2xl relative group ${
                    isUser || isAgentRequest ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl shadow-md border ${
                      isUser && !isAgentRequest
                        ? "bg-indigo-600 text-white border-indigo-700 rounded-br-none"
                        : isAI
                        ? "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-900 border-teal-200 rounded-bl-none shadow-inner"
                        : isAgent
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-900 border-orange-200 rounded-bl-none shadow-inner"
                        : isAgentLoading
                        ? "bg-gray-100 text-gray-600 border-gray-200 rounded-bl-none animate-bounce"
                        : isAgentRequest
                        ? "bg-blue-500 text-white border-blue-600 rounded-br-none"
                        : "bg-white text-gray-800 border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!isUser && !isAgentRequest && message.sender && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isAI
                              ? "bg-teal-200 text-teal-700"
                              : isAgent
                              ? "bg-orange-200 text-orange-700"
                              : isAgentLoading
                              ? "bg-gray-200 text-gray-600 animate-spin"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {isAI
                              ? "🤖"
                              : isAgent
                              ? "🧠"
                              : isAgentLoading
                              ? "⌛"
                              : message.sender[0].toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isAI
                              ? "text-teal-800"
                              : isAgent
                              ? "text-orange-800"
                              : isAgentLoading
                              ? "text-gray-600"
                              : "text-gray-700"
                          }`}
                        >
                          {isAI
                            ? "AI Assistant"
                            : isAgent
                            ? "AI Agent"
                            : isAgentLoading
                            ? "AI Agent Processing"
                            : message.sender}
                        </span>
                      </div>
                    )}
                    <div className={isAI || isAgent ? "space-y-2" : ""}>
                      {isAI || isAgent ? (
                        parseAIResponse(message.text)
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 ${
                        isUser && !isAgentRequest
                          ? "text-indigo-200"
                          : isAI
                          ? "text-teal-600"
                          : isAgent
                          ? "text-orange-600"
                          : isAgentLoading
                          ? "text-gray-500"
                          : isAgentRequest
                          ? "text-blue-200"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t shadow-inner"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Type your message or @ai for AI Agent..."
                disabled={isAILoading || isAgentLoading}
              />
              <button
                type="button"
                onClick={handleAIChat}
                disabled={isAILoading || isAgentLoading}
                className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-md"
              >
                {isAILoading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Thinking...
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    Ask AI
                  </>
                )}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isAILoading || isAgentLoading}
              >
                {isAgentLoading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin inline-block mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending to Agent...
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
