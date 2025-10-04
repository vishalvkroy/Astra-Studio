import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, FileText, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Character from '../components/3d/Character';
import Room from '../components/3d/Room';
import EnhancedWhiteboard from '../components/EnhancedWhiteboard';
import ConversationManager from '../components/ConversationManager';
import ExperienceDashboard from '../components/ExperienceDashboard';
import NotesIcon from '../components/NotesIcon';
import ChatInterface from '../components/ChatInterface';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { CharacterHandle, Question } from '../types';
import { createDynamicBackground, createFloatingParticles } from '../utils/backgroundEffects';
import '../styles/ExperiencePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ExperiencePage: React.FC = () => {
  const navigate = useNavigate();
  const characterRef = useRef<CharacterHandle>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [whiteboardVisible, setWhiteboardVisible] = useState(false);
  const [whiteboardContent, setWhiteboardContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [temporaryNotes, setTemporaryNotes] = useState<Array<{
    id: string;
    content: string;
    timestamp: number;
    questionId?: string;
  }>>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>>([]);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [conversationCycleCount, setConversationCycleCount] = useState(0);
  const [lastQuizTime, setLastQuizTime] = useState<number>(Date.now());

  useEffect(() => {
    // Get selected level from localStorage
    const level = localStorage.getItem('selectedLevel') as 'beginner' | 'intermediate' | 'advanced';
    if (level) {
      setUserLevel(level);
    }

    // Initialize voice
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const female = voices.find(v => v.lang.includes('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha')));
      voiceRef.current = female || voices[0];
    };
    speechSynthesis.onvoiceschanged = loadVoice;
    loadVoice();

    // Background effects
    const container = document.querySelector('.experience-page') as HTMLElement;
    if (container) {
      const cleanupBg = createDynamicBackground(container);
      const cleanupParticles = createFloatingParticles(container, 20);
      
      return () => {
        cleanupBg();
        cleanupParticles();
      };
    }

    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Conversation cycle timer - triggers quiz every 1.5 minutes
  useEffect(() => {
    if (!isMicOn || currentQuestion) return;

    const timeSinceLastQuiz = Date.now() - lastQuizTime;
    const timeUntilNextQuiz = 90000 - timeSinceLastQuiz; // 1.5 minutes

    if (timeUntilNextQuiz <= 0) {
      triggerQuizQuestion();
      return;
    }

    const timer = setTimeout(() => {
      triggerQuizQuestion();
    }, timeUntilNextQuiz);

    return () => clearTimeout(timer);
  }, [isMicOn, currentQuestion, lastQuizTime, conversationHistory]);

  const speak = useCallback((text: string, onComplete?: () => void) => {
    if (isMuted) {
      onComplete?.();
      return;
    }

    setIsSpeaking(true);
    characterRef.current?.setAnimation('talk');

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      setIsSpeaking(false);
      characterRef.current?.setAnimation('idle');
      onComplete?.();
    };

    speechSynthesis.speak(utterance);
  }, [isMuted]);

  const triggerQuizQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/questions/random`, {
        params: { level: userLevel },
        headers: { Authorization: `Bearer ${token}` }
      });

      const question = response.data.data;
      setCurrentQuestion(question);
      setLastQuizTime(Date.now());

      // Astra asks the question
      speak(`Alright, let me test your knowledge. ${question.question}`, () => {
        // Question asked, waiting for answer
      });
    } catch (error) {
      console.error('Failed to fetch question:', error);
      toast.error('Failed to load question');
    }
  };

  const handleAnswerQuestion = async (answer: string, isCorrect: boolean) => {
    if (!currentQuestion) return;

    try {
      const token = localStorage.getItem('token');
      
      // Submit answer to backend
      await axios.post(
        `${API_URL}/api/questions/answer`,
        {
          questionId: currentQuestion.id,
          answer,
          isCorrect,
          level: userLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (isCorrect) {
        // Correct answer - appreciation
        const praises = [
          "Excellent work! That's absolutely correct!",
          "Perfect! You really know your stuff!",
          "Outstanding! You nailed it!",
          "Brilliant! That's exactly right!",
          "Amazing! You're doing great!"
        ];
        const praise = praises[Math.floor(Math.random() * praises.length)];
        
        speak(praise, () => {
          setCurrentQuestion(null);
          // Continue conversation
          speak("So, what else would you like to learn about?");
        });
      } else {
        // Wrong answer - show explanation on whiteboard
        speak(`Not quite. The correct answer is: ${currentQuestion.answer}. Let me explain this on the board.`, () => {
          showExplanationOnWhiteboard(currentQuestion);
        });
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const showExplanationOnWhiteboard = (question: Question) => {
    const explanation = formatExplanation(question);
    setWhiteboardContent(explanation);
    setWhiteboardVisible(true);

    // Add to temporary notes
    const noteId = `note_${Date.now()}`;
    setTemporaryNotes(prev => [...prev, {
      id: noteId,
      content: explanation,
      timestamp: Date.now(),
      questionId: question.id
    }]);

    // Speak explanation
    speak(question.explanation, () => {
      // Keep whiteboard visible for 15 seconds
      setTimeout(() => {
        setWhiteboardVisible(false);
        setCurrentQuestion(null);
        
        // Return to conversation
        speak("Alright, let's continue our conversation. What would you like to discuss?");
      }, 15000);
    });
  };

  const formatExplanation = (question: Question): string => {
    return `
📚 QUESTION
${question.question}

✅ CORRECT ANSWER
${question.answer}

💡 EXPLANATION
${question.explanation}

🎯 HINT
${question.hint}

📝 CATEGORY: ${question.category}
⭐ DIFFICULTY: ${question.difficulty.toUpperCase()}
    `.trim();
  };

  const handleTalkToAstra = () => {
    if (!isMicOn) {
      setIsMicOn(true);
      speak("Hey there! I'm Astra, your friendly coding companion. What's on your mind today?", () => {
        // Mic is now on, conversation can start
      });
    } else {
      setIsMicOn(false);
      speak("Alright, I'll be here when you need me!");
    }
  };

  const handleSaveNote = async (noteId: string, title: string, folder: string) => {
    try {
      const note = temporaryNotes.find(n => n.id === noteId);
      if (!note) return;

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/notes`,
        {
          title,
          content: note.content,
          folder,
          questionId: note.questionId,
          isSaved: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Note saved successfully!');
      setTemporaryNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteTempNote = (noteId: string) => {
    setTemporaryNotes(prev => prev.filter(n => n.id !== noteId));
    toast.success('Note discarded');
  };

  // Auto-delete notes after 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTemporaryNotes(prev => prev.filter(note => {
        const age = now - note.timestamp;
        return age < 24 * 60 * 60 * 1000; // 24 hours
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="experience-loading">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <h2>Loading 3D Classroom</h2>
          <p>Preparing your immersive learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="experience-page">
      {/* 3D Scene */}
      <div className="scene-container">
        <Canvas
          camera={{ position: [0, 1.6, 5], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 3, -5]} intensity={0.5} color="#667eea" />
          
          <Room />
          <Character ref={characterRef} isSpeaking={isSpeaking} />
        </Canvas>
      </div>

      {/* Experience Dashboard Overlay */}
      <ExperienceDashboard
        userLevel={userLevel}
        questionsAnswered={conversationCycleCount}
        currentStreak={0}
        sessionTime={Math.floor((Date.now() - lastQuizTime) / 1000)}
      />

      {/* Whiteboard */}
      <AnimatePresence>
        {whiteboardVisible && (
          <EnhancedWhiteboard
            content={whiteboardContent}
            onClose={() => setWhiteboardVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <ChatInterface
        conversationHistory={conversationHistory}
        isSpeaking={isSpeaking}
        isVisible={!currentQuestion}
      />

      {/* Quiz Question Overlay */}
      <AnimatePresence>
        {currentQuestion && (
          <motion.div
            className="quiz-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="quiz-card">
              <h3>Quiz Time!</h3>
              <p className="quiz-question">{currentQuestion.question}</p>
              <div className="quiz-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="quiz-option"
                    onClick={() => handleAnswerQuestion(option, option === currentQuestion.answer)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Panel */}
      <NotesIcon
        temporaryNotes={temporaryNotes}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteTempNote}
        isVisible={!currentQuestion}
      />

      {/* Control Panel */}
      <div className="control-panel">
        <button
          className={`control-btn ${isMicOn ? 'active' : ''}`}
          onClick={handleTalkToAstra}
          disabled={isSpeaking}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          <span>{isMicOn ? 'Mic On' : 'Talk to Astra'}</span>
        </button>

        <button
          className="control-btn"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        <button
          className="control-btn"
          onClick={() => navigate('/dashboard')}
        >
          <X size={24} />
          <span>Exit</span>
        </button>
      </div>

      {/* Conversation Manager (handles speech recognition and AI responses) */}
      <ConversationManager
        isMicOn={isMicOn}
        isMuted={isMuted}
        isSpeaking={isSpeaking}
        setIsSpeaking={setIsSpeaking}
        userLevel={userLevel}
        conversationHistory={conversationHistory}
        setConversationHistory={setConversationHistory}
        characterRef={characterRef}
        voiceRef={voiceRef}
        onSpeak={speak}
      />
    </div>
  );
};

export default ExperiencePage;
