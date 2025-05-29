/**
 * 3D Path Tools for Spline.design
 * 
 * Tools for creating and manipulating 3D paths for animation and object placement.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register 3D path tools
 * @param {McpServer} server - The MCP server instance
 */
export function register3DPathTools(server) {
  server.tool(
    "create3DPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      points: z.array(z.object({
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).describe("Point position"),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("In handle for Bezier curve"),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Out handle for Bezier curve"),
      })).min(2).describe("Path points"),
      closed: z.boolean().default(false).describe("Whether the path is closed"),
      type: z.enum(["bezier", "linear"]).default("bezier").describe("Path interpolation type"),
      name: z.string().optional().describe("Path name"),
      visible: z.boolean().default(true).describe("Path visibility"),
      color: z.string().optional().describe("Path display color (hex/rgba)"),
    },
    async ({ sceneId, points, closed, type, name, visible, color }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/paths`, {
          method: "POST",
          body: JSON.stringify({
            points,
            closed,
            type,
            name,
            visible,
            color,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created 3D path (ID: ${result.pathId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating 3D path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update3DPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      pathId: z.string().min(1).describe("Path ID"),
      points: z.array(z.object({
        index: z.number().int().min(0).describe("Point index to update"),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated position"),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated in handle"),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated out handle"),
      })).optional().describe("Points to update"),
      addPoints: z.array(z.object({
        afterIndex: z.number().int().min(0).describe("Index after which to add the point"),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).describe("Position"),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("In handle"),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Out handle"),
      })).optional().describe("Points to add"),
      removePointIndices: z.array(z.number().int().min(0)).optional().describe("Indices of points to remove"),
      closed: z.boolean().optional().describe("Update path closure"),
      type: z.enum(["bezier", "linear"]).optional().describe("Update path interpolation type"),
      name: z.string().optional().describe("Update path name"),
      visible: z.boolean().optional().describe("Update path visibility"),
      color: z.string().optional().describe("Update path display color"),
    },
    async ({ sceneId, pathId, points, addPoints, removePointIndices, closed, type, name, visible, color }) => {
      try {
        await updateSplineObject(sceneId, pathId, { 
          pathUpdates: {
            points,
            addPoints,
            removePointIndices,
          },
          closed, 
          type,
          name,
          visible,
          color,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated 3D path ${pathId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating 3D path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "objectFollowPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      pathId: z.string().min(1).describe("Path ID"),
      parameters: z.object({
        alignToPath: z.boolean().default(true).describe("Align object rotation to path tangent"),
        alignAxis: z.enum(["auto", "x", "y", "z", "-x", "-y", "-z"]).default("auto")
          .describe("Which axis to align to path direction"),
        alignUpAxis: z.enum(["auto", "x", "y", "z", "-x", "-y", "-z"]).default("auto")
          .describe("Which axis to use as up vector"),
        loopPath: z.boolean().default(false).describe("Loop when reaching path end"),
        duration: z.number().positive().default(5).describe("Duration in seconds to traverse path"),
        easing: z.enum([
          "linear", "easeIn", "easeOut", "easeInOut", 
          "easeInQuad", "easeOutQuad", "easeInOutQuad",
          "easeInCubic", "easeOutCubic", "easeInOutCubic",
          "easeInQuart", "easeOutQuart", "easeInOutQuart",
          "easeInQuint", "easeOutQuint", "easeInOutQuint",
          "easeInSine", "easeOutSine", "easeInOutSine",
          "easeInExpo", "easeOutExpo", "easeInOutExpo",
          "easeInCirc", "easeOutCirc", "easeInOutCirc",
          "easeInBack", "easeOutBack", "easeInOutBack",
          "easeInElastic", "easeOutElastic", "easeInOutElastic",
          "easeInBounce", "easeOutBounce", "easeInOutBounce"
        ]).default("linear").describe("Easing function for path traversal"),
        startOffset: z.number().min(0).max(1).default(0).describe("Starting position on path (0-1)"),
        constantSpeed: z.boolean().default(true).describe("Maintain constant speed along path"),
        autoPlay: z.boolean().default(true).describe("Start animation automatically"),
      }).optional().describe("Path following parameters"),
    },
    async ({ sceneId, objectId, pathId, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/follow-path`, {
          method: "POST",
          body: JSON.stringify({
            pathId,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Object ${objectId} set to follow path ${pathId} (Animation ID: ${result.animationId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error setting object to follow path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "controlPathAnimation",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      animationId: z.string().min(1).describe("Path animation ID"),
      action: z.enum(["play", "pause", "stop", "reset"]).describe("Animation control action"),
      timeScale: z.number().positive().optional().describe("Animation time scale (playback speed)"),
    },
    async ({ sceneId, animationId, action, timeScale }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/animations/${animationId}/control`, {
          method: "POST",
          body: JSON.stringify({
            action,
            timeScale,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Path animation ${animationId} ${action} command sent`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error controlling path animation: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "distributeAlongPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      pathId: z.string().min(1).describe("Path ID"),
      objectId: z.string().min(1).describe("Source object ID to distribute"),
      count: z.number().int().positive().describe("Number of instances to create"),
      parameters: z.object({
        alignToPath: z.boolean().default(true).describe("Align objects to path tangent"),
        alignAxis: z.enum(["auto", "x", "y", "z", "-x", "-y", "-z"]).default("auto")
          .describe("Which axis to align to path direction"),
        distribution: z.enum(["even", "start", "end", "random"]).default("even")
          .describe("Distribution pattern along the path"),
        startOffset: z.number().min(0).max(1).default(0).describe("Starting position on path (0-1)"),
        endOffset: z.number().min(0).max(1).default(1).describe("Ending position on path (0-1)"),
        randomSeed: z.number().int().optional().describe("Seed for random distribution"),
        createGroup: z.boolean().default(true).describe("Create a group containing the distributed objects"),
      }).optional().describe("Distribution parameters"),
    },
    async ({ sceneId, pathId, objectId, count, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/paths/${pathId}/distribute`, {
          method: "POST",
          body: JSON.stringify({
            objectId,
            count,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Distributed ${count} instances along path (Group ID: ${result.groupId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error distributing along path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}