# Installing Spline.design MCP Server

This guide explains how to install and configure the Spline.design MCP Server for use with Claude Desktop or other MCP clients.

## Option 1: Easy Installation with npx (Recommended)

The easiest way to install and use the server is with npx:

```json
{
  "mcpServers": {
    "spline": {
      "command": "npx",
      "args": [
        "-y",
        "spline-mcp-server"
      ],
      "env": {
        "SPLINE_API_KEY": "YOUR_SPLINE_API_KEY_HERE"
      }
    }
  }
}
```

Simply add this to your Claude Desktop configuration, and it will automatically install and run the server when needed.

## Option 2: Global Installation

You can also install the server globally:

```bash
npm install -g spline-mcp-server
```

Then configure Claude Desktop to use the globally installed version:

```json
{
  "mcpServers": {
    "spline": {
      "command": "spline-mcp",
      "args": [],
      "env": {
        "SPLINE_API_KEY": "YOUR_SPLINE_API_KEY_HERE"
      }
    }
  }
}
```

## Option 3: Manual Installation

For development or customization:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spline-mcp-server.git
   cd spline-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with your API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Run the server:
   ```bash
   npm start
   ```

## API Keys

The server requires a Spline.design API key to function. You can get an API key by:

1. Creating an account at [spline.design](https://spline.design)
2. Navigating to your account settings
3. Generating an API key

Then make the key available to the server through one of these methods:

- Environment variable: `export SPLINE_API_KEY=your_key_here`
- .env file in the current directory
- Configuration in Claude Desktop as shown above

## Testing Your Installation

To verify your installation is working correctly, run:

```bash
spline-mcp --verbose
```

You should see the server start up successfully.

## Configuration Options

The server accepts these command-line options:

- `--transport=stdio|http`: Transport type (default: stdio)
- `--port=3000`: Port for HTTP transport
- `--config=/path/to/config.env`: Path to a custom config file
- `--verbose`: Enable verbose logging

For example:
```bash
spline-mcp --transport=http --port=8080 --verbose
```

## Using with Claude Desktop

1. Ensure the server is running or configured to run with npx
2. In Claude Desktop, use the server in your conversations
3. Claude will automatically connect to the server and use its tools

For more information, refer to the [main README](README.md).
