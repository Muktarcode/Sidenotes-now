// Local Storage service for SideNotes Clone PWA
// Handles all note CRUD operations with localStorage persistence

const STORAGE_KEYS = {
  NOTES: 'sidenotes-notes',
  SETTINGS: 'sidenotes-settings',
  VERSION: 'sidenotes-version'
};

const CURRENT_VERSION = '1.0.0';

// Default notes for first-time users
const DEFAULT_NOTES = [
  {
    id: '1',
    title: 'Welcome to SideNotes',
    content: `# Welcome to SideNotes Clone! 🗒️

This is your first note. You can:

- Write in **Markdown** with live preview
- Drag and drop images directly into notes  
- Use \`Ctrl + Shift + N\` to toggle the panel
- Create multiple notes with titles
- Everything saves automatically to your browser

## Features
- ✅ Offline first - no internet required
- ✅ Dark/Light mode support  
- ✅ Works on mobile, tablet & desktop
- ✅ PWA installable as native app

Start writing your notes below!`,
    tags: ['welcome', 'tutorial'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: []
  },
  {
    id: '2', 
    title: 'Project Ideas',
    content: `# Project Ideas 💡

## Web Development
- [ ] Build a PWA note-taking app
- [ ] Create a habit tracker
- [ ] Design a portfolio website

## Learning Goals
- [ ] Master React hooks
- [ ] Learn service workers
- [ ] Practice responsive design

## Quick Notes
- Remember to test offline functionality
- Add keyboard shortcuts for better UX
- Consider accessibility features`,
    tags: ['projects', 'ideas', 'todo'],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    images: []
  },
  {
    id: '3',
    title: 'Meeting Notes - Jan 15',
    content: `# Team Meeting Notes

**Date:** January 15, 2025  
**Attendees:** John, Sarah, Mike

## Agenda Items
1. Project timeline review
2. Feature prioritization
3. Next sprint planning

## Key Decisions
- Focus on mobile responsiveness first
- Implement dark mode by end of week
- Weekly demo sessions starting next Monday

## Action Items
- [ ] Sarah: Update design mockups
- [ ] Mike: Set up testing environment  
- [ ] John: Research PWA best practices

*Next meeting: January 22, 2025*`,
    tags: ['meeting', 'work', 'notes'],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    images: []
  }
];

class NotesStorage {
  constructor() {
    this.initializeStorage();
  }

  // Initialize storage with default data if needed
  initializeStorage() {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.VERSION);
      const existingNotes = localStorage.getItem(STORAGE_KEYS.NOTES);

      // First time setup or version upgrade
      if (!version || !existingNotes) {
        this.setNotes(DEFAULT_NOTES);
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        console.log('SideNotes: Initialized with default notes');
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      // Fallback to default notes if localStorage fails
    }
  }

  // Get all notes from localStorage
  getNotes() {
    try {
      const notesJson = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!notesJson) return DEFAULT_NOTES;
      
      const notes = JSON.parse(notesJson);
      // Sort by updatedAt descending (most recent first)
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error('Failed to get notes from storage:', error);
      return DEFAULT_NOTES;
    }
  }

  // Save notes array to localStorage
  setNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Failed to save notes to storage:', error);
      return false;
    }
  }

  // Get single note by ID
  getNoteById(id) {
    const notes = this.getNotes();
    return notes.find(note => note.id === id) || null;
  }

  // Create new note
  createNote(noteData) {
    try {
      const notes = this.getNotes();
      const newNote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: noteData.images || []
      };
      
      notes.unshift(newNote);
      this.setNotes(notes);
      
      console.log('Note created:', newNote.id);
      return newNote;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw new Error('Failed to create note');
    }
  }

  // Update existing note
  updateNote(id, updates) {
    try {
      const notes = this.getNotes();
      const noteIndex = notes.findIndex(note => note.id === id);
      
      if (noteIndex === -1) {
        throw new Error('Note not found');
      }
      
      const updatedNote = {
        ...notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      notes[noteIndex] = updatedNote;
      this.setNotes(notes);
      
      console.log('Note updated:', id);
      return updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  }

  // Delete note
  deleteNote(id) {
    try {
      const notes = this.getNotes();
      const noteIndex = notes.findIndex(note => note.id === id);
      
      if (noteIndex === -1) {
        throw new Error('Note not found');
      }
      
      const deletedNote = notes.splice(noteIndex, 1)[0];
      this.setNotes(notes);
      
      console.log('Note deleted:', id);
      return deletedNote;
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }

  // Search notes by query
  searchNotes(query) {
    try {
      const notes = this.getNotes();
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) return notes;
      
      return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Failed to search notes:', error);
      return this.getNotes();
    }
  }

  // Get all unique tags
  getAllTags() {
    try {
      const notes = this.getNotes();
      const tagSet = new Set();
      
      notes.forEach(note => {
        note.tags.forEach(tag => tagSet.add(tag));
      });
      
      return Array.from(tagSet).sort();
    } catch (error) {
      console.error('Failed to get tags:', error);
      return [];
    }
  }

  // Filter notes by tag
  getNotesByTag(tag) {
    try {
      const notes = this.getNotes();
      return notes.filter(note => 
        note.tags.some(noteTag => 
          noteTag.toLowerCase() === tag.toLowerCase()
        )
      );
    } catch (error) {
      console.error('Failed to filter notes by tag:', error);
      return [];
    }
  }

  // Backup notes to JSON file
  exportNotes() {
    try {
      const notes = this.getNotes();
      const backup = {
        version: CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        notes: notes
      };
      
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sidenotes-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (error) {
      console.error('Failed to export notes:', error);
      return false;
    }
  }

  // Import notes from JSON file
  importNotes(jsonData) {
    try {
      const backup = JSON.parse(jsonData);
      
      if (backup.notes && Array.isArray(backup.notes)) {
        // Validate note structure
        const validNotes = backup.notes.filter(note => 
          note.id && note.title !== undefined && note.content !== undefined
        );
        
        if (validNotes.length > 0) {
          this.setNotes(validNotes);
          console.log(`Imported ${validNotes.length} notes`);
          return validNotes.length;
        }
      }
      
      throw new Error('Invalid backup format');
    } catch (error) {
      console.error('Failed to import notes:', error);
      throw error;
    }
  }

  // Clear all data (with confirmation)
  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.VERSION);
      console.log('All SideNotes data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const notes = this.getNotes();
      const notesSize = new Blob([JSON.stringify(notes)]).size;
      
      return {
        noteCount: notes.length,
        storageSize: notesSize,
        storageSizeFormatted: this.formatBytes(notesSize),
        lastUpdated: notes.length > 0 ? notes[0].updatedAt : null
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  // Helper: Format bytes to human readable
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Create singleton instance
const notesStorage = new NotesStorage();

// Export API that matches the mock API interface
export const notesAPI = {
  getAllNotes: () => {
    return Promise.resolve(notesStorage.getNotes());
  },
  
  getNoteById: (id) => {
    return Promise.resolve(notesStorage.getNoteById(id));
  },
  
  createNote: (noteData) => {
    return Promise.resolve(notesStorage.createNote(noteData));
  },
  
  updateNote: (id, updates) => {
    return Promise.resolve(notesStorage.updateNote(id, updates));
  },
  
  deleteNote: (id) => {
    return Promise.resolve(notesStorage.deleteNote(id));
  },
  
  searchNotes: (query) => {
    return Promise.resolve(notesStorage.searchNotes(query));
  },
  
  getAllTags: () => {
    return Promise.resolve(notesStorage.getAllTags());
  },
  
  getNotesByTag: (tag) => {
    return Promise.resolve(notesStorage.getNotesByTag(tag));
  },
  
  exportNotes: () => {
    return Promise.resolve(notesStorage.exportNotes());
  },
  
  importNotes: (jsonData) => {
    return Promise.resolve(notesStorage.importNotes(jsonData));
  },
  
  getStorageInfo: () => {
    return Promise.resolve(notesStorage.getStorageInfo());
  },
  
  clearAllData: () => {
    return Promise.resolve(notesStorage.clearAllData());
  }
};

export default notesStorage;