# Spline.design MCP Server

> **Work in Progress** — This project is under active development. See the [Current Status](#current-status) section below.

An MCP (Model Context Protocol) server for [Spline.design](https://spline.design) that helps you generate code for controlling 3D scenes using the `@splinetool/runtime` library.

## Current Status

Spline.design does **not** provide a public REST API for programmatic scene manipulation. Their developer tools consist of:

- **[Code API](https://docs.spline.design/exporting-your-scene/web/code-api-for-web)** — A client-side JavaScript runtime (`@splinetool/runtime`) for controlling exported scenes in the browser
- **[Real-time API](https://docs.spline.design/interaction-states-events-and-actions/real-time-api)** — A feature inside the Spline editor for connecting scenes to external APIs (outbound calls from Spline, not inbound)

### What works today

The **code generation tools** work and are useful — they generate ready-to-use JavaScript, React, and Next.js code for the `@splinetool/runtime`:

- `getRuntimeSetup` — Setup instructions for the runtime package
- `generateComprehensiveExample` — Full working code examples
- `generateAnimationCode` — Animation code (rotate, move, scale, color with easing)
- `generateSceneInteractionCode` — Interaction patterns (explore, events, variables, camera, physics)
- `generateReactComponent` — React/TypeScript components
- `generateObjectCode` — Object interaction code
- `generateEventListenerCode` — Event listener code
- `exportSceneCode` — Export code in vanilla/React/Next.js formats
- `generateEmbedCode` — Iframe embed code
- `generateVariableCode` — Variable manipulation code

### What doesn't work yet

The remaining ~130 tools (object CRUD, materials, events, actions, design tools, etc.) call a REST API at `api.spline.design` that **does not exist**. These tools will fail with network errors if called. They represent the intended future architecture if Spline ever releases a public API.

## Installation

### Using npx (for Claude Desktop)

Add this to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "spline": {
      "command": "npx",
      "args": ["-y", "spline-mcp-server"]
    }
  }
}
```

### Local development

```bash
git clone https://github.com/aydinfer/spline-mcp-server.git
cd spline-mcp-server
npm install
npm start
```

## What you can do with it

Ask Claude to generate Spline runtime code for your projects:

- "Generate a React component that loads my Spline scene and adds click handlers to objects"
- "Write animation code that rotates an object on hover"
- "Create an interactive scene with variable-based state management"
- "Generate Next.js code with Spline integration"

Claude will use the code generation tools to produce working `@splinetool/runtime` code you can use directly in your web projects.

## Spline Runtime API Reference

The `@splinetool/runtime` provides these methods (which the code generation tools target):

| Method | Description |
|---|---|
| `findObjectByName(name)` | Find an object by name |
| `findObjectById(uuid)` | Find an object by ID |
| `getAllObjects()` | List all scene objects |
| `emitEvent(event, nameOrUuid)` | Trigger an event on an object |
| `addEventListener(event, cb)` | Listen for scene events |
| `setVariable(name, value)` | Set a scene variable |
| `getVariable(name)` | Get a scene variable |
| `setZoom(value)` | Control zoom level |
| `play()` / `stop()` | Control rendering |

Objects expose `position`, `rotation`, `scale`, `visible`, and `intensity` properties.

## Project Structure

```
spline-mcp-server/
├── src/
│   ├── tools/             # MCP tool implementations
│   │   └── design/        # Advanced design tools (pending API)
│   ├── utils/             # API client and runtime manager
│   ├── prompts/           # Prompt templates
│   ├── resources/         # MCP resources
│   └── index.js           # Main server entry point
├── bin/cli.js             # CLI entry point
├── docs/                  # Documentation
└── package.json
```

## Contributing

Contributions are welcome! Areas that would be especially valuable:

- **Browser automation approach** — Using Puppeteer/Playwright to control Spline scenes via the runtime API
- **Spline plugin/extension** — If Spline releases a plugin system or REST API
- **Improved code generation** — More templates and patterns for common use cases

Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
