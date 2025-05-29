# Design Tools for Spline.design MCP Server

This directory contains the implementation of advanced design tools for Spline.design, enabling comprehensive control of Spline's powerful 3D design capabilities through the Model Context Protocol (MCP).

## Tool Modules

The design tools are organized into modular files by functionality area:

| File                       | Description                                                                      |
|----------------------------|----------------------------------------------------------------------------------|
| `parametric-objects.js`    | Create and manipulate parametric 2D and 3D objects                               |
| `boolean-operations.js`    | Perform boolean operations (union, subtract, intersect) on 3D objects            |
| `extrusion-tools.js`       | Extrude 2D shapes into 3D objects with various parameters                        |
| `text-tools.js`            | Create and customize 2D and 3D text objects                                      |
| `pen-tools.js`             | Create and edit vector paths and shapes                                          |
| `shape-blend-tools.js`     | Create morphing blends between different shapes                                  |
| `modeling-tools.js`        | Import, export, and edit 3D models                                               |
| `sculpting-tools.js`       | Create and manipulate sculptable 3D objects                                      |
| `cloner-tools.js`          | Create arrays and patterns of repeated objects                                   |
| `ui-scene-tools.js`        | Build interface layouts and UI components                                        |
| `particle-tools.js`        | Create and configure particle systems                                            |
| `gaussian-splatting-tools.js` | Import and manipulate 3D Gaussian Splatting models                           |
| `library-tools.js`         | Access and use assets from the Spline 3D library                                 |
| `component-tools.js`       | Create and manage reusable component systems                                     |
| `physics-tools.js`         | Add and configure physics simulation for objects                                 |
| `path-tools.js`            | Create animation paths and move objects along them                               |
| `version-history-tools.js` | Manage scene versions and snapshots                                              |
| `multi-scene-tools.js`     | Work with multiple interconnected scenes                                         |
| `hana-tools.js`            | Create and control Hana canvas designs and interactions                          |

## Usage

All design tools are registered through the main entry point (`design-tools.js`) in the parent directory. To use the design tools with the MCP server, simply import and register the main design tools module:

```javascript
import { registerDesignTools } from './tools/design-tools.js';

// In your server setup function:
registerDesignTools(server);
```

## Tool Categories

The design tools are grouped into several categories:

### Basic Object Manipulation
Tools for creating and manipulating parametric objects, boolean operations, and extrusion.

### Specialized Design Tools
Tools for text, pen paths, shape blending, and 3D modeling/sculpting.

### Advanced Scene Features
Tools for cloners, UI scene design, particles, and Gaussian Splatting.

### Project Management
Tools for managing components, libraries, versions, and multiple scenes.

### Hana Canvas
Tools for working with Spline's Hana 2D canvas for interactive designs.

## Integration with Spline API

These tools interact with the Spline API through utility functions imported from `../utils/api-client.js`. Please ensure that the API client configuration is properly set up and that the necessary API authentication is provided.

## Versioning

These tools are designed to work with Spline.design from 2023 onwards. As the Spline API evolves, some tools may require updates to maintain compatibility.

## Contributing

To add new design tools:

1. Create a new file for your tool category in this directory
2. Implement the registration function following the established pattern
3. Export the registration function
4. Import and add your registration to the main `design-tools.js` file
5. Update this README with information about your new tools

## License

These design tools are part of the Spline.design MCP Server and are subject to the same license terms as the main project.