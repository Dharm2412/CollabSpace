import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import RoomSidebar from './RoomSidebar';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { debounce } from 'lodash';
import { FiFile, FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';

export default function CodeShare() {
  const { roomId } = useParams();
  const [files, setFiles] = useState({ 'main.js': '// Start coding here...' });
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState('main.js');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    const handleRoomData = ({ users }) => {
      setUsers(users);
    };

    const handleCodeUpdate = debounce((newCode) => {
      setFiles(prev => prev !== newCode ? newCode : prev);
    }, 50);

    newSocket.on('connect', () => {
      newSocket.emit('join-room', { roomId, username: 'Anonymous' });
    });

    newSocket.on('room-data', handleRoomData);
    newSocket.on('code_update', handleCodeUpdate);
    newSocket.on('user_list', setUsers);

    return () => {
      newSocket.off('room-data', handleRoomData);
      newSocket.off('code_update', handleCodeUpdate);
      newSocket.off('user_list', setUsers);
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleEditorChange = useCallback(
    debounce((value) => {
      if (socket && value !== files[selectedFile]) {
        socket.emit('code_update', { roomId, code: value, filename: selectedFile });
      }
    }, 50),
    [socket, roomId, selectedFile]
  );

  const fileTree = useMemo(() => {
    const tree = {};
    Object.keys(files).forEach(path => {
      const parts = path.split('/');
      let currentLevel = tree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            isFolder: index < parts.length - 1,
            path: parts.slice(0, index + 1).join('/'),
            children: {}
          };
        }
        currentLevel = currentLevel[part].children;
      });
    });
    return tree;
  }, [files]);

  const generateCodeWithAI = async () => {
    try {
      setIsAILoading(true);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBQdCEmQAKkd6qDYFcPK6aZ1Mkus2nqGa8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `As a senior developer, generate clean code without comments. 
                     Structure response with // FILENAME: before each file. 
                     Request: ${aiPrompt}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedCode = data.candidates[0].content.parts[0].text;
      
      const fileRegex = /^\s*\/\/\s*FILENAME:\s*(.+?)\s*$(?:\r\n?|\n)([\s\S]*?)(?=^\s*\/\/\s*FILENAME:|\Z)/gmi;
      const newFiles = {};
      let match;
      
      while ((match = fileRegex.exec(generatedCode)) !== null) {
        const fullPath = match[1].trim();
        const content = match[2].trim()
          .replace(/\/\/ FILENAME:.*$/gm, '')
          .replace(/\/\/.*/g, '')
          .trim();
        
        if (fullPath && content.length > 0) {
          newFiles[fullPath] = content;
        }
      }
      
      if (Object.keys(newFiles).length > 0) {
        setFiles(prev => {
          const updatedFiles = { ...newFiles };
          if (socket) {
            socket.emit('code_update', { roomId, code: updatedFiles });
          }
          return updatedFiles;
        });
        setSelectedFile(Object.keys(newFiles)[0]);
      } else {
        alert('No valid code files generated');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  const MemoizedFileTree = memo(({ data, level = 0 }) => {
    const toggleFolder = useCallback((path) => {
      setExpandedFolders(prev => new Set(prev)[path] ? prev.delete(path) : prev.add(path));
    }, []);

    return Object.values(data).map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center p-1 hover:bg-gray-100 rounded cursor-pointer ${
            selectedFile === node.path ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => !node.isFolder && setSelectedFile(node.path)}
        >
          {node.isFolder ? (
            <>
              <button
                className="mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
              >
                {expandedFolders.has(node.path) ? <FiChevronDown /> : <FiChevronRight />}
              </button>
              <FiFolder className="mr-2 text-blue-500" />
              <span className="font-medium">{node.name}</span>
            </>
          ) : (
            <>
              <FiFile className="mr-2 text-gray-500 ml-4" />
              <span className="text-gray-700">{node.name}</span>
            </>
          )}
        </div>
        {node.isFolder && expandedFolders.has(node.path) && (
          <MemoizedFileTree data={node.children} level={level + 1} />
        )}
      </div>
    ));
  });

  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 15,
    scrollBeyondLastLine: false,
    lineNumbersMinChars: 3,
    padding: { top: 10 },
    roundedSelection: false,
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 }
  }), []);

  return (
    <div className="flex h-screen">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 p-4 bg-gray-50">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Room: {roomId}</h2>
          
          <div className="flex gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the code you want to generate (e.g. 'React todo app with components')"
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={generateCodeWithAI}
              disabled={isAILoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
            >
              {isAILoading ? (
                <>
                  <span className="animate-spin">🌀</span> Generating...
                </>
              ) : (
                <>
                  <span>✨</span> Generate Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-2 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Project Files</h3>
              <button
                onClick={() => {
                  const newPath = prompt('Enter file/folder path (e.g. src/components/Button.js):');
                  if (newPath && newPath.trim().length > 0) {
                    setFiles(prev => ({ 
                      ...prev, 
                      [newPath.trim()]: '// Start coding here...' 
                    }));
                    setSelectedFile(newPath.trim());
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-600"
              >
                <FiFile className="inline-block mr-1" />+
              </button>
            </div>
            <MemoizedFileTree data={fileTree} />
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Current File:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {selectedFile}
                </span>
              </div>
              <button
                onClick={() => {
                  const newPath = prompt('Enter new file path:');
                  if (newPath) {
                    setFiles(prev => ({ ...prev, [newPath]: '' }));
                    setSelectedFile(newPath);
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm flex items-center gap-1"
              >
                <FiFile className="inline-block" /> New File
              </button>
            </div>
            
            <Editor
              key={selectedFile}
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={files[selectedFile] || ''}
              options={editorOptions}
              onChange={(value) => {
                setFiles(prev => ({ ...prev, [selectedFile]: value }));
                handleEditorChange(value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 