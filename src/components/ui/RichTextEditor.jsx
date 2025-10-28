import React, { useState, useRef } from "react";

const RichTextEditor = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  className = "" 
}) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const handleInput = (e) => {
    const content = e.target.innerHTML;
    onChange({ target: { name, value: content } });
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 border-b border-gray-300 dark:border-gray-600 flex gap-2">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              isBold ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 011-1h5.5a2.5 2.5 0 010 5H6a1 1 0 000 2h4.5a2.5 2.5 0 010 5H6a1 1 0 01-1-1V4z"/>
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              isItalic ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 2a1 1 0 000 2h1.5l-2 8H8a1 1 0 100 2h4a1 1 0 100-2h-1.5l2-8H12a1 1 0 100-2H8z"/>
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              isUnderline ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
          </button>
          
          <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>
          
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 000 2h1a1 1 0 100-2H3zm0 4a1 1 0 000 2h1a1 1 0 100-2H3zm0 4a1 1 0 000 2h1a1 1 0 100-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 000 2h1a1 1 0 100-2H3zm0 4a1 1 0 000 2h1a1 1 0 100-2H3zm0 4a1 1 0 000 2h1a1 1 0 100-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
            </svg>
          </button>
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateToolbarState}
          onKeyUp={updateToolbarState}
          className="min-h-[200px] p-4 focus:outline-none dark:bg-gray-800 dark:text-white"
          style={{ minHeight: '200px' }}
        />
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
      </p>
    </div>
  );
};

export default RichTextEditor;
