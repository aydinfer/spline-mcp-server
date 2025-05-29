// Simple Spline Webhook Server without MCP dependencies
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage for webhooks (in a real implementation, this would be a database)
const webhooks = [];

// Simple server to handle webhook requests
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Extract the path
  const urlPath = req.url;
  
  // Create a webhook
  if (urlPath === '/create-webhook' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const webhookData = JSON.parse(body);
        const webhookId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        
        const newWebhook = {
          id: webhookId,
          name: webhookData.name || `Webhook ${webhookId}`,
          variables: webhookData.variables || [],
          createdAt: new Date().toISOString(),
          url: `/webhook/${webhookId}`
        };
        
        webhooks.push(newWebhook);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          webhook: newWebhook,
          webhookUrl: `${getServerUrl(req)}/webhook/${webhookId}`
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }
  
  // List webhooks
  if (urlPath === '/webhooks' && req.method === 'GET') {
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
  
  // Receive data through a webhook
  if (urlPath.startsWith('/webhook/') && req.method === 'POST') {
    const webhookId = urlPath.replace('/webhook/', '');
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
        
        // In a real implementation, this would update variables in Spline
        // For now, we just log the data
        
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
  
  // Serve the web interface
  if (urlPath === '/' || urlPath === '/index.html') {
    fs.readFile(path.join(__dirname, 'public/webhook-ui.html'), 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading interface');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
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
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Spline Webhook Server running on http://localhost:${PORT}`);
  console.log(`Create a webhook: POST to http://localhost:${PORT}/create-webhook`);
  console.log(`List webhooks: GET http://localhost:${PORT}/webhooks`);
  console.log(`Send data to a webhook: POST to http://localhost:${PORT}/webhook/:id`);
  console.log(`Web interface available at http://localhost:${PORT}/`);
});
