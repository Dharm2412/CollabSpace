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
} from "react-icons/fi";
import RoomSidebar from "./RoomSidebar";
import toast from "react-hot-toast";

const SOCKET_URL = "http://localhost:3001";
const API_KEY = "AIzaSyBQdCEmQAKkd6qDYFcPK6aZ1Mkus2nqGa8";
const AI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Memoized File Tree Component
const FileTree = memo(
  ({
    data,
    level = 0,
    selectedFile,
    onSelectFile,
    expandedFolders,
    toggleFolder,
  }) => {
    return Object.values(data).map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center p-1 hover:bg-gray-100 rounded cursor-pointer ${
            selectedFile === node.path
              ? "bg-blue-50 border border-blue-200"
              : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => !node.isFolder && onSelectFile(node.path)}
        >
          {node.isFolder ? (
            <>
              <button
                className="mr-1 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
              >
                {expandedFolders.has(node.path) ? (
                  <FiChevronDown />
                ) : (
                  <FiChevronRight />
                )}
              </button>
              <FiFolder className="mr-2 text-blue-500" />
              <span className="font-medium text-gray-700">{node.name}</span>
            </>
          ) : (
            <>
              <FiFile className="mr-2 text-gray-500 ml-4" />
              <span className="text-gray-700">{node.name}</span>
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
          />
        )}
      </div>
    ));
  }
);

function CodeShare() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState({ "main.js": "// Start coding here..." });
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState("main.js");
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [username] = useState(localStorage.getItem("username") || "Anonymous");

  // Socket setup and cleanup
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-room", { roomId, username });
      toast.success("Connected to room");
    });

    newSocket.on("connect_error", () => {
      toast.error("Failed to connect to server");
      navigate("/chat");
    });

    newSocket.on("room-data", ({ users }) => setUsers(users));
    newSocket.on(
      "code_update",
      debounce((newFiles) => {
        setFiles((prev) =>
          JSON.stringify(prev) !== JSON.stringify(newFiles) ? newFiles : prev
        );
      }, 50)
    );
    newSocket.on("user_list", setUsers);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username, navigate]);

  // Editor change handler
  const handleEditorChange = useCallback(
    debounce((value) => {
      if (socket && value !== files[selectedFile]) {
        const updatedFiles = { ...files, [selectedFile]: value };
        socket.emit("code_update", { roomId, code: updatedFiles });
        setFiles(updatedFiles);
      }
    }, 50),
    [socket, roomId, selectedFile, files]
  );

  // File tree computation
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

  // AI code generation
  const generateCodeWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
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
                  text: `As a senior developer, generate clean code without comments. 
                     Structure response with // FILENAME: before each file. 
                     Request: ${aiPrompt}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI API request failed");

      const data = await response.json();
      const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedCode) throw new Error("No valid response from AI");

      const fileRegex =
        /^\s*\/\/\s*FILENAME:\s*(.+?)\s*$(?:\r\n?|\n)([\s\S]*?)(?=^\s*\/\/\s*FILENAME:|\Z)/gim;
      const newFiles = {};
      let match;

      while ((match = fileRegex.exec(generatedCode)) !== null) {
        const fullPath = match[1].trim();
        const content = match[2].trim();
        if (fullPath && content) newFiles[fullPath] = content;
      }

      if (Object.keys(newFiles).length === 0) {
        throw new Error("No valid code files generated");
      }

      setFiles((prev) => {
        const updatedFiles = { ...prev, ...newFiles };
        if (socket) socket.emit("code_update", { roomId, code: updatedFiles });
        return updatedFiles;
      });
      setSelectedFile(Object.keys(newFiles)[0]);
      toast.success("Code generated successfully");
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error.message || "Failed to generate code");
    } finally {
      setIsAILoading(false);
      setAiPrompt("");
    }
  };

  // File tree handlers
  const toggleFolder = useCallback((path) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  }, []);

  const addNewFile = useCallback(() => {
    const newPath = prompt(
      "Enter file/folder path (e.g. src/components/Button.js):"
    );
    if (!newPath || !newPath.trim()) return;

    const trimmedPath = newPath.trim();
    setFiles((prev) => {
      if (prev[trimmedPath]) {
        toast.error("File already exists");
        return prev;
      }
      const updatedFiles = {
        ...prev,
        [trimmedPath]: "// Start coding here...",
      };
      if (socket) socket.emit("code_update", { roomId, code: updatedFiles });
      return updatedFiles;
    });
    setSelectedFile(trimmedPath);
    toast.success("File added");
  }, [socket, roomId]);

  // Download all files as zip
  const downloadCode = useCallback(() => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        saveAs(content, `CodeRoom_${roomId}.zip`);
        toast.success("Code downloaded successfully");
      })
      .catch((error) => {
        console.error("Download Error:", error);
        toast.error("Failed to download code");
      });
  }, [files, roomId]);

  // Import folder or multiple files
  const importFolder = useCallback(async () => {
    try {
      // Try directory picker (modern browsers)
      if ("showDirectoryPicker" in window) {
        const dirHandle = await window.showDirectoryPicker();
        const newFiles = {};

        const readDirectory = async (handle, basePath = "") => {
          for await (const entry of handle.values()) {
            const path = `${basePath}${entry.name}`;
            if (entry.kind === "file") {
              const file = await entry.getFile();
              const content = await file.text();
              newFiles[path] = content;
            } else if (entry.kind === "directory") {
              await readDirectory(entry, `${path}/`);
            }
          }
        };

        await readDirectory(dirHandle);
        if (Object.keys(newFiles).length === 0) {
          toast.error("No files found in the selected directory");
          return;
        }

        setFiles((prev) => {
          const updatedFiles = { ...prev, ...newFiles };
          if (socket) socket.emit("code_update", { roomId, code: updatedFiles });
          return updatedFiles;
        });
        setSelectedFile(Object.keys(newFiles)[0]);
        toast.success(`Imported ${Object.keys(newFiles).length} files`);
      } else {
        // Fallback to multiple file input
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.webkitdirectory = true; // For older browsers
        input.directory = true;       // For some browsers
        input.mozdirectory = true;    // For Firefox
        
        input.onchange = (e) => {
          const selectedFiles = Array.from(e.target.files);
          if (!selectedFiles.length) return;

          const newFiles = {};
          const promises = selectedFiles.map((file) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                // Use webkitRelativePath or relativePath if available, otherwise just file.name
                const path = file.webkitRelativePath || file.relativePath || file.name;
                newFiles[path] = event.target.result;
                resolve();
              };
              reader.onerror = () => {
                toast.error(`Failed to read ${file.name}`);
                resolve();
              };
              reader.readAsText(file);
            });
          });

          Promise.all(promises).then(() => {
            if (Object.keys(newFiles).length === 0) {
              toast.error("No valid files imported");
              return;
            }

            setFiles((prev) => {
              const updatedFiles = { ...prev, ...newFiles };
              if (socket) socket.emit("code_update", { roomId, code: updatedFiles });
              return updatedFiles;
            });
            setSelectedFile(Object.keys(newFiles)[0]);
            toast.success(`Imported ${Object.keys(newFiles).length} files`);
          });
        };
        input.click();
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Failed to import folder");
    }
  }, [socket, roomId]);

  // Editor options
  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 16,
      scrollBeyondLastLine: false,
      lineNumbersMinChars: 3,
      padding: { top: 10 },
      roundedSelection: false,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
      wordWrap: "on",
    }),
    []
  );

  if (!socket)
    return (
      <div className="flex h-screen items-center justify-center">
        Connecting...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 p-6">
        <div className="mb-6 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Code Room: {roomId}
          </h2>
          <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the code you want (e.g., 'React todo app with hooks')"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700"
              disabled={isAILoading}
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
                  <span>🤖</span> Generate
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-72 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-gray-700">Files</h3>
              <div className="flex gap-2">
                <button
                  onClick={addNewFile}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                  title="Add new file"
                >
                  <FiFile className="text-lg" />
                </button>
                <button
                  onClick={importFolder}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                  title="Import folder"
                >
                  <FiUpload className="text-lg" />
                </button>
                <button
                  onClick={downloadCode}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                  title="Download all files"
                >
                  <FiDownload className="text-lg" />
                </button>
              </div>
            </div>
            <FileTree
              data={fileTree}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Editing:
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                  {selectedFile}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addNewFile}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <FiFile /> New File
                </button>
                <button
                  onClick={importFolder}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <FiUpload /> Import Folder
                </button>
                <button
                  onClick={downloadCode}
                  className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <FiDownload /> Download
                </button>
              </div>
            </div>
            <Editor
              key={selectedFile}
              height="100%"
              defaultLanguage={
                selectedFile.endsWith(".css")
                  ? "css"
                  : selectedFile.endsWith(".html")
                  ? "html"
                  : "javascript"
              }
              theme="vs-dark"
              value={files[selectedFile] || ""}
              options={editorOptions}
              onChange={handleEditorChange}
              loading={
                <div className="p-4 text-gray-500">Loading editor...</div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeShare;
