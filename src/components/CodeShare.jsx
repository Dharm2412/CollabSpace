import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";
import { debounce } from "lodash";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  FiFile,
  FiFolder,
  FiChevronRight,
  FiChevronDown,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiCode,
  FiPlay,
  FiX,
} from "react-icons/fi";
import RoomSidebar from "./RoomSidebar";
import toast from "react-hot-toast";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const SOCKET_URL = "http://localhost:3001";
const API_KEY = "AIzaSyB5LjHte97UTbIkcGyu-pWvMcdv82HiCwM";
const AI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// FileTree Component (for displaying the file structure)
const FileTree = memo(
  ({
    data,
    level = 0,
    selectedFile,
    onSelectFile,
    expandedFolders,
    toggleFolder,
    onDeleteFile,
  }) => (
    <div className="space-y-1">
      {Object.values(data).map((node) => (
        <div key={node.path}>
          <div
            className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 ${
              selectedFile === node.path
                ? "bg-blue-50 border-l-2 border-blue-500"
                : "hover:bg-gray-100"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => !node.isFolder && onSelectFile(node.path)}
          >
            {node.isFolder ? (
              <>
                <button
                  className="mr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(node.path);
                  }}
                >
                  {expandedFolders.has(node.path) ? (
                    <FiChevronDown size={14} />
                  ) : (
                    <FiChevronRight size={14} />
                  )}
                </button>
                <FiFolder className="mr-1 text-blue-400" size={14} />
                <span className="text-sm text-gray-800 truncate">
                  {node.name}
                </span>
              </>
            ) : (
              <>
                <FiFile className="mr-1 text-gray-400" size={14} />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {node.name}
                </span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(node.path);
                  }}
                  title="Delete File"
                >
                  <FiTrash2 size={12} />
                </button>
              </>
            )}
          </div>
          {node.isFolder && expandedFolders.has(node.path) && (
            <FileTree
              data={node.children}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onDeleteFile={onDeleteFile}
            />
          )}
        </div>
      ))}
    </div>
  )
);

// Main CodeShare Component
const CodeShare = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [username] = useState(localStorage.getItem("username") || "Anonymous");

  // Console feature state
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);

  // Firestore Synchronization
  useEffect(() => {
    const roomDocRef = doc(db, "codeRooms", roomId);
    const unsubscribe = onSnapshot(
      roomDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const newFiles = data.files || {};
          setFiles(newFiles);
          if (!selectedFile || !newFiles[selectedFile]) {
            const firstFile = Object.keys(newFiles)[0];
            setSelectedFile(firstFile || null);
          }
        } else {
          setDoc(roomDocRef, { files: {} });
        }
      },
      (error) => toast.error("Firestore sync failed: " + error.message)
    );
    return () => unsubscribe();
  }, [roomId, selectedFile]);

  // Socket.IO Connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-room", { roomId, username });
      toast.success("Connected to room");
    });

    newSocket.on("connect_error", () => {
      toast.error("Connection failed");
      setTimeout(() => navigate("/chat"), 2000);
    });

    newSocket.on("room-data", ({ users }) => setUsers(users));
    newSocket.on(
      "code_update",
      debounce((newFiles) => {
        setFiles((prev) =>
          JSON.stringify(prev) === JSON.stringify(newFiles) ? prev : newFiles
        );
        if (!newFiles[selectedFile] && Object.keys(newFiles).length > 0) {
          setSelectedFile(Object.keys(newFiles)[0]);
        }
      }, 50)
    );
    newSocket.on("user_list", setUsers);

    return () => newSocket.disconnect();
  }, [roomId, username, navigate, selectedFile]);

  // Sync files to Firestore
  const syncFilesToFirestore = useCallback(
    debounce(async (newFiles) => {
      const roomDocRef = doc(db, "codeRooms", roomId);
      try {
        await setDoc(roomDocRef, { files: newFiles }, { merge: true });
      } catch (error) {
        toast.error("Sync failed: " + error.message);
      }
    }, 300),
    [roomId]
  );

  // Handle editor changes
  const handleEditorChange = useCallback(
    debounce((value) => {
      if (!socket || !selectedFile || value === files[selectedFile]) return;
      const updatedFiles = { ...files, [selectedFile]: value || "" };
      setFiles(updatedFiles);
      socket.emit("code_update", { roomId, code: updatedFiles });
      syncFilesToFirestore(updatedFiles);
    }, 150),
    [socket, roomId, selectedFile, files, syncFilesToFirestore]
  );

  // Compute file tree structure
  const fileTree = useMemo(() => {
    const tree = {};
    Object.keys(files).forEach((path) => {
      const parts = path.split("/").filter(Boolean);
      let currentLevel = tree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            isFolder: index < parts.length - 1,
            path: parts.slice(0, index + 1).join("/"),
            children: {},
          };
        }
        currentLevel = currentLevel[part].children;
      });
    });
    return tree;
  }, [files]);

  // Run JavaScript code and capture console output
  const handleRunCode = useCallback(() => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }
    const language = getEditorLanguage(selectedFile);
    if (language !== "javascript") {
      toast.error("Only JavaScript is supported for now");
      return;
    }
    const code = files[selectedFile];
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput((prev) => [
      ...prev,
      { type: "info", message: `----- Run at ${timestamp} -----` },
    ]);
    setIsConsoleVisible(true);

    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args) => {
      setConsoleOutput((prev) => [
        ...prev,
        { type: "log", message: args.join(" ") },
      ]);
      originalLog(...args);
    };
    console.error = (...args) => {
      setConsoleOutput((prev) => [
        ...prev,
        { type: "error", message: args.join(" ") },
      ]);
      originalError(...args);
    };

    try {
      eval(code);
    } catch (error) {
      setConsoleOutput((prev) => [
        ...prev,
        { type: "error", message: `Execution Error: ${error.message}` },
      ]);
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  }, [selectedFile, files]);

  // Keyboard shortcut for running code (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleRunCode();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode]);

  // AI Code Generation
  const generateCodeWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a valid prompt");
      return;
    }
    setIsAILoading(true);
    try {
      const response = await fetch(`${AI_API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
                    You are an expert developer proficient in all programming languages.
                    Generate a complete, functional codebase for the following request: "${aiPrompt}".
                    - Structure the output with "// FILENAME: <path/to/file>" (e.g., "// FILENAME: src/main.js").
                    - Always include a "// FILENAME: main.js" as the entry point file.
                    - Use proper file extensions (.js, .py, etc.).
                    - Include all necessary files for a fully working application.
                    - Ensure the code is clean, syntactically correct, and production-ready with NO comments except FILENAME markers.
                    - Support folder structures for larger projects.
                    - If no specific language is mentioned, default to JavaScript with main.js as entry point.
                  `,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedCode) {
        throw new Error("No code generated");
      }

      const fileRegex =
        /^\s*\/\/\s*FILENAME:\s*([^\s]+.*?)(?:\r\n|\n|\r)([\s\S]*?)(?=(^\s*\/\/\s*FILENAME:|\Z))/gim;
      const newFiles = {};
      let match;
      while ((match = fileRegex.exec(generatedCode)) !== null) {
        const fullPath = match[1].trim();
        const content = match[2].trim();
        if (fullPath && content && /\.\w+$/.test(fullPath)) {
          newFiles[fullPath] = content;
        }
      }

      if (!newFiles["main.js"]) {
        newFiles["main.js"] = "console.log('Hello from main.js');";
      }

      if (!Object.keys(newFiles).length) {
        throw new Error("No valid files generated");
      }

      setFiles(newFiles);
      setSelectedFile("main.js");
      socket?.emit("code_update", { roomId, code: newFiles });
      await syncFilesToFirestore(newFiles);
      toast.success(`Generated ${Object.keys(newFiles).length} files`);
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error.message || "Failed to generate code");
    } finally {
      setIsAILoading(false);
      setAiPrompt("");
    }
  }, [aiPrompt, socket, roomId, syncFilesToFirestore]);

  // Add a new file
  const addNewFile = useCallback(() => {
    const newPath = prompt("Enter file path (e.g., src/main.js):")?.trim();
    if (!newPath || !/\.\w+$/.test(newPath)) {
      toast.error("Invalid file path (must include extension)");
      return;
    }
    if (files[newPath]) {
      toast.error("File already exists");
      return;
    }
    const updatedFiles = { ...files, [newPath]: "" };
    setFiles(updatedFiles);
    setSelectedFile(newPath);
    socket?.emit("code_update", { roomId, code: updatedFiles });
    syncFilesToFirestore(updatedFiles);
  }, [files, socket, roomId, syncFilesToFirestore]);

  // Delete a file
  const deleteFile = useCallback(
    (path) => {
      if (!window.confirm(`Delete ${path}? This cannot be undone.`)) return;
      const updatedFiles = { ...files };
      delete updatedFiles[path];
      setFiles(updatedFiles);
      if (selectedFile === path) setSelectedFile(null);
      socket?.emit("code_update", { roomId, code: updatedFiles });
      syncFilesToFirestore(updatedFiles);
      toast.success(`Deleted ${path}`);
    },
    [files, selectedFile, socket, roomId, syncFilesToFirestore]
  );

  // Delete all files
  const deleteAllFiles = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete all files?")) return;
    const emptyFiles = {};
    setFiles(emptyFiles);
    setSelectedFile(null);
    setExpandedFolders(new Set());
    socket?.emit("code_update", { roomId, code: emptyFiles });
    await syncFilesToFirestore(emptyFiles);
    toast.success("All files deleted");
  }, [socket, roomId, syncFilesToFirestore]);

  // Download project as ZIP
  const downloadCode = useCallback(async () => {
    if (!Object.keys(files).length) {
      toast.error("No files to download");
      return;
    }
    const zip = new JSZip();
    const filesToDownload = { ...files };
    if (!filesToDownload["main.js"]) {
      filesToDownload["main.js"] = "console.log('Hello from main.js');";
    }
    Object.entries(filesToDownload).forEach(([path, content]) =>
      zip.file(path, content)
    );
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `CodeRoom_${roomId}_${Date.now()}.zip`);
    toast.success("Project downloaded");
  }, [files, roomId]);

  // Import folder/files
  const importFolder = useCallback(async () => {
    const loadingToast = toast.loading("Importing files...");
    try {
      const newFiles = {};
      if ("showDirectoryPicker" in window) {
        const dirHandle = await window.showDirectoryPicker();
        const readDirectory = async (handle, basePath = "") => {
          for await (const entry of handle.values()) {
            const path = `${basePath}${entry.name}`;
            if (entry.kind === "file") {
              newFiles[path] = await (await entry.getFile()).text();
            } else if (entry.kind === "directory") {
              await readDirectory(entry, `${path}/`);
            }
          }
        };
        await readDirectory(dirHandle);
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.webkitdirectory = true;
        await new Promise((resolve) => {
          input.onchange = async (e) => {
            await Promise.all(
              Array.from(e.target.files).map(async (file) => {
                newFiles[file.webkitRelativePath || file.name] =
                  await file.text();
              })
            );
            resolve();
          };
          input.click();
        });
      }

      if (!Object.keys(newFiles).length) {
        throw new Error("No files imported");
      }
      const updatedFiles = { ...files, ...newFiles };
      setFiles(updatedFiles);
      setSelectedFile(Object.keys(newFiles)[0]);
      socket?.emit("code_update", { roomId, code: updatedFiles });
      await syncFilesToFirestore(updatedFiles);
      toast.success(`Imported ${Object.keys(newFiles).length} files`);
    } catch (error) {
      toast.error(error.message || "Failed to import files");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, [files, socket, roomId, syncFilesToFirestore]);

  // Toggle folder expansion
  const toggleFolder = useCallback((path) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  }, []);

  // Determine editor language based on file extension
  const getEditorLanguage = useCallback((fileName) => {
    if (!fileName) return "plaintext";
    const extension = fileName.split(".").pop().toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      php: "php",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      sql: "sql",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      rb: "ruby",
      go: "go",
      rs: "rust",
      sh: "shell",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
    };
    return languageMap[extension] || "plaintext";
  }, []);

  // Editor options
  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      lineNumbersMinChars: 3,
      padding: { top: 8, bottom: 8 },
      roundedSelection: false,
      scrollbar: { vertical: "auto", horizontal: "auto" },
      wordWrap: "on",
      smoothScrolling: true,
      formatOnType: true,
      formatOnPaste: true,
      tabSize: 2,
      automaticLayout: true,
    }),
    []
  );

  // Loading state
  if (!socket) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <span className="animate-pulse text-gray-600">Connecting...</span>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Room: <span className="font-mono text-blue-600">{roomId}</span>
          </h2>
          <div className="mt-3 flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., 'Create a simple React application'"
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm placeholder-gray-400"
              disabled={isAILoading}
              onKeyPress={(e) => e.key === "Enter" && generateCodeWithAI()}
            />
            <button
              onClick={generateCodeWithAI}
              disabled={isAILoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isAILoading ? (
                <>
                  <span className="animate-spin">🌀</span> Generating...
                </>
              ) : (
                <>
                  <span>🤖</span> Generate Code
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex flex-1 gap-4 overflow-hidden">
          <aside className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-800">
                Project Files
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addNewFile}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  title="New File"
                >
                  <FiPlus size={18} />
                </button>
                <button
                  onClick={importFolder}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  title="Import Folder"
                >
                  <FiUpload size={18} />
                </button>
                <button
                  onClick={downloadCode}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  title="Download Project"
                >
                  <FiDownload size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {Object.keys(files).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">
                  No files yet. Add or generate some!
                </p>
              ) : (
                <FileTree
                  data={fileTree}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  onDeleteFile={deleteFile}
                />
              )}
            </div>
          </aside>

          <main className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {selectedFile && files[selectedFile] !== undefined ? (
              <>
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs text-gray-600 truncate max-w-[50%]">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">
                      {selectedFile}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCode}
                      className="px-4 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm font-medium flex items-center gap-1"
                      title="Run Code (Ctrl+Enter)"
                    >
                      <FiPlay size={16} />
                      Run
                    </button>
                    <button
                      onClick={addNewFile}
                      className="px-4 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium"
                    >
                      New File
                    </button>
                    <button
                      onClick={downloadCode}
                      className="px-4 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm font-medium"
                    >
                      Download All
                    </button>
                    <button
                      onClick={deleteAllFiles}
                      className="px-4 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium"
                      title="Delete All Files"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={getEditorLanguage(selectedFile)}
                    theme="vs-dark"
                    value={files[selectedFile] || ""}
                    options={editorOptions}
                    onChange={handleEditorChange}
                    loading={
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Loading Editor...
                      </div>
                    }
                  />
                  {isConsoleVisible && (
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gray-900 text-white p-2 overflow-auto">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Console</span>
                        <div>
                          <button
                            onClick={() => setConsoleOutput([])}
                            className="mr-2 text-gray-400 hover:text-white"
                            title="Clear Console"
                          >
                            <FiTrash2 size={14} />
                          </button>
                          <button
                            onClick={() => setIsConsoleVisible(false)}
                            className="text-gray-400 hover:text-white"
                            title="Close Console"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                      <pre className="text-sm">
                        {consoleOutput.map((item, index) => (
                          <div
                            key={index}
                            className={
                              item.type === "error"
                                ? "text-red-400"
                                : item.type === "info"
                                ? "text-gray-500"
                                : "text-white"
                            }
                          >
                            {item.message}
                          </div>
                        ))}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a file or generate a project to start coding
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CodeShare;
