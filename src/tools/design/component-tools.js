/**
 * Component Tools for Spline.design
 * 
 * Tools for creating and managing reusable components.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register component tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerComponentTools(server) {
  server.tool(
    "createComponent",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      name: z.string().min(1).describe("Component name"),
      objectIds: z.array(z.string().min(1)).min(1).describe("Object IDs to include in component"),
      description: z.string().optional().describe("Component description"),
      tags: z.array(z.string()).optional().describe("Component tags"),
      icon: z.string().optional().describe("Component icon URL"),
    },
    async ({ sceneId, name, objectIds, description, tags, icon }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/components`, {
          method: "POST",
          body: JSON.stringify({
            name,
            objectIds,
            description,
            tags,
            icon,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created component "${name}" (ID: ${result.componentId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating component: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "instantiateComponent",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      componentId: z.string().min(1).describe("Component ID"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      scale: z.number().positive().default(1).describe("Scale factor"),
    },
    async ({ sceneId, componentId, position, scale }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/components/${componentId}/instances`, {
          method: "POST",
          body: JSON.stringify({
            position,
            scale,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Instantiated component (Instance ID: ${result.instanceId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error instantiating component: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateComponentInstance",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      instanceId: z.string().min(1).describe("Component instance ID"),
      overrides: z.record(z.any()).describe("Property overrides for this instance"),
    },
    async ({ sceneId, instanceId, overrides }) => {
      try {
        await updateSplineObject(sceneId, instanceId, { 
          overrides,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated component instance ${instanceId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating component instance: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Additional component tools to be implemented...
}
