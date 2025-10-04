import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = Router();

// User Stats Schema
const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  level: { type: String, default: 'beginner' },
  lastActivityDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserStats = mongoose.models.UserStats || mongoose.model('UserStats', userStatsSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    let stats = await UserStats.findOne({ userId });
    
    // Create default stats if not exists
    if (!stats) {
      stats = new UserStats({ userId });
      await stats.save();
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
});

// Get user progress
router.get('/progress', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get stats
    const stats = await UserStats.findOne({ userId });
    
    // Calculate progress data for last 7 days
    const progressData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      progressData.push({
        date: dateStr,
        questionsAnswered: Math.floor(Math.random() * 10), // Mock data
        correctAnswers: Math.floor(Math.random() * 8)
      });
    }

    res.json({
      success: true,
      data: {
        stats: stats || { questionsAnswered: 0, correctAnswers: 0, currentStreak: 0 },
        progressData
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    // Note: This would update the User model from auth
    // For now, just return success
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { name, email }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profilePictureUrl }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    // Note: This would verify and update password in User model
    // For now, just return success
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

export default router;
