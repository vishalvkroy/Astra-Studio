import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import '../styles/ChatInterface.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  conversationHistory: Message[];
  isSpeaking: boolean;
  isVisible: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationHistory,
  isSpeaking,
  isVisible
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="chat-interface"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="chat-header">
        <div className="chat-status">
          <div className={`status-indicator ${isSpeaking ? 'speaking' : 'listening'}`}></div>
          <span>{isSpeaking ? 'Astra is speaking...' : 'Listening...'}</span>
        </div>
      </div>

      <div className="chat-messages">
        <AnimatePresence>
          {conversationHistory.slice(-5).map((message, index) => (
            <motion.div
              key={`${message.timestamp}-${index}`}
              className={`message ${message.role}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  );
};

export default ChatInterface;
