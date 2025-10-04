import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Plane, 
  Environment,
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { Mesh, Vector3 } from 'three';
import { useAuthStore } from '../store/authStore';
import '../styles/ThreeClassroom.css';

// AI Assistant Avatar Component
const AstraAvatar: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Main Avatar Sphere */}
      <Sphere
        ref={meshRef}
        args={[0.8, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? "#845EC2" : "#00C9A7"}
          emissive={hovered ? "#845EC2" : "#00C9A7"}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={[
          Math.cos(i * Math.PI / 4) * 1.5,
          Math.sin(i * Math.PI / 4) * 0.5,
          Math.sin(i * Math.PI / 4) * 1.5
        ]}>
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
      
      {/* Name Label */}
      <Html position={[0, -1.5, 0]} center>
        <div className="avatar-label">
          <span>Astra AI</span>
        </div>
      </Html>
    </group>
  );
};

// Interactive Code Block Component
const CodeBlock: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const [active, setActive] = useState(false);
  
  return (
    <group position={position}>
      <Box
        args={[3, 2, 0.1]}
        onClick={() => setActive(!active)}
        onPointerOver={() => setActive(true)}
        onPointerOut={() => setActive(false)}
      >
        <meshStandardMaterial
          color={active ? "#4A90E2" : "#2D3748"}
          emissive={active ? "#4A90E2" : "#2D3748"}
          emissiveIntensity={active ? 0.3 : 0.1}
        />
      </Box>
      
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        color="#00FF00"
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.woff"
      >
        {`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`}
      </Text>
      
      <Html position={[0, -1.2, 0]} center>
        <div className="code-label">
          <span>Interactive Code Example</span>
        </div>
      </Html>
    </group>
  );
};

// Learning Progress Visualization
const ProgressOrb: React.FC<{ position: [number, number, number]; progress: number }> = ({ 
  position, 
  progress 
}) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 16, 16]}>
        <meshStandardMaterial
          color="#FF6B6B"
          transparent
          opacity={0.7}
          emissive="#FF6B6B"
          emissiveIntensity={progress * 0.5}
        />
      </Sphere>
      
      <Html position={[0, -0.8, 0]} center>
        <div className="progress-label">
          <span>{Math.round(progress * 100)}% Complete</span>
        </div>
      </Html>
    </group>
  );
};

// Main Classroom Scene
const ClassroomScene: React.FC = () => {
  const { user } = useAuthStore();
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#845EC2" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Floor */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <meshStandardMaterial
          color="#1A202C"
          metalness={0.1}
          roughness={0.8}
        />
      </Plane>
      
      {/* Walls */}
      <Plane
        args={[20, 10]}
        position={[0, 3, -10]}
      >
        <meshStandardMaterial
          color="#2D3748"
          metalness={0.1}
          roughness={0.9}
        />
      </Plane>
      
      {/* Interactive Elements */}
      <AstraAvatar position={[0, 2, 0]} />
      <CodeBlock position={[-4, 1, -2]} />
      <CodeBlock position={[4, 1, -2]} />
      
      {/* Progress Visualization */}
      {user && (
        <ProgressOrb 
          position={[0, 4, -5]} 
          progress={user.progress.xp / 1000} 
        />
      )}
      
      {/* Welcome Text */}
      <Text
        position={[0, 6, -8]}
        fontSize={0.8}
        color="#00C9A7"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Welcome to Your 3D Classroom!
      </Text>
      
      {user && (
        <Text
          position={[0, 5, -8]}
          fontSize={0.4}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {`Hello ${user.firstName}! Level ${user.progress.level} - ${user.progress.xp} XP`}
        </Text>
      )}
    </>
  );
};

// Main Component
const ThreeClassroom: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    // Simulate loading time for 3D assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="classroom-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🎓
        </motion.div>
        <p>Loading your 3D classroom...</p>
      </div>
    );
  }

  return (
    <div className="three-classroom">
      <div className="classroom-ui">
        <div className="classroom-header">
          <h1>3D Interactive Classroom</h1>
          <p>Experience coding in a whole new dimension</p>
        </div>
        
        <div className="classroom-controls">
          <button className="control-btn">
            🎤 Voice Chat
          </button>
          <button className="control-btn">
            📝 Take Notes
          </button>
          <button className="control-btn">
            🎯 Practice Mode
          </button>
          <button className="control-btn">
            📊 View Progress
          </button>
        </div>
      </div>

      <Canvas
        className="classroom-canvas"
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
      >
        <ClassroomScene />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      <div className="classroom-chat">
        <div className="chat-header">
          <span>💬 Chat with Astra</span>
        </div>
        <div className="chat-messages">
          <div className="message astra-message">
            <span className="message-author">Astra AI</span>
            <p>Welcome to your 3D classroom, {user?.firstName}! I'm here to help you learn programming in an immersive environment. What would you like to explore today?</p>
          </div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask Astra anything about programming..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // Handle chat input
                console.log('Chat message:', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ThreeClassroom;
