import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { locationxyz } from './functions.js';

let camera, controls, scene, renderer, model, pointerDiv;
let floatOffset = 0; // Offset for floating animation

init();

function init() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd6e3ff);
  scene.fog = new THREE.FogExp2(0xd6e3ff, 0.001);

  // Create the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  // Create the camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-500, 900, 900);

  // Add OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 350;
  controls.maxPolarAngle = Math.PI / 2;

  // Load the 3D model
  const loader = new GLTFLoader();
  loader.load(
    './public/Capitol.glb',
    (gltf) => {
      model = gltf.scene;
      model.position.set(40, -20, 20);

      model.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(new THREE.Color('rgb(245, 247, 255)'));
        }
      });

      scene.add(model);

      // Add the pointer div once the model is loaded
      addPointerDiv();
    },
    undefined,
    (error) => console.error('An error occurred while loading the model:', error)
  );

  // Add lighting
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

function addPointerDiv() {
  // Create a div element for the pointer
  pointerDiv = document.createElement('div');
  pointerDiv.style.position = 'absolute';
  pointerDiv.style.width = '20px';
  pointerDiv.style.height = '20px';
  pointerDiv.style.backgroundColor = 'red';
  pointerDiv.style.borderRadius = '50%'; // Make it circular
  pointerDiv.style.pointerEvents = 'none'; // Allow interaction with the scene below
  pointerDiv.style.opacity = '0.8'; // Slight transparency
  pointerDiv.style.transform = 'translate(-50%, -50%)'; // Center the div on its position
  document.body.appendChild(pointerDiv);
}

function updatePointerPosition() {
  if (!pointerDiv || !locationxyz || !model) return;

  try {
    // Parse the locationxyz string into coordinates
    const [x, y, z] = locationxyz.split(',').map(Number);

    // Add floating effect using a sine wave
    floatOffset += 0.03; // Increment the offset for the floating effect
    const floatY = y + Math.sin(floatOffset) * 5; // Oscillate within 5 units on the Y-axis

    // Calculate the pointer's world position
    const pointerWorldPosition = new THREE.Vector3(x, floatY, z);

    // Project the pointer's world position to screen space
    const screenPosition = pointerWorldPosition.project(camera);

    // Convert normalized device coordinates (NDC) to screen coordinates
    const screenX = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = -(screenPosition.y * 0.5 - 0.5) * window.innerHeight;

    // Update the pointerDiv position
    pointerDiv.style.left = `${screenX}px`;
    pointerDiv.style.top = `${screenY}px`;
    pointerDiv.style.opacity = '1'; // Ensure it's visible
  } catch (error) {
    console.error('Error parsing locationxyz:', error);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  controls.update(); // Update controls for damping or auto-rotation
  if (model) {
    updatePointerPosition(); // Keep the pointer updated
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}
