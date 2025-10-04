import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RoomProps {
  position?: [number, number, number];
  scale?: number;
}

const Room: React.FC<RoomProps> = ({ 
  position = [0, 0, 0],
  scale = 1
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/room.glb');

  // Clone the scene to avoid modifying the cached version
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  // Apply materials and shadows
  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Enhance materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.needsUpdate = true;
            });
          } else {
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene]);

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Room;
