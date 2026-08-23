import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { globalRobotController } from './RobotController';

export default function RobotScene({ onFail }) {
  const group = useRef();
  const wrapperRef = useRef();

  const [modelData, setModelData] = useState(null);
  const [mixer, setMixer] = useState(null);
  const [headBone, setHeadBone] = useState(null);

  // Manually load the GLTF to safely catch all errors without crashing Suspense or triggering Vite's overlay
  useEffect(() => {
    const loader = new GLTFLoader();

    loader.load(
      '/models/cute-robot.glb',
      (gltf) => {
        // Success!
        const scene = gltf.scene;
        const animations = gltf.animations;

        let newMixer = null;
        if (animations && animations.length > 0) {
          newMixer = new THREE.AnimationMixer(scene);
          // Try to find an idle animation, or just play the first one
          const idleAnim = animations.find(a => a.name.toLowerCase().includes('idle')) || animations[0];
          if (idleAnim) {
            newMixer.clipAction(idleAnim).play();
          }
        }

        let foundHead = null;
        scene.traverse((child) => {
          if (child.isBone && child.name.toLowerCase().includes('head')) {
            foundHead = child;
          }
        });
        if (!foundHead) {
          scene.traverse((child) => {
            if (child.name.toLowerCase().includes('head')) foundHead = child;
          });
        }

        setHeadBone(foundHead);
        setMixer(newMixer);
        setModelData(scene);
      },
      undefined,
      (error) => {
        // Fail!
        console.error("Failed to load cute-robot.glb:", error);
        if (onFail) onFail();
      }
    );

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [onFail]);

  // Center and normalize scale
  // We use useEffect instead of useMemo to prevent React StrictMode from mutating the object twice
  // However, local dev looked fine because the double-mutation was resetting the position to [0,0,0] and scale to 1.
  // To match local dev, we simply apply a fixed scale and position.
  useEffect(() => {
    if (!modelData) return;

    // Heuristic to hide background planes/floors in generic GLBs
    modelData.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Hide large floor planes
        const childBox = new THREE.Box3().setFromObject(child);
        const childSize = childBox.getSize(new THREE.Vector3());
        if (childSize.y < 0.1 && childSize.x > 5 && childSize.z > 5) {
          child.visible = false;
        }
      }
    });

    // Reset position and apply a much larger base scale to ensure it is clearly visible
    modelData.position.set(0, 0, 0);
    modelData.scale.setScalar(1.2);
    
  }, [modelData]);



  // Cache reduced motion to avoid expensive calls every frame
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Mouse interactivity & Animation updates
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);

    if (!group.current || !wrapperRef.current || !modelData) return;

    // 1. Interpolate wrapper to target position/rotation/scale
    const targetPos = globalRobotController.targetPosition;
    const targetRot = globalRobotController.targetRotation;
    const targetScale = globalRobotController.targetScale;

    const lerpSpeed = prefersReducedMotion ? 1 : 0.05; // Instant if reduced motion

    wrapperRef.current.position.lerp(targetPos, lerpSpeed);

    // Lerp rotation smoothly
    wrapperRef.current.rotation.x = THREE.MathUtils.lerp(wrapperRef.current.rotation.x, targetRot.x, lerpSpeed);
    wrapperRef.current.rotation.y = THREE.MathUtils.lerp(wrapperRef.current.rotation.y, targetRot.y, lerpSpeed);
    wrapperRef.current.rotation.z = THREE.MathUtils.lerp(wrapperRef.current.rotation.z, targetRot.z, lerpSpeed);

    // Lerp scale smoothly
    const currentScale = wrapperRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpSpeed);
    wrapperRef.current.scale.setScalar(nextScale);

    if (prefersReducedMotion) return;

    // 2. Smooth floating on the inner group
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t / 1.5) / 10;

    // 3. Fast Face/Head Tracking ONLY in Hero Section
    if (globalRobotController.activeSectionId === 'hero') {
      const mouseX = globalRobotController.mouseTarget.x;
      const mouseY = globalRobotController.mouseTarget.y;

      const targetLookX = (mouseX * Math.PI) / 4; // Wide range
      const targetLookY = (mouseY * Math.PI) / 6;

      // If we found a specific head bone/mesh, rotate that incredibly fast
      if (headBone) {
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targetLookX, 0.2); // 0.2 is very fast and snappy
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -targetLookY, 0.2);

        // Ensure body remains still (reset subtle movements)
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.1);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
      } else {
        // Fallback: rotate whole body fast if no head found
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetLookX, 0.2);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetLookY, 0.2);
      }
    } else {
      // Not in hero: gracefully return head to center
      if (headBone) {
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, 0, 0.1);
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, 0, 0.1);
      }

      // Subtle body movement for other sections based on mouse
      const mouseX = globalRobotController.mouseTarget.x;
      const mouseY = globalRobotController.mouseTarget.y;
      const targetLookX = (mouseX * Math.PI) / 25;
      const targetLookY = (mouseY * Math.PI) / 25;

      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetLookX, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetLookY, 0.05);
    }
  });

  if (!modelData) return null;

  return (
    <group ref={wrapperRef}>
      <group ref={group} dispose={null}>
        <primitive object={modelData} />
      </group>
    </group>
  );
}
