#!/usr/bin/env node

// Import and run the main server from src/index.js
import { main } from './src/index.js';

main().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});