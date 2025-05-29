/**
 * Version History Tools for Spline.design
 * 
 * Tools for managing version history and snapshots of Spline scenes.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register version history tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerVersionHistoryTools(server) {
  server.tool(
    "createSnapshot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      name: z.string().optional().describe("Snapshot name"),
      description: z.string().optional().describe("Snapshot description"),
      tags: z.array(z.string()).optional().describe("Snapshot tags"),
    },
    async ({ sceneId, name, description, tags }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/snapshots`, {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            tags,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created snapshot "${name || 'Unnamed'}" (ID: ${result.snapshotId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating snapshot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "listSnapshots",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      page: z.number().int().min(1).default(1).describe("Page number"),
      pageSize: z.number().int().min(1).max(100).default(20).describe("Snapshots per page"),
      tags: z.array(z.string()).optional().describe("Filter by tags"),
    },
    async ({ sceneId, page, pageSize, tags }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/snapshots`, {
          method: "GET",
          query: {
            page,
            pageSize,
            tags: tags?.join(','),
          },
        });

        return {
          content: [{
            type: "text",
            text: `Found ${result.total} snapshots for scene ${sceneId}`,
          }, {
            type: "json",
            json: result.items,
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error listing snapshots: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "restoreSnapshot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      snapshotId: z.string().min(1).describe("Snapshot ID"),
      createBackup: z.boolean().default(true).describe("Create backup of current state before restoring"),
    },
    async ({ sceneId, snapshotId, createBackup }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/snapshots/${snapshotId}/restore`, {
          method: "POST",
          body: JSON.stringify({
            createBackup,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Restored snapshot ${snapshotId}${createBackup ? ' with backup of current state' : ''}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error restoring snapshot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "compareSnapshots",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      snapshotAId: z.string().min(1).describe("First snapshot ID"),
      snapshotBId: z.string().min(1).describe("Second snapshot ID"),
    },
    async ({ sceneId, snapshotAId, snapshotBId }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/snapshots/compare`, {
          method: "POST",
          body: JSON.stringify({
            snapshotAId,
            snapshotBId,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Snapshot comparison results:`
          }, {
            type: "json",
            json: result.differences,
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error comparing snapshots: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "mergeSnapshot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      snapshotId: z.string().min(1).describe("Snapshot ID to merge into current scene"),
      mergeStrategy: z.enum(["overwrite", "additive", "selective"]).default("selective")
        .describe("Merge strategy"),
      objectIdsToMerge: z.array(z.string()).optional()
        .describe("Object IDs to merge (for selective strategy)"),
      stateIdsToMerge: z.array(z.string()).optional()
        .describe("State IDs to merge (for selective strategy)"),
      eventIdsToMerge: z.array(z.string()).optional()
        .describe("Event IDs to merge (for selective strategy)"),
      createBackup: z.boolean().default(true).describe("Create backup of current state before merging"),
    },
    async ({ sceneId, snapshotId, mergeStrategy, objectIdsToMerge, stateIdsToMerge, eventIdsToMerge, createBackup }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/snapshots/${snapshotId}/merge`, {
          method: "POST",
          body: JSON.stringify({
            mergeStrategy,
            objectIdsToMerge,
            stateIdsToMerge,
            eventIdsToMerge,
            createBackup,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Merged snapshot ${snapshotId} using ${mergeStrategy} strategy`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error merging snapshot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "exportSnapshot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      snapshotId: z.string().min(1).describe("Snapshot ID"),
      format: z.enum(["spline", "json"]).default("spline").describe("Export format"),
    },
    async ({ sceneId, snapshotId, format }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/snapshots/${snapshotId}/export`, {
          method: "POST",
          body: JSON.stringify({
            format,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Exported snapshot ${snapshotId} in ${format} format. Download URL: ${result.downloadUrl}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error exporting snapshot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "deleteSnapshot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      snapshotId: z.string().min(1).describe("Snapshot ID"),
    },
    async ({ sceneId, snapshotId }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/snapshots/${snapshotId}`, {
          method: "DELETE",
        });

        return {
          content: [{
            type: "text",
            text: `Deleted snapshot ${snapshotId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error deleting snapshot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}