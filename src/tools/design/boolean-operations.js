/**
 * Boolean Operation Tools for Spline.design
 * 
 * Tools for performing boolean operations (union, subtract, intersect) on 3D objects.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register boolean operation tools (union, subtract, intersect)
 * @param {McpServer} server - The MCP server instance
 */
export function registerBooleanOperationTools(server) {
  server.tool(
    "createBooleanOperation",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      operation: z.enum(["union", "subtract", "intersect"]).describe("Boolean operation type"),
      targetObjectId: z.string().min(1).describe("Target object ID"),
      sourceObjectIds: z.array(z.string().min(1)).min(1).describe("Source object IDs to apply the operation with"),
      createNewObject: z.boolean().default(true).describe("Whether to create a new object or modify the target"),
      keepOriginals: z.boolean().default(false).describe("Whether to keep original objects"),
    },
    async ({ sceneId, operation, targetObjectId, sourceObjectIds, createNewObject, keepOriginals }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/boolean`, {
          method: "POST",
          body: JSON.stringify({
            operation,
            targetObjectId,
            sourceObjectIds,
            createNewObject,
            keepOriginals,
          }),
        });

        return {
          content: [{
            type: "text",
            text: createNewObject 
              ? `Created new object (ID: ${result.objectId}) from boolean ${operation}`
              : `Applied boolean ${operation} to object ${targetObjectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error performing boolean operation: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}