import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Folder, FolderPlus, FileText, Plus, Search, Trash2, Edit,
  Save, X, ChevronRight, ChevronDown, Clock, Tag, Star,
  Download, Share2, Filter, SortAsc, Grid, List, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Note, NoteFolder } from '../types';
import '../styles/NotesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    folder: '',
    tags: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotesData();
  }, []);

  const fetchNotesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [foldersRes, notesRes] = await Promise.all([
        axios.get(`${API_URL}/api/notes/folders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFolders(foldersRes.data.data || []);
      setNotes(notesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/notes/folders`,
        { name: newFolderName, parentId: newFolderParent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Folder created successfully');
      setShowNewFolderModal(false);
      setNewFolderName('');
      setNewFolderParent(null);
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleCreateNote = async () => {
    if (!currentNote.title?.trim() || !currentNote.content?.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/notes`,
        currentNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Note created successfully');
      setShowNewNoteModal(false);
      setCurrentNote({ title: '', content: '', folder: '', tags: [] });
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!currentNote.id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/notes/${currentNote.id}`,
        currentNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Note updated successfully');
      setShowEditNoteModal(false);
      setCurrentNote({ title: '', content: '', folder: '', tags: [] });
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Note deleted successfully');
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure? This will delete all notes in this folder.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/notes/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Folder deleted successfully');
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const noteId = result.draggableId;
    const newFolderId = result.destination.droppableId;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/notes/${noteId}/move`,
        { folderId: newFolderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Note moved successfully');
      fetchNotesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to move note');
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const renderFolderTree = (parentId: string | null = null, level: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    
    return childFolders.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasChildren = folders.some(f => f.parentId === folder.id);
      
      return (
        <div key={folder.id} className="folder-tree-item" style={{ paddingLeft: `${level * 1.5}rem` }}>
          <div
            className={`folder-item ${selectedFolder === folder.id ? 'selected' : ''}`}
            onClick={() => setSelectedFolder(folder.id)}
          >
            <button
              className="folder-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                <div style={{ width: 16 }} />
              )}
            </button>
            <Folder size={18} />
            <span className="folder-name">{folder.name}</span>
            <span className="folder-count">{folder.noteCount}</span>
            <button
              className="folder-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {isExpanded && renderFolderTree(folder.id, level + 1)}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="notes-loading">
        <div className="loading-spinner"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="notes-page">
      {/* Sidebar */}
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="sidebar-actions">
          <button className="action-btn primary" onClick={() => setShowNewNoteModal(true)}>
            <Plus size={18} />
            <span>New Note</span>
          </button>
          <button className="action-btn" onClick={() => setShowNewFolderModal(true)}>
            <FolderPlus size={18} />
            <span>New Folder</span>
          </button>
        </div>

        <div className="folders-section">
          <h3>Folders</h3>
          <div className="folder-tree">
            <div
              className={`folder-item ${!selectedFolder ? 'selected' : ''}`}
              onClick={() => setSelectedFolder(null)}
            >
              <FileText size={18} />
              <span className="folder-name">All Notes</span>
              <span className="folder-count">{notes.length}</span>
            </div>
            {renderFolderTree()}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="notes-main">
        <header className="notes-header">
          <div className="header-left">
            <h1>My Notes</h1>
            <p>{filteredNotes.length} notes</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={`notes-content ${viewMode}`}>
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <FileText size={64} />
                <h2>No notes yet</h2>
                <p>Create your first note to get started</p>
                <button className="btn-primary" onClick={() => setShowNewNoteModal(true)}>
                  <Plus size={18} />
                  Create Note
                </button>
              </div>
            ) : (
              <Droppable droppableId="notes-list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="notes-grid"
                  >
                    {filteredNotes.map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`note-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="note-header">
                              <h3>{note.title}</h3>
                              <div className="note-actions">
                                <button
                                  onClick={() => {
                                    setCurrentNote(note);
                                    setShowEditNoteModal(true);
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteNote(note.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="note-content">{note.content.substring(0, 150)}...</p>
                            <div className="note-footer">
                              <div className="note-tags">
                                {note.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="tag">
                                    <Tag size={12} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="note-meta">
                                <Clock size={14} />
                                <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            {note.expiresAt && !note.isSaved && (
                              <div className="note-expiry">
                                <span>Expires in {Math.ceil((new Date(note.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} hours</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
      </main>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create New Folder</h2>
                <button onClick={() => setShowNewFolderModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Parent Folder (Optional)</label>
                  <select
                    value={newFolderParent || ''}
                    onChange={(e) => setNewFolderParent(e.target.value || null)}
                  >
                    <option value="">Root</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowNewFolderModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreateFolder}>
                  <FolderPlus size={18} />
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New/Edit Note Modal */}
      <AnimatePresence>
        {(showNewNoteModal || showEditNoteModal) && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowNewNoteModal(false);
              setShowEditNoteModal(false);
            }}
          >
            <motion.div
              className="modal-content note-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{showEditNoteModal ? 'Edit Note' : 'Create New Note'}</h2>
                <button onClick={() => {
                  setShowNewNoteModal(false);
                  setShowEditNoteModal(false);
                }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                    placeholder="Enter note content"
                    rows={10}
                  />
                </div>
                <div className="form-group">
                  <label>Folder</label>
                  <select
                    value={currentNote.folder || ''}
                    onChange={(e) => setCurrentNote({ ...currentNote, folder: e.target.value })}
                  >
                    <option value="">No Folder</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={currentNote.tags?.join(', ') || ''}
                    onChange={(e) => setCurrentNote({
                      ...currentNote,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., cpp, loops, functions"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => {
                  setShowNewNoteModal(false);
                  setShowEditNoteModal(false);
                }}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={showEditNoteModal ? handleUpdateNote : handleCreateNote}
                >
                  <Save size={18} />
                  {showEditNoteModal ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
