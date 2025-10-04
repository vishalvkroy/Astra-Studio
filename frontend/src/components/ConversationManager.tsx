import React, { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { CharacterHandle } from '../types';

interface ConversationManagerProps {
  isMicOn: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  userLevel: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  setConversationHistory: React.Dispatch<React.SetStateAction<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>>>;
  characterRef: React.RefObject<CharacterHandle>;
  voiceRef: React.MutableRefObject<SpeechSynthesisVoice | null>;
  onSpeak: (text: string, onComplete?: () => void) => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ConversationManager: React.FC<ConversationManagerProps> = ({
  isMicOn,
  isMuted,
  isSpeaking,
  setIsSpeaking,
  userLevel,
  conversationHistory,
  setConversationHistory,
  characterRef,
  voiceRef,
  onSpeak
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false);

  const setupRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      console.log('🎤 Listening started');
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      console.log('🎤 Listening ended');
      
      // Restart if mic is still on and not speaking
      if (isMicOn && !isSpeaking && !isProcessingRef.current) {
        setTimeout(() => {
          if (recognitionRef.current && isMicOn) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.warn('Recognition restart error:', err);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Recognition error:', event.error);
      isListeningRef.current = false;
      
      if (event.error === 'no-speech') {
        // Restart listening
        setTimeout(() => {
          if (recognitionRef.current && isMicOn && !isSpeaking) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.warn('Recognition restart error:', err);
            }
          }
        }, 2000);
      }
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      
      if (!transcript || isProcessingRef.current || isSpeaking) return;
      
      console.log('👤 User said:', transcript);
      
      // Add user message to history
      const userMessage = {
        role: 'user' as const,
        content: transcript,
        timestamp: Date.now()
      };
      
      setConversationHistory(prev => [...prev, userMessage]);
      
      // Process AI response
      await handleAIResponse(transcript);
    };

    recognitionRef.current = recognition;
  }, [isMicOn, isSpeaking, setConversationHistory]);

  const handleAIResponse = async (userInput: string) => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    try {
      // Stop recognition while processing
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
      }

      const token = localStorage.getItem('token');
      
      // Get AI response from backend
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: userInput,
          context: {
            level: userLevel,
            conversationHistory: conversationHistory.slice(-10)
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );

      const aiResponse = response.data.response || response.data.message || "I'm here to help you learn!";
      
      // Add AI response to history
      const assistantMessage = {
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: Date.now()
      };
      
      setConversationHistory(prev => [...prev, assistantMessage]);
      
      // Speak the response
      onSpeak(aiResponse, () => {
        isProcessingRef.current = false;
        
        // Restart recognition after speaking
        if (isMicOn && recognitionRef.current && !isListeningRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.warn('Recognition restart error:', err);
            }
          }, 500);
        }
      });
      
    } catch (error: any) {
      console.error('AI response error:', error);
      
      const fallbackResponse = "I'm having trouble connecting right now. Could you please repeat that?";
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: fallbackResponse,
        timestamp: Date.now()
      };
      
      setConversationHistory(prev => [...prev, assistantMessage]);
      
      onSpeak(fallbackResponse, () => {
        isProcessingRef.current = false;
      });
    }
  };

  // Initialize recognition
  useEffect(() => {
    setupRecognition();
    
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setupRecognition]);

  // Start/stop recognition based on mic state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isMicOn && !isSpeaking && !isProcessingRef.current) {
      if (!isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Recognition start error:', err);
        }
      }
    } else {
      if (isListeningRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isMicOn, isSpeaking]);

  // Stop recognition when speaking
  useEffect(() => {
    if (isSpeaking && recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, [isSpeaking]);

  return null; // This is a logic-only component
};

export default ConversationManager;
