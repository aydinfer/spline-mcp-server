#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Define the CLI options
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('mode', {
    alias: 'm',
    describe: 'Server mode to run',
    type: 'string',
    choices: ['mcp', 'webhook', 'minimal'],
    default: 'mcp'
  })
  .option('transport', {
    alias: 't',
    describe: 'Transport type for MCP mode',
    type: 'string',
    choices: ['stdio', 'http'],
    default: 'stdio'
  })
  .option('port', {
    alias: 'p',
    describe: 'Port for HTTP transport or webhook server',
    type: 'number',
    default: 3000
  })
  .option('config', {
    alias: 'c',
    describe: 'Path to config file',
    type: 'string',
    default: join(rootDir, 'config', '.env')
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Run with verbose logging',
    type: 'boolean',
    default: false
  })
  .example('$0 --mode webhook --port 3000', 'Run the webhook server on port 3000')
  .example('$0 --mode mcp --transport http --port 3000', 'Run the MCP server with HTTP transport on port 3000')
  .example('$0 --mode mcp --transport stdio', 'Run the MCP server with stdio transport (for Claude Desktop)')
  .help()
  .alias('help', 'h')
  .argv;

// Define script paths
const scriptPaths = {
  mcp: join(rootDir, 'src', 'index.js'),
  webhook: join(rootDir, 'simple-webhook-server.js'),
  minimal: join(rootDir, 'minimal.js')
};

// Build the command based on the mode
let command = '';
let args = [];

switch (argv.mode) {
  case 'mcp':
    command = 'node';
    args = [
      scriptPaths.mcp,
      '--transport', argv.transport,
      '--port', argv.port.toString(),
      '--config', argv.config
    ];
    if (argv.verbose) args.push('--verbose');
    break;
    
  case 'webhook':
    // Set PORT environment variable for the webhook server
    process.env.PORT = argv.port.toString();
    
    command = 'node';
    args = [scriptPaths.webhook];
    break;
    
  case 'minimal':
    command = 'node';
    args = [scriptPaths.minimal];
    break;
    
  default:
    console.error(`Unknown mode: ${argv.mode}`);
    process.exit(1);
}

// Log what we're about to do
console.log(`Starting Spline server in ${argv.mode} mode`);
if (argv.mode === 'mcp') {
  console.log(`Transport: ${argv.transport}`);
}
console.log(`Port: ${argv.port}`);
console.log(`Config: ${argv.config}`);
console.log(`Command: ${command} ${args.join(' ')}`);
console.log('');

// Check if the script exists
if (!fs.existsSync(args[0])) {
  console.error(`Error: Script not found at ${args[0]}`);
  process.exit(1);
}

try {
  // Execute the command
  execSync(`${command} ${args.join(' ')}`, { 
    stdio: 'inherit',
    env: { ...process.env }
  });
} catch (error) {
  console.error(`Error executing command: ${error.message}`);
  process.exit(1);
}
