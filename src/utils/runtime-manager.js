import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * RuntimeManager class for interacting with Spline's runtime
 * This utility helps manage and interact with exported Spline scenes
 * using the official @splinetool/runtime package
 */
export class RuntimeManager {
  constructor() {
    this.scenes = new Map();
  }

  /**
   * Parse a Spline scene URL to extract scene ID
   * @param {string} url - Spline scene URL
   * @returns {string} - Scene ID
   */
  parseSceneUrl(url) {
    // Extract the scene ID from a URL like https://prod.spline.design/[SCENE_ID]/scene.splinecode
    const regex = /https:\/\/prod\.spline\.design\/([^\/]+)\/scene\.splinecode/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('Invalid Spline scene URL format');
  }

  /**
   * Generate a complete script to import and use the Spline runtime
   * @returns {string} - npm install command and basic setup
   */
  generateRuntimeSetup() {
    return `
# Installing @splinetool/runtime
npm install @splinetool/runtime

# For React projects, also install
npm install @splinetool/react-spline

# Basic HTML setup:
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Spline Scene</title>
  <style>
    html, body { margin: 0; height: 100%; overflow: hidden; }
    #canvas3d { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <canvas id="canvas3d"></canvas>
  <script type="module">
    import { Application } from '@splinetool/runtime';
    
    // Create application
    const canvas = document.getElementById('canvas3d');
    const spline = new Application(canvas);
    
    // Load scene
    spline.load('https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode')
      .then(() => {
        console.log('Scene loaded');
        // Interact with scene here
      });
  </script>
</body>
</html>
`;
  }

  /**
   * Generate runtime code for a scene
   * @param {string} sceneId - ID of the scene
   * @param {string} format - Runtime format ('vanilla', 'react', 'next')
   * @returns {string} - Generated code
   */
  generateRuntimeCode(sceneId, format = 'vanilla') {
    const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
    
    if (format === 'vanilla') {
      return `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
  // Access the Spline Application API
  // Get an object by name
  const myObject = spline.findObjectByName('Cube');
  
  // Or get an object by ID
  // const myObject = spline.findObjectById('...');
  
  // Interact with the object
  if (myObject) {
    // Modify properties
    myObject.position.y += 1;
    myObject.rotation.y = Math.PI / 4;
    
    // Listen for events
    spline.addEventListener('mouseDown', (e) => {
      if (e.target === myObject) {
        console.log('Object clicked!');
      }
    });
    
    // Emit events
    myObject.emitEvent('mouseDown');
  }
});
`;
    } else if (format === 'react') {
      return `
import React, { useRef } from 'react';
import Spline from '@splinetool/react-spline';

export default function Scene() {
  const objectRef = useRef();
  
  function onLoad(splineApp) {
    console.log('Scene loaded successfully');
    
    // Save references to objects
    objectRef.current = splineApp.findObjectByName('Cube');
  }
  
  function handleClick() {
    if (objectRef.current) {
      // Modify object properties
      objectRef.current.position.y += 1;
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button onClick={handleClick}>Move Object Up</button>
      <Spline 
        scene="${sceneUrl}" 
        onLoad={onLoad}
        onMouseDown={(e) => {
          console.log('Mouse down on:', e.target.name);
        }}
      />
    </div>
  );
}
`;
    } else if (format === 'next') {
      return `
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';

// Import Spline component with no SSR
const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => <div>Loading 3D scene...</div>
});

export default function Scene() {
  const objectRef = useRef();
  
  function onLoad(splineApp) {
    console.log('Scene loaded successfully');
    
    // Save references to objects
    objectRef.current = splineApp.findObjectByName('Cube');
  }
  
  function handleClick() {
    if (objectRef.current) {
      // Modify object properties
      objectRef.current.position.y += 1;
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button onClick={handleClick}>Move Object Up</button>
      <Spline 
        scene="${sceneUrl}" 
        onLoad={onLoad}
        onMouseDown={(e) => {
          console.log('Mouse down on:', e.target.name);
        }}
      />
    </div>
  );
}
`;
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate code to interact with scene objects
   * @param {string} sceneId - ID of the scene
   * @param {string} objectId - ID of the object
   * @param {string} action - Action to perform
   * @param {object} params - Action parameters
   * @returns {string} - Generated code
   */
  generateObjectInteractionCode(sceneId, objectId, action, params = {}) {
    const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
    
    let codeSnippet = '';
    
    switch (action) {
      case 'move':
        const { x = 0, y = 0, z = 0 } = params;
        codeSnippet = `
// Move object
const obj = spline.findObjectById('${objectId}');
obj.position.x = ${x};
obj.position.y = ${y};
obj.position.z = ${z};

// Animate movement smoothly (alternative approach)
let startTime = null;
const duration = 1000; // 1 second
const startPos = { ...obj.position };
const targetPos = { x: ${x}, y: ${y}, z: ${z} };

function animateMove(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / duration, 1);
  
  // Use easing function (ease-out-cubic)
  const easeOut = 1 - Math.pow(1 - progress, 3);
  
  obj.position.x = startPos.x + (targetPos.x - startPos.x) * easeOut;
  obj.position.y = startPos.y + (targetPos.y - startPos.y) * easeOut;
  obj.position.z = startPos.z + (targetPos.z - startPos.z) * easeOut;
  
  if (progress < 1) {
    requestAnimationFrame(animateMove);
  }
}

// Uncomment to use animation instead of direct positioning
// requestAnimationFrame(animateMove);
`;
        break;
        
      case 'rotate':
        const { rotX = 0, rotY = 0, rotZ = 0 } = params;
        codeSnippet = `
// Rotate object
const obj = spline.findObjectById('${objectId}');
obj.rotation.x = ${rotX} * Math.PI / 180; // Convert degrees to radians
obj.rotation.y = ${rotY} * Math.PI / 180;
obj.rotation.z = ${rotZ} * Math.PI / 180;

// Animate rotation smoothly (alternative approach)
let startTime = null;
const duration = 1000; // 1 second
const startRot = { ...obj.rotation };
const targetRot = { 
  x: ${rotX} * Math.PI / 180,
  y: ${rotY} * Math.PI / 180,
  z: ${rotZ} * Math.PI / 180
};

function animateRotation(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / duration, 1);
  
  // Use easing function (ease-in-out)
  const easeInOut = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  
  obj.rotation.x = startRot.x + (targetRot.x - startRot.x) * easeInOut;
  obj.rotation.y = startRot.y + (targetRot.y - startRot.y) * easeInOut;
  obj.rotation.z = startRot.z + (targetRot.z - startRot.z) * easeInOut;
  
  if (progress < 1) {
    requestAnimationFrame(animateRotation);
  }
}

// Uncomment to use animation instead of direct rotation
// requestAnimationFrame(animateRotation);
`;
        break;
        
      case 'scale':
        const { scaleX = 1, scaleY = 1, scaleZ = 1 } = params;
        codeSnippet = `
// Scale object
const obj = spline.findObjectById('${objectId}');
obj.scale.x = ${scaleX};
obj.scale.y = ${scaleY};
obj.scale.z = ${scaleZ};
`;
        break;
        
      case 'color':
        const { color = '#ffffff' } = params;
        codeSnippet = `
// Change object color
const obj = spline.findObjectById('${objectId}');
if (obj.material) {
  obj.material.color.set('${color}');
}

// For more complex color operations
// You can also change emissive color
if (obj.material && obj.material.emissive) {
  obj.material.emissive.set('#000000');
  obj.material.emissiveIntensity = 0.5;
}

// Or use RGB values
// obj.material.color.setRGB(1, 0, 0); // Red
`;
        break;
        
      case 'visibility':
        const { visible = true } = params;
        codeSnippet = `
// Change object visibility
const obj = spline.findObjectById('${objectId}');
obj.visible = ${visible};

// To fade out an object gradually
function fadeOut(obj, duration = 1000) {
  const startOpacity = 1;
  const endOpacity = 0;
  let startTime = null;
  
  // Store the original material
  const originalMaterial = obj.material.clone();
  
  // Make sure the material is set to be transparent
  obj.material.transparent = true;
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    obj.material.opacity = startOpacity + (endOpacity - startOpacity) * progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      obj.visible = false;
      // Restore original opacity to the material
      obj.material.opacity = startOpacity;
    }
  }
  
  requestAnimationFrame(animate);
}

// To fade in an object gradually
function fadeIn(obj, duration = 1000) {
  const startOpacity = 0;
  const endOpacity = 1;
  let startTime = null;
  
  // Make sure the material is set to be transparent and object is visible
  obj.material.transparent = true;
  obj.material.opacity = startOpacity;
  obj.visible = true;
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    obj.material.opacity = startOpacity + (endOpacity - startOpacity) * progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // If material wasn't originally transparent, we could reset here
      // obj.material.transparent = false;
    }
  }
  
  requestAnimationFrame(animate);
}

// Uncomment to use fading
// ${visible ? 'fadeIn(obj, 1000);' : 'fadeOut(obj, 1000);'}
`;
        break;
        
      case 'emitEvent':
        const { eventName = 'mouseDown' } = params;
        codeSnippet = `
// Emit event on object
const obj = spline.findObjectById('${objectId}');
obj.emitEvent('${eventName}');

// Listen for events on this object
spline.addEventListener('${eventName}', (e) => {
  if (e.target.id === '${objectId}') {
    console.log('Event ${eventName} triggered on object');
    // Handle the event
  }
});

// Available events:
// - mouseDown
// - mouseUp
// - mouseHover (mouseOver)
// - mouseOut
// - keyDown
// - keyUp
// - collision
`;
        break;

      case 'material':
        const { materialId = '', materialParams = {} } = params;
        codeSnippet = `
// Change object material
const obj = spline.findObjectById('${objectId}');

// Option 1: Apply an existing material by finding it
const material = spline.findMaterialById('${materialId}');
if (material) {
  obj.material = material;
}

// Option 2: Create a new material
// Note: This is a simplified example - Spline materials are more complex
const newMaterial = new THREE.MeshStandardMaterial({
  color: ${materialParams.color ? `'${materialParams.color}'` : "'#ffffff'"},
  roughness: ${materialParams.roughness || 0.5},
  metalness: ${materialParams.metalness || 0},
  transparent: ${materialParams.transparent || false},
  opacity: ${materialParams.opacity || 1}
});

// To apply the new material:
// obj.material = newMaterial;
`;
        break;

      case 'animation':
        const { 
          animationType = 'rotate',
          duration = 1000,
          easing = 'easeInOut',
          loop = false
        } = params;
        
        let animationCode = '';
        
        if (animationType === 'rotate') {
          animationCode = `
  // Rotate animation
  const startRotation = { ...obj.rotation };
  const targetRotation = { 
    x: startRotation.x + Math.PI * 2,  // Full 360° rotation
    y: startRotation.y,
    z: startRotation.z
  };
  
  obj.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * progress;`;
        } else if (animationType === 'move') {
          animationCode = `
  // Move animation
  const startPosition = { ...obj.position };
  const targetPosition = { 
    x: startPosition.x,
    y: startPosition.y + 1,  // Move up by 1 unit
    z: startPosition.z
  };
  
  obj.position.x = startPosition.x + (targetPosition.x - startPosition.x) * progress;
  obj.position.y = startPosition.y + (targetPosition.y - startPosition.y) * progress;
  obj.position.z = startPosition.z + (targetPosition.z - startPosition.z) * progress;`;
        } else if (animationType === 'scale') {
          animationCode = `
  // Scale animation
  const startScale = { ...obj.scale };
  const targetScale = { 
    x: startScale.x * 1.5,  // Scale up by 50%
    y: startScale.y * 1.5,
    z: startScale.z * 1.5
  };
  
  obj.scale.x = startScale.x + (targetScale.x - startScale.x) * progress;
  obj.scale.y = startScale.y + (targetScale.y - startScale.y) * progress;
  obj.scale.z = startScale.z + (targetScale.z - startScale.z) * progress;`;
        }
        
        let easingFunction = '';
        
        if (easing === 'linear') {
          easingFunction = 'const ease = progress;';
        } else if (easing === 'easeIn') {
          easingFunction = 'const ease = progress * progress;';
        } else if (easing === 'easeOut') {
          easingFunction = 'const ease = 1 - Math.pow(1 - progress, 2);';
        } else { // easeInOut
          easingFunction = 'const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;';
        }
        
        codeSnippet = `
// Animate object
const obj = spline.findObjectById('${objectId}');
let startTime = null;
const duration = ${duration}; // milliseconds
let animationFrame;

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  let progress = Math.min(elapsed / duration, 1);
  
  // Apply easing
  ${easingFunction}
  progress = ease;
  
${animationCode}
  
  if (progress < 1) {
    animationFrame = requestAnimationFrame(animate);
  } else if (${loop}) {
    // Reset for looping
    startTime = null;
    animationFrame = requestAnimationFrame(animate);
  }
}

// Start animation
animationFrame = requestAnimationFrame(animate);

// To stop animation early:
// cancelAnimationFrame(animationFrame);
`;
        break;
        
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
    
    return `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
  ${codeSnippet}
});
`;
  }

  /**
   * Generate event listener code
   * @param {string} sceneId - ID of the scene
   * @param {string} eventName - Name of the event
   * @returns {string} - Generated code
   */
  generateEventListenerCode(sceneId, eventName) {
    const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
    
    return `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
  // Add event listener
  spline.addEventListener('${eventName}', (e) => {
    console.log('Event triggered:', e);
    
    // Get information about the target object
    const targetObject = e.target;
    console.log('Target object:', targetObject.name, targetObject.id);
    
    // Respond to the event
    if (targetObject.name === 'Cube') {
      // Handle cube-specific event
      targetObject.scale.multiplyScalar(1.1); // Grow by 10%
    } else if (targetObject.name === 'Sphere') {
      // Handle sphere-specific event
      targetObject.material.color.set('#ff0000'); // Change to red
    }
    
    // You can also emit events on other objects
    const otherObject = spline.findObjectByName('OtherObject');
    if (otherObject) {
      otherObject.emitEvent('mouseDown');
    }
  });
});
`;
  }

  /**
   * Generate variable manipulation code
   * @param {string} sceneId - ID of the scene
   * @param {string} variableName - Name of the variable
   * @param {any} value - Value to set
   * @returns {string} - Generated code
   */
  generateVariableCode(sceneId, variableName, value) {
    const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
    
    return `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
  // Set variable value
  spline.setVariable('${variableName}', ${JSON.stringify(value)});
  
  // Get variable value
  const currentValue = spline.getVariable('${variableName}');
  console.log('Current value:', currentValue);
  
  // Listen for variable changes
  spline.addEventListener('variableChanged', (e) => {
    if (e.variableName === '${variableName}') {
      console.log('Variable changed:', e.variableName, e.value);
      // React to variable change
    }
  });
  
  // Example: Change variable over time
  let count = 0;
  const interval = setInterval(() => {
    count++;
    spline.setVariable('${variableName}', count);
    
    if (count >= 10) {
      clearInterval(interval);
    }
  }, 1000);
});
`;
  }

  /**
   * Generate comprehensive scene management code
   * @param {string} sceneId - ID of the scene
   * @returns {string} - Generated code with comprehensive examples
   */
  generateComprehensiveExample(sceneId) {
    const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
    
    return `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Track interactive objects
const interactiveObjects = {};

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
  // 1. Scene exploration - find all objects
  const allObjects = spline.getObjects();
  console.log('All objects:', allObjects.length);
  
  // 2. Find specific objects
  const cube = spline.findObjectByName('Cube');
  const sphere = spline.findObjectByName('Sphere');
  
  if (cube) {
    interactiveObjects.cube = cube;
    console.log('Found cube:', cube.id);
  }
  
  if (sphere) {
    interactiveObjects.sphere = sphere;
    console.log('Found sphere:', sphere.id);
  }
  
  // 3. Set up event listeners
  spline.addEventListener('mouseDown', handleMouseDown);
  spline.addEventListener('mouseUp', handleMouseUp);
  spline.addEventListener('mouseHover', handleMouseHover);
  spline.addEventListener('mouseOut', handleMouseOut);
  
  // 4. Get and set variables
  setUpVariables();
  
  // 5. Set up UI controls
  setUpControls();
});

// Event handlers
function handleMouseDown(e) {
  const target = e.target;
  console.log('Mouse down on:', target.name);
  
  // Example: Scale up on click
  target.scale.multiplyScalar(1.1);
  
  // Add click effect
  addClickEffect(target);
}

function handleMouseUp(e) {
  const target = e.target;
  console.log('Mouse up on:', target.name);
  
  // Example: Return to original scale
  target.scale.divideScalar(1.1);
}

function handleMouseHover(e) {
  const target = e.target;
  console.log('Mouse hover on:', target.name);
  
  // Example: Change color on hover
  if (target.material) {
    target.userData.originalColor = target.material.color.clone();
    target.material.color.set('#ffcc00');
  }
}

function handleMouseOut(e) {
  const target = e.target;
  console.log('Mouse out from:', target.name);
  
  // Example: Restore original color
  if (target.material && target.userData.originalColor) {
    target.material.color.copy(target.userData.originalColor);
  }
}

// Helper function to add click effect
function addClickEffect(object) {
  let startTime = null;
  const duration = 300; // ms
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Pulse effect
    const scale = 1 + 0.2 * Math.sin(progress * Math.PI);
    object.scale.setScalar(scale);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      object.scale.setScalar(1);
    }
  }
  
  requestAnimationFrame(animate);
}

// Set up variables
function setUpVariables() {
  // Get all variables
  const variables = spline.getVariables();
  console.log('Variables:', variables);
  
  // Example: Counter variable
  spline.setVariable('counter', 0);
  
  // Update counter every second
  setInterval(() => {
    const currentCount = spline.getVariable('counter') || 0;
    spline.setVariable('counter', currentCount + 1);
  }, 1000);
  
  // Listen for variable changes
  spline.addEventListener('variableChanged', (e) => {
    console.log('Variable changed:', e.variableName, e.value);
    
    // React to variable changes
    if (e.variableName === 'counter') {
      // Example: Rotate cube based on counter
      const cube = interactiveObjects.cube;
      if (cube) {
        cube.rotation.y = e.value * 0.1;
      }
    }
  });
}

// Set up UI controls
function setUpControls() {
  // Example: Add UI buttons
  const controlsDiv = document.createElement('div');
  controlsDiv.style.position = 'absolute';
  controlsDiv.style.bottom = '20px';
  controlsDiv.style.left = '20px';
  controlsDiv.style.zIndex = '100';
  document.body.appendChild(controlsDiv);
  
  // Rotate button
  const rotateBtn = document.createElement('button');
  rotateBtn.textContent = 'Rotate Objects';
  rotateBtn.addEventListener('click', () => {
    // Rotate all objects
    Object.values(interactiveObjects).forEach(obj => {
      animateRotation(obj);
    });
  });
  controlsDiv.appendChild(rotateBtn);
  
  // Reset button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset Scene';
  resetBtn.style.marginLeft = '10px';
  resetBtn.addEventListener('click', () => {
    // Reset the scene
    spline.load('${sceneUrl}');
  });
  controlsDiv.appendChild(resetBtn);
}

// Animate rotation
function animateRotation(object) {
  let startTime = null;
  const duration = 1000; // ms
  const startRot = { ...object.rotation };
  const targetRot = { 
    x: startRot.x,
    y: startRot.y + Math.PI * 2, // Full 360° rotation
    z: startRot.z
  };
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easing function (ease-in-out)
    const easeInOut = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    object.rotation.y = startRot.y + (targetRot.y - startRot.y) * easeInOut;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}
`;
  }
}

export default new RuntimeManager();
