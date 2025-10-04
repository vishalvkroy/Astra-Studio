import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Note Schema
const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  folder: { type: String, default: '' },
  questionId: { type: String },
  isSaved: { type: Boolean, default: false },
  tags: [{ type: String }],
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// Folder Schema
const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  parentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Folder = mongoose.model('Folder', folderSchema);

// Get all notes for user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Delete expired notes
    await Note.deleteMany({
      userId,
      isSaved: false,
      expiresAt: { $lt: new Date() }
    });

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
});

// Create new note
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, content, folder, questionId, isSaved, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const note = new Note({
      userId,
      title,
      content,
      folder: folder || '',
      questionId,
      isSaved: isSaved || false,
      tags: tags || [],
      expiresAt: isSaved ? null : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await note.save();

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
});

// Update note
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, content, folder, tags, isSaved } = req.body;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (folder !== undefined) note.folder = folder;
    if (tags) note.tags = tags;
    if (isSaved !== undefined) {
      note.isSaved = isSaved;
      if (isSaved) {
        note.expiresAt = undefined;
      }
    }
    note.updatedAt = new Date();

    await note.save();

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await Note.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
});

// Move note to folder
router.put('/:id/move', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { folderId } = req.body;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.folder = folderId || '';
    note.updatedAt = new Date();
    await note.save();

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error moving note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move note'
    });
  }
});

// Get all folders for user
router.get('/folders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const folders = await Folder.find({ userId }).sort({ createdAt: -1 });

    // Count notes in each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          userId,
          folder: folder._id.toString()
        });
        return {
          ...folder.toObject(),
          noteCount
        };
      })
    );

    res.json({
      success: true,
      data: foldersWithCount
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folders'
    });
  }
});

// Create new folder
router.post('/folders', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    const folder = new Folder({
      userId,
      name,
      parentId: parentId || null
    });

    await folder.save();

    res.status(201).json({
      success: true,
      data: folder
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create folder'
    });
  }
});

// Delete folder
router.delete('/folders/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Delete all notes in folder
    await Note.deleteMany({ userId, folder: id });

    // Delete folder
    const result = await Folder.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    res.json({
      success: true,
      message: 'Folder and its notes deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete folder'
    });
  }
});

export default router;
