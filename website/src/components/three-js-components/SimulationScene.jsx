import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./SimulationScene.css";

// --------------------- Car Component ---------------------
function Car({ velocityRef }) {
  const gltf = useGLTF("/models/mclaren-f1/scene.gltf");

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_31") {
        child.visible = false;
      }
    });
  }, [gltf]);

  useFrame(() => {
    const wheelRotationSpeed = velocityRef.current * 10;
    if (gltf.nodes.WheelFL) gltf.nodes.WheelFL.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelFR) gltf.nodes.WheelFR.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelRL) gltf.nodes.WheelRL.rotation.x += wheelRotationSpeed;
    if (gltf.nodes.WheelRR) gltf.nodes.WheelRR.rotation.x += wheelRotationSpeed;
  });

  // Increase scale so the car appears larger.
  return (
    <group scale={[2, 2, 2]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// --------------------- CircuitTrack Component ---------------------
// A longer, more intricate track shape defined by custom outer and inner boundaries.
function CircuitTrack() {
  // Outer boundary points (clockwise)
  const outerPoints = [
    new THREE.Vector2(-150, -100),
    new THREE.Vector2(150, -100),
    new THREE.Vector2(200, -50),
    new THREE.Vector2(220, 0),
    new THREE.Vector2(200, 50),
    new THREE.Vector2(150, 100),
    new THREE.Vector2(-150, 100),
    new THREE.Vector2(-200, 50),
    new THREE.Vector2(-220, 0),
    new THREE.Vector2(-200, -50)
  ];

  // Inner boundary points (counter-clockwise)
  const innerPoints = [
    new THREE.Vector2(-130, -80),
    new THREE.Vector2(130, -80),
    new THREE.Vector2(170, -40),
    new THREE.Vector2(190, 0),
    new THREE.Vector2(170, 40),
    new THREE.Vector2(130, 80),
    new THREE.Vector2(-130, 80),
    new THREE.Vector2(-170, 40),
    new THREE.Vector2(-190, 0),
    new THREE.Vector2(-170, -40)
  ];

  const trackShape = new THREE.Shape(outerPoints);
  trackShape.holes.push(new THREE.Path(innerPoints));

  // Reduce depth and add bevel for smoother edges
  const extrudeSettings = { 
    depth: 0.1, // Reduced from 1 to 0.1
    bevelEnabled: false
  };
  const geometry = new THREE.ExtrudeGeometry(trackShape, extrudeSettings);

  // Rotate so that the track lies on the XZ-plane.
  return (
    <mesh 
      geometry={geometry} 
      rotation-x={-Math.PI / 2} 
      position={[0, 0, 0]} // Changed from 0.01 to 0
      receiveShadow
    >
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

// --------------------- FollowCamera Component ---------------------
function FollowCamera({ carRef }) {
  const { camera } = useThree();
  useFrame(() => {
    if (carRef.current) {
      const carPos = carRef.current.position;
      const carRot = carRef.current.rotation.y;
      const offsetDistance = 10;
      const offsetHeight = 4;
      const offsetX = -Math.sin(carRot) * offsetDistance;
      const offsetZ = -Math.cos(carRot) * offsetDistance;
      const desiredPos = new THREE.Vector3(carPos.x + offsetX, carPos.y + offsetHeight, carPos.z + offsetZ);
      camera.position.lerp(desiredPos, 0.1);
      camera.lookAt(carPos);
    }
  });
  return null;
}

// Update the PressurePlate component
function PressurePlate({ position, isPressed }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[8, isPressed ? 0.1 : 0.2, 8]} /> {/* Squish height when pressed */}
      <meshStandardMaterial 
        color={isPressed ? "#ff6666" : "#ff0000"} 
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// --------------------- Scene Component ---------------------
// Handles car movement, physics, and interactive pressure plate.
function Scene({ setShowJourneyBox, carRef }) {
  const plateRefs = useRef([]);
  const keysPressed = useRef({});
  const velocityRef = useRef(0);
  const carAngle = useRef(0);
  const [pressedPlates, setPressedPlates] = useState([]);
  
  // Update plate positions to follow the track
  const plateData = [
    { 
      position: [0, 0.1, -90], // Start of track (bottom)
      message: "Early Years: Starting my journey in technology..." 
    },
    { 
      position: [180, 0.1, 0], // Right side of track
      message: "University Years: Developing my entrepreneurial mindset..." 
    },
    { 
      position: [0, 0.1, 90], // Top of track
      message: "Career Start: Building my first business..." 
    },
    { 
      position: [-180, 0.1, 0], // Left side of track
      message: "Future Goals: Expanding into new markets..." 
    }
  ];

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
    if (carRef.current) {
      // Slower car physics.
      const acceleration = 0.005;
      const maxSpeed = 0.5;
      const reverseMaxSpeed = -0.25;
      const turnSpeed = 0.03;
      const friction = 0.98;

      if (keysPressed.current["w"]) {
        velocityRef.current += acceleration;
        if (velocityRef.current > maxSpeed) velocityRef.current = maxSpeed;
      }
      if (keysPressed.current["s"]) {
        velocityRef.current -= acceleration;
        if (velocityRef.current < reverseMaxSpeed) velocityRef.current = reverseMaxSpeed;
      }
      if (!keysPressed.current["w"] && !keysPressed.current["s"]) {
        velocityRef.current *= friction;
      }

      if (Math.abs(velocityRef.current) > 0.001) {
        if (keysPressed.current["a"]) {
          carAngle.current += turnSpeed * (velocityRef.current / maxSpeed);
        }
        if (keysPressed.current["d"]) {
          carAngle.current -= turnSpeed * (velocityRef.current / maxSpeed);
        }
      }

      const dx = Math.sin(carAngle.current) * velocityRef.current;
      const dz = Math.cos(carAngle.current) * velocityRef.current;
      carRef.current.position.x += dx;
      carRef.current.position.z += dz;
      carRef.current.rotation.y = carAngle.current;

      let isAnyPlatePressed = false;

      // Simplified collision detection
      const carPosition = carRef.current.position;
      plateData.forEach((plate, index) => {
        const distance = new THREE.Vector3(
          plate.position[0],
          plate.position[1],
          plate.position[2]
        ).distanceTo(carPosition);

        // If car is within 6 units of plate center
        if (distance < 6) {
          isAnyPlatePressed = true;
          if (!pressedPlates.includes(index)) {
            console.log(`Triggered plate ${index + 1}:`, plate.message);
            setPressedPlates(prev => [...prev, index]);
            setShowJourneyBox({
              show: true,
              message: plate.message,
              index: index
            });
          }
        } else {
          setPressedPlates(prev => prev.filter(i => i !== index));
        }
      });

      // Close journey box if no plates are being pressed
      if (!isAnyPlatePressed) {
        setShowJourneyBox(prev => ({ ...prev, show: false }));
      }
    }
  });

  return (
    <>
      <group ref={carRef} position={[0, 0.5, 0]}> {/* Lowered car initial position */}
        <Car velocityRef={velocityRef} /> {/* Remove isPressing prop */}
      </group>
      
      {plateData.map((plate, index) => (
        <PressurePlate
          key={index}
          position={plate.position}
          isPressed={pressedPlates.includes(index)}
        />
      ))}
    </>
  );
}

// --------------------- SimulationScene (Main) ---------------------
function SimulationScene() {
  const [journeyBox, setJourneyBox] = useState({ show: false, message: "", index: null });
  const carRef = useRef();

  return (
    <div className="simulation-container">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[50, 150, 50]} intensity={1} />
        <pointLight position={[0, 50, 0]} intensity={1.5} distance={200} decay={2} />
        <spotLight castShadow position={[0, 150, 50]} angle={0.3} intensity={1} />

        {/* Ground Plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="green" />
        </mesh>

        {/* Circuit Track */}
        <CircuitTrack />

        <Suspense fallback={null}>
          <Scene setShowJourneyBox={setJourneyBox} carRef={carRef} />
        </Suspense>
        <FollowCamera carRef={carRef} />
      </Canvas>
      
      {journeyBox.show && (
        <div className="journey-box">
          <h2>Journey Milestone {journeyBox.index + 1}</h2>
          <p>{journeyBox.message}</p>
          <button onClick={() => setJourneyBox({ show: false, message: "", index: null })}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default SimulationScene;