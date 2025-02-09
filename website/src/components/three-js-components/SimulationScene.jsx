import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./SimulationScene.css";

// Car component loads the 3D model and rotates the wheels based on the current velocity.
function Car({ velocityRef, isPressing }) {
  const gltf = useGLTF("/models/mclaren-f1/scene.gltf");
    


  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_31") {
        child.visible = false; // Hide the problematic mesh
        console.log("Hiding Object_31 (black floor)");
      }
    });
  }, [gltf]);

  useFrame(() => {
    const wheelRotationSpeed = velocityRef.current * 10;
    // Update the wheels' rotation (ensure these node names match your model)
    if (gltf.nodes.WheelFL) gltf.nodes.WheelFL.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelFR) gltf.nodes.WheelFR.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelRL) gltf.nodes.WheelRL.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelRR) gltf.nodes.WheelRR.rotation.x += wheelRotationSpeed;
  });

  return (
    <group scale={[1, isPressing ? 0.9 : 1, 1]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Scene component handles the car movement, physics and collision detection with the pressure plate.
function Scene({ setShowJourneyBox }) {
  const carRef = useRef();
  const plateRef = useRef();
  const keysPressed = useRef({});
  const velocityRef = useRef(0);
  const carAngle = useRef(0);
  const [isPressing, setIsPressing] = useState(false);

  // Listen for WASD key presses.
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (carRef.current && plateRef.current) {
      // Physics parameters
      const acceleration = 0.005;
      const maxSpeed = 0.2;
      const reverseMaxSpeed = -0.1;
      const turnSpeed = 0.03;
      const friction = 0.98;

      // Accelerate / Brake using W/S.
      if (keysPressed.current["w"]) {
        velocityRef.current += acceleration;
        if (velocityRef.current > maxSpeed) velocityRef.current = maxSpeed;
      }
      if (keysPressed.current["s"]) {
        velocityRef.current -= acceleration;
        if (velocityRef.current < reverseMaxSpeed) {
          velocityRef.current = reverseMaxSpeed;
        }
      }
      if (!keysPressed.current["w"] && !keysPressed.current["s"]) {
        velocityRef.current *= friction;
      }

      // Steering using A/D.
      if (Math.abs(velocityRef.current) > 0.001) {
        if (keysPressed.current["a"]) {
          carAngle.current += turnSpeed * (velocityRef.current / maxSpeed);
        }
        if (keysPressed.current["d"]) {
          carAngle.current -= turnSpeed * (velocityRef.current / maxSpeed);
        }
      }

      // Update car position based on velocity and angle.
      const dx = Math.sin(carAngle.current) * velocityRef.current;
      const dz = Math.cos(carAngle.current) * velocityRef.current;
      carRef.current.position.x += dx;
      carRef.current.position.z += dz;
      carRef.current.rotation.y = carAngle.current;

      // Collision detection with the pressure plate.
      const carBox = new THREE.Box3().setFromObject(carRef.current);
      const plateBox = new THREE.Box3().setFromObject(plateRef.current);
      if (carBox.intersectsBox(plateBox)) {
        setShowJourneyBox(true);
        setIsPressing(true);
      } else {
        setIsPressing(false);
      }
    }
  });

  return (
    <>
      {/* Car Model */}
      <group ref={carRef} position={[0, 0.5, 0]}>
        <Car velocityRef={velocityRef} isPressing={isPressing} />
      </group>
      {/* Pressure Plate */}
      <mesh ref={plateRef} position={[5, 0.05, 5]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial colour="green" />
      </mesh>
    </>
  );
}

// SimulationScene sets up the Canvas and overlays the journey box.
function SimulationScene() {
  const [showJourneyBox, setShowJourneyBox] = useState(false);


  return (
    <div className="simulation-container">
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[10, 10, 10]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={1.5} distance={10} decay={2} />
        <spotLight castShadow position={[0, 15, 10]} angle={0.3} intensity={1} />
        {/* Ground Plane */}
        <mesh receiveShadow>
          <boxGeometry args={[10, 0.1, 10]} />
          <meshStandardMaterial colour="grey" />
        </mesh>
        {/* Wrap Scene in Suspense in case the model is still loading */}
        <Suspense fallback={null}>
          <Scene setShowJourneyBox={setShowJourneyBox} />
        </Suspense>
      </Canvas>
      {showJourneyBox && (
        <div className="journey-box">
          <h2>My Journey So Far</h2>
          <p>Details about my journey...</p>
          <button onClick={() => setShowJourneyBox(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default SimulationScene;