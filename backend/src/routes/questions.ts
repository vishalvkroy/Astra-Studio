import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';
import pool from '../config/mysql';

const router = Router();

// Get random question by difficulty level
router.get('/random', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { level } = req.query;
    
    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level as string)) {
      res.status(400).json({
        success: false,
        message: 'Valid difficulty level is required (beginner, intermediate, advanced)'
      });
      return;
    }

    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
      [level]
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No questions found for this difficulty level'
      });
      return;
    }

    const question: any = questions[0];
    
    // Parse options if stored as JSON string
    if (typeof question.options === 'string') {
      question.options = JSON.parse(question.options);
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
});

// Submit answer to question
router.post('/answer', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, answer, isCorrect, level } = req.body;
    const userId = (req as any).user.id;

    if (!questionId || answer === undefined || isCorrect === undefined) {
      res.status(400).json({
        success: false,
        message: 'Question ID, answer, and correctness are required'
      });
      return;
    }

    // Record the answer
    const answerId = uuidv4();
    await pool.query(
      'INSERT INTO user_answers (id, user_id, question_id, user_answer, is_correct) VALUES (?, ?, ?, ?, ?)',
      [answerId, userId, questionId, answer, isCorrect]
    );

    // Update user stats
    const points = isCorrect ? 10 : 0;
    
    await pool.query(`
      UPDATE user_stats 
      SET 
        total_score = total_score + ?,
        questions_answered = questions_answered + 1,
        correct_answers = correct_answers + ?,
        wrong_answers = wrong_answers + ?,
        current_streak = CASE WHEN ? THEN current_streak + 1 ELSE 0 END,
        longest_streak = CASE WHEN ? AND (current_streak + 1) > longest_streak THEN current_streak + 1 ELSE longest_streak END,
        last_active = NOW()
      WHERE user_id = ?
    `, [points, isCorrect ? 1 : 0, isCorrect ? 0 : 1, isCorrect, isCorrect, userId]);

    // Update cpp_progress based on level
    if (isCorrect) {
      const progressIncrement = level === 'beginner' ? 0.5 : level === 'intermediate' ? 0.3 : 0.2;
      await pool.query(
        'UPDATE user_stats SET cpp_progress = LEAST(cpp_progress + ?, 100) WHERE user_id = ?',
        [progressIncrement, userId]
      );
    }

    res.json({
      success: true,
      data: {
        points,
        isCorrect
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
});

// Get question by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE id = ?',
      [id]
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Question not found'
      });
      return;
    }

    const question: any = questions[0];
    
    if (typeof question.options === 'string') {
      question.options = JSON.parse(question.options);
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
});

export default router;
