import React, { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun, Tag, Clock, Trash2, Download, Upload, Settings, Maximize, Minimize } from 'lucide-react';
import NoteEditor from './NoteEditor';
import { notesAPI } from '../services/notesStorage';

const SideNotesPanel = ({ isOpen, onClose, isDark, onThemeToggle }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
    loadStorageInfo();
  }, []);

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      notesAPI.searchNotes(searchQuery)
        .then(results => setFilteredNotes(results));
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const loadNotes = async () => {
    try {
      const allNotes = await notesAPI.getAllNotes();
      setNotes(allNotes);
      if (allNotes.length > 0 && !selectedNote) {
        setSelectedNote(allNotes[0]);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      // Handle error - could show toast notification
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await notesAPI.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleCreateNote = async () => {
    setIsCreatingNote(true);
    try {
      const newNote = await notesAPI.createNote({
        title: 'New Note',
        content: '# New Note\n\nStart writing...'
      });
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      await loadStorageInfo(); // Update storage info
    } catch (error) {
      console.error('Failed to create note:', error);
      // Handle error - could show toast notification
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleNoteUpdate = async (noteId, updates) => {
    try {
      const updatedNote = await notesAPI.updateNote(noteId, updates);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
      }
      await loadStorageInfo(); // Update storage info
    } catch (error) {
      console.error('Failed to update note:', error);
      // Handle error - could show toast notification
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (notes.length <= 1) return; // Keep at least one note
    
    try {
      await notesAPI.deleteNote(noteId);
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNotes[0] || null);
      }
      await loadStorageInfo(); // Update storage info
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Handle error - could show toast notification
    }
  };

  const handleExportNotes = async () => {
    try {
      await notesAPI.exportNotes();
      // Success feedback could be added here
    } catch (error) {
      console.error('Failed to export notes:', error);
      // Handle error - could show toast notification
    }
  };

  const handleImportNotes = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedCount = await notesAPI.importNotes(e.target.result);
        await loadNotes(); // Reload notes
        await loadStorageInfo(); // Update storage info
        console.log(`Successfully imported ${importedCount} notes`);
        // Success feedback could be added here
      } catch (error) {
        console.error('Failed to import notes:', error);
        // Handle error - could show toast notification
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={`
      fixed right-0 top-0 h-full z-40
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      ${isFullscreen ? 'left-0 w-full' : ''}
    `}>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div className={`
        relative h-full
        ${isFullscreen 
          ? 'w-full flex' 
          : 'w-96 md:w-[480px] flex flex-col'
        }
        ${isDark 
          ? 'bg-slate-900 border-l border-slate-700' 
          : 'bg-white border-l border-gray-200'
        }
        shadow-2xl z-40
      `}>
        
        {/* Header */}
        <div className={`
          p-4 border-b
          ${isDark ? 'border-slate-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`
              text-xl font-semibold
              ${isDark ? 'text-slate-100' : 'text-gray-900'}
            `}>
              SideNotes
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={onThemeToggle}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                  ${isFullscreen ? (isDark ? 'bg-slate-800' : 'bg-gray-100') : ''}
                `}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                  ${showSettings ? (isDark ? 'bg-slate-800' : 'bg-gray-100') : ''}
                `}
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleCreateNote}
                disabled={isCreatingNote}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                  disabled:opacity-50
                `}
                aria-label="Create new note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className={`
              mb-4 p-3 rounded-lg border
              ${isDark 
                ? 'bg-slate-800 border-slate-600' 
                : 'bg-gray-50 border-gray-300'
              }
            `}>
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-sm font-medium
                  ${isDark ? 'text-slate-200' : 'text-gray-700'}
                `}>
                  Data Management
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={handleExportNotes}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded text-sm
                    transition-colors
                    ${isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                
                <label className={`
                  flex items-center space-x-2 px-3 py-2 rounded text-sm
                  cursor-pointer transition-colors
                  ${isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }
                `}>
                  <Upload className="w-3 h-3" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportNotes}
                    className="hidden"
                  />
                </label>
              </div>
              
              {storageInfo && (
                <div className={`
                  text-xs
                  ${isDark ? 'text-slate-400' : 'text-gray-500'}
                `}>
                  {storageInfo.noteCount} notes • {storageInfo.storageSizeFormatted} used
                </div>
              )}
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
              ${isDark ? 'text-slate-400' : 'text-gray-400'}
            `} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 rounded-lg border
                transition-colors focus:outline-none focus:ring-2
                ${isDark 
                  ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-slate-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }
              `}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className={`
          flex-1 overflow-y-auto
          ${isDark ? 'bg-slate-900' : 'bg-white'}
        `}>
          {filteredNotes.length === 0 ? (
            <div className={`
              p-8 text-center
              ${isDark ? 'text-slate-400' : 'text-gray-500'}
            `}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`
                    group p-3 rounded-lg cursor-pointer
                    transition-colors duration-150
                    ${selectedNote?.id === note.id
                      ? (isDark ? 'bg-slate-800 border border-slate-600' : 'bg-blue-50 border border-blue-200')
                      : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50')
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        font-medium truncate
                        ${selectedNote?.id === note.id
                          ? (isDark ? 'text-slate-100' : 'text-blue-900')
                          : (isDark ? 'text-slate-200' : 'text-gray-900')
                        }
                      `}>
                        {note.title}
                      </h3>
                      <p className={`
                        text-sm mt-1 line-clamp-2
                        ${selectedNote?.id === note.id
                          ? (isDark ? 'text-slate-300' : 'text-blue-700')
                          : (isDark ? 'text-slate-400' : 'text-gray-600')
                        }
                      `}>
                        {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className={`
                        ml-2 p-1 rounded opacity-0 group-hover:opacity-100
                        transition-opacity
                        ${isDark 
                          ? 'hover:bg-slate-700 text-slate-400' 
                          : 'hover:bg-gray-200 text-gray-500'
                        }
                      `}
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Clock className={`
                        w-3 h-3
                        ${isDark ? 'text-slate-500' : 'text-gray-400'}
                      `} />
                      <span className={`
                        text-xs
                        ${isDark ? 'text-slate-500' : 'text-gray-400'}
                      `}>
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    
                    {note.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className={`
                          w-3 h-3
                          ${isDark ? 'text-slate-500' : 'text-gray-400'}
                        `} />
                        <span className={`
                          text-xs
                          ${isDark ? 'text-slate-500' : 'text-gray-400'}
                        `}>
                          {note.tags.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor (overlay on small screens, side-by-side on larger) */}
      {selectedNote && (
        <NoteEditor
          note={selectedNote}
          onUpdate={handleNoteUpdate}
          onClose={() => setSelectedNote(null)}
          isDark={isDark}
          isOpen={isOpen}
        />
      )}
    </div>
  );
};

export default SideNotesPanel;