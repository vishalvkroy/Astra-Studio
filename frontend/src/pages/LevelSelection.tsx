import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Rocket, ArrowRight, Star, Code, Brain } from 'lucide-react';
import { createDynamicBackground, createFloatingParticles, createGridPattern } from '../utils/backgroundEffects';
import '../styles/LevelSelection.css';

interface Level {
  id: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: string[];
}

const LevelSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.level-selection-page') as HTMLElement;
    if (!container) return;

    const cleanupBg = createDynamicBackground(container);
    const cleanupParticles = createFloatingParticles(container, 30);
    const cleanupGrid = createGridPattern(container);

    return () => {
      cleanupBg();
      cleanupParticles();
      cleanupGrid();
    };
  }, []);

  const levels: Level[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      subtitle: 'Start Your Journey',
      description: 'Perfect for those new to C++ programming. Learn the fundamentals with guided support.',
      icon: <Target size={48} />,
      color: '#4ade80',
      gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      features: [
        'Basic syntax and concepts',
        'Step-by-step guidance',
        'Interactive examples',
        'Foundational knowledge'
      ]
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      subtitle: 'Level Up Your Skills',
      description: 'For those with basic knowledge. Dive deeper into C++ concepts and best practices.',
      icon: <Zap size={48} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      features: [
        'Advanced data structures',
        'Object-oriented programming',
        'Memory management',
        'Real-world applications'
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced',
      subtitle: 'Master the Craft',
      description: 'Challenge yourself with complex problems and advanced C++ techniques.',
      icon: <Rocket size={48} />,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      features: [
        'Complex algorithms',
        'Performance optimization',
        'Design patterns',
        'Expert-level challenges'
      ]
    }
  ];

  const handleLevelSelect = async (levelId: string) => {
    setSelectedLevel(levelId);
    setIsLoading(true);

    // Save level to localStorage
    localStorage.setItem('selectedLevel', levelId);

    // Simulate loading and transition
    setTimeout(() => {
      navigate('/experience');
    }, 2000);
  };

  return (
    <div className="level-selection-page">
      <div className="level-selection-container">
        <motion.div
          className="level-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="header-icon">
            <Brain size={64} />
          </div>
          <h1>Choose Your Learning Path</h1>
          <p>Select the level that matches your C++ programming experience</p>
        </motion.div>

        <div className="levels-grid">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => !isLoading && handleLevelSelect(level.id)}
            >
              <div className="level-card-glow" style={{ background: level.gradient }}></div>
              
              <div className="level-icon" style={{ color: level.color }}>
                {level.icon}
              </div>

              <h2>{level.title}</h2>
              <h3>{level.subtitle}</h3>
              <p className="level-description">{level.description}</p>

              <div className="level-features">
                {level.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <Star size={16} style={{ color: level.color }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className="level-select-btn"
                style={{ background: level.gradient }}
              >
                <span>Select Level</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="level-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Don't worry, you can change your level anytime during your learning journey</p>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <div className="loading-spinner-large"></div>
              <h2>Preparing Your Experience</h2>
              <p>Loading 3D classroom environment...</p>
              <div className="loading-bar">
                <motion.div
                  className="loading-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LevelSelection;
