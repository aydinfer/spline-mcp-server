/**
 * Gaussian Splatting Tools for Spline.design
 * 
 * Tools for working with 3D Gaussian Splatting in Spline.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register Gaussian Splatting tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerGaussianSplattingTools(server) {
  server.tool(
    "importGaussianSplatting",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      url: z.string().url().describe("URL to Gaussian Splatting data (.splat, .ply)"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      rotation: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Rotation in degrees"),
      scale: z.number().positive().default(1).describe("Uniform scale factor"),
      parameters: z.object({
        quality: z.enum(["low", "medium", "high", "ultra"]).default("high").describe("Render quality"),
        pointSize: z.number().positive().optional().describe("Point size multiplier"),
        opacity: z.number().min(0).max(1).default(1).describe("Global opacity"),
        colorAdjustment: z.object({
          brightness: z.number().min(-1).max(1).default(0).describe("Brightness adjustment"),
          contrast: z.number().min(-1).max(1).default(0).describe("Contrast adjustment"),
          saturation: z.number().min(-1).max(1).default(0).describe("Saturation adjustment"),
          hue: z.number().min(-180).max(180).default(0).describe("Hue rotation in degrees"),
        }).optional().describe("Color adjustment parameters"),
        clipPlanes: z.array(z.object({
          normal: z.object({
            x: z.number(),
            y: z.number(),
            z: z.number(),
          }).describe("Plane normal vector"),
          distance: z.number().describe("Plane distance from origin"),
        })).optional().describe("Clipping planes"),
      }).optional().describe("Gaussian Splatting parameters"),
    },
    async ({ sceneId, url, position, rotation, scale, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/gaussian-splatting`, {
          method: "POST",
          body: JSON.stringify({
            url,
            position,
            rotation,
            scale,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Imported Gaussian Splatting (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error importing Gaussian Splatting: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateGaussianSplatting",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Gaussian Splatting object ID"),
      parameters: z.record(z.any()).describe("Updated Gaussian Splatting parameters"),
    },
    async ({ sceneId, objectId, parameters }) => {
      try {
        await updateSplineObject(sceneId, objectId, { 
          parameters,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated Gaussian Splatting ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating Gaussian Splatting: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createGaussianSplattingFromImages",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      imageUrls: z.array(z.string().url()).min(5).describe("URLs to input images (min 5 images)"),
      cameraParameters: z.array(z.object({
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).describe("Camera position"),
        rotation: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).describe("Camera rotation"),
        fov: z.number().positive().default(60).describe("Field of view in degrees"),
      })).optional().describe("Camera parameters for each image (if known)"),
      quality: z.enum(["draft", "medium", "high"]).default("medium").describe("Reconstruction quality"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space for result"),
      autoOrient: z.boolean().default(true).describe("Automatically orient the result"),
    },
    async ({ sceneId, imageUrls, cameraParameters, quality, position, autoOrient }) => {
      try {
        // This operation is typically long-running, so we return a job ID
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/gaussian-splatting/from-images`, {
          method: "POST",
          body: JSON.stringify({
            imageUrls,
            cameraParameters,
            quality,
            position,
            autoOrient,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Started Gaussian Splatting creation from ${imageUrls.length} images (Job ID: ${result.jobId}). You can check progress with the "checkGaussianSplattingJob" tool.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating Gaussian Splatting: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "checkGaussianSplattingJob",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      jobId: z.string().min(1).describe("Gaussian Splatting job ID"),
    },
    async ({ sceneId, jobId }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/gaussian-splatting/jobs/${jobId}`, {
          method: "GET",
        });

        if (result.status === "completed") {
          return {
            content: [{
              type: "text",
              text: `Gaussian Splatting job completed successfully! Object ID: ${result.objectId}`
            }]
          };
        } else if (result.status === "failed") {
          return {
            content: [{
              type: "text",
              text: `Gaussian Splatting job failed: ${result.error}`
            }],
            isError: true
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `Gaussian Splatting job is ${result.status}. Progress: ${result.progress}%`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking Gaussian Splatting job: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "convertMeshToGaussianSplatting",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Source mesh object ID"),
      quality: z.enum(["draft", "medium", "high"]).default("medium").describe("Conversion quality"),
      samplingDensity: z.number().positive().default(1).describe("Point sampling density multiplier"),
      preserveOriginal: z.boolean().default(true).describe("Keep the original mesh"),
    },
    async ({ sceneId, objectId, quality, samplingDensity, preserveOriginal }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/to-gaussian-splatting`, {
          method: "POST",
          body: JSON.stringify({
            quality,
            samplingDensity,
            preserveOriginal,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Converted mesh to Gaussian Splatting (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting mesh to Gaussian Splatting: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}