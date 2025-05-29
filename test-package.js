#!/usr/bin/env node

/**
 * This script tests the package without actually publishing it to npm.
 * It verifies that all required files are correctly configured.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing package configuration for npx installation...');

// Check package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found!');
  process.exit(1);
}

// Parse package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verify required fields
const requiredFields = ['name', 'version', 'main', 'bin'];
for (const field of requiredFields) {
  if (!packageJson[field]) {
    console.error(`Error: Missing required field '${field}' in package.json`);
    process.exit(1);
  }
}

// Verify bin entry
if (!packageJson.bin || !packageJson.bin['spline-mcp']) {
  console.error('Error: Missing or incorrect bin entry in package.json');
  process.exit(1);
}

// Check that the binary file exists
const binPath = path.join(__dirname, packageJson.bin['spline-mcp']);
if (!fs.existsSync(binPath)) {
  console.error(`Error: Binary file not found at ${binPath}`);
  process.exit(1);
}

// Check file permissions
try {
  const stats = fs.statSync(binPath);
  const isExecutable = !!(stats.mode & 0o111);
  if (!isExecutable) {
    console.warn('Warning: Binary file is not executable. Adding executable permission...');
    fs.chmodSync(binPath, '755');
  }
} catch (error) {
  console.error('Error checking file permissions:', error);
  process.exit(1);
}

// Verify that environment variables are handled correctly
console.log('\nChecking environment variable handling...');
try {
  // Test CLI with test API key
  process.env.SPLINE_API_KEY = 'test_api_key_for_verification';
  
  // Try to execute the binary (will be interrupted)
  const result = execSync(`node ${binPath} --transport=stdio --test-mode`, { 
    timeout: 2000,
    env: { ...process.env, SPLINE_API_KEY: 'test_api_key_for_verification' }
  }).toString();
  
  if (result.includes('SPLINE_API_KEY is not set')) {
    console.error('Error: Environment variable SPLINE_API_KEY is not being correctly read');
    process.exit(1);
  }
} catch (error) {
  // This is expected as the server will start and not exit
  if (error.stdout && error.stdout.toString().includes('Spline.design MCP Server')) {
    console.log('Server started successfully with environment variables');
  } else {
    console.error('Error executing binary:', error);
    process.exit(1);
  }
}

console.log('\nAll checks passed! The package is correctly configured for npx installation.');
console.log('\nTo publish the package to npm, run:');
console.log('  npm login');
console.log('  npm publish');
