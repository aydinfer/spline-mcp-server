/**
 * Multi-Scene Tools for Spline.design
 * 
 * Tools for managing multiple scenes and their relationships.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register multi-scene tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerMultiSceneTools(server) {
  server.tool(
    "createScene",
    {
      projectId: z.string().min(1).describe("Project ID"),
      name: z.string().min(1).describe("Scene name"),
      description: z.string().optional().describe("Scene description"),
      template: z.enum(["empty", "product", "presentation", "interactive", "portfolio"]).optional()
        .describe("Scene template"),
      sceneType: z.enum(["3d", "ui", "hana"]).default("3d").describe("Scene type"),
    },
    async ({ projectId, name, description, template, sceneType }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/scenes`, {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            template,
            sceneType,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created new ${sceneType} scene "${name}" (ID: ${result.sceneId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating scene: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "listScenes",
    {
      projectId: z.string().min(1).describe("Project ID"),
      filter: z.enum(["all", "active", "archived"]).default("all").describe("Filter scenes by status"),
      page: z.number().int().min(1).default(1).describe("Page number"),
      pageSize: z.number().int().min(1).max(100).default(20).describe("Scenes per page"),
    },
    async ({ projectId, filter, page, pageSize }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/scenes`, {
          method: "GET",
          query: {
            filter,
            page,
            pageSize,
          },
        });

        return {
          content: [{
            type: "text",
            text: `Found ${result.total} scenes in project ${projectId}`,
          }, {
            type: "json",
            json: result.items,
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error listing scenes: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "linkScenes",
    {
      projectId: z.string().min(1).describe("Project ID"),
      sourceSceneId: z.string().min(1).describe("Source scene ID"),
      targetSceneId: z.string().min(1).describe("Target scene ID"),
      linkType: z.enum(["reference", "embed", "portal"]).describe("Type of scene link"),
      sourceObjectId: z.string().optional().describe("Source object ID (for embedding or portal)"),
      linkName: z.string().optional().describe("Link name"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position for embedded scene"),
      scale: z.number().positive().default(1).optional().describe("Scale for embedded scene"),
    },
    async ({ projectId, sourceSceneId, targetSceneId, linkType, sourceObjectId, linkName, position, scale }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/scenes/links`, {
          method: "POST",
          body: JSON.stringify({
            sourceSceneId,
            targetSceneId,
            linkType,
            sourceObjectId,
            linkName,
            position,
            scale,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created ${linkType} link between scenes (Link ID: ${result.linkId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error linking scenes: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "copyBetweenScenes",
    {
      projectId: z.string().min(1).describe("Project ID"),
      sourceSceneId: z.string().min(1).describe("Source scene ID"),
      targetSceneId: z.string().min(1).describe("Target scene ID"),
      objectIds: z.array(z.string().min(1)).optional().describe("Object IDs to copy"),
      stateIds: z.array(z.string().min(1)).optional().describe("State IDs to copy"),
      eventIds: z.array(z.string().min(1)).optional().describe("Event IDs to copy"),
      materialIds: z.array(z.string().min(1)).optional().describe("Material IDs to copy"),
      componentIds: z.array(z.string().min(1)).optional().describe("Component IDs to copy"),
      copyDependencies: z.boolean().default(true).describe("Copy dependent objects automatically"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Target position for copied objects"),
    },
    async ({ projectId, sourceSceneId, targetSceneId, objectIds, stateIds, eventIds, materialIds, componentIds, copyDependencies, position }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/scenes/copy`, {
          method: "POST",
          body: JSON.stringify({
            sourceSceneId,
            targetSceneId,
            objectIds,
            stateIds,
            eventIds,
            materialIds,
            componentIds,
            copyDependencies,
            position,
          }),
        });

        const itemCounts = [];
        if (result.copiedObjects?.length) itemCounts.push(`${result.copiedObjects.length} objects`);
        if (result.copiedStates?.length) itemCounts.push(`${result.copiedStates.length} states`);
        if (result.copiedEvents?.length) itemCounts.push(`${result.copiedEvents.length} events`);
        if (result.copiedMaterials?.length) itemCounts.push(`${result.copiedMaterials.length} materials`);
        if (result.copiedComponents?.length) itemCounts.push(`${result.copiedComponents.length} components`);

        return {
          content: [{
            type: "text",
            text: `Copied ${itemCounts.join(', ')} between scenes`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error copying between scenes: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "navigateBetweenScenes",
    {
      projectId: z.string().min(1).describe("Project ID"),
      currentSceneId: z.string().min(1).describe("Current scene ID"),
      targetSceneId: z.string().min(1).describe("Target scene ID"),
      transitionType: z.enum(["none", "fade", "slide", "zoom", "custom"]).default("fade")
        .describe("Transition animation type"),
      transitionDuration: z.number().positive().default(0.5).describe("Transition duration in seconds"),
      preserveCamera: z.boolean().default(false).describe("Preserve camera position/rotation in target scene"),
      stateToTrigger: z.string().optional().describe("State ID to trigger in target scene on load"),
    },
    async ({ projectId, currentSceneId, targetSceneId, transitionType, transitionDuration, preserveCamera, stateToTrigger }) => {
      try {
        await fetchFromSplineApi(`/projects/${projectId}/scenes/${currentSceneId}/navigate`, {
          method: "POST",
          body: JSON.stringify({
            targetSceneId,
            transitionType,
            transitionDuration,
            preserveCamera,
            stateToTrigger,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Navigated from scene ${currentSceneId} to scene ${targetSceneId} with ${transitionType} transition`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error navigating between scenes: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createSceneGroup",
    {
      projectId: z.string().min(1).describe("Project ID"),
      name: z.string().min(1).describe("Scene group name"),
      sceneIds: z.array(z.string().min(1)).min(1).describe("Scene IDs to include in group"),
      description: z.string().optional().describe("Group description"),
    },
    async ({ projectId, name, sceneIds, description }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/scene-groups`, {
          method: "POST",
          body: JSON.stringify({
            name,
            sceneIds,
            description,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created scene group "${name}" with ${sceneIds.length} scenes (Group ID: ${result.groupId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating scene group: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}