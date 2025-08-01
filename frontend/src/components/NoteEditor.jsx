import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Edit, Image, Save, Tag, Plus } from 'lucide-react';

const NoteEditor = ({ note, onUpdate, onClose, isDark, isOpen }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
    }
  }, [note]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (note && (title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags))) {
        handleSave();
      }
    }, 1000);
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [title, content, tags]);

  // Handle paste events for image pasting
  useEffect(() => {
    const handlePaste = (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      items.forEach(item => {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
          }
        }
      });
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('paste', handlePaste);
      return () => editor.removeEventListener('paste', handlePaste);
    }
  }, []);

  const handleSave = () => {
    if (note) {
      onUpdate(note.id, { title, content, tags });
    }
  };

  // Enhanced markdown to HTML converter with image support
  const markdownToHtml = (markdown) => {
    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-current">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-current">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-current">$1</h3>')
      // Text formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, `<code class="px-1 py-0.5 rounded text-sm font-mono ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-800'}">$1</code>`)
      // Images - with proper styling
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm my-4 mx-auto block" style="max-height: 400px; object-fit: contain;" />')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" class="${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} underline" target="_blank" rel="noopener noreferrer">$1</a>`)
      // Paragraphs and line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 text-current">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p class="mb-4 text-current">$1</p>')
      .replace(/<p class="mb-4 text-current"><\/p>/g, '')
      // Wrap lists
      .replace(/(<li class="ml-4 list-disc[^>]*>.*?<\/li>)/gs, '<ul class="mb-4">$1</ul>')
      .replace(/(<li class="ml-4 list-decimal[^>]*>.*?<\/li>)/gs, '<ol class="mb-4">$1</ol>');
  };

  // Handle image drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the editor area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
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

  const handleImageFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    
    setIsUploadingImage(true);
    
    try {
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
          
          // Restore cursor position after the inserted image
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
            textarea.focus();
          }, 0);
        } else {
          setContent(prev => prev + imageMarkdown);
        }
      };
      
      reader.onerror = () => {
        console.error('Failed to read image file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsUploadingImage(false);
    }
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

  // Tag management functions
  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && newTag === '' && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
    }
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
        p-4 border-b flex flex-col space-y-3
        ${isDark ? 'border-slate-600' : 'border-gray-300'}
      `}>
        {/* Title and buttons */}
        <div className="flex items-center justify-between">
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
              disabled={isUploadingImage}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark 
                  ? 'hover:bg-slate-700 text-slate-300' 
                  : 'hover:bg-gray-200 text-gray-600'
                }
                disabled:opacity-50
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

        {/* Tags Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Tag className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Tags
            </span>
          </div>
          
          {/* Tag list */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs
                  ${isDark 
                    ? 'bg-slate-700 text-slate-200' 
                    : 'bg-gray-200 text-gray-700'
                  }
                `}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className={`
                    ml-1 hover:text-red-500 transition-colors
                    ${isDark ? 'text-slate-400' : 'text-gray-500'}
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {/* Add tag input */}
            <div className="flex items-center">
              <input
                ref={tagInputRef}
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyPress}
                placeholder="Add tag..."
                className={`
                  text-xs px-2 py-1 rounded-full border-none outline-none
                  min-w-[80px] max-w-[120px]
                  ${isDark 
                    ? 'bg-slate-700 text-slate-200 placeholder-slate-400' 
                    : 'bg-gray-200 text-gray-700 placeholder-gray-500'
                  }
                `}
              />
              {newTag.trim() && (
                <button
                  onClick={addTag}
                  className={`
                    ml-1 p-0.5 rounded-full
                    ${isDark 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
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
              className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}
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
                border-2 border-dashed rounded-lg pointer-events-none
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

            {/* Upload indicator */}
            {isUploadingImage && (
              <div className={`
                absolute top-4 right-4 px-3 py-2 rounded-lg
                ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-700'}
                shadow-lg border
              `}>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="text-sm">Uploading image...</span>
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
          {tags.length > 0 && ` • ${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
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