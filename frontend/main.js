import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
import { DragControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js';

document.addEventListener('DOMContentLoaded', function (event) {
    // Create a scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('app').appendChild(renderer.domElement);

    // Create a GLTFLoader
    const loader = new GLTFLoader();

    // Initialize the material
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Initial color (white)
        metalness: 0.0, // Set your desired metallic properties
        roughness: 0.6, // Set your desired roughness properties
    });

    // Load the T-shirt model
    let tshirtModel;
    loader.load('./model/tshirt.gltf', (gltf) => {
        tshirtModel = gltf.scene;
        tshirtModel.position.set(0, 0, 0);

        // Apply the material to the T-shirt model
        tshirtModel.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
            }
        });

        scene.add(tshirtModel);

        const boundingBox = new THREE.Box3().setFromObject(tshirtModel);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        camera.position.set(center.x, center.y, center.z + cameraDistance * 2); // Adjust the camera position
        camera.lookAt(center);

        // Initialize DragControls for rotation
        const dragControls = new DragControls([tshirtModel], camera, renderer.domElement);

        dragControls.addEventListener('drag', () => {
            // Update the rotation when dragging
            updateTshirt();
        });

        // Create a function to update the T-shirt
        function updateTshirt() {
            if (tshirtModel) {
                // Add additional rotations (in radians) as needed
                tshirtModel.rotation.x += 0.01; // Rotate around the x-axis
                tshirtModel.rotation.z += 0.01; // Rotate around the z-axis
            }
        }
    }, undefined, (error) => {
        console.error(error);
    });

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Example: Add a color picker
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', () => {
        const color = new THREE.Color(colorPicker.value);
        tshirtModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.copy(color);
            }
        });
    });

    // Animation/render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});
