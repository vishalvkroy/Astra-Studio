import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import pool from '../config/mysql';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
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
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const [stats] = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (!Array.isArray(stats) || stats.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User stats not found'
      });
      return;
    }

    // Get user rank
    const [rankResult] = await pool.query(`
      SELECT COUNT(*) + 1 as rank
      FROM user_stats
      WHERE total_score > (SELECT total_score FROM user_stats WHERE user_id = ?)
    `, [userId]);

    const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users');

    const userStats: any = stats[0];
    userStats.rank = Array.isArray(rankResult) && rankResult[0] ? (rankResult[0] as any).rank : 0;
    userStats.totalUsers = Array.isArray(totalUsers) && totalUsers[0] ? (totalUsers[0] as any).total : 0;

    // Get achievements (mock data for now)
    userStats.achievements = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Answered your first question',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'learning'
      },
      {
        id: '2',
        name: 'Quick Learner',
        description: 'Answered 10 questions correctly',
        icon: '⚡',
        unlockedAt: new Date().toISOString(),
        category: 'mastery'
      }
    ];

    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get user progress analytics
router.get('/progress', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get last 30 days of activity
    const [progressData] = await pool.query(`
      SELECT 
        DATE(answered_at) as date,
        COUNT(*) as questionsAnswered,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correctAnswers,
        0 as timeSpent
      FROM user_answers
      WHERE user_id = ? AND answered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(answered_at)
      ORDER BY date ASC
    `, [userId]);

    res.json({
      success: true,
      data: progressData || []
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
router.put('/profile', authenticateToken, upload.single('profilePicture'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { username, email, currentPassword, newPassword } = req.body;
    const updateFields: any = {};

    // Check if username is being changed and is unique
    if (username) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
        return;
      }
      updateFields.username = username;
    }

    // Check if email is being changed and is unique
    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
        return;
      }
      updateFields.email = email;
      updateFields.email_verified = false; // Reset verification on email change
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
        return;
      }

      // Verify current password
      const [users] = await pool.query(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (!Array.isArray(users) || users.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, (users[0] as any).password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password_hash = hashedPassword;
    }

    // Handle profile picture upload
    if (req.file) {
      updateFields.profile_picture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user
    if (Object.keys(updateFields).length > 0) {
      const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateFields), userId];
      
      await pool.query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateFields
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export default router;
