import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const SolarSystemSimulation = () => {
  const mountRef = useRef(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const isPausedRef = useRef(false);
  const requestRef = useRef();
  const planetsRef = useRef([]);

  useEffect(() => {
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // --- Lights ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Create a point light for the Sun.
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    // Add sunLight to the scene now; it will be re-parented when the Sun loads.
    scene.add(sunLight);

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
          }
        });
        // Create a pivot group for the Sun.
        const sunPivot = new THREE.Group();
        sunPivot.add(sunModel);
        // Ensure the pivot is at the origin.
        sunPivot.position.set(0, 0, 0);
        // Attach the sun light to the Sun pivot.
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
      { name: "Mercury", distance: 12, scale: 1, orbitSpeed: 0.015, selfRotationSpeed: 0.02, message: "Work on orbital mechanics" },
      { name: "Venus", distance: 16, scale: 1, orbitSpeed: 0.012, selfRotationSpeed: 0.017, message: "Develop new shader techniques" },
      { name: "Earth", distance: 20, scale: 1, orbitSpeed: 0.010, selfRotationSpeed: 0.015, message: "Improve simulation realism" },
      { name: "Mars", distance: 24, scale: 1, orbitSpeed: 0.008, selfRotationSpeed: 0.012, message: "Research atmospheric effects" },
      { name: "Jupiter", distance: 30, scale: 1, orbitSpeed: 0.005, selfRotationSpeed: 0.007, message: "Study gas giant dynamics" },
      { name: "Saturn", distance: 38, scale: 0.01, orbitSpeed: 0.004, selfRotationSpeed: 0.006, message: "Explore ring formation" },
      { name: "Uranus", distance: 44, scale: 1, orbitSpeed: 0.003, selfRotationSpeed: 0.005, message: "Investigate ice giant properties" },
      { name: "Neptune", distance: 50, scale: 1, orbitSpeed: 0.002, selfRotationSpeed: 0.004, message: "Deep dive into outer planets" },
    ];

    // Create orbit lines and load planet models.
    planetData.forEach((data) => {
      // Create orbit line (circle in XZ plane).
      const segments = 64;
      const orbitPoints = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(theta) * data.distance, 0, Math.sin(theta) * data.distance));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true });
      const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
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
              if (data.name !== "Saturn") {
                child.geometry.center();
              }
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          // Mark the model for raycasting.
          model.userData.planet = data.name;
          // Create an orbit pivot for the planet.
          // Set the model's local position to (0,0,0) so that its pivot is at its center.
          model.position.set(0, 0, 0);
          const orbitGroup = new THREE.Group();
          orbitGroup.add(model);
          // Position the orbit group at the orbit radius along the x-axis.
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

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      // Only update rotations if there are planet meshes loaded.
      if (planetsRef.current.length > 0) {
        planetsRef.current.forEach((item) => {
          if (!isPausedRef.current) {
            item.orbit.rotation.y += item.data.orbitSpeed;
            item.model.rotation.y += item.data.selfRotationSpeed;
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
      if (planetMeshes.length > 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetMeshes, true);
        if (intersects.length > 0) {
          isPausedRef.current = true;
          setHoveredPlanet({ name: intersects[0].object.userData.planet });
        } else {
          isPausedRef.current = false;
          setHoveredPlanet(null);
        }
      } else {
        // If no planets are loaded yet, ensure simulation is not paused.
        isPausedRef.current = false;
        setHoveredPlanet(null);
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }} ref={mountRef}>
      {hoveredPlanet && <div className="hover-overlay">{hoveredPlanet.name}</div>}
    </div>
  );
};

export default SolarSystemSimulation;