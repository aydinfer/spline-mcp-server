/**
 * UI Scene Tools for Spline.design
 * 
 * Tools for creating and manipulating UI scenes for interface design.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register UI scene tools for interface design
 * @param {McpServer} server - The MCP server instance
 */
export function registerUISceneTools(server) {
  server.tool(
    "createUIComponent",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      type: z.enum([
        "button", "slider", "toggle", "input", "dropdown", 
        "card", "modal", "navbar", "sidebar", "custom"
      ]).describe("Type of UI component"),
      content: z.string().optional().describe("Text content for the component"),
      size: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
      }).describe("Component dimensions"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      style: z.object({
        backgroundColor: z.string().optional().describe("Background color (hex/rgb)"),
        textColor: z.string().optional().describe("Text color (hex/rgb)"),
        cornerRadius: z.number().min(0).optional().describe("Corner radius"),
        borderWidth: z.number().min(0).optional().describe("Border width"),
        borderColor: z.string().optional().describe("Border color (hex/rgb)"),
        shadow: z.boolean().default(false).optional().describe("Enable drop shadow"),
        shadowColor: z.string().optional().describe("Shadow color (hex/rgb)"),
        shadowBlur: z.number().min(0).optional().describe("Shadow blur amount"),
        shadowOffsetX: z.number().optional().describe("Shadow X offset"),
        shadowOffsetY: z.number().optional().describe("Shadow Y offset"),
        fontFamily: z.string().optional().describe("Font family name"),
        fontSize: z.number().positive().optional().describe("Font size"),
        fontWeight: z.enum(["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"])
          .optional().describe("Font weight"),
        padding: z.object({
          top: z.number().min(0),
          right: z.number().min(0),
          bottom: z.number().min(0),
          left: z.number().min(0),
        }).optional().describe("Component padding"),
      }).optional().describe("Component styling"),
      states: z.array(z.object({
        name: z.string().min(1).describe("State name (e.g., 'hover', 'pressed')"),
        style: z.record(z.any()).describe("Style changes for this state"),
      })).optional().describe("Component states"),
    },
    async ({ sceneId, type, content, size, position, style, states }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/ui`, {
          method: "POST",
          body: JSON.stringify({
            type,
            content,
            size,
            position,
            style,
            states,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created UI ${type} component (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating UI component: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createUILayout",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      type: z.enum(["grid", "flex", "absolute"]).describe("Layout type"),
      size: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
      }).describe("Layout dimensions"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      parameters: z.object({
        // Grid layout parameters
        columns: z.number().int().positive().optional().describe("Number of columns"),
        rows: z.number().int().positive().optional().describe("Number of rows"),
        columnGap: z.number().min(0).optional().describe("Gap between columns"),
        rowGap: z.number().min(0).optional().describe("Gap between rows"),
        
        // Flex layout parameters
        direction: z.enum(["row", "column"]).optional().describe("Flex direction"),
        justifyContent: z.enum(["start", "center", "end", "space-between", "space-around", "space-evenly"])
          .optional().describe("Justify content"),
        alignItems: z.enum(["start", "center", "end", "stretch"])
          .optional().describe("Align items"),
        gap: z.number().min(0).optional().describe("Gap between items"),
        wrap: z.boolean().default(false).optional().describe("Wrap items"),
      }).optional().describe("Layout parameters"),
      style: z.object({
        backgroundColor: z.string().optional().describe("Background color (hex/rgb)"),
        cornerRadius: z.number().min(0).optional().describe("Corner radius"),
        border: z.boolean().default(false).optional().describe("Show border"),
        borderColor: z.string().optional().describe("Border color (hex/rgb)"),
        borderWidth: z.number().min(0).optional().describe("Border width"),
        shadow: z.boolean().default(false).optional().describe("Enable drop shadow"),
      }).optional().describe("Layout styling"),
    },
    async ({ sceneId, type, size, position, parameters, style }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/ui-layout`, {
          method: "POST",
          body: JSON.stringify({
            type,
            size,
            position,
            parameters,
            style,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created UI ${type} layout container (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating UI layout: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "addObjectToUILayout",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      layoutId: z.string().min(1).describe("Layout container ID"),
      objectId: z.string().min(1).describe("Object ID to add to layout"),
      gridPosition: z.object({
        column: z.number().int().min(0).optional().describe("Column index (for grid layout)"),
        row: z.number().int().min(0).optional().describe("Row index (for grid layout)"),
        columnSpan: z.number().int().positive().default(1).optional().describe("Column span (for grid layout)"),
        rowSpan: z.number().int().positive().default(1).optional().describe("Row span (for grid layout)"),
      }).optional().describe("Grid position configuration"),
      flexGrow: z.number().min(0).default(0).optional().describe("Flex grow factor (for flex layout)"),
      absolutePosition: z.object({
        left: z.number().optional().describe("Left position (for absolute layout)"),
        top: z.number().optional().describe("Top position (for absolute layout)"),
        right: z.number().optional().describe("Right position (for absolute layout)"),
        bottom: z.number().optional().describe("Bottom position (for absolute layout)"),
      }).optional().describe("Absolute position (for absolute layout)"),
    },
    async ({ sceneId, layoutId, objectId, gridPosition, flexGrow, absolutePosition }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${layoutId}/items`, {
          method: "POST",
          body: JSON.stringify({
            objectId,
            gridPosition,
            flexGrow,
            absolutePosition,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added object ${objectId} to layout ${layoutId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error adding object to layout: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createResponsiveVariant",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("UI object or layout ID"),
      breakpoint: z.enum(["mobile", "tablet", "desktop", "custom"]).describe("Breakpoint name"),
      customWidth: z.number().positive().optional().describe("Custom breakpoint width (when breakpoint is 'custom')"),
      properties: z.record(z.any()).describe("Properties to change at this breakpoint"),
    },
    async ({ sceneId, objectId, breakpoint, customWidth, properties }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/responsive`, {
          method: "POST",
          body: JSON.stringify({
            breakpoint,
            customWidth,
            properties,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${breakpoint} responsive variant to object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating responsive variant: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}