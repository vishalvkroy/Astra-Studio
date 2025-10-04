import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, AlertCircle, 
  CheckCircle, Brain, Sparkles, Shield, Users, 
  BarChart3, Code, Home, Loader2 
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import '../styles/AuthPage.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin, isAuthenticated } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Handle email verification
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [isAuthenticated, navigate, searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      await apiService.verifyEmail(token);
      setMessage({ type: 'success', text: 'Email verified successfully! You can now log in.' });
      setIsLogin(true);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Email verification failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLogin) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!isLogin && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const response = await apiService.login(formData.email, formData.password);
        console.log('Login response:', response);
        
        if (response.success && response.user && response.accessToken) {
          authLogin(response.user, response.accessToken);
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        const response = await apiService.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        
        // In development, auto-skip verification
        if (import.meta.env.DEV) {
          try {
            await apiService.post('/auth/skip-verification', { email: formData.email });
            setMessage({ 
              type: 'success', 
              text: '✅ Registration successful! You can now log in with your credentials.' 
            });
          } catch (skipError) {
            setMessage({ 
              type: 'success', 
              text: '✅ Registration successful! Please check your email to verify your account.' 
            });
          }
        } else {
          setMessage({ 
            type: 'success', 
            text: '✅ Registration successful! Please check your email to verify your account.' 
          });
        }
        
        // Auto-switch to login tab
        setTimeout(() => {
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }, 2000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Professional error messages
      if (errorMessage.includes('Invalid email or password')) {
        errorMessage = '❌ Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = '⚠️ This email is already registered. Please login or use a different email.';
      } else if (errorMessage.includes('verify your email')) {
        errorMessage = '📧 Please verify your email before logging in. Check your inbox for the verification link.';
      } else if (errorMessage.includes('Google Sign-In')) {
        errorMessage = '🔐 This account uses Google Sign-In. Please use the "Continue with Google" button.';
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        const result = await apiService.googleLogin(response.code);
        console.log('Google login response:', result);
        
        if (result.success && result.user && result.accessToken) {
          authLogin(result.user, result.accessToken);
          setMessage({ type: 'success', text: '✅ Google login successful! Redirecting...' });
          
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || '❌ Google login failed. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setMessage({ type: 'error', text: '❌ Google login failed. Please try again.' });
    },
    flow: 'auth-code',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setMessage(null);
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Tutoring",
      description: "Get personalized explanations and hints from your AI tutor",
    },
    {
      icon: Code,
      title: "3D Coding Environment",
      description: "Learn coding in an immersive 3D environment with voice interaction",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Track your learning progress with detailed analytics and achievements",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Organize your learning with AI-generated notes and explanations",
    },
  ];

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Home Button */}
      <motion.button
        className="home-button"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Home size={20} />
        Home
      </motion.button>

      {/* Main Container */}
      <div className="auth-container">
        {/* Features Side */}
        <motion.div 
          className="auth-branding"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="brand-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Brain className="brain-icon" size={40} />
                <Sparkles className="sparkle-icon" size={16} />
              </div>
              <h1>Astra</h1>
              <p className="tagline">Your AI-Powered 3D Coding Tutor</p>
            </div>

            <div className="features-list">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="feature-icon">
                    <feature.icon size={20} />
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="stats-section">
              <div className="stat-item">
                <Users className="stat-icon" size={20} />
                <div>
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              <div className="stat-item">
                <Shield className="stat-icon" size={20} />
                <div>
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Side */}
        <motion.div 
          className="auth-form-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-card">
            <div className="auth-header">
              <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
              <p>
                {isLogin 
                  ? 'Sign in to continue your coding journey' 
                  : 'Start your AI-powered coding adventure'
                }
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => !isLoading && setIsLogin(true)}
                disabled={isLoading}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => !isLoading && setIsLogin(false)}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>

            {/* Message Display */}
            <AnimatePresence>
              {message && (
                <motion.div
                  className={`error-message ${message.type === 'success' ? 'success-message' : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    className="name-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="input-group">
                      <div className={`input-wrapper ${errors.firstName ? 'error' : ''}`}>
                        <User className="input-icon" size={20} />
                        <input
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                    </div>

                    <div className="input-group">
                      <div className={`input-wrapper ${errors.lastName ? 'error' : ''}`}>
                        <User className="input-icon" size={20} />
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="input-group">
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="input-group">
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </motion.button>
            </form>

            {/* OAuth Divider */}
            <div className="oauth-divider">
              <span>or continue with</span>
            </div>

            {/* Google OAuth */}
            <div className="google-auth">
              <motion.button
                type="button"
                className="auth-button google"
                onClick={() => googleLogin()}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>
            </div>

            {/* Footer */}
            <div className="auth-footer">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    className="link-button" 
                    onClick={toggleAuthMode}
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    className="link-button" 
                    onClick={toggleAuthMode}
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
