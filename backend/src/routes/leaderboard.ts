import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import pool from '../config/mysql';

const router = Router();

// Get global leaderboard
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const [leaderboard] = await pool.query(`
      SELECT 
        u.id as userId,
        u.username,
        u.profile_picture as profilePicture,
        s.total_score as score,
        s.questions_answered as questionsAnswered,
        s.level,
        ROUND((s.correct_answers * 100.0 / NULLIF(s.questions_answered, 0)), 1) as accuracy,
        @rank := @rank + 1 as rank
      FROM users u
      INNER JOIN user_stats s ON u.id = s.user_id
      CROSS JOIN (SELECT @rank := 0) r
      ORDER BY s.total_score DESC, s.correct_answers DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      success: true,
      data: leaderboard || []
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get user's rank
router.get('/rank/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [rankResult] = await pool.query(`
      SELECT 
        COUNT(*) + 1 as rank,
        (SELECT COUNT(*) FROM users) as totalUsers
      FROM user_stats
      WHERE total_score > (SELECT total_score FROM user_stats WHERE user_id = ?)
    `, [userId]);

    if (!Array.isArray(rankResult) || rankResult.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: rankResult[0]
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
