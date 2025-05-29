# Spline Webhook Server

This is a simple webhook server designed to work with Spline.design for creating interactive 3D experiences with real-time data updates.

## Getting Started

1. Copy the simple package.json to package.json:
   ```bash
   cp simple-package.json package.json
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open the web interface:
   ```
   http://localhost:3000/
   ```

## How to Use

### 1. Create a Webhook

1. In the web interface, fill out the "Create a Webhook" form
2. Give your webhook a name
3. Add variables that will be updated when data is received
4. Click "Create Webhook"

### 2. Set Up Your Spline Scene

1. Open Spline.design
2. Create a new scene or open an existing one
3. Create variables that match the names of the webhook variables
4. Go to the Variables & Data Panel
5. Click on the Webhooks tab
6. Click on New Webhook
7. Copy the webhook URL from our server
8. Map the webhook data to your scene variables

### 3. Test the Webhook

1. In the web interface, select your webhook from the dropdown
2. Enter JSON data to send (should match the variable names you defined)
3. Click "Send Data"
4. Watch your Spline scene update in real-time!

## Example Workflow

### Weather Visualization

1. Create a webhook with variables: `temperature`, `humidity`, `windSpeed`
2. In Spline, create objects that visualize these variables:
   - A thermometer that scales based on temperature
   - A water drop that changes opacity based on humidity
   - A windmill that rotates based on wind speed
3. Create variables in Spline with the same names
4. Set up the webhook in Spline and map the variables
5. Send test data through the webhook server

### API Integration

You can connect this webhook server to external APIs using tools like Zapier, IFTTT, or custom code:

1. Create a webhook with relevant variables
2. Set up an automation in Zapier/IFTTT that:
   - Triggers when new data is available from an API
   - Formats the data to match your webhook variables
   - Sends the data to your webhook URL
3. Your Spline scene will automatically update when new data arrives

## Programmatic Usage

You can also interact with the webhook server programmatically:

### Create a Webhook

```javascript
fetch('http://localhost:3000/create-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'API Webhook',
    variables: [
      { name: 'value', type: 'number' },
      { name: 'status', type: 'string' }
    ]
  })
}).then(r => r.json()).then(console.log);
```

### List Webhooks

```javascript
fetch('http://localhost:3000/webhooks')
  .then(r => r.json())
  .then(console.log);
```

### Send Data to a Webhook

```javascript
fetch('http://localhost:3000/webhook/YOUR_WEBHOOK_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 42,
    status: 'active'
  })
}).then(r => r.json()).then(console.log);
```

## Documentation on Spline Webhooks

For more detailed information on how to use webhooks in Spline, refer to the Spline documentation:

- Navigate to the Variables & Data Panel
- Select the Webhooks tab
- Webhooks allow your scene to receive data from external systems

In Spline, you can:
1. Define variables that will be updated by webhook data
2. Create Variable Change Events to trigger actions when data is received
3. Build complex visualizations that respond to real-time data

## Troubleshooting

- **CORS Issues**: This server has CORS enabled, but if you're hosting it on a different domain, you may need to configure CORS settings
- **JSON Format**: Make sure your data is properly formatted as JSON
- **Variable Names**: Variable names must match exactly between the webhook and Spline
- **Connection Issues**: Ensure Spline can reach the webhook server (may require public hosting if using Spline online)

## Next Steps

- Host the webhook server online for public access
- Add authentication to secure your webhooks
- Implement data validation and transformation
- Create a library of example Spline scenes that use webhooks
