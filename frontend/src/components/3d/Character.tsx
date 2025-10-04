import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterHandle } from '../../types';

interface CharacterProps {
  isSpeaking: boolean;
  position?: [number, number, number];
  scale?: number;
}

const Character = forwardRef<CharacterHandle, CharacterProps>(({ 
  isSpeaking,
  position = [0, 0, 0],
  scale = 1
}, ref) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/assets/char.glb');
  const { actions, mixer } = useAnimations(animations, group);
  const currentAnimation = useRef<string>('idle');

  useImperativeHandle(ref, () => ({
    faceCamera: () => {
      if (group.current) {
        // Smoothly rotate to face camera
        const targetRotation = new THREE.Euler(0, Math.PI, 0);
        group.current.rotation.y = targetRotation.y;
      }
    },
    setAnimation: (animationName: 'idle' | 'talk' | 'think' | 'celebrate' | 'explain') => {
      if (currentAnimation.current === animationName) return;
      
      const previousAction = actions[currentAnimation.current];
      const nextAction = actions[animationName] || actions['idle'];
      
      if (previousAction) {
        previousAction.fadeOut(0.5);
      }
      
      if (nextAction) {
        nextAction.reset().fadeIn(0.5).play();
        currentAnimation.current = animationName;
      }
    },
    playGesture: (gesture: string) => {
      const gestureAction = actions[gesture];
      if (gestureAction) {
        gestureAction.reset().play();
        gestureAction.setLoop(THREE.LoopOnce, 1);
        gestureAction.clampWhenFinished = true;
      }
    }
  }));

  useEffect(() => {
    // Start with idle animation
    const idleAction = actions['idle'] || actions[Object.keys(actions)[0]];
    if (idleAction) {
      idleAction.play();
      currentAnimation.current = 'idle';
    }

    // Configure animations
    Object.values(actions).forEach(action => {
      if (action) {
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(1);
      }
    });
  }, [actions]);

  useEffect(() => {
    if (isSpeaking) {
      const talkAction = actions['talk'] || actions['idle'];
      if (talkAction && currentAnimation.current !== 'talk') {
        const previousAction = actions[currentAnimation.current];
        if (previousAction) {
          previousAction.fadeOut(0.3);
        }
        talkAction.reset().fadeIn(0.3).play();
        currentAnimation.current = 'talk';
      }
    } else {
      const idleAction = actions['idle'];
      if (idleAction && currentAnimation.current !== 'idle') {
        const previousAction = actions[currentAnimation.current];
        if (previousAction) {
          previousAction.fadeOut(0.3);
        }
        idleAction.reset().fadeIn(0.3).play();
        currentAnimation.current = 'idle';
      }
    }
  }, [isSpeaking, actions]);

  // Subtle floating animation
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
      
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <pointLight
          position={[0, 1.5, 0]}
          intensity={0.5}
          distance={3}
          color="#667eea"
          decay={2}
        />
      )}
    </group>
  );
});

Character.displayName = 'Character';

export default Character;
