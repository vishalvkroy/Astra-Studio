import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Leaderboard entry schema
const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  email: { type: String },
  profilePicture: { type: String },
  totalPoints: { type: Number, default: 0 },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

leaderboardSchema.index({ totalPoints: -1 });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);

// Get global leaderboard
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const leaderboard = await Leaderboard
      .find()
      .sort({ totalPoints: -1 })
      .skip(offsetNum)
      .limit(limitNum)
      .select('-__v');

    // Add rank to each entry
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: offsetNum + index + 1
    }));

    res.json({
      success: true,
      data: leaderboardWithRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get user rank
router.get('/rank', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userEntry = await Leaderboard.findOne({ userId });
    
    if (!userEntry) {
      res.json({
        success: true,
        data: {
          rank: null,
          totalPoints: 0,
          message: 'User not ranked yet'
        }
      });
      return;
    }

    // Count users with higher points
    const rank = await Leaderboard.countDocuments({
      totalPoints: { $gt: userEntry.totalPoints }
    }) + 1;

    res.json({
      success: true,
      data: {
        rank,
        totalPoints: userEntry.totalPoints,
        questionsAnswered: userEntry.questionsAnswered,
        correctAnswers: userEntry.correctAnswers,
        currentStreak: userEntry.currentStreak
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank'
    });
  }
});

export default router;
