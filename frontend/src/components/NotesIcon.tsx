import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Save, Trash2, Clock, Folder } from 'lucide-react';
import { format } from 'date-fns';
import '../styles/NotesIcon.css';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  questionId?: string;
}

interface NotesIconProps {
  temporaryNotes: Note[];
  onSaveNote: (noteId: string, title: string, folder: string) => void;
  onDeleteNote: (noteId: string) => void;
  isVisible: boolean;
}

const NotesIcon: React.FC<NotesIconProps> = ({
  temporaryNotes,
  onSaveNote,
  onDeleteNote,
  isVisible
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveFolder, setSaveFolder] = useState('');

  const handleSave = () => {
    if (selectedNote && saveTitle.trim()) {
      onSaveNote(selectedNote.id, saveTitle, saveFolder);
      setSelectedNote(null);
      setSaveTitle('');
      setSaveFolder('');
    }
  };

  const getTimeRemaining = (timestamp: number): string => {
    const expiryTime = timestamp + (24 * 60 * 60 * 1000); // 24 hours
    const remaining = expiryTime - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  if (!isVisible) return null;

  return (
    <>
      <motion.button
        className={`notes-icon-button ${temporaryNotes.length > 0 ? 'has-notes' : ''}`}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FileText size={24} />
        {temporaryNotes.length > 0 && (
          <span className="notes-badge">{temporaryNotes.length}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notes-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="notes-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="notes-panel-header">
                <h3>
                  <FileText size={20} />
                  Temporary Notes
                </h3>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="notes-panel-content">
                {temporaryNotes.length === 0 ? (
                  <div className="empty-notes">
                    <FileText size={48} />
                    <p>No temporary notes yet</p>
                    <span>Explanations from Astra will appear here</span>
                  </div>
                ) : (
                  <div className="notes-list">
                    {temporaryNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        className="note-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="note-header">
                          <span className="note-number">Q{index + 1}</span>
                          <div className="note-meta">
                            <Clock size={14} />
                            <span>{getTimeRemaining(note.timestamp)}</span>
                          </div>
                        </div>
                        <div className="note-preview">
                          {note.content.substring(0, 100)}...
                        </div>
                        <div className="note-actions">
                          <button
                            className="btn-save"
                            onClick={() => {
                              setSelectedNote(note);
                              setSaveTitle(`Question ${index + 1} - ${format(new Date(note.timestamp), 'MMM d')}`);
                            }}
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => onDeleteNote(note.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="notes-panel-footer">
                <div className="footer-info">
                  <Clock size={16} />
                  <span>Notes auto-delete after 24 hours if not saved</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="save-note-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              className="save-note-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Save Note</h3>
                <button onClick={() => setSelectedNote(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Note Title</label>
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Enter note title"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Folder size={16} />
                    Folder (Optional)
                  </label>
                  <input
                    type="text"
                    value={saveFolder}
                    onChange={(e) => setSaveFolder(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                <div className="note-preview-full">
                  <label>Content Preview</label>
                  <div className="preview-content">
                    {selectedNote.content}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedNote(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  <Save size={18} />
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotesIcon;
