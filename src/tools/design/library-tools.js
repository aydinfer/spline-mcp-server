/**
 * 3D Library Tools for Spline.design
 * 
 * Tools for browsing, importing, and managing 3D assets from the Spline library.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register 3D library tools
 * @param {McpServer} server - The MCP server instance
 */
export function register3DLibraryTools(server) {
  server.tool(
    "browseLibrary",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      category: z.enum([
        "3d-models", "materials", "textures", "hdris", 
        "templates", "components", "effects"
      ]).describe("Library category"),
      query: z.string().optional().describe("Search query"),
      tags: z.array(z.string()).optional().describe("Filter by tags"),
      page: z.number().int().min(1).default(1).describe("Page number"),
      pageSize: z.number().int().min(1).max(50).default(20).describe("Items per page"),
    },
    async ({ sceneId, category, query, tags, page, pageSize }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/library/${category}`, {
          method: "GET",
          query: {
            q: query,
            tags: tags?.join(','),
            page,
            pageSize,
          },
        });

        return {
          content: [{
            type: "text",
            text: `Found ${result.total} ${category} items in the library.`,
          }, {
            type: "json",
            json: result.items,
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error browsing library: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "importFromLibrary",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      itemId: z.string().min(1).describe("Library item ID"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      scale: z.number().positive().default(1).describe("Scale factor"),
    },
    async ({ sceneId, itemId, position, scale }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/library/import`, {
          method: "POST",
          body: JSON.stringify({
            itemId,
            position,
            scale,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Imported library item (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error importing from library: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Additional library tools to be implemented...
}
