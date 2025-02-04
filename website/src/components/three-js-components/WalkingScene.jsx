import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

/**
 * Main parent component rendering the Canvas
 */
export default function WalkingScene() {
  return (
    <Canvas style={{ width: "100%", height: "100vh" }}>
      <SceneContents />
    </Canvas>
  );
}

/**
 * Holds lights, camera logic, and the walking man
 */
function SceneContents() {
  const { camera } = useThree();
  const topPosition = new THREE.Vector3(0, 10, 10); // Starting camera position
  const frontPosition = new THREE.Vector3(0, 2, 5); // Ending camera position

  useEffect(() => {
    // Set initial camera position & orientation (top-down)
    camera.position.copy(topPosition);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Use a ref to track the timeline to avoid multiple inits
  const tlRef = useRef(null);

  useEffect(() => {
    if (!tlRef.current) {
      // Create a custom object to store the animation time [0..1]
      const animState = { clipTime: 0 };

      // GSAP timeline for scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container", // The main scrolling wrapper
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 1. Animate the camera from top view -> front view
      tl.to(camera.position, {
        x: frontPosition.x,
        y: frontPosition.y,
        z: frontPosition.z,
        onUpdate: () => {
          // Keep the camera looking at the model (origin) during motion
          camera.lookAt(0, 0, 0);
        },
      });

      // 2. Animate the clip time from 0 -> 1
      tl.to(
        animState,
        {
          clipTime: 1,
          onUpdate: () => {
            // We'll update the character's mixer time in <WalkingMan />
            // by reading animState.clipTime. We'll store it somewhere global or pass it via a ref.
          },
        },
        0 // Start at the same time as camera animation
      );

      tlRef.current = { tl, animState };
    }
  }, [camera]);

  return (
    <>
      {/* OrbitControls can help debug camera, remove in production */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 10, 5]} />
      <WalkingMan animRef={tlRef} />
    </>
  );
}

/**
 * Loads the walking man model and drives its animation time
 */
function WalkingMan({ animRef }) {
  const { scene, animations } = useGLTF("/models/walking_man.glb");
  const mixerRef = useRef(null);

  // Set up the animation mixer and action
  useEffect(() => {
    if (!animations || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(scene);
    const clip = animations[0];
    const action = mixer.clipAction(clip);
    action.play();

    mixerRef.current = { mixer, clipDuration: clip.duration };

    return () => {
      mixer.stopAllAction();
    };
  }, [scene, animations]);

  // Each frame, update the mixer time based on animRef.current.animState.clipTime
  useFrame((_, delta) => {
    if (!mixerRef.current || !animRef.current) return;

    const { mixer, clipDuration } = mixerRef.current;
    const { animState } = animRef.current;

    // animState.clipTime goes from 0..1
    // So to move the animation forward/backward, set the mixer time accordingly
    const desiredTime = animState.clipTime * clipDuration;

    // We'll read the current time so we can figure out if we should go forward or backward
    const currentTime = mixer.time;
    const timeDelta = desiredTime - currentTime;

    // Advance or rewind the animation according to the difference
    // This ensures we can handle reversing if user scrolls up
    mixer.update((timeDelta * delta) / (Math.abs(timeDelta) || 1));

    // Alternatively, if you want a direct "snap to time" approach:
    // mixer.setTime(desiredTime);
  });

  return <primitive object={scene} scale={1} />;
}