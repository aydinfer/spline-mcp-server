#!/bin/bash

# This script tests if the server can be run successfully
# It simulates the process of installing and running via npx

# Set up test environment
echo "Setting up test environment..."
chmod +x ./bin/cli.js

# Test CLI directly
echo -e "\n\n===== Testing CLI execution directly ====="
node ./bin/cli.js --transport=stdio --verbose

# Test as if installed with NPM
echo -e "\n\n===== Testing execution as if installed with NPM ====="
export SPLINE_API_KEY="test_api_key_value"
./bin/cli.js --transport=stdio

# Test with environment variables
echo -e "\n\n===== Testing with environment variables ====="
unset SPLINE_API_KEY
export SPLINE_API_KEY="test_api_key_value_from_env"
./bin/cli.js --transport=stdio

echo -e "\n\nAll tests completed."
