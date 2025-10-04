import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Users, 
  Play, 
  Settings,
  Brain,
  Code,
  Star,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Current Level',
      value: user?.progress.level || 1,
      icon: Trophy,
      color: '#FFD700'
    },
    {
      label: 'Total XP',
      value: user?.progress.xp || 0,
      icon: Star,
      color: '#00C9A7'
    },
    {
      label: 'Lessons Completed',
      value: user?.progress.completedLessons?.length || 0,
      icon: BookOpen,
      color: '#845EC2'
    },
    {
      label: 'Streak Days',
      value: 7,
      icon: Zap,
      color: '#FF6B6B'
    }
  ];

  const quickActions = [
    {
      title: 'Enter 3D Classroom',
      description: 'Start learning with Astra AI',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/classroom')
    },
    {
      title: 'Practice Coding',
      description: 'Solve interactive challenges',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      action: () => console.log('Practice coding')
    },
    {
      title: 'View Progress',
      description: 'Track your learning journey',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      action: () => console.log('View progress')
    },
    {
      title: 'Join Community',
      description: 'Connect with other learners',
      icon: Users,
      color: 'from-yellow-500 to-orange-500',
      action: () => console.log('Join community')
    }
  ];

  const recentLessons = [
    { title: 'JavaScript Fundamentals', progress: 85, difficulty: 'Beginner' },
    { title: 'React Components', progress: 60, difficulty: 'Intermediate' },
    { title: 'Three.js Basics', progress: 30, difficulty: 'Advanced' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <motion.div
              className="user-profile-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="user-avatar">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt={`${user?.firstName} ${user?.lastName}`}
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}${user?.lastName}`;
                  }}
                />
              </div>
              <div className="welcome-section">
                <h1>Welcome back, {user?.firstName}! 👋</h1>
                <p>Ready to continue your coding journey?</p>
              </div>
            </motion.div>

            <div className="header-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Home
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="container">
          {/* Stats Grid */}
          <motion.section 
            className="stats-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-card"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section 
            className="actions-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  className="action-card"
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className={`action-icon bg-gradient-to-br ${action.color}`}>
                    <action.icon size={24} />
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Recent Lessons */}
          <motion.section 
            className="lessons-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2>Continue Learning</h2>
            <div className="lessons-grid">
              {recentLessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  className="lesson-card"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <div className="lesson-header">
                    <h4>{lesson.title}</h4>
                    <span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <div className="lesson-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{lesson.progress}%</span>
                  </div>
                  <button className="lesson-continue">
                    <Play size={16} />
                    Continue
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
