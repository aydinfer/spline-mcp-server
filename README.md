# Spline.design MCP Server (Archived)

> **This project is archived.** Spline.design does not provide a public REST API, making most of this server's functionality non-operational. See below for details.

## Why archived

This MCP server was built to programmatically control Spline.design 3D scenes through Claude. However, **Spline does not offer a public REST API** for scene manipulation. The ~130 tools that call `api.spline.design` target endpoints that don't exist and will fail with network errors.

Spline's actual developer tools are:

- **[Code API](https://docs.spline.design/exporting-your-scene/web/code-api-for-web)** — A client-side JavaScript runtime (`@splinetool/runtime`) that only works in a browser with a canvas element. It can manipulate objects in exported scenes but cannot create scenes or objects.
- **[Real-time API](https://docs.spline.design/interaction-states-events-and-actions/real-time-api)** — A feature inside the Spline editor for making outbound API calls from Spline to external services. Not an inbound API.

Neither of these enables the kind of server-side programmatic control this MCP server attempts.

### What does work

10 **code generation tools** generate `@splinetool/runtime` code for Vanilla JS, React, and Next.js. However, Claude can already write this code without an MCP server, making these tools redundant.

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

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
