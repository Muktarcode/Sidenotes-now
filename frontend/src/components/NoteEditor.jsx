import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Edit, Image, Save } from 'lucide-react';

const NoteEditor = ({ note, onUpdate, onClose, isDark, isOpen }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPreview, setIsPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (note && (title !== note.title || content !== note.content)) {
        handleSave();
      }
    }, 1000);
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [title, content]);

  const handleSave = () => {
    if (note) {
      onUpdate(note.id, { title, content });
    }
  };

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p class="mb-4">$1</p>')
      .replace(/<p class="mb-4"><\/p>/g, '')
      .replace(/^\s*<li/gm, '<ul><li')
      .replace(/<\/li>\s*$/gm, '</li></ul>');
  };

  // Handle image drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
      }
    });
  };

  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      
      // Insert at cursor position or end of content
      const textarea = editorRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const newContent = content.slice(0, cursorPos) + imageMarkdown + content.slice(cursorPos);
        setContent(newContent);
      } else {
        setContent(prev => prev + imageMarkdown);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
      }
    });
    e.target.value = ''; // Reset input
  };

  if (!note) return null;

  return (
    <div className={`
      fixed inset-0 z-50 md:relative md:inset-auto
      md:w-96 lg:w-[480px] h-full
      ${isDark 
        ? 'bg-slate-800 border-l border-slate-600' 
        : 'bg-gray-50 border-l border-gray-300'
      }
      flex flex-col
      transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `}>
      
      {/* Header */}
      <div className={`
        p-4 border-b flex items-center justify-between
        ${isDark ? 'border-slate-600' : 'border-gray-300'}
      `}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`
            flex-1 bg-transparent border-none outline-none
            text-lg font-semibold mr-2
            ${isDark ? 'text-slate-100' : 'text-gray-900'}
          `}
          placeholder="Note title..."
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark 
                ? 'hover:bg-slate-700 text-slate-300' 
                : 'hover:bg-gray-200 text-gray-600'
              }
              ${isPreview ? (isDark ? 'bg-slate-700' : 'bg-gray-200') : ''}
            `}
            aria-label={isPreview ? 'Edit mode' : 'Preview mode'}
          >
            {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleImageUpload}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark 
                ? 'hover:bg-slate-700 text-slate-300' 
                : 'hover:bg-gray-200 text-gray-600'
              }
            `}
            aria-label="Add image"
          >
            <Image className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors md:hidden
              ${isDark 
                ? 'hover:bg-slate-700 text-slate-300' 
                : 'hover:bg-gray-200 text-gray-600'
              }
            `}
            aria-label="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        {isPreview ? (
          // Preview Mode
          <div className={`
            h-full overflow-y-auto p-6
            ${isDark ? 'text-slate-100' : 'text-gray-900'}
          `}>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: markdownToHtml(content) 
              }}
            />
          </div>
        ) : (
          // Edit Mode
          <div 
            className={`
              h-full relative
              ${isDragging ? (isDark ? 'bg-slate-700' : 'bg-blue-50') : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note in Markdown..."
              className={`
                w-full h-full p-6 resize-none border-none outline-none
                font-mono text-sm leading-relaxed
                ${isDark 
                  ? 'bg-slate-800 text-slate-100 placeholder-slate-400' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                }
              `}
            />
            
            {/* Drag overlay */}
            {isDragging && (
              <div className={`
                absolute inset-0 flex items-center justify-center
                border-2 border-dashed rounded-lg
                ${isDark 
                  ? 'border-slate-400 bg-slate-700/80' 
                  : 'border-blue-400 bg-blue-50/80'
                }
              `}>
                <div className={`
                  text-center
                  ${isDark ? 'text-slate-200' : 'text-blue-700'}
                `}>
                  <Image className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">Drop images here</p>
                  <p className="text-sm opacity-75">They'll be inserted into your note</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className={`
        p-2 border-t text-xs flex items-center justify-between
        ${isDark 
          ? 'border-slate-600 text-slate-400 bg-slate-900' 
          : 'border-gray-300 text-gray-500 bg-white'
        }
      `}>
        <span>
          {content.length} characters • {content.split('\n').length} lines
        </span>
        <div className="flex items-center space-x-2">
          <Save className="w-3 h-3" />
          <span>Auto-saved</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default NoteEditor;