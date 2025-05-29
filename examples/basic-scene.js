/**
 * Example: Creating a basic scene with a cube, sphere, and lighting
 * This example demonstrates how to use the Spline.design MCP tools
 * to create a simple scene with multiple objects
 */

// Example conversation with Claude:

/*
User: Please create a basic scene in Spline with a rotating cube and a static sphere. I want the cube to rotate when clicked.

Claude: I'll help you create a scene with a rotating cube and a static sphere. First, let's break this down into steps:

1. Create a cube object
2. Create a sphere object
3. Create a directional light for proper lighting
4. Create a state for the cube rotation
5. Create an event to trigger the rotation when the cube is clicked

Let me start by creating these objects in your scene. What's your scene ID?

User: My scene ID is abc123

Claude: I'll create the objects in scene abc123. Let me start with the cube and sphere.

I'll use the createObject tool to add a cube:

[Claude uses the createObject tool with parameters:
sceneId: "abc123",
type: "cube",
name: "Interactive Cube",
position: { x: -1, y: 0, z: 0 },
color: "#3a86ff"]

Now I'll add a sphere:

[Claude uses the createObject tool with parameters:
sceneId: "abc123",
type: "sphere",
name: "Static Sphere",
position: { x: 1, y: 0, z: 0 },
color: "#ff006e"]

Now let's add a directional light to illuminate the scene:

[Claude uses the createObject tool with parameters:
sceneId: "abc123",
type: "light",
name: "Main Light",
position: { x: 0, y: 3, z: 2 }]

Great! Now let's create a rotation state for the cube. First, I need to know the object ID of the cube that was created.

Let me list the objects in your scene:

[Claude uses the getObjects tool with parameters:
sceneId: "abc123"]

I can see the cube has ID "cube456". Now I'll create a rotation state:

[Claude uses the createState tool with parameters:
sceneId: "abc123",
name: "Cube Rotation",
properties: [{
  objectId: "cube456",
  property: "rotation.y",
  value: 360
}],
transitionDuration: 2000,
transitionEasing: "easeInOut"]

Finally, let's create a mouseDown event for the cube that triggers this rotation:

[Claude uses the createEvent tool with parameters:
sceneId: "abc123",
name: "Cube Click",
type: "mouseDown",
objectId: "cube456",
actions: [{
  type: "triggerState",
  target: "state789",  // The ID of the state we created
  params: {}
}]]

Perfect! I've created a scene with:
1. A blue cube at position (-1, 0, 0)
2. A pink sphere at position (1, 0, 0)
3. A directional light illuminating the scene
4. A rotation state that rotates the cube 360 degrees over 2 seconds
5. A click event that triggers the rotation when the cube is clicked

You can now view this scene in Spline, and when you click on the blue cube, it will rotate 360 degrees around the Y-axis.

User: Can you make the sphere change color when hovered?

Claude: I'll add color change functionality to the sphere when hovered. Let me implement this:

First, I'll create two states for the sphere - one for its hover color and one to return to its original color:

[Claude uses the createState tool with parameters:
sceneId: "abc123",
name: "Sphere Hover Color",
properties: [{
  objectId: "sphere123",  // The sphere's ID
  property: "color",
  value: "#ffbe0b"  // Yellow color on hover
}],
transitionDuration: 300,
transitionEasing: "easeOut"]

[Claude uses the createState tool with parameters:
sceneId: "abc123",
name: "Sphere Original Color",
properties: [{
  objectId: "sphere123",
  property: "color",
  value: "#ff006e"  // Original pink color
}],
transitionDuration: 300,
transitionEasing: "easeOut"]

Now I'll create two events - one for mouseOver and one for mouseOut:

[Claude uses the createEvent tool with parameters:
sceneId: "abc123",
name: "Sphere Hover",
type: "mouseOver",
objectId: "sphere123",
actions: [{
  type: "triggerState",
  target: "stateHover456",  // ID of the hover state
  params: {}
}]]

[Claude uses the createEvent tool with parameters:
sceneId: "abc123",
name: "Sphere Unhover",
type: "mouseOut",
objectId: "sphere123",
actions: [{
  type: "triggerState",
  target: "stateOriginal789",  // ID of the original color state
  params: {}
}]]

I've now added hover interactivity to the sphere:
1. When you hover over the pink sphere, it will transition to yellow
2. When you move your mouse away, it will transition back to pink
3. Both transitions take 300ms with an easeOut easing for a smooth effect

Your scene now has two interactive elements:
- A cube that rotates when clicked
- A sphere that changes color when hovered

Is there anything else you'd like to add to this scene?
*/
