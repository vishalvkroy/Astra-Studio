import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// AI Chat endpoint
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, context } = req.body;
    const userId = (req as any).user.id;

    if (!message) {
      res.status(400).json({
        success: false,
        message: 'Message is required'
      });
      return;
    }

    // Build conversation context
    const systemPrompt = `You are Astra, a friendly and knowledgeable C++ programming tutor. 
You're not just a teacher, but a supportive friend who makes learning fun and engaging.

Key personality traits:
- Friendly and approachable, like a best friend
- Enthusiastic about programming
- Patient and encouraging
- Use casual language, but stay professional
- Sometimes share interesting programming facts or tips
- Don't always talk about coding - be conversational
- Show genuine interest in the user's progress

Current context:
- User level: ${context?.level || 'beginner'}
- Conversation history: ${context?.conversationHistory?.length || 0} messages

Guidelines:
- Keep responses concise (2-3 sentences usually)
- Be encouraging and positive
- Mix coding topics with casual conversation
- Don't ask quiz questions here (they're handled separately)
- If user seems stuck, offer hints rather than direct answers
- Celebrate their progress and achievements`;

    // Simple AI response logic (replace with OpenAI API in production)
    const aiResponse = generateAIResponse(message, context, systemPrompt);

    res.json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
});

// Simple AI response generator (replace with OpenAI API)
function generateAIResponse(message: string, context: any, systemPrompt: string): string {
  const lowerMessage = message.toLowerCase();

  // Greeting responses
  if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
    const greetings = [
      "Hey there! Great to see you! Ready to dive into some coding?",
      "Hi! How's it going? What would you like to learn about today?",
      "Hello! I'm excited to code with you today. What's on your mind?",
      "Hey! Good to have you here. Let's make today awesome!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you responses
  if (lowerMessage.match(/how are you|how're you|what's up|wassup/)) {
    const responses = [
      "I'm doing great, thanks for asking! Ready to help you level up your C++ skills. What would you like to work on?",
      "Fantastic! I love helping people learn to code. How about you? How's your coding journey going?",
      "I'm awesome! Just excited to be here with you. What brings you to our coding session today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Help/stuck responses
  if (lowerMessage.match(/\b(help|stuck|confused|don't understand|difficult|hard)\b/)) {
    const responses = [
      "No worries! Everyone gets stuck sometimes. That's how we learn! Can you tell me more about what's confusing you?",
      "I'm here to help! Let's break it down together. What specific part is giving you trouble?",
      "Hey, it's totally normal to feel stuck. That means you're pushing yourself! Let's work through this together."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // C++ specific topics
  if (lowerMessage.match(/\b(variable|pointer|class|function|loop|array|vector)\b/)) {
    const responses = [
      "Great topic! That's one of the fundamental concepts in C++. Want to explore it more deeply?",
      "Ah yes, that's super important in C++! It's actually one of my favorite topics. What would you like to know?",
      "Nice! Understanding that will really level up your C++ game. Let me know if you want to dive deeper!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Positive feedback
  if (lowerMessage.match(/\b(thanks|thank you|awesome|great|cool)\b/)) {
    const responses = [
      "You're welcome! You're doing amazing! Keep up the great work!",
      "Anytime! I'm here whenever you need me. You're making awesome progress!",
      "Happy to help! You're crushing it! Let's keep this momentum going!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default conversational responses
  const defaultResponses = [
    "That's interesting! Tell me more about what you're thinking.",
    "I see what you mean. Programming is all about problem-solving, right?",
    "Good point! Have you tried experimenting with that concept in code?",
    "Absolutely! The best way to learn is by doing. Want to try something together?",
    "I hear you! Learning to code is a journey, and you're doing great so far.",
    "That's a great observation! It shows you're really thinking about the concepts."
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export default router;
