import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Clock } from 'lucide-react';
import '../styles/ExperienceDashboard.css';

interface ExperienceDashboardProps {
  userLevel: string;
  questionsAnswered: number;
  currentStreak: number;
  sessionTime: number;
}

const ExperienceDashboard: React.FC<ExperienceDashboardProps> = ({
  userLevel,
  questionsAnswered,
  currentStreak,
  sessionTime
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="experience-dashboard"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="dashboard-item">
        <div className="item-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Target size={18} />
        </div>
        <div className="item-content">
          <span className="item-label">Level</span>
          <span className="item-value">{userLevel}</span>
        </div>
      </div>

      <div className="dashboard-item">
        <div className="item-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <Trophy size={18} />
        </div>
        <div className="item-content">
          <span className="item-label">Questions</span>
          <span className="item-value">{questionsAnswered}</span>
        </div>
      </div>

      <div className="dashboard-item">
        <div className="item-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <Zap size={18} />
        </div>
        <div className="item-content">
          <span className="item-label">Streak</span>
          <span className="item-value">{currentStreak}</span>
        </div>
      </div>

      <div className="dashboard-item">
        <div className="item-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <Clock size={18} />
        </div>
        <div className="item-content">
          <span className="item-label">Time</span>
          <span className="item-value">{formatTime(sessionTime)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceDashboard;
