// Mock data for SideNotes Clone PWA
export const mockNotes = [
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
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z'),
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
    createdAt: new Date('2025-01-15T11:30:00Z'),
    updatedAt: new Date('2025-01-15T11:30:00Z'),
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
    createdAt: new Date('2025-01-15T14:00:00Z'),
    updatedAt: new Date('2025-01-15T14:00:00Z'),
    images: []
  }
];

export const mockTags = [
  'welcome',
  'tutorial', 
  'projects',
  'ideas',
  'todo',
  'meeting',
  'work',
  'notes'
];

// Mock functions for localStorage operations (will be replaced with real localStorage later)
export const mockNotesAPI = {
  getAllNotes: () => {
    return Promise.resolve([...mockNotes]);
  },
  
  getNoteById: (id) => {
    const note = mockNotes.find(n => n.id === id);
    return Promise.resolve(note);
  },
  
  createNote: (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      tags: noteData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      images: []
    };
    mockNotes.unshift(newNote);
    return Promise.resolve(newNote);
  },
  
  updateNote: (id, updates) => {
    const noteIndex = mockNotes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
      mockNotes[noteIndex] = {
        ...mockNotes[noteIndex],
        ...updates,
        updatedAt: new Date()
      };
      return Promise.resolve(mockNotes[noteIndex]);
    }
    return Promise.reject(new Error('Note not found'));
  },
  
  deleteNote: (id) => {
    const noteIndex = mockNotes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
      const deletedNote = mockNotes.splice(noteIndex, 1)[0];
      return Promise.resolve(deletedNote);
    }
    return Promise.reject(new Error('Note not found'));
  },
  
  searchNotes: (query) => {
    const results = mockNotes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return Promise.resolve(results);
  }
};