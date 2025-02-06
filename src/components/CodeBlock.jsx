import React from 'react';

export function CodeBlock({ title, code }) {
  return (
    <div className="bg-gray-900 text-white rounded-lg p-4 my-4">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <pre className="whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
} 