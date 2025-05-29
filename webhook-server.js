import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a new MCP server
const server = new McpServer({
  name: "Spline.design Webhook MCP",
  version: "1.0.0",
  description: "Webhook integration for Spline.design"
});

// Tool to list and manage available webhooks
server.tool(
  "getWebhooks",
  {
    sceneId: z.string().min(1).describe("Scene ID"),
  },
  async ({ sceneId }) => {
    // In a real implementation, this would fetch webhooks from Spline's API
    // For now, we'll return a mock response
    const mockWebhooks = [
      {
        id: "webhook1",
        name: "Data Update Webhook",
        url: `https://hooks.spline.design/${sceneId}/webhook1`,
        variables: ["temperature", "humidity", "pressure"]
      },
      {
        id: "webhook2",
        name: "User Interaction Webhook",
        url: `https://hooks.spline.design/${sceneId}/webhook2`,
        variables: ["userId", "actionType", "timestamp"]
      }
    ];
    
    return {
      content: [{ 
        type: "text", 
        text: `Available webhooks for scene ${sceneId}:\n\n${JSON.stringify(mockWebhooks, null, 2)}`
      }]
    };
  }
);

// Tool to create a new webhook
server.tool(
  "createWebhook",
  {
    sceneId: z.string().min(1).describe("Scene ID"),
    name: z.string().min(1).describe("Webhook name"),
    variables: z.array(z.object({
      name: z.string().min(1).describe("Variable name"),
      type: z.enum(["string", "number", "boolean"]).describe("Variable type")
    })).min(1).describe("Variables to capture from webhook data")
  },
  async ({ sceneId, name, variables }) => {
    // In a real implementation, this would create a webhook via Spline's API
    // For now, we'll return a mock response with a generated URL
    const webhookId = Math.random().toString(36).substring(2, 10);
    const webhookUrl = `https://hooks.spline.design/${sceneId}/${webhookId}`;
    
    return {
      content: [{ 
        type: "text", 
        text: `Webhook "${name}" created successfully!\n\nWebhook URL: ${webhookUrl}\n\nUse this URL in your external systems to send data to Spline. Data sent to this webhook will update the following variables: ${variables.map(v => v.name).join(", ")}`
      }]
    };
  }
);

// Tool to simulate sending data to a webhook
server.tool(
  "sendWebhookData",
  {
    webhookUrl: z.string().url().describe("Webhook URL"),
    data: z.record(z.any()).describe("Data to send to the webhook")
  },
  async ({ webhookUrl, data }) => {
    // In a real implementation, this would send an HTTP request to the webhook URL
    // For now, we'll simulate the process
    
    try {
      // Simulate webhook processing
      console.log(`Simulating webhook call to: ${webhookUrl}`);
      console.log(`Data: ${JSON.stringify(data)}`);
      
      return {
        content: [{ 
          type: "text", 
          text: `Data sent successfully to webhook: ${webhookUrl}\n\nData:\n${JSON.stringify(data, null, 2)}\n\nThis would update the corresponding variables in your Spline scene.`
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error sending data to webhook: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool to setup a webhook integration with a common service
server.tool(
  "setupServiceWebhook",
  {
    sceneId: z.string().min(1).describe("Scene ID"),
    service: z.enum([
      "zapier", 
      "ifttt", 
      "n8n",
      "make",
      "custom"
    ]).describe("Service to integrate with"),
    eventType: z.string().min(1).describe("Type of event to listen for"),
    mappings: z.array(z.object({
      serviceField: z.string().min(1).describe("Field from the service"),
      splineVariable: z.string().min(1).describe("Spline variable to update")
    })).min(1).describe("Data mappings")
  },
  async ({ sceneId, service, eventType, mappings }) => {
    // In a real implementation, this would create a proper webhook integration
    // For now, we'll return instructions
    
    const webhookId = Math.random().toString(36).substring(2, 10);
    const webhookUrl = `https://hooks.spline.design/${sceneId}/${webhookId}`;
    
    let instructions = "";
    
    if (service === "zapier") {
      instructions = `
# Zapier Integration Instructions

1. **Create a new Zap** in Zapier
2. Choose a **Trigger** corresponding to your event type: "${eventType}"
3. For the **Action**, select "Webhooks by Zapier" and choose "POST"
4. Enter this **Webhook URL**: ${webhookUrl}
5. Configure the **Data** to be sent with these mappings:
${mappings.map(m => `   - Map Zapier field "${m.serviceField}" to payload key "${m.splineVariable}"`).join('\n')}
6. **Test** your Zap to verify it's working
7. **Turn on** your Zap
`;
    } else if (service === "ifttt") {
      instructions = `
# IFTTT Integration Instructions

1. **Create a new Applet** in IFTTT
2. Choose a "This" trigger for your event type: "${eventType}"
3. For "That", select the "Webhooks" service
4. Choose the "Make a web request" action
5. Enter this **URL**: ${webhookUrl}
6. Set **Method** to POST
7. Set **Content Type** to application/json
8. Set **Body** to:
\`\`\`json
{
${mappings.map(m => `  "${m.splineVariable}": "{{${m.serviceField}}}""`).join(',\n')}
}
\`\`\`
9. **Create** the Applet
`;
    } else if (service === "n8n") {
      instructions = `
# n8n Integration Instructions

1. **Add an HTTP Request node** to your workflow
2. Set **Method** to POST
3. Enter this **URL**: ${webhookUrl}
4. Set **Content Type** to application/json
5. Configure **JSON Body** with these mappings:
\`\`\`json
{
${mappings.map(m => `  "${m.splineVariable}": "={{$node[\"Previous Node\"].data.${m.serviceField}}}""`).join(',\n')}
}
\`\`\`
6. **Connect** this node to your trigger node
7. **Save** and **activate** your workflow
`;
    } else if (service === "make") {
      instructions = `
# Make.com (Integromat) Integration Instructions

1. **Create a new scenario** in Make.com
2. Add a module for your event type: "${eventType}"
3. Add an **HTTP** module
4. Set **URL** to: ${webhookUrl}
5. Set **Method** to POST
6. In the **Body** section, map these fields:
${mappings.map(m => `   - Map "${m.serviceField}" to "${m.splineVariable}"`).join('\n')}
7. **Save** and **run** your scenario
`;
    } else {
      instructions = `
# Custom Webhook Integration Instructions

Your webhook has been created. Send POST requests to:

**Webhook URL**: ${webhookUrl}

**Expected JSON payload format**:
\`\`\`json
{
${mappings.map(m => `  "${m.splineVariable}": "Value from ${m.serviceField}"`).join(',\n')}
}
\`\`\`

This will update the variables in your Spline scene in real-time.
`;
    }
    
    return {
      content: [{ 
        type: "text", 
        text: `Webhook for ${service} integration created successfully!\n\n${instructions}`
      }]
    };
  }
);

// Resource to view webhook documentation
server.resource(
  "webhook-docs",
  "spline://webhook-docs",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# Spline Webhook Documentation

## What are Webhooks?

Webhooks in Spline allow your 3D scenes to receive real-time data from external systems. They act as "listeners" that wait for incoming data and then update your scene accordingly.

## How Webhooks Work in Spline

1. **Create a webhook** in Spline with specified variables
2. Spline generates a **unique URL** for your webhook
3. **Configure external systems** to send data to this URL
4. When data is received, Spline **updates the variables** in your scene
5. Your scene can react to these changes via **Variable Change Events**

## Common Use Cases

- Real-time data visualizations
- IoT device integration
- User interaction tracking
- Multi-user experiences
- Live updates from databases or APIs

## Working with Webhooks

Use the \`createWebhook\` tool to create a new webhook, then set up your external system to send data to the generated URL. The data should be a JSON object with keys matching your defined variables.

## Examples

- Weather data visualization (temperature, humidity)
- Stock market trackers
- Social media engagement metrics
- Live sports scores
- IoT sensor readings
- Multi-user collaborative environments
`
    }]
  })
);

// Add a webhook prompt
server.prompt(
  "setup-data-visualization",
  {
    sceneId: z.string().min(1).describe("Scene ID"),
    dataType: z.enum([
      "weather", 
      "stocks", 
      "social", 
      "sports", 
      "iot", 
      "custom"
    ]).describe("Type of data to visualize"),
    visualizationStyle: z.enum([
      "bars", 
      "colors", 
      "movement", 
      "size", 
      "particles"
    ]).default("bars").describe("How to visualize the data")
  },
  ({ sceneId, dataType, visualizationStyle }) => {
    let dataFields = [];
    let description = "";
    
    switch (dataType) {
      case "weather":
        dataFields = ["temperature", "humidity", "pressure", "windSpeed"];
        description = "real-time weather data visualization";
        break;
      case "stocks":
        dataFields = ["price", "change", "volume", "volatility"];
        description = "stock market data visualization";
        break;
      case "social":
        dataFields = ["likes", "shares", "comments", "reach"];
        description = "social media metrics visualization";
        break;
      case "sports":
        dataFields = ["score", "timeRemaining", "possession", "playerStats"];
        description = "live sports data visualization";
        break;
      case "iot":
        dataFields = ["sensorValue", "batteryLevel", "status", "timestamp"];
        description = "IoT sensor data visualization";
        break;
      case "custom":
        dataFields = ["value1", "value2", "value3", "value4"];
        description = "custom data visualization";
        break;
    }
    
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `I want to create a ${description} in my Spline scene (ID: ${sceneId}) that updates in real-time through webhooks. The visualization should use ${visualizationStyle} to represent the data.

Please help me:
1. Create a webhook that captures these data fields: ${dataFields.join(", ")}
2. Set up the appropriate 3D objects in my scene to visualize this data
3. Create the necessary variable mappings
4. Configure the Variable Change Events to update the visualization

After setting this up, I want to be able to send data to the webhook URL and see my visualization update in real-time.`
        }
      }]
    };
  }
);

// Create a stdio transport
const transport = new StdioServerTransport();

// Connect the server to the transport
console.log("Starting Spline.design Webhook MCP Server...");
server.connect(transport).then(() => {
  console.log("Server is running and ready to process webhook requests.");
}).catch(error => {
  console.error("Error connecting server:", error);
});
