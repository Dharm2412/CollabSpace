import React, { useState } from 'react';
import { generateCode } from '../utils/gemini';
import { Code2, Copy, Send, MessageSquare, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CodeGenerator({ onPasteToChat, onPasteToWhiteboard }) {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
  ];

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description of the code you want to generate');
      return;
    }

    setIsLoading(true);
    try {
      const code = await generateCode(prompt, language);
      setGeneratedCode(code);
      toast.success('Code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard!');
    }
  };

  const handlePasteToChat = () => {
    if (generatedCode && onPasteToChat) {
      onPasteToChat(generatedCode);
      toast.success('Code pasted to chat!');
    }
  };

  const handlePasteToWhiteboard = () => {
    if (generatedCode && onPasteToWhiteboard) {
      onPasteToWhiteboard(generatedCode);
      toast.success('Code pasted to whiteboard!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">AI Code Generator</h2>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the code you want to generate
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a function that sorts an array of numbers in ascending order"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows="3"
          />
        </div>

        <button
          onClick={handleGenerateCode}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Code2 className="w-5 h-5" />
              Generate Code
            </>
          )}
        </button>
      </div>

      {/* Generated Code Section */}
      {generatedCode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              {onPasteToChat && (
                <button
                  onClick={handlePasteToChat}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Paste to Chat
                </button>
              )}
              {onPasteToWhiteboard && (
                <button
                  onClick={handlePasteToWhiteboard}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Paste to Whiteboard
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm font-mono">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 