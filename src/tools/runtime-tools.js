import { z } from 'zod';
import runtimeManager from '../utils/runtime-manager.js';

/**
 * Runtime interaction tools for Spline.design
 * These tools directly leverage the @splinetool/runtime package
 * @param {object} server - MCP server instance
 */
export const registerRuntimeTools = (server) => {
  // Get runtime setup guidance
  server.tool(
    'getRuntimeSetup',
    {},
    async () => {
      try {
        const setupCode = runtimeManager.generateRuntimeSetup();
        
        return {
          content: [
            { 
              type: 'text', 
              text: setupCode 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating setup code: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate comprehensive example
  server.tool(
    'generateComprehensiveExample',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const code = runtimeManager.generateComprehensiveExample(sceneId);
        
        return {
          content: [
            { 
              type: 'text', 
              text: code 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating comprehensive example: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate object animation code
  server.tool(
    'generateAnimationCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      animationType: z.enum(['rotate', 'move', 'scale', 'color']).describe('Animation type'),
      duration: z.number().int().min(100).default(1000).describe('Animation duration (ms)'),
      easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).default('easeInOut')
        .describe('Animation easing'),
      loop: z.boolean().default(false).describe('Whether to loop the animation'),
      params: z.record(z.any()).optional().describe('Animation-specific parameters'),
    },
    async ({ sceneId, objectId, animationType, duration, easing, loop, params }) => {
      try {
        const animationParams = {
          animationType,
          duration,
          easing,
          loop,
          ...(params && params),
        };
        
        const code = runtimeManager.generateObjectInteractionCode(
          sceneId, 
          objectId, 
          'animation', 
          animationParams
        );
        
        return {
          content: [
            { 
              type: 'text', 
              text: code 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating animation code: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate scene interaction code
  server.tool(
    'generateSceneInteractionCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      interactionType: z.enum([
        'explore', 'eventListeners', 'variables', 'camera', 'physics', 'custom'
      ]).describe('Type of interaction'),
      options: z.record(z.any()).optional().describe('Interaction-specific options'),
    },
    async ({ sceneId, interactionType, options }) => {
      try {
        let code = '';
        const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
        
        const baseCode = `
import { Application } from '@splinetool/runtime';

// Create a new Application instance
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

// Load the scene
spline.load('${sceneUrl}').then(() => {
  console.log('Scene loaded successfully');
  
`;

        const endCode = `
});
`;

        let interactionCode = '';
        
        switch (interactionType) {
          case 'explore':
            interactionCode = `
  // Scene exploration
  const allObjects = spline.getObjects();
  console.log('Total objects:', allObjects.length);
  
  // Log object hierarchy
  function logObjectHierarchy(objects, indent = '') {
    objects.forEach(obj => {
      console.log(\`\${indent}\${obj.name} (\${obj.type})\`);
      if (obj.children && obj.children.length > 0) {
        logObjectHierarchy(obj.children, indent + '  ');
      }
    });
  }
  
  logObjectHierarchy(allObjects);
  
  // Find objects by type
  const cubes = allObjects.filter(obj => obj.type === 'cube');
  const lights = allObjects.filter(obj => obj.type === 'light');
  const cameras = allObjects.filter(obj => obj.type === 'camera');
  
  console.log('Cubes:', cubes.length);
  console.log('Lights:', lights.length);
  console.log('Cameras:', cameras.length);
`;
            break;
          
          case 'eventListeners':
            interactionCode = `
  // Set up event listeners
  spline.addEventListener('mouseDown', (e) => {
    console.log('Mouse down on:', e.target.name);
    
    // Highlight clicked object
    if (e.target.material) {
      e.target.userData.originalColor = e.target.material.color.clone();
      e.target.material.color.set('#ff0000');
    }
  });
  
  spline.addEventListener('mouseUp', (e) => {
    console.log('Mouse up on:', e.target.name);
    
    // Restore original color
    if (e.target.material && e.target.userData.originalColor) {
      e.target.material.color.copy(e.target.userData.originalColor);
    }
  });
  
  spline.addEventListener('mouseHover', (e) => {
    console.log('Mouse hover on:', e.target.name);
    document.body.style.cursor = 'pointer';
  });
  
  spline.addEventListener('mouseOut', (e) => {
    console.log('Mouse out from:', e.target.name);
    document.body.style.cursor = 'default';
  });
  
  // Key events
  document.addEventListener('keydown', (e) => {
    console.log('Key down:', e.key);
    
    // Example: Move objects with arrow keys
    const selectedObject = spline.findObjectByName('${options?.objectName || 'Cube'}');
    if (selectedObject) {
      const moveDistance = 0.1;
      
      switch (e.key) {
        case 'ArrowUp':
          selectedObject.position.z -= moveDistance;
          break;
        case 'ArrowDown':
          selectedObject.position.z += moveDistance;
          break;
        case 'ArrowLeft':
          selectedObject.position.x -= moveDistance;
          break;
        case 'ArrowRight':
          selectedObject.position.x += moveDistance;
          break;
      }
    }
  });
`;
            break;
          
          case 'variables':
            interactionCode = `
  // Get all variables
  const variables = spline.getVariables();
  console.log('Variables:', variables);
  
  // Set variables
  spline.setVariable('counter', 0);
  spline.setVariable('isActive', true);
  spline.setVariable('userName', 'Visitor');
  
  // Listen for variable changes
  spline.addEventListener('variableChanged', (e) => {
    console.log('Variable changed:', e.variableName, e.value);
    
    // React to specific variable changes
    if (e.variableName === 'counter') {
      // Example: Update UI based on counter
      document.getElementById('counter-display').textContent = e.value;
      
      // Example: Rotate object based on counter
      const cube = spline.findObjectByName('${options?.objectName || 'Cube'}');
      if (cube) {
        cube.rotation.y = e.value * 0.1;
      }
    }
  });
  
  // Example: Increment counter every second
  setInterval(() => {
    const currentCount = spline.getVariable('counter') || 0;
    spline.setVariable('counter', currentCount + 1);
  }, 1000);
`;
            break;
          
          case 'camera':
            interactionCode = `
  // Get all cameras
  const cameras = spline.getObjects().filter(obj => obj.type === 'camera');
  console.log('Available cameras:', cameras.map(c => c.name));
  
  // Get the active camera
  const activeCamera = spline.getActiveCamera();
  console.log('Active camera:', activeCamera.name);
  
  // Create UI for camera switching
  const cameraControls = document.createElement('div');
  cameraControls.style.position = 'absolute';
  cameraControls.style.top = '20px';
  cameraControls.style.right = '20px';
  cameraControls.style.zIndex = '100';
  document.body.appendChild(cameraControls);
  
  // Add camera buttons
  cameras.forEach(camera => {
    const button = document.createElement('button');
    button.textContent = camera.name;
    button.addEventListener('click', () => {
      // Switch to this camera
      spline.setActiveCamera(camera);
    });
    cameraControls.appendChild(button);
  });
  
  // Camera animation function
  function animateCameraTo(targetPosition, duration = 1000) {
    const camera = spline.getActiveCamera();
    const startPosition = { ...camera.position };
    let startTime = null;
    
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out
      const easeInOut = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeInOut;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeInOut;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeInOut;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  // Example: Add position buttons
  const positions = [
    { name: 'Front', position: { x: 0, y: 0, z: 5 } },
    { name: 'Top', position: { x: 0, y: 5, z: 0 } },
    { name: 'Side', position: { x: 5, y: 0, z: 0 } }
  ];
  
  positions.forEach(pos => {
    const button = document.createElement('button');
    button.textContent = pos.name;
    button.addEventListener('click', () => {
      animateCameraTo(pos.position);
    });
    cameraControls.appendChild(button);
  });
`;
            break;
          
          case 'physics':
            interactionCode = `
  // Set up physics (if the scene has physics enabled)
  // Note: This requires physics to be set up in the Spline scene
  
  // Get physics objects
  const physicsObjects = spline.getObjects().filter(obj => obj.physics);
  console.log('Physics objects:', physicsObjects.map(obj => obj.name));
  
  // Apply force to an object
  function applyForce(objectName, force) {
    const obj = spline.findObjectByName(objectName);
    if (obj && obj.physics) {
      obj.physics.applyForce(force);
    }
  }
  
  // Example: Apply force on click
  spline.addEventListener('mouseDown', (e) => {
    if (e.target.physics) {
      // Apply upward force
      applyForce(e.target.name, { x: 0, y: 10, z: 0 });
    }
  });
  
  // Create physics controls
  const physicsControls = document.createElement('div');
  physicsControls.style.position = 'absolute';
  physicsControls.style.bottom = '20px';
  physicsControls.style.left = '20px';
  physicsControls.style.zIndex = '100';
  document.body.appendChild(physicsControls);
  
  // Reset physics button
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset Physics';
  resetButton.addEventListener('click', () => {
    // Reset all physics objects
    physicsObjects.forEach(obj => {
      obj.physics.reset();
    });
  });
  physicsControls.appendChild(resetButton);
  
  // Gravity controls
  const gravityControls = document.createElement('div');
  gravityControls.innerHTML = '<label>Gravity: </label>';
  const gravitySlider = document.createElement('input');
  gravitySlider.type = 'range';
  gravitySlider.min = '0';
  gravitySlider.max = '20';
  gravitySlider.value = '9.8';
  gravitySlider.addEventListener('input', (e) => {
    // Update gravity
    const gravity = parseFloat(e.target.value);
    spline.setPhysicsGravity({ x: 0, y: -gravity, z: 0 });
  });
  gravityControls.appendChild(gravitySlider);
  physicsControls.appendChild(gravityControls);
`;
            break;
          
          case 'custom':
            // For custom interaction, use the provided options
            interactionCode = options?.code || `
  // Custom interaction code
  console.log('Custom interaction code goes here');
  
  // Example: Set up a custom animation loop
  let time = 0;
  
  function animate() {
    time += 0.01;
    
    // Animate all objects
    spline.getObjects().forEach(obj => {
      if (obj.type === 'mesh') {
        // Create wave effect
        obj.position.y = Math.sin(time + obj.position.x) * 0.2;
      }
    });
    
    requestAnimationFrame(animate);
  }
  
  // Start animation loop
  animate();
`;
            break;
          
          default:
            interactionCode = `
  // Default interaction code
  console.log('Scene loaded and ready for interaction');
`;
        }
        
        code = baseCode + interactionCode + endCode;
        
        return {
          content: [
            { 
              type: 'text', 
              text: code 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating scene interaction code: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate React component
  server.tool(
    'generateReactComponent',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      componentName: z.string().min(1).default('SplineScene').describe('React component name'),
      interactivity: z.enum(['none', 'basic', 'advanced']).default('basic')
        .describe('Level of interactivity'),
      responsive: z.boolean().default(true).describe('Whether to make the component responsive'),
      typescript: z.boolean().default(false).describe('Whether to generate TypeScript code'),
    },
    async ({ sceneId, componentName, interactivity, responsive, typescript }) => {
      try {
        const sceneUrl = `https://prod.spline.design/${sceneId}/scene.splinecode`;
        
        // Base component with no interactivity
        let componentCode = `
import React${typescript ? ', { FC }' : ''} from 'react';
import Spline from '@splinetool/react-spline';

${typescript ? `interface ${componentName}Props {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const ${componentName}: FC<${componentName}Props> = ({ width = '100%', height = '100%', className = '' }) => {` : 
`const ${componentName} = ({ width = '100%', height = '100%', className = '' }) => {`}
  return (
    <div 
      style={{ 
        width: ${responsive ? 'width' : "'100%'"}, 
        height: ${responsive ? 'height' : "'100%'"}, 
        position: 'relative'
      }}
      className={className}
    >
      <Spline 
        scene="${sceneUrl}"${interactivity === 'none' ? '' : `
        onLoad={handleOnLoad}`}
      />
    </div>
  );
};

export default ${componentName};`;

        // Add interactivity if requested
        if (interactivity !== 'none') {
          // Insert before the return statement
          const basicCode = `
  ${typescript ? 'const handleOnLoad = (splineApp: any) => {' : 'const handleOnLoad = (splineApp) => {'}
    console.log('Spline scene loaded');
    
    // Get objects by name
    const cube = splineApp.findObjectByName('Cube');
    if (cube) {
      console.log('Found cube:', cube);
    }
  };
`;

          const advancedCode = `
  ${typescript ? 'const [activeObject, setActiveObject] = React.useState<any | null>(null);' : 'const [activeObject, setActiveObject] = React.useState(null);'}
  ${typescript ? 'const splineRef = React.useRef<any | null>(null);' : 'const splineRef = React.useRef(null);'}

  ${typescript ? 'const handleOnLoad = (splineApp: any) => {' : 'const handleOnLoad = (splineApp) => {'}
    console.log('Spline scene loaded');
    splineRef.current = splineApp;
    
    // Get all interactive objects
    const objects = splineApp.getObjects();
    console.log('Scene objects:', objects.length);
    
    // Set up event listeners
    splineApp.addEventListener('mouseDown', handleMouseDown);
    splineApp.addEventListener('mouseUp', handleMouseUp);
    splineApp.addEventListener('mouseHover', handleMouseHover);
  };

  ${typescript ? 'const handleMouseDown = (e: any) => {' : 'const handleMouseDown = (e) => {'}
    console.log('Mouse down on:', e.target.name);
    setActiveObject(e.target);
    
    // Example: Scale up on click
    e.target.scale.multiplyScalar(1.1);
  };

  ${typescript ? 'const handleMouseUp = (e: any) => {' : 'const handleMouseUp = (e) => {'}
    console.log('Mouse up on:', e.target.name);
    
    // Example: Scale back down
    if (e.target === activeObject) {
      e.target.scale.divideScalar(1.1);
    }
  };

  ${typescript ? 'const handleMouseHover = (e: any) => {' : 'const handleMouseHover = (e) => {'}
    console.log('Mouse hover on:', e.target.name);
    
    // Example: Change cursor
    document.body.style.cursor = 'pointer';
  };

  // Example function to animate an object
  ${typescript ? 'const animateObject = (objectName: string) => {' : 'const animateObject = (objectName) => {'}
    if (!splineRef.current) return;
    
    const obj = splineRef.current.findObjectByName(objectName);
    if (!obj) return;
    
    let startTime = null;
    const duration = 1000; // ms
    
    function animate(timestamp${typescript ? ': number' : ''}) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Rotate the object
      obj.rotation.y = progress * Math.PI * 2;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  };

  // Effect to set up keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e${typescript ? ': KeyboardEvent' : ''}) => {
      if (!splineRef.current) return;
      
      if (e.key === 'r' && activeObject) {
        // Rotate the active object
        animateObject(activeObject.name);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeObject]);
`;

          // Insert the interactivity code based on level
          if (interactivity === 'basic') {
            componentCode = componentCode.replace(`const ${componentName} = (`, basicCode + `const ${componentName} = (`);
          } else if (interactivity === 'advanced') {
            componentCode = componentCode.replace(`import React`, `import React, { useState, useEffect, useRef }`);
            componentCode = componentCode.replace(`const ${componentName} = (`, advancedCode + `const ${componentName} = (`);
          }
        }
        
        return {
          content: [
            { 
              type: 'text', 
              text: componentCode 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating React component: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
