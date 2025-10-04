import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, BookOpen, Users, Trophy, Shield, BarChart3, 
  Brain, Code, Star, ChevronRight, Zap, Globe, 
  Sparkles, Settings, ArrowRight, Rocket, Menu, X 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized tutoring that adapts to your learning style and pace",
      color: "from-purple-500 to-pink-500",
      details: "Advanced AI algorithms analyze your progress and customize lessons"
    },
    {
      icon: Code,
      title: "3D Interactive Coding",
      description: "Write, compile, and debug code in an immersive 3D environment",
      color: "from-blue-500 to-cyan-500",
      details: "Experience coding like never before with our 3D virtual classroom"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Learn alongside thousands of students from around the world",
      color: "from-green-500 to-emerald-500",
      details: "Connect with peers, share knowledge, and grow together"
    },
    {
      icon: Trophy,
      title: "Gamified Progress",
      description: "Earn achievements, level up, and compete on global leaderboards",
      color: "from-yellow-500 to-orange-500",
      details: "Stay motivated with our comprehensive achievement system"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security protecting your data and progress",
      color: "from-red-500 to-pink-500",
      details: "Your privacy and security are our top priorities"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed insights into your learning journey and skill development",
      color: "from-indigo-500 to-purple-500",
      details: "Track your growth with comprehensive analytics and reports"
    }
  ];

  const stats = [
    { label: "Active Learners", value: "50K+", icon: Users },
    { label: "Questions Solved", value: "1M+", icon: Code },
    { label: "Success Rate", value: "95%", icon: Trophy },
    { label: "Countries", value: "150+", icon: Globe }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      avatar: "👩‍💻",
      text: "This platform revolutionized how I learn programming. The 3D environment makes complex concepts so much easier to understand!"
    },
    {
      name: "Mike Chen",
      role: "Software Engineer",
      avatar: "👨‍💻",
      text: "As someone transitioning to programming, the AI tutor helped me learn at my own pace. Highly recommended!"
    },
    {
      name: "Emma Williams",
      role: "High School Teacher",
      avatar: "👩‍🏫",
      text: "My students are more engaged than ever. The gamification aspect keeps them motivated to learn."
    }
  ];

  useEffect(() => {
    // Add floating particles
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      document.querySelector('.particles')?.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 25000);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/dashboard');
        setIsLoading(false);
      }, 1000);
    } else {
      navigate('/auth');
    }
  };

  const handleTalkToAstra = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      navigate('/classroom');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="homepage">
      {/* Video Background */}
      <div className="video-background">
        <video autoPlay muted loop playsInline>
          <source src="/api/placeholder/video/bg.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
        <div className="particles" />
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <motion.div 
              className="logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="logo-icon" />
              <span className="logo-text">Astra</span>
            </motion.div>

            <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Features
              </button>
              <button onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
                Stats
              </button>
              <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>
                Reviews
              </button>
              {isAuthenticated ? (
                <motion.button 
                  className="button button-primary"
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
              ) : (
                <motion.button 
                  className="button button-secondary"
                  onClick={() => navigate('/auth')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              )}
            </nav>

            <button 
              className={`mobile-menu-button ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="badge-glow" />
              🚀 Experience the Future of Learning
            </motion.div>

            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Learn Programming in a{' '}
              <span className="highlight">3D World</span>
            </motion.h1>

            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Meet Astra, your AI-powered coding companion in an immersive 3D environment. 
              Master programming through interactive lessons, real-time feedback, and personalized guidance.
            </motion.p>

            <motion.div 
              className="hero-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button 
                className="button button-primary large"
                onClick={handleGetStarted}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      className="spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings size={20} />
                    </motion.div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    {isAuthenticated ? 'Go to Dashboard' : 'Start Learning'}
                  </>
                )}
              </motion.button>

              <motion.button 
                className="button button-secondary large"
                onClick={handleTalkToAstra}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                Meet Astra
              </motion.button>
            </motion.div>

            {isAuthenticated && user && (
              <motion.div 
                className="welcome-back"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <p>Welcome back, <strong>{user.firstName}</strong>! Ready to continue your journey?</p>
                <div className="progress-preview">
                  <div className="level">Level {user.progress.level}</div>
                  <div className="xp">{user.progress.xp} XP</div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div 
            className="hero-graphic"
            style={{ y: y1 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="graphic-container">
              <div className="hero-3d-preview">
                <div className="preview-grid">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="floating-elements">
                  <div className="float-element element-1">
                    <Brain size={40} />
                  </div>
                  <div className="float-element element-2">
                    <Code size={36} />
                  </div>
                  <div className="float-element element-3">
                    <Sparkles size={32} />
                  </div>
                </div>
                <div className="center-orb">
                  <div className="orb-ring"></div>
                  <div className="orb-ring"></div>
                  <div className="orb-core"></div>
                </div>
              </div>
              <div className="graphic-overlay" />
              <div className="graphic-highlight" />
            </div>
            <div className="graphic-orb" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="section stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="stats-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <stat.icon className="stats-icon" />
                <div className="stats-value">{stat.value}</div>
                <div className="stats-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Discover the cutting-edge technology that makes learning programming 
              more engaging, effective, and enjoyable than ever before.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="feature-glow" />
                <div className="feature-border" />
                
                <div className="feature-icon-container">
                  <feature.icon className="feature-icon" />
                </div>
                
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <p className="feature-details">{feature.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="section demo-section">
        <div className="container">
          <div className="demo-content">
            <motion.div 
              className="demo-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">See Astra in Action</h2>
              <p className="demo-description">
                Watch how our AI companion guides students through complex programming 
                concepts in an immersive 3D environment. Experience the future of education today.
              </p>
              
              <motion.button 
                className="button button-primary"
                onClick={handleTalkToAstra}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                Start Interactive Demo
              </motion.button>
            </motion.div>

            <motion.div 
              className="demo-video-container"
              style={{ y: y2 }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="video-wrapper">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="3D Classroom Demo"
                  className="demo-image"
                />
                <div className="video-highlight" />
                <motion.div 
                  className="video-play-button"
                  onClick={handleTalkToAstra}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="play-icon" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied learners who have transformed their 
              programming skills with our innovative platform.
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="testimonial-glow" />
                <div className="quote-mark">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <span className="author-avatar">{testimonial.avatar}</span>
                    <div>
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-company">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of learners who have already mastered programming with 
              Astra's AI-powered platform. Start your journey today and experience 
              the future of education.
            </p>
            
            <div className="cta-buttons">
              <motion.button 
                className="button button-primary large"
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket size={20} />
                {isAuthenticated ? 'Continue Learning' : 'Get Started Free'}
              </motion.button>
              
              <motion.button 
                className="button button-secondary large"
                onClick={handleTalkToAstra}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain size={20} />
                Talk to Astra
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-logo-container">
              <div className="logo">
                <Brain className="logo-icon" />
                <span className="logo-text">Astra</span>
              </div>
              <p className="footer-tagline">
                Revolutionizing education through AI-powered 3D learning experiences.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="GitHub">🐙</a>
                <a href="#" aria-label="Discord">💬</a>
              </div>
            </div>

            <div className="footer-grid">
              <div className="footer-column">
                <h4 className="footer-heading">Product</h4>
                <ul>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Integrations</a></li>
                  <li><a href="#">API</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">Learn</h4>
                <ul>
                  <li><a href="#">Tutorials</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Community</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">Support</h4>
                <ul>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">Status</a></li>
                  <li><a href="#">Bug Reports</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">Stay Updated</h4>
                <p>Get the latest updates and announcements.</p>
                <div className="newsletter">
                  <div className="newsletter-input">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                    />
                    <button>Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 Astra. All rights reserved.</p>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
