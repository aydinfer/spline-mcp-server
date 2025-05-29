# Spline.design Integration Server

This server provides comprehensive integration with Spline.design 3D scenes through multiple modes:

1. **MCP Server** - Full Model Context Protocol integration for Claude Desktop
2. **Webhook Server** - Standalone webhook support for data-driven visualizations
3. **Minimal Server** - Lightweight option with essential functionality

## Features

- **Comprehensive 3D Object Management**
  - Create, modify, and delete any 3D object
  - Control positioning, rotation, scaling, and visibility
  - Generate runtime code for object interactions

- **Runtime API Integration**
  - Direct integration with `@splinetool/runtime` for programmatic control
  - Generate ready-to-use JavaScript, React, and Next.js code
  - Create interactive animations and behaviors
  - Implement custom event handling and scene manipulation

- **Advanced Material System**
  - Create layered materials with extensive customization
  - Support for all Spline material types and properties
  - Configure complex shading options

- **Complete Event & Action System**
  - Support for 20+ event types (mouse, keyboard, physics, etc.)
  - Implementation of 15+ action types
  - Create complex event chains and conditional logic

- **Webhook Integration**
  - Create webhooks to receive external data
  - Build real-time data visualizations
  - Connect with services like Zapier, IFTTT, n8n, or custom APIs

## Installation

### Option 1: Install and run locally

```bash
# Clone the repository
git clone https://github.com/yourusername/spline-mcp-server.git
cd spline-mcp-server

# Install dependencies
npm install

# Configure environment variables
cp config/.env.example .env

# Start the server in MCP mode (for Claude Desktop)
npm start
```

### Option 2: Run different server modes

```bash
# Start in MCP mode (default)
node bin/cli.js --mode mcp

# Start in webhook mode
node bin/cli.js --mode webhook

# Start in minimal mode
node bin/cli.js --mode minimal
```

## Command-Line Options

The server supports various command-line options through the unified CLI:

```bash
# Get help
node bin/cli.js --help

# MCP mode with HTTP transport
node bin/cli.js --mode mcp --transport http --port 3000

# MCP mode with stdio transport (for Claude Desktop)
node bin/cli.js --mode mcp --transport stdio

# Webhook server mode
node bin/cli.js --mode webhook --port 3000
```

## Project Structure

```
spline-mcp-server/
├── bin/                   # Executable scripts
│   └── cli.js             # Unified CLI entry point
├── config/                # Configuration files
│   ├── .env.example       # Environment variables template
│   └── *.json             # JSON configuration files
├── docs/                  # Documentation
│   ├── INSTALLATION.md    # Installation guide
│   ├── USAGE_GUIDE.md     # Usage instructions
│   └── WEBHOOK_GUIDE.md   # Webhook specific guide
├── examples/              # Example usage patterns
├── package-templates/     # Package.json templates for different modes
├── public/                # Web assets
│   └── webhook-ui.html    # Webhook UI interface
├── scripts/               # Shell scripts
│   ├── install.sh         # Installation script
│   └── test-*.sh          # Testing scripts
├── src/                   # Source code
│   ├── prompts/           # Prompt templates
│   ├── resources/         # MCP resources
│   ├── tools/             # MCP tools
│   ├── utils/             # Utility functions
│   └── index.js           # Main MCP entry point
├── minimal.js             # Minimal server implementation
├── simple-webhook-server.js # Standalone webhook server
├── LICENSE                # License file
├── README.md              # Project readme
└── package.json           # Unified package file
```

## Using with Claude Desktop

This server is designed to work with Claude Desktop in MCP mode:

1. Start the server in MCP mode with stdio transport:
   ```bash
   node bin/cli.js --mode mcp --transport stdio
   ```

2. In Claude Desktop, access the MCP connection settings
3. Connect to the server
4. Start interacting with Spline.design through Claude

## Using Webhook Mode

The webhook server provides a simple web interface for creating and testing webhooks:

1. Start the server in webhook mode:
   ```bash
   node bin/cli.js --mode webhook
   ```

2. Open the web interface at http://localhost:3000
3. Create a webhook and obtain its URL
4. In Spline.design, configure the webhook in the Variables & Data Panel
5. Send test data to see your scene update in real-time

## Examples

See the `examples/` directory for sample usage patterns and common workflows.

## Documentation

For detailed documentation, see the files in the `docs/` directory:

- [Installation Guide](docs/INSTALLATION.md)
- [Usage Guide](docs/USAGE_GUIDE.md)
- [Webhook Guide](docs/WEBHOOK_GUIDE.md)
- [Testing Guide](docs/TEST_CASES.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
