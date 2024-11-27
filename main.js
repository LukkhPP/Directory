import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { locationxyz } from './functions.js';
import { samename } from './functions.js';

let camera, controls, scene, renderer, model, Pinloc;
let previouspos = new THREE.Vector3();

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd6e3ff);
  scene.fog = new THREE.FogExp2(0xd6e3ff, 0.001);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-500, 900, 900);
  
  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 350;
  controls.maxPolarAngle = Math.PI / 2;

  // Loader of Model
  const loader = new GLTFLoader();
  loader.load(
    './public/Capitol.glb',
    function (gltf) {
      model = gltf.scene;

      model.position.set(40, -20, 20);

      // Traverse the model and change the material color
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(new THREE.Color("rgb(245, 247, 255)"));
        }
      });

      scene.add(model);
      render(); // Start rendering once model is loaded
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('An error happened', error);
    }
  );

  // Lighting
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  controls.update(); // Required for damping or auto-rotation

  if (model) {
    updateTextPosition();
  }

  render();
}

function updateTextPosition() {

  Pinloc = document.getElementById('picto_loc');

  Pinloc.style.zIndex = -4;

  if (!model || !locationxyz) return; // Ensure both model and locationxyz are available

  let offsets = [];
  const modelWorldPosition = new THREE.Vector3();
  model.getWorldPosition(modelWorldPosition);
  

  try {

    // Parse locationxyz into a vector
    const [x, y, z] = locationxyz.split(',').map(Number); // Convert string to numbers
    let dynamicOffset;

    Pinloc.style.zIndex = 1;
    
    
       // Create THREE.js vector

       dynamicOffset = new THREE.Vector3(x, y, z);
  

    offsets = [
      { divId: 'picto_loc', offset: dynamicOffset },
    ];
  
  
  } catch (error) {
    console.error('Error parsing locationxyz:', error);
    return; // Exit if locationxyz is invalid
  }

  const zoomFactor = camera.zoom || 1; // Use zoom factor to adjust label position
  
  // Update positions for all offsets
  offsets.forEach(({ divId, offset }) => {
    const labelWorldPosition = modelWorldPosition.clone().add(offset); // Calculate position

    // Project position from world space to 2D screen space
    const projectedPosition = labelWorldPosition.project(camera);

    // Convert NDC (-1 to 1) to screen coordinates
    const x = (projectedPosition.x * 0.5 + 0.5) * window.innerWidth;

    // Adjust the Y-axis based on zoom level
    let zoomAdjustment = 0.5 * (-80 / zoomFactor); // You can adjust this factor
    const y = -(projectedPosition.y * 0.5 - 0.5) * window.innerHeight + zoomAdjustment;

    // Update the corresponding div position
    const labelDiv = document.getElementById(divId);
    if (labelDiv) {
      labelDiv.style.left = `${x}px`;
      labelDiv.style.top = `${y}px`;
      labelDiv.style.opacity = 1; // Make the label visible

      // Keep font size consistent
      const h2 = labelDiv.querySelector('h2');
      if (h2) h2.style.fontSize = '50px';
    }
  });
}


// Example of detecting zoom changes (if using OrbitControls or similar)
controls.addEventListener('change', updateTextPosition);



function render() {
  renderer.render(scene, camera);
}
