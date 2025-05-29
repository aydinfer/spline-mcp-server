/**
 * 3D Modeling Tools for Spline.design
 * 
 * Tools for importing, exporting, and manipulating 3D models.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register 3D modeling tools
 * @param {McpServer} server - The MCP server instance
 */
export function register3DModelingTools(server) {
  server.tool(
    "import3DModel",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      modelUrl: z.string().url().describe("URL of the 3D model to import"),
      modelFormat: z.enum(["gltf", "glb", "obj", "fbx", "dae", "stl"]).describe("Format of the 3D model"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      scale: z.number().positive().default(1).describe("Uniform scale factor"),
      applyMaterials: z.boolean().default(true).describe("Apply materials from the model"),
      optimizeMesh: z.boolean().default(true).describe("Optimize the mesh for Spline"),
    },
    async ({ sceneId, modelUrl, modelFormat, position, scale, applyMaterials, optimizeMesh }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/import`, {
          method: "POST",
          body: JSON.stringify({
            modelUrl,
            modelFormat,
            position,
            scale,
            applyMaterials,
            optimizeMesh,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Imported 3D model (${modelFormat.toUpperCase()}) as object (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error importing 3D model: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "export3DModel",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().optional().describe("Object ID to export (omit for entire scene)"),
      format: z.enum(["gltf", "glb", "obj", "fbx", "usdz"]).default("glb").describe("Export format"),
      includeTextures: z.boolean().default(true).describe("Include textures in export"),
      includeAnimations: z.boolean().default(true).describe("Include animations in export"),
      quality: z.enum(["low", "medium", "high"]).default("medium").describe("Export quality"),
    },
    async ({ sceneId, objectId, format, includeTextures, includeAnimations, quality }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/export`, {
          method: "POST",
          body: JSON.stringify({
            objectId,
            format,
            includeTextures,
            includeAnimations,
            quality,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Exported 3D model in ${format.toUpperCase()} format. Download URL: ${result.downloadUrl}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error exporting 3D model: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "edit3DMesh",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      operation: z.enum([
        "subdivide", "decimate", "smoothNormals", "flipNormals", 
        "triangulate", "unwrapUVs", "resetUVs"
      ]).describe("Mesh operation to perform"),
      parameters: z.record(z.any()).optional().describe("Operation-specific parameters"),
    },
    async ({ sceneId, objectId, operation, parameters }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/mesh`, {
          method: "POST",
          body: JSON.stringify({
            operation,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Applied ${operation} operation to mesh ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error editing 3D mesh: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}