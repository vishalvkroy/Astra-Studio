import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  User, Settings, LogOut, Trophy, Target, TrendingUp,
  Clock, Award, BookOpen, Code, Zap, Star, ChevronRight,
  Bell, Search, Calendar, Download, Share2, Edit, Camera,
  Mail, Lock, Check, X, Folder, FileText, Brain, Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { UserStats, LeaderboardEntry, ProgressAnalytics, SkillLevel } from '../types';
import '../styles/ProfessionalDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfessionalDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'leaderboard' | 'progress' | 'notes' | 'profile'>('overview');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profilePicture || '');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, leaderboardRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/user/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUserStats(statsRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
      setProgressData(progressRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (profileData.username !== user?.username) {
        formData.append('username', profileData.username);
      }
      if (profileData.email !== user?.email) {
        formData.append('email', profileData.email);
      }
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        formData.append('currentPassword', profileData.currentPassword);
        formData.append('newPassword', profileData.newPassword);
      }
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      await axios.put(`${API_URL}/api/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully');
      setShowProfileEdit(false);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const skillsData: SkillLevel[] = [
    { skill: 'Variables', level: userStats?.cppProgress || 0, maxLevel: 100, progress: (userStats?.cppProgress || 0) },
    { skill: 'Functions', level: Math.min((userStats?.cppProgress || 0) * 0.8, 100), maxLevel: 100, progress: Math.min((userStats?.cppProgress || 0) * 0.8, 100) },
    { skill: 'OOP', level: Math.min((userStats?.cppProgress || 0) * 0.6, 100), maxLevel: 100, progress: Math.min((userStats?.cppProgress || 0) * 0.6, 100) },
    { skill: 'Data Structures', level: Math.min((userStats?.cppProgress || 0) * 0.5, 100), maxLevel: 100, progress: Math.min((userStats?.cppProgress || 0) * 0.5, 100) },
    { skill: 'Algorithms', level: Math.min((userStats?.cppProgress || 0) * 0.4, 100), maxLevel: 100, progress: Math.min((userStats?.cppProgress || 0) * 0.4, 100) },
  ];

  const radarData = skillsData.map(skill => ({
    subject: skill.skill,
    value: skill.level,
    fullMark: 100,
  }));

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="professional-dashboard">
      {/* Vertical Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Brain className="logo-icon" />
            <span>Astra</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity />
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart />
            <span>Statistics</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy />
            <span>Leaderboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <TrendingUp />
            <span>Progress</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText />
            <span>Notes</span>
          </button>
          <button
            className="nav-item nav-item-primary"
            onClick={() => navigate('/landing')}
          >
            <Zap />
            <span>Talk to Astra</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => navigate('/')}>
            <ChevronRight />
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user?.username}!</h1>
            <p className="header-subtitle">Ready to continue your learning journey?</p>
          </div>
          <div className="header-right">
            <button className="header-btn">
              <Bell />
            </button>
            <button className="header-btn">
              <Search />
            </button>
            <div className="profile-dropdown">
              <button className="profile-btn" onClick={() => setShowProfileEdit(true)}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} />
                ) : (
                  <User />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <Trophy />
                    </div>
                    <div className="stat-content">
                      <h3>{userStats?.totalScore || 0}</h3>
                      <p>Total Score</p>
                      <span className="stat-change positive">+12% this week</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <Target />
                    </div>
                    <div className="stat-content">
                      <h3>{userStats?.questionsAnswered || 0}</h3>
                      <p>Questions Answered</p>
                      <span className="stat-change positive">+{userStats?.correctAnswers || 0} correct</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                      <Award />
                    </div>
                    <div className="stat-content">
                      <h3>#{userStats?.rank || 0}</h3>
                      <p>Global Rank</p>
                      <span className="stat-change">of {userStats?.totalUsers || 0} users</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                      <Zap />
                    </div>
                    <div className="stat-content">
                      <h3>{userStats?.currentStreak || 0}</h3>
                      <p>Day Streak</p>
                      <span className="stat-change">Best: {userStats?.longestStreak || 0} days</span>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                  <div className="chart-card">
                    <h3>C++ Skills Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" stroke="#888" />
                        <PolarRadiusAxis stroke="#888" />
                        <Radar name="Skills" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Accuracy Rate</h3>
                    <div className="accuracy-display">
                      <div className="accuracy-circle">
                        <svg viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="90" fill="none" stroke="#222" strokeWidth="20" />
                          <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="20"
                            strokeDasharray={`${(userStats?.correctAnswers || 0) / (userStats?.questionsAnswered || 1) * 565} 565`}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#667eea" />
                              <stop offset="100%" stopColor="#764ba2" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="accuracy-text">
                          <h2>{Math.round((userStats?.correctAnswers || 0) / (userStats?.questionsAnswered || 1) * 100)}%</h2>
                          <p>Accuracy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="achievements-section">
                  <h3>Recent Achievements</h3>
                  <div className="achievements-grid">
                    {userStats?.achievements.slice(0, 6).map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        className="achievement-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="achievement-icon">{achievement.icon}</div>
                        <h4>{achievement.name}</h4>
                        <p>{achievement.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                <h2>Detailed Statistics</h2>
                
                <div className="chart-card full-width">
                  <h3>Learning Progress Over Time</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4facfe" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                      <Legend />
                      <Area type="monotone" dataKey="questionsAnswered" stroke="#667eea" fillOpacity={1} fill="url(#colorQuestions)" />
                      <Area type="monotone" dataKey="correctAnswers" stroke="#4facfe" fillOpacity={1} fill="url(#colorCorrect)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="charts-row">
                  <div className="chart-card">
                    <h3>Performance by Difficulty</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { difficulty: 'Beginner', accuracy: 95, count: 120 },
                        { difficulty: 'Intermediate', accuracy: 78, count: 85 },
                        { difficulty: 'Advanced', accuracy: 62, count: 45 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="difficulty" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                        <Legend />
                        <Bar dataKey="accuracy" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Study Time Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                        <Legend />
                        <Line type="monotone" dataKey="timeSpent" stroke="#f5576c" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                <h2>Global Leaderboard</h2>
                <div className="leaderboard-container">
                  <div className="leaderboard-header">
                    <span>Rank</span>
                    <span>User</span>
                    <span>Score</span>
                    <span>Questions</span>
                    <span>Accuracy</span>
                  </div>
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      className={`leaderboard-row ${entry.userId === user?.id ? 'current-user' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="rank">
                        {entry.rank <= 3 ? (
                          <div className={`medal medal-${entry.rank}`}>
                            <Trophy />
                          </div>
                        ) : (
                          <span>#{entry.rank}</span>
                        )}
                      </div>
                      <div className="user-info">
                        {entry.profilePicture ? (
                          <img src={entry.profilePicture} alt={entry.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{entry.username}</span>
                      </div>
                      <div className="score">{entry.score}</div>
                      <div className="questions">{entry.questionsAnswered}</div>
                      <div className="accuracy">{entry.accuracy}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                <h2>C++ Learning Progress</h2>
                <div className="progress-overview">
                  <div className="overall-progress">
                    <h3>Overall Progress</h3>
                    <div className="progress-bar-large">
                      <div 
                        className="progress-fill"
                        style={{ width: `${userStats?.cppProgress || 0}%` }}
                      >
                        <span>{userStats?.cppProgress || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="skills-breakdown">
                    <h3>Skills Breakdown</h3>
                    {skillsData.map((skill, index) => (
                      <div key={skill.skill} className="skill-item">
                        <div className="skill-header">
                          <span>{skill.skill}</span>
                          <span>{skill.level}%</span>
                        </div>
                        <div className="skill-progress-bar">
                          <motion.div
                            className="skill-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.progress}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="content-section"
              >
                <div className="notes-header">
                  <h2>My Notes</h2>
                  <button className="btn-primary" onClick={() => navigate('/notes')}>
                    <Folder />
                    Manage Notes
                  </button>
                </div>
                <p className="notes-description">
                  Access your saved notes and explanations from Astra sessions.
                  Notes are automatically saved when Astra explains concepts on the whiteboard.
                </p>
                <button className="btn-large" onClick={() => navigate('/notes')}>
                  <FileText />
                  Open Notes Manager
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileEdit(false)}
          >
            <motion.div
              className="modal-content profile-edit-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Edit Profile</h2>
                <button onClick={() => setShowProfileEdit(false)}>
                  <X />
                </button>
              </div>

              <div className="modal-body">
                <div className="profile-picture-section">
                  <div className="profile-picture-preview">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" />
                    ) : (
                      <User size={64} />
                    )}
                  </div>
                  <label className="btn-secondary">
                    <Camera />
                    Change Picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <User size={18} />
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                  {!user?.emailVerified && (
                    <span className="email-status unverified">Email not verified</span>
                  )}
                </div>

                <div className="form-divider">
                  <span>Change Password (Optional)</span>
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={18} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={18} />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={18} />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowProfileEdit(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleProfileUpdate}>
                  <Check />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalDashboard;
