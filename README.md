# Spline MCP Server

An MCP server for working with the Spline 3D design tool API. This server provides a convenient interface for Claude to interact with Spline's features, including exporting scenes, importing models, creating animations, and managing projects.

## Features

### Basic Operations
- Export Spline scenes to various formats (GLB, GLTF, FBX, OBJ)
- Import 3D models into Spline
- Get details about Spline scenes
- List available Spline scenes

### Animation Capabilities
- Create keyframe animations for objects
- Trigger existing animations
- List animations in a scene
- Create event-triggered animations (onClick, onHover, etc.)

## Installation

```bash
npm install spline-mcp-server
```

Or use it directly with npx:

```bash
npx spline-mcp-server
```

## Configuration

Create a `.env` file with your Spline API credentials:

```
SPLINE_API_KEY=your_api_key_here
SPLINE_API_URL=https://api.spline.design
```

## Usage

This MCP server can be used with Claude to interact with Spline's features. Here are some examples of how to use it:

### Basic Operations

```
Export my Spline scene with ID "abc123" to GLB format
```

```
Import the 3D model from "https://example.com/model.glb" into my Spline project
```

```
Get details for my Spline scene with ID "abc123"
```

```
List my available Spline scenes
```

### Animation Operations

```
Create an animation named "Rotate" for the cube object in my scene
```

```
Trigger the "Bounce" animation for the ball object
```

```
Create an onClick animation that makes an object move up when clicked
```

```
List all animations in my scene
```

## Animation Examples

### Creating a Simple Rotation Animation

```
Create an animation named "Spin" for object "cube-123" in scene "abc456" with keyframes for rotation
```

### Creating an Event-Based Animation

```
Create an onClick animation named "Grow" for object "button-123" in scene "abc456" that scales the object to 1.5x its size
```

### Triggering Animations

```
Trigger the "Pulse" animation for object "heart-123" in scene "abc456" with loop enabled
```

## API Documentation

For more information about the Spline API, see the [official documentation](https://docs.spline.design/).

## License

MIT