            <div>
                <label for="spline-webhook-url">Spline Webhook URL (Optional)</label>
                <input type="text" id="spline-webhook-url" placeholder="https://hooks.spline.design/yourID">
                <small>If provided, data will be forwarded to this Spline webhook</small>
            </div>#!/usr/bin/env node

/**
 * Super Simple Spline Webhook Server
 * No dependencies, just plain Node.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage for webhooks
const webhooks = [];

// Create a simple HTML page for the UI
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spline Webhook Manager</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2563eb;
        }
        .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        input, textarea, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #1d4ed8;
        }
        .webhook-item {
            background-color: #f9fafb;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        .webhook-url {
            background-color: #f3f4f6;
            padding: 8px;
            border-radius: 4px;
            word-break: break-all;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>Spline Webhook Manager</h1>
    
    <div class="card">
        <h2>Create a Webhook</h2>
        <form id="create-form">
            <div>
                <label for="webhook-name">Webhook Name</label>
                <input type="text" id="webhook-name" required>
            </div>
            
            <div id="variables-container">
                <h3>Variables</h3>
                <div>
                    <input type="text" placeholder="Variable name" class="variable-name">
                    <select class="variable-type">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </div>
            </div>
            
            <button type="button" id="add-variable">Add Variable</button>
            <button type="submit">Create Webhook</button>
        </form>
    </div>
    
    <div class="card">
        <h2>Your Webhooks</h2>
        <button id="refresh-btn">Refresh</button>
        <div id="webhook-list"></div>
    </div>
    
    <div class="card">
        <h2>Send Test Data</h2>
        <div>
            <label for="webhook-select">Select Webhook</label>
            <select id="webhook-select">
                <option value="">-- Select a webhook --</option>
            </select>
        </div>
        
        <div id="test-data-container" style="display: none;">
            <label for="test-data">JSON Data</label>
            <textarea id="test-data" rows="5"></textarea>
            <button id="send-data-btn">Send Data</button>
        </div>
    </div>
    
    <div class="card">
        <h2>Results</h2>
        <div id="result"></div>
    </div>
    
    <script>
        // Simple client-side JavaScript
        const createForm = document.getElementById('create-form');
        const webhookNameInput = document.getElementById('webhook-name');
        const variablesContainer = document.getElementById('variables-container');
        const addVariableBtn = document.getElementById('add-variable');
        const refreshBtn = document.getElementById('refresh-btn');
        const webhookList = document.getElementById('webhook-list');
        const webhookSelect = document.getElementById('webhook-select');
        const testDataContainer = document.getElementById('test-data-container');
        const testDataInput = document.getElementById('test-data');
        const sendDataBtn = document.getElementById('send-data-btn');
        const resultDiv = document.getElementById('result');
        
        // Event listeners
        createForm.addEventListener('submit', createWebhook);
        addVariableBtn.addEventListener('click', addVariable);
        refreshBtn.addEventListener('click', fetchWebhooks);
        webhookSelect.addEventListener('change', () => {
            testDataContainer.style.display = webhookSelect.value ? 'block' : 'none';
        });
        sendDataBtn.addEventListener('click', sendTestData);
        
        // Fetch webhooks on load
        fetchWebhooks();
        
        function addVariable() {
            const div = document.createElement('div');
            div.innerHTML = \`
                <input type="text" placeholder="Variable name" class="variable-name">
                <select class="variable-type">
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                </select>
            \`;
            variablesContainer.appendChild(div);
        }
        
        async function createWebhook(e) {
            e.preventDefault();
            
            const name = webhookNameInput.value;
            if (!name) return;
            
            const variables = [];
            const varInputs = variablesContainer.querySelectorAll('.variable-name');
            const varTypes = variablesContainer.querySelectorAll('.variable-type');
            
            for (let i = 0; i < varInputs.length; i++) {
                if (varInputs[i].value) {
                    variables.push({
                        name: varInputs[i].value,
                        type: varTypes[i].value
                    });
                }
            }
            
            try {
                const response = await fetch('/create-webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, variables })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = \`<p>Webhook created: <strong>\${data.webhook.name}</strong></p>
                                          <p>URL: <code>\${data.webhookUrl}</code></p>\`;
                    webhookNameInput.value = '';
                    fetchWebhooks();
                } else {
                    resultDiv.innerHTML = \`<p>Error: \${data.error}</p>\`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
            }
        }
        
        async function fetchWebhooks() {
            try {
                const response = await fetch('/webhooks');
                const data = await response.json();
                
                if (data.success) {
                    updateWebhookList(data.webhooks);
                    updateWebhookSelect(data.webhooks);
                }
            } catch (error) {
                resultDiv.innerHTML = \`<p>Error fetching webhooks: \${error.message}</p>\`;
            }
        }
        
        function updateWebhookList(webhooks) {
            webhookList.innerHTML = '';
            
            if (webhooks.length === 0) {
                webhookList.innerHTML = '<p>No webhooks found.</p>';
                return;
            }
            
            webhooks.forEach(webhook => {
                const item = document.createElement('div');
                item.className = 'webhook-item';
                
                let variablesHtml = '';
                if (webhook.variables && webhook.variables.length > 0) {
                    variablesHtml = '<ul>';
                    webhook.variables.forEach(v => {
                        variablesHtml += \`<li>\${v.name} (\${v.type})</li>\`;
                    });
                    variablesHtml += '</ul>';
                }
                
                item.innerHTML = \`
                    <h3>\${webhook.name}</h3>
                    <div class="webhook-url">\${webhook.fullUrl}</div>
                    <p>Created: \${new Date(webhook.createdAt).toLocaleString()}</p>
                    <div>\${variablesHtml}</div>
                \`;
                
                webhookList.appendChild(item);
            });
        }
        
        function updateWebhookSelect(webhooks) {
            webhookSelect.innerHTML = '<option value="">-- Select a webhook --</option>';
            
            webhooks.forEach(webhook => {
                const option = document.createElement('option');
                option.value = webhook.id;
                option.textContent = webhook.name;
                option.dataset.url = webhook.fullUrl;
                webhookSelect.appendChild(option);
            });
        }
        
        async function sendTestData() {
            if (!webhookSelect.value) return;
            
            let data;
            try {
                data = JSON.parse(testDataInput.value);
            } catch (error) {
                resultDiv.innerHTML = '<p>Invalid JSON data</p>';
                return;
            }
            
            const option = webhookSelect.options[webhookSelect.selectedIndex];
            const webhookUrl = option.dataset.url;
            
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: testDataInput.value
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = '<p>Data sent successfully!</p>';
                } else {
                    resultDiv.innerHTML = \`<p>Error: \${result.error}</p>\`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
            }
        }
    </script>
</body>
</html>
`;

// Create the server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = req.url;
  
  // Serve the main page
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlPage);
    return;
  }
  
  // Create a webhook
  if (url === '/create-webhook' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const webhookId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        
        const webhook = {
          id: webhookId,
          name: data.name || `Webhook ${webhookId}`,
          variables: data.variables || [],
          createdAt: new Date().toISOString(),
          url: `/webhook/${webhookId}`,
          splineWebhookUrl: data.splineWebhookUrl || null
        };
        
        webhooks.push(webhook);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          webhook,
          webhookUrl: `${getServerUrl(req)}${webhook.url}`
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }
  
  // List webhooks
  if (url === '/webhooks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      webhooks: webhooks.map(webhook => ({
        ...webhook,
        fullUrl: `${getServerUrl(req)}${webhook.url}`
      }))
    }));
    return;
  }
  
  // Handle webhook data
  if (url.startsWith('/webhook/') && req.method === 'POST') {
    const webhookId = url.replace('/webhook/', '');
    const webhook = webhooks.find(wh => wh.id === webhookId);
    
    if (!webhook) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Webhook not found' }));
      return;
    }
    
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        console.log(`Webhook ${webhook.name} (${webhook.id}) received data:`); 
        console.log(JSON.stringify(data, null, 2));

        // Check if this is a Spline webhook that needs forwarding
        if (webhook.splineWebhookUrl) {
          console.log(`Forwarding data to Spline webhook: ${webhook.splineWebhookUrl}`);
          try {
            // Forward the data to Spline
            const splineResponse = await fetch(webhook.splineWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const splineResult = await splineResponse.text();
            console.log(`Spline webhook response: ${splineResult}`);
          } catch (forwardError) {
            console.error(`Error forwarding to Spline: ${forwardError.message}`);
          }
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Data received successfully',
          webhook: webhook.name,
          receivedData: data
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }
  
  // Handle 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Helper function to get the server URL
function getServerUrl(req) {
  const protocol = req.socket.encrypted ? 'https' : 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
}

// Start the server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Super Simple Spline Webhook Server`);
  console.log(`===================================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to use the webhook manager`);
  console.log(`---------------------------------------------------`);
  console.log(`This standalone server has no external dependencies`);
  console.log(`and can be used with Spline.design to create webhooks for`);
  console.log(`real-time data visualizations.`);
  console.log(`===================================================`);
});
