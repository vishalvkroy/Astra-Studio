import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import '../styles/EnhancedWhiteboard.css';

interface EnhancedWhiteboardProps {
  content: string;
  onClose: () => void;
  duration?: number;
}

const EnhancedWhiteboard: React.FC<EnhancedWhiteboardProps> = ({
  content,
  onClose,
  duration = 15000
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration / 1000);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra-explanation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  const parseContent = (text: string) => {
    const sections: Array<{ type: 'text' | 'code'; content: string; title?: string }> = [];
    const lines = text.split('\n');
    let currentSection: { type: 'text' | 'code'; content: string; title?: string } | null = null;
    let inCodeBlock = false;

    lines.forEach(line => {
      // Check for code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          if (currentSection) {
            sections.push(currentSection);
            currentSection = null;
          }
          inCodeBlock = false;
        } else {
          // Start code block
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = { type: 'code', content: '' };
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock && currentSection) {
        currentSection.content += line + '\n';
        return;
      }

      // Check for section headers
      if (line.match(/^[📚✅💡🎯📝⭐]/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { type: 'text', content: line, title: line };
      } else if (currentSection) {
        currentSection.content += '\n' + line;
      } else {
        currentSection = { type: 'text', content: line };
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseContent(content);

  return (
    <motion.div
      className="whiteboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="whiteboard-container"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div className="whiteboard-header">
          <div className="header-left">
            <div className="whiteboard-title">
              <span className="title-icon">📋</span>
              <h2>Astra's Explanation</h2>
            </div>
            <div className="timer">
              <div className="timer-circle">
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="3"
                    strokeDasharray={`${(timeRemaining / (duration / 1000)) * 100}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="timer-text">{timeRemaining}s</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button className="action-btn" onClick={handleDownload} title="Download">
              <Download size={18} />
            </button>
            <button className="action-btn close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="whiteboard-content">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className={`content-section ${section.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {section.type === 'text' ? (
                <div className="text-section">
                  {section.title && (
                    <h3 className="section-title">{section.title}</h3>
                  )}
                  <p className="section-content">{section.content}</p>
                </div>
              ) : (
                <div className="code-section">
                  <SyntaxHighlighter
                    language="cpp"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      fontSize: '0.95rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                    }}
                    showLineNumbers
                  >
                    {section.content.trim()}
                  </SyntaxHighlighter>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="whiteboard-footer">
          <div className="footer-info">
            <span className="info-badge">
              <span className="badge-dot"></span>
              This explanation will be saved to your temporary notes
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedWhiteboard;
