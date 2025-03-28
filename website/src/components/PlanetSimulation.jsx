import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './NextSteps.css';
import './PlanetSimulation.css';

const SELECTED_SCALE = 3;
const SELECTED_Y_POSITION = 20;
const ANIMATION_DURATION = 500; // milliseconds

const SolarSystemSimulation = () => {
  const mountRef = useRef(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const isPausedRef = useRef(false);
  const requestRef = useRef();
  const planetsRef = useRef([]);
  const [planetNotes, setPlanetNotes] = useState({});
  const originalScalesRef = useRef({});
  const controlsRef = useRef(null);
  const animationFramesRef = useRef([]); // Add this line to track animation frames

  // Add this function to track and cleanup animation frames
  const trackAnimationFrame = (frameId) => {
    animationFramesRef.current.push(frameId);
    return frameId;
  };

  useEffect(() => {
    // Reset animation frames array when component mounts
    animationFramesRef.current = [];
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    // Starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(400);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(400);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(400);
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 40, 70);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      shadowMap: {
        enabled: true,
        type: THREE.PCFSoftShadowMap // Add soft shadow mapping
      }
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // --- Lights ---
    // Reduce ambient light further to make sun's light more prominent
    const ambient = new THREE.AmbientLight(0xffffff, 0.05); // Reduced from 0.1 to 0.05
    scene.add(ambient);

    // Enhanced sun light with stronger intensity
    const sunLight = new THREE.PointLight(0xffffff, 5, 1000); // Increased intensity from 3 to 5, distance from 500 to 1000
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.normalBias = 0.02; // Add normal bias to prevent shadow acne
    // Add decay to make light more realistic
    sunLight.decay = 1;
    // Add intensity to make center brighter
    sunLight.power = 1000;
    scene.add(sunLight);

    // Add a secondary sun glow light
    const sunGlow = new THREE.PointLight(0xffa500, 2, 200); // Orange-tinted secondary light
    sunGlow.position.set(0, 0, 0);
    scene.add(sunGlow);

    // Add after the sunLight setup
    const sunIllumination = new THREE.SpotLight(0xffffff, 1);
    sunIllumination.position.set(0, 50, 50);
    sunIllumination.angle = Math.PI / 4;
    sunIllumination.penumbra = 0.5;
    sunIllumination.decay = 0;
    sunIllumination.target.position.set(0, 0, 0);
    scene.add(sunIllumination);
    scene.add(sunIllumination.target);

    // --- glTF URLs ---
    const gltfUrls = {
      Sun: "./models/the_sun/scene.gltf",
      Mercury: "./models/mercury/scene.gltf",
      Venus: "./models/venus/scene.gltf",
      Earth: "./models/earth/scene.gltf",
      Mars: "./models/mars/scene.gltf",
      Jupiter: "./models/jupiter/scene.gltf",
      Saturn: "./models/saturn/scene.gltf",
      Uranus: "./models/uranus/scene.gltf",
      Neptune: "./models/neptune/scene.gltf",
    };

    const loader = new GLTFLoader();

    // --- Load Sun and Center It ---
    loader.load(
      gltfUrls.Sun,
      (gltf) => {
        const sunModel = gltf.scene;
        sunModel.scale.set(6, 6, 6);
        // Center each mesh's geometry.
        sunModel.traverse((child) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.center();
            // Make the sun receive light better
            if (child.material) {
              child.material.metalness = 0.3;
              child.material.roughness = 0.5;
            }
          }
        });
        // Rest of the sun setup remains the same
        const sunPivot = new THREE.Group();
        sunPivot.add(sunModel);
        sunPivot.position.set(0, 0, 0);
        sunPivot.add(sunLight);
        sunLight.position.set(0, 0, 0);
        scene.add(sunPivot);
      },
      undefined,
      (error) => {
        console.error("Error loading Sun model:", error);
      }
    );

    // --- Planet Data & Orbit Lines ---
    // Note: Saturn's scale is 0.01 as requested.
    const planetData = [
      { name: "Mercury", distance: 12, scale: 1, orbitSpeed: 0.5, selfRotationSpeed: 0.002, message: "Work on orbital mechanics" },
      { name: "Venus", distance: 16, scale: 1, orbitSpeed: 0.4, selfRotationSpeed: 0.0017, message: "Develop new shader techniques" },
      { name: "Earth", distance: 20, scale: 1, orbitSpeed: 0.3, selfRotationSpeed: 0.0015, message: "Improve simulation realism" },
      { name: "Mars", distance: 24, scale: 1, orbitSpeed: 0.25, selfRotationSpeed: 0.0012, message: "Research atmospheric effects" },
      { name: "Jupiter", distance: 30, scale: 1, orbitSpeed: 0.2, selfRotationSpeed: 0.0007, message: "Study gas giant dynamics" },
      { name: "Neptune", distance: 36, scale: 1, orbitSpeed: 0.05, selfRotationSpeed: 0.0004, message: "Deep dive into outer planets" },
    ];

    // Create orbit lines and load planet models.
    planetData.forEach((data) => {
      // Create orbit line (circle in XZ plane).
      const segments = 128; // Increased segments for smoother circles
      const orbitPoints = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * data.distance;
        const z = Math.sin(theta) * data.distance;
        orbitPoints.push(new THREE.Vector3(x, 0, z));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.2, // Slightly increased opacity
        transparent: true,
        linewidth: 1
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // Load planet model.
      loader.load(
        gltfUrls[data.name],
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(data.scale, data.scale, data.scale);
          // Recenter each mesh's geometry (skip Saturn to preserve rings).
          model.traverse((child) => {
            if (child.isMesh && child.geometry) {
              child.geometry.computeBoundingBox();
              child.geometry.center();
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.planet = data.name; // Add this line
              // Add metalness and roughness for better light interaction
              if (child.material) {
                child.material.metalness = 0.3;
                child.material.roughness = 0.7;
              }
            }
          });
          // Mark the model for raycasting.
          model.userData.planet = data.name;
          // Create an orbit pivot for the planet.
          // Set the model's local position to (0,0,0) so that its pivot is at its center.
          model.position.set(0, 0, 0);
          const orbitGroup = new THREE.Group();
          orbitGroup.add(model);
          // Set initial position
          orbitGroup.position.set(data.distance, 0, 0);
          scene.add(orbitGroup);
          planetsRef.current.push({ model, orbit: orbitGroup, data });
        },
        undefined,
        (error) => {
          console.error(`Error loading ${data.name} model:`, error);
        }
      );
    });

    // --- Raycaster for Hover Detection ---
    // Build a list of planet meshes for raycasting.
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Add OrbitControls
    controlsRef.current = new OrbitControls(camera, renderer.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.25;
    controlsRef.current.enableZoom = true;

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      // Store animation frame ID in ref
      requestRef.current = trackAnimationFrame(requestAnimationFrame(animate));
      const elapsedTime = clock.getElapsedTime();

      if (planetsRef.current.length > 0) {
        planetsRef.current.forEach((item) => {
          if (!isPausedRef.current) {
            // Update the orbital position
            const angle = elapsedTime * item.data.orbitSpeed * Math.PI * 2;
            const x = Math.cos(angle) * item.data.distance;
            const z = Math.sin(angle) * item.data.distance;
            item.orbit.position.set(x, 0, z);
            
            // Apply self-rotation
            item.model.rotation.y = elapsedTime * item.data.selfRotationSpeed;
          }
        });
      }

      // Build list of only planet meshes.
      const planetMeshes = [];
      planetsRef.current.forEach((item) => {
        item.model.traverse((child) => {
          if (child.isMesh) {
            planetMeshes.push(child);
          }
        });
      });
      // Replace the raycasting section in the animate function
      if (planetMeshes.length > 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetMeshes, true);
        if (intersects.length > 0) {
          const planetName = intersects[0].object.userData.planet;
          if (planetName) {
            isPausedRef.current = true;
            setHoveredPlanet({ name: planetName });
          }
        } else {
          isPausedRef.current = false;
          setHoveredPlanet(null);
        }
      } else {
        // If no planets are loaded yet, ensure simulation is not paused.
        isPausedRef.current = false;
        setHoveredPlanet(null);
      }

      controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(requestRef.current);
      
      // Safely remove event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener("mousemove", onMouseMove);
      }
      
      // Safely remove renderer DOM element
      if (mountRef.current && renderer.domElement) {
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      
      // Dispose of controls if they exist
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      // Dispose of geometries, materials, textures
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      // Clear references
      planetsRef.current = [];
    };
  }, []);

  return <div className="simulation-wrapper" ref={mountRef} />;
};

const PlanetSimulation = ({ selectedPlanet }) => {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const isPausedRef = useRef(false);
  const requestRef = useRef();
  const originalScalesRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFramesRef = useRef([]); // Store all animation frame IDs

  // Add this function to track and cleanup animation frames
  const trackAnimationFrame = (frameId) => {
    animationFramesRef.current.push(frameId);
    return frameId;
  };

  useEffect(() => {
    // Reset animation frames array when component mounts
    animationFramesRef.current = [];
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    rendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      shadowMap: {
        enabled: true,
        type: THREE.PCFSoftShadowMap
      }
    });

    // Starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(400);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(400);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(400);
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    sceneRef.current.add(stars);

    cameraRef.current.position.set(0, 40, 70);
    cameraRef.current.lookAt(0, 0, 0);

    rendererRef.current.setSize(width, height);
    rendererRef.current.shadowMap.enabled = true;
    mountRef.current.appendChild(rendererRef.current.domElement);

    // --- Lights ---
    // Reduce ambient light further to make sun's light more prominent
    const ambient = new THREE.AmbientLight(0xffffff, 0.05); // Reduced from 0.1 to 0.05
    sceneRef.current.add(ambient);

    // Enhanced sun light with stronger intensity
    const sunLight = new THREE.PointLight(0xffffff, 5, 1000); // Increased intensity from 3 to 5, distance from 500 to 1000
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.normalBias = 0.02; // Add normal bias to prevent shadow acne
    // Add decay to make light more realistic
    sunLight.decay = 1;
    // Add intensity to make center brighter
    sunLight.power = 1000;
    sceneRef.current.add(sunLight);

    // Add a secondary sun glow light
    const sunGlow = new THREE.PointLight(0xffa500, 2, 200); // Orange-tinted secondary light
    sunGlow.position.set(0, 0, 0);
    sceneRef.current.add(sunGlow);

    // Add after the sunLight setup
    const sunIllumination = new THREE.SpotLight(0xffffff, 1);
    sunIllumination.position.set(0, 50, 50);
    sunIllumination.angle = Math.PI / 4;
    sunIllumination.penumbra = 0.5;
    sunIllumination.decay = 0;
    sunIllumination.target.position.set(0, 0, 0);
    sceneRef.current.add(sunIllumination);
    sceneRef.current.add(sunIllumination.target);

    // --- glTF URLs ---
    const gltfUrls = {
      Sun: "./models/the_sun/scene.gltf",
      Mercury: "./models/mercury/scene.gltf",
      Venus: "./models/venus/scene.gltf",
      Earth: "./models/earth/scene.gltf",
      Mars: "./models/mars/scene.gltf",
      Jupiter: "./models/jupiter/scene.gltf",
      Saturn: "./models/saturn/scene.gltf",
      Uranus: "./models/uranus/scene.gltf",
      Neptune: "./models/neptune/scene.gltf",
    };

    const loader = new GLTFLoader();

    // --- Load Sun and Center It ---
    loader.load(
      gltfUrls.Sun,
      (gltf) => {
        const sunModel = gltf.scene;
        sunModel.scale.set(6, 6, 6);
        // Center each mesh's geometry.
        sunModel.traverse((child) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.center();
            // Make the sun receive light better
            if (child.material) {
              child.material.metalness = 0.3;
              child.material.roughness = 0.5;
            }
          }
        });
        // Rest of the sun setup remains the same
        const sunPivot = new THREE.Group();
        sunPivot.add(sunModel);
        sunPivot.position.set(0, 0, 0);
        sunPivot.add(sunLight);
        sunLight.position.set(0, 0, 0);
        sceneRef.current.add(sunPivot);
      },
      undefined,
      (error) => {
        console.error("Error loading Sun model:", error);
      }
    );

    // --- Planet Data & Orbit Lines ---
    // Note: Saturn's scale is 0.01 as requested.
    const planetData = [
      { name: "Mercury", distance: 12, scale: 1, orbitSpeed: 0.5, selfRotationSpeed: 0.002, message: "Work on orbital mechanics" },
      { name: "Venus", distance: 16, scale: 1, orbitSpeed: 0.4, selfRotationSpeed: 0.0017, message: "Develop new shader techniques" },
      { name: "Earth", distance: 20, scale: 1, orbitSpeed: 0.3, selfRotationSpeed: 0.0015, message: "Improve simulation realism" },
      { name: "Mars", distance: 24, scale: 1, orbitSpeed: 0.25, selfRotationSpeed: 0.0012, message: "Research atmospheric effects" },
      { name: "Jupiter", distance: 30, scale: 1, orbitSpeed: 0.2, selfRotationSpeed: 0.0007, message: "Study gas giant dynamics" },
      { name: "Neptune", distance: 36, scale: 1, orbitSpeed: 0.05, selfRotationSpeed: 0.0004, message: "Deep dive into outer planets" },
    ];

    // Create orbit lines and load planet models.
    planetData.forEach((data) => {
      // Create orbit line (circle in XZ plane).
      const segments = 128; // Increased segments for smoother circles
      const orbitPoints = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * data.distance;
        const z = Math.sin(theta) * data.distance;
        orbitPoints.push(new THREE.Vector3(x, 0, z));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.2, // Slightly increased opacity
        transparent: true,
        linewidth: 1
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      sceneRef.current.add(orbitLine);

      // Load planet model.
      loader.load(
        gltfUrls[data.name],
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(data.scale, data.scale, data.scale);
          // Recenter each mesh's geometry (skip Saturn to preserve rings).
          model.traverse((child) => {
            if (child.isMesh && child.geometry) {
              child.geometry.computeBoundingBox();
              child.geometry.center();
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.planet = data.name; // Add this line
              // Add metalness and roughness for better light interaction
              if (child.material) {
                child.material.metalness = 0.3;
                child.material.roughness = 0.7;
              }
            }
          });
          // Mark the model for raycasting.
          model.userData.planet = data.name;
          // Create an orbit pivot for the planet.
          // Set the model's local position to (0,0,0) so that its pivot is at its center.
          model.position.set(0, 0, 0);
          const orbitGroup = new THREE.Group();
          orbitGroup.add(model);
          // Set initial position
          orbitGroup.position.set(data.distance, 0, 0);
          sceneRef.current.add(orbitGroup);
          planetsRef.current.push({ model, orbit: orbitGroup, data });
        },
        undefined,
        (error) => {
          console.error(`Error loading ${data.name} model:`, error);
        }
      );
    });

    // Add OrbitControls
    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.25;
    controlsRef.current.enableZoom = true;

    // --- Animation Loop ---
    const animate = () => {
      // Store animation frame ID in ref
      requestRef.current = trackAnimationFrame(requestAnimationFrame(animate));
      const elapsedTime = clockRef.current.getElapsedTime();

      if (planetsRef.current.length > 0) {
        planetsRef.current.forEach((item) => {
          if (!isPausedRef.current) {
            const angle = elapsedTime * item.data.orbitSpeed * Math.PI * 2;
            const x = Math.cos(angle) * item.data.distance;
            const z = Math.sin(angle) * item.data.distance;
            item.orbit.position.set(x, 0, z);
            item.model.rotation.y = elapsedTime * item.data.selfRotationSpeed;
          }
        });
      }

      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Update the cleanup function
    return () => {
      // Cancel any ongoing animation frames
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Cancel all tracked animation frames
      animationFramesRef.current.forEach(frameId => {
        cancelAnimationFrame(frameId);
      });
      
      // Clean up Three.js resources
      if (rendererRef.current && mountRef.current) {
        // Safe check to ensure the renderer.domElement still exists in the DOM
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      
      // Dispose of geometries, materials, textures
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      // Clear references
      planetsRef.current = [];
      originalScalesRef.current = {};
      
      // Dispose of controls if they exist
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  // Handle selected planet scaling
  useEffect(() => {
    if (selectedPlanet && planetsRef.current) {
      isPausedRef.current = true;
      planetsRef.current.forEach((planet) => {
        if (planet.data.name === selectedPlanet) {
          if (!originalScalesRef.current[planet.data.name]) {
            originalScalesRef.current[planet.data.name] = {
              scale: planet.model.scale.x,
              y: planet.orbit.position.y
            };
          }
          
          // Animate the selected planet
          const startScale = planet.model.scale.x;
          const startY = planet.orbit.position.y;
          const startTime = Date.now();

          const animateTransform = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            
            // Smooth easing function
            const eased = progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;

            // Interpolate scale and position
            const currentScale = startScale + (originalScalesRef.current[planet.data.name].scale * SELECTED_SCALE - startScale) * eased;
            const currentY = startY + (SELECTED_Y_POSITION - startY) * eased;

            planet.model.scale.set(currentScale, currentScale, currentScale);
            planet.orbit.position.y = currentY;

            if (progress < 1) {
              trackAnimationFrame(requestAnimationFrame(animateTransform));
            }
          };

          animateTransform();
          
          // Update the render order to appear above other planets
          planet.model.traverse(child => {
            if (child.isMesh) {
              child.renderOrder = 1;
            }
          });
        } else {
          // Animate other planets back to original position
          const startScale = planet.model.scale.x;
          const startY = planet.orbit.position.y;
          const startTime = Date.now();
          const originalScale = originalScalesRef.current[planet.data.name]?.scale || startScale;

          const animateBack = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            
            const eased = progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;

            const currentScale = startScale + (originalScale - startScale) * eased;
            const currentY = startY + (0 - startY) * eased;

            planet.model.scale.set(currentScale, currentScale, currentScale);
            planet.orbit.position.y = currentY;

            if (progress < 1) {
              trackAnimationFrame(requestAnimationFrame(animateBack));
            }
          };

          animateBack();
          
          // Reset render order
          planet.model.traverse(child => {
            if (child.isMesh) {
              child.renderOrder = 0;
            }
          });
        }
      });
    } else {
      // Reset all planets when nothing is selected
      isPausedRef.current = false;
      planetsRef.current?.forEach((planet) => {
        const startScale = planet.model.scale.x;
        const startY = planet.orbit.position.y;
        const startTime = Date.now();
        const originalScale = originalScalesRef.current[planet.data.name]?.scale || startScale;

        const animateReset = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
          
          const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

          const currentScale = startScale + (originalScale - startScale) * eased;
          const currentY = startY + (0 - startY) * eased;

          planet.model.scale.set(currentScale, currentScale, currentScale);
          planet.orbit.position.y = currentY;

          if (progress < 1) {
            trackAnimationFrame(requestAnimationFrame(animateReset));
          }
        };

        animateReset();
        
        planet.model.traverse(child => {
          if (child.isMesh) {
            child.renderOrder = 0;
          }
        });
      });
    }
  }, [selectedPlanet]);

  return <div className="simulation-wrapper" ref={mountRef} />;
};

export default PlanetSimulation;