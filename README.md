# Spline MCP Server

An MCP server for working with the Spline 3D design tool API. This server provides a convenient interface for Claude to interact with Spline's features, including exporting scenes, importing models, and managing projects.

## Features

- Export Spline scenes to various formats (GLB, GLTF, FBX, OBJ)
- Import 3D models into Spline
- Get details about Spline scenes
- List available Spline scenes

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

### Export a Spline scene

```
Export my Spline scene with ID "abc123" to GLB format
```

### Import a 3D model into Spline

```
Import the 3D model from "https://example.com/model.glb" into my Spline project
```

### Get details about a Spline scene

```
Get details for my Spline scene with ID "abc123"
```

### List available Spline scenes

```
List my available Spline scenes
```

## API Documentation

For more information about the Spline API, see the [official documentation](https://docs.spline.design/).

## License

MIT