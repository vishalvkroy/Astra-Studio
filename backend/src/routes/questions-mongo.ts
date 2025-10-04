import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Question Schema for MongoDB
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  topic: { type: String },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// User Answer Schema
const userAnswerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  userAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  difficulty: { type: String, required: true },
  answeredAt: { type: Date, default: Date.now }
});

const UserAnswer = mongoose.models.UserAnswer || mongoose.model('UserAnswer', userAnswerSchema);

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

    // Get random question
    const count = await Question.countDocuments({ difficulty: level });
    if (count === 0) {
      res.status(404).json({
        success: false,
        message: 'No questions found for this difficulty level'
      });
      return;
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne({ difficulty: level }).skip(random);

    if (!question) {
      res.status(404).json({
        success: false,
        message: 'No questions found'
      });
      return;
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

// Submit answer
router.post('/submit', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      res.status(400).json({
        success: false,
        message: 'Question ID and answer are required'
      });
      return;
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({
        success: false,
        message: 'Question not found'
      });
      return;
    }

    const isCorrect = question.correctAnswer === answer;

    // Save user answer
    const userAnswer = new UserAnswer({
      userId,
      questionId,
      userAnswer: answer,
      isCorrect,
      difficulty: question.difficulty
    });
    await userAnswer.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
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

    const question = await Question.findById(id);
    if (!question) {
      res.status(404).json({
        success: false,
        message: 'Question not found'
      });
      return;
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
