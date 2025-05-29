/**
 * Hana Canvas Tools for Spline.design
 * 
 * Tools for creating and manipulating Hana canvas designs and interactions.
 * Hana is Spline's 2D canvas for creating interactive 2D designs that can
 * integrate with 3D scenes.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register Hana canvas tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerHanaTools(server) {
  server.tool(
    "createHanaCanvas",
    {
      projectId: z.string().min(1).describe("Project ID"),
      name: z.string().min(1).describe("Canvas name"),
      width: z.number().positive().default(1920).describe("Canvas width in pixels"),
      height: z.number().positive().default(1080).describe("Canvas height in pixels"),
      background: z.string().optional().describe("Background color (hex/rgba)"),
      devicePreset: z.enum(["none", "iphone", "ipad", "macbook", "desktop", "custom"]).default("none")
        .describe("Device frame preset"),
    },
    async ({ projectId, name, width, height, background, devicePreset }) => {
      try {
        const result = await fetchFromSplineApi(`/projects/${projectId}/hana`, {
          method: "POST",
          body: JSON.stringify({
            name,
            width,
            height,
            background,
            devicePreset,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created Hana canvas "${name}" (Canvas ID: ${result.canvasId}, Scene ID: ${result.sceneId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating Hana canvas: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "addHanaElement",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      elementType: z.enum([
        "rectangle", "ellipse", "text", "image", "input", "button", 
        "slider", "toggle", "embed", "3d", "group", "path"
      ]).describe("Element type"),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }).describe("Position on canvas"),
      size: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
      }).optional().describe("Element size (some elements have default sizes)"),
      style: z.object({
        // Common style properties
        fill: z.string().optional().describe("Fill color (hex/rgba)"),
        stroke: z.string().optional().describe("Stroke color (hex/rgba)"),
        strokeWidth: z.number().min(0).optional().describe("Stroke width"),
        opacity: z.number().min(0).max(1).default(1).describe("Element opacity"),
        blur: z.number().min(0).optional().describe("Blur amount"),
        borderRadius: z.number().min(0).optional().describe("Border radius for rectangles"),
        rotation: z.number().optional().describe("Rotation angle in degrees"),
        
        // Text properties
        text: z.string().optional().describe("Text content for text elements"),
        fontFamily: z.string().optional().describe("Font family for text"),
        fontSize: z.number().positive().optional().describe("Font size"),
        fontWeight: z.enum(["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"])
          .optional().describe("Font weight"),
        textAlign: z.enum(["left", "center", "right"]).optional().describe("Text alignment"),
        lineHeight: z.number().positive().optional().describe("Line height"),
        
        // Image properties
        imageUrl: z.string().url().optional().describe("Image URL for image elements"),
        objectFit: z.enum(["cover", "contain", "fill", "none"]).optional().describe("Image object fit"),
        
        // Button properties
        buttonText: z.string().optional().describe("Text for button elements"),
        buttonStyle: z.enum(["default", "primary", "secondary", "outline", "text"]).optional().describe("Button style"),
        
        // Input properties
        placeholder: z.string().optional().describe("Placeholder text for input elements"),
        inputType: z.enum(["text", "number", "email", "password"]).optional().describe("Input field type"),
        
        // 3D embed properties
        sceneId: z.string().optional().describe("3D scene ID to embed"),
        
        // Effects
        shadow: z.boolean().default(false).optional().describe("Enable drop shadow"),
        shadowColor: z.string().optional().describe("Shadow color (hex/rgba)"),
        shadowOffsetX: z.number().optional().describe("Shadow X offset"),
        shadowOffsetY: z.number().optional().describe("Shadow Y offset"),
        shadowBlur: z.number().min(0).optional().describe("Shadow blur amount"),
        
        // Advanced properties
        zIndex: z.number().int().optional().describe("Z-index for stacking order"),
        overflow: z.enum(["visible", "hidden", "scroll", "auto"]).optional().describe("Overflow behavior"),
        pointerEvents: z.enum(["auto", "none"]).optional().describe("Pointer events handling"),
      }).optional().describe("Element style properties"),
      name: z.string().optional().describe("Element name"),
    },
    async ({ sceneId, elementType, position, size, style, name }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/elements`, {
          method: "POST",
          body: JSON.stringify({
            elementType,
            position,
            size,
            style,
            name,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${elementType} element to Hana canvas (Element ID: ${result.elementId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error adding Hana element: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateHanaElement",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      elementId: z.string().min(1).describe("Element ID"),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }).optional().describe("Updated position"),
      size: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
      }).optional().describe("Updated size"),
      style: z.record(z.any()).optional().describe("Updated style properties"),
      name: z.string().optional().describe("Updated element name"),
    },
    async ({ sceneId, elementId, position, size, style, name }) => {
      try {
        await updateSplineObject(sceneId, elementId, { 
          position,
          size,
          style,
          name,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated Hana element ${elementId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating Hana element: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "addHanaInteraction",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      elementId: z.string().min(1).describe("Element ID to add interaction to"),
      eventType: z.enum([
        "click", "hover", "mouseEnter", "mouseLeave", "mouseDown", "mouseUp",
        "drag", "dragStart", "dragEnd", "scroll", "swipe",
        "keyUp", "keyDown", "keyPress", "focus", "blur",
        "load", "valueChange"
      ]).describe("Event type"),
      actions: z.array(z.object({
        actionType: z.enum([
          "changeStyle", "changePosition", "changeSize", "show", "hide",
          "navigate", "openUrl", "playAnimation", "toggleClass",
          "setValue", "increaseValue", "decreaseValue",
          "showElement", "hideElement", "toggleElement",
          "playSound", "playVideo", "stopVideo", "pauseVideo"
        ]).describe("Action type"),
        targetId: z.string().min(1).optional().describe("Target element ID (if different from source)"),
        parameters: z.record(z.any()).describe("Action-specific parameters"),
        delay: z.number().min(0).default(0).describe("Delay before action in seconds"),
        duration: z.number().min(0).optional().describe("Action duration in seconds (for animations)"),
        easing: z.string().optional().describe("Easing function for animations"),
      })).min(1).describe("Actions to trigger"),
      name: z.string().optional().describe("Interaction name"),
    },
    async ({ sceneId, elementId, eventType, actions, name }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/elements/${elementId}/interactions`, {
          method: "POST",
          body: JSON.stringify({
            eventType,
            actions,
            name,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${eventType} interaction to element ${elementId} (Interaction ID: ${result.interactionId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error adding Hana interaction: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "addHanaState",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      name: z.string().min(1).describe("State name"),
      elementStates: z.array(z.object({
        elementId: z.string().min(1).describe("Element ID"),
        properties: z.record(z.any()).describe("Property changes for this element in this state"),
      })).min(1).describe("Element states for this canvas state"),
      defaultTransition: z.object({
        duration: z.number().positive().default(0.3).describe("Transition duration in seconds"),
        easing: z.string().default("ease").describe("Transition easing function"),
        delay: z.number().min(0).default(0).describe("Transition delay in seconds"),
      }).optional().describe("Default transition properties for this state"),
    },
    async ({ sceneId, name, elementStates, defaultTransition }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/states`, {
          method: "POST",
          body: JSON.stringify({
            name,
            elementStates,
            defaultTransition,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created Hana state "${name}" (State ID: ${result.stateId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating Hana state: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "triggerHanaState",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      stateId: z.string().min(1).describe("State ID"),
      transitionOverrides: z.object({
        duration: z.number().positive().optional().describe("Override transition duration"),
        easing: z.string().optional().describe("Override easing function"),
        delay: z.number().min(0).optional().describe("Override transition delay"),
      }).optional().describe("Transition property overrides"),
    },
    async ({ sceneId, stateId, transitionOverrides }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/hana/states/${stateId}/trigger`, {
          method: "POST",
          body: JSON.stringify({
            transitionOverrides,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Triggered Hana state ${stateId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error triggering Hana state: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createHanaAnimation",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      name: z.string().min(1).describe("Animation name"),
      targetElementId: z.string().min(1).describe("Target element ID"),
      keyframes: z.array(z.object({
        time: z.number().min(0).describe("Keyframe time in seconds"),
        properties: z.record(z.any()).describe("Element properties at this keyframe"),
      })).min(2).describe("Animation keyframes"),
      duration: z.number().positive().describe("Animation duration in seconds"),
      easing: z.string().default("linear").describe("Animation easing function"),
      loop: z.boolean().default(false).describe("Whether to loop the animation"),
      autoPlay: z.boolean().default(false).describe("Whether to play the animation automatically"),
    },
    async ({ sceneId, name, targetElementId, keyframes, duration, easing, loop, autoPlay }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/animations`, {
          method: "POST",
          body: JSON.stringify({
            name,
            targetElementId,
            keyframes,
            duration,
            easing,
            loop,
            autoPlay,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created Hana animation "${name}" (Animation ID: ${result.animationId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating Hana animation: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "controlHanaAnimation",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      animationId: z.string().min(1).describe("Animation ID"),
      action: z.enum(["play", "pause", "stop", "reverse"]).describe("Animation control action"),
      playbackRate: z.number().positive().optional().describe("Playback speed (1.0 = normal)"),
    },
    async ({ sceneId, animationId, action, playbackRate }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/hana/animations/${animationId}/control`, {
          method: "POST",
          body: JSON.stringify({
            action,
            playbackRate,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Hana animation ${animationId} ${action} command sent`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error controlling Hana animation: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "addHanaEffect",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      elementId: z.string().min(1).describe("Target element ID"),
      effectType: z.enum([
        "blur", "glow", "neon", "shadow", "gradient", 
        "noise", "grain", "distortion", "wavy", "ripple"
      ]).describe("Effect type"),
      parameters: z.object({
        // Blur effect parameters
        blurAmount: z.number().min(0).optional().describe("Blur amount (px)"),
        
        // Glow effect parameters
        glowColor: z.string().optional().describe("Glow color (hex/rgba)"),
        glowRadius: z.number().min(0).optional().describe("Glow radius (px)"),
        glowIntensity: z.number().min(0).optional().describe("Glow intensity"),
        
        // Neon effect parameters
        neonColor: z.string().optional().describe("Neon color (hex/rgba)"),
        neonWidth: z.number().min(0).optional().describe("Neon width (px)"),
        neonIntensity: z.number().min(0).optional().describe("Neon intensity"),
        
        // Shadow effect parameters
        shadowColor: z.string().optional().describe("Shadow color (hex/rgba)"),
        shadowOffsetX: z.number().optional().describe("Shadow X offset (px)"),
        shadowOffsetY: z.number().optional().describe("Shadow Y offset (px)"),
        shadowBlur: z.number().min(0).optional().describe("Shadow blur (px)"),
        
        // Gradient effect parameters
        gradientType: z.enum(["linear", "radial", "conic"]).optional().describe("Gradient type"),
        gradientColors: z.array(z.string()).optional().describe("Gradient colors (hex/rgba)"),
        gradientStops: z.array(z.number().min(0).max(1)).optional().describe("Gradient color stops (0-1)"),
        gradientAngle: z.number().optional().describe("Gradient angle (degrees, for linear)"),
        
        // Noise/grain effect parameters
        noiseType: z.enum(["perlin", "simplex", "value", "fractal"]).optional().describe("Noise type"),
        noiseScale: z.number().positive().optional().describe("Noise scale"),
        noiseAmount: z.number().min(0).max(1).optional().describe("Noise amount"),
        
        // Distortion effect parameters
        distortionType: z.enum(["bulge", "pinch", "twist", "wave"]).optional().describe("Distortion type"),
        distortionAmount: z.number().optional().describe("Distortion amount"),
        distortionCenter: z.object({
          x: z.number().min(0).max(1).optional().describe("Center X (0-1)"),
          y: z.number().min(0).max(1).optional().describe("Center Y (0-1)"),
        }).optional().describe("Distortion center point"),
        
        // Common parameters
        blend: z.enum(["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn"])
          .default("normal").optional().describe("Blend mode"),
        opacity: z.number().min(0).max(1).default(1).optional().describe("Effect opacity"),
        animate: z.boolean().default(false).optional().describe("Animate the effect"),
        animationSpeed: z.number().positive().default(1).optional().describe("Animation speed"),
      }).describe("Effect-specific parameters"),
    },
    async ({ sceneId, elementId, effectType, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/elements/${elementId}/effects`, {
          method: "POST",
          body: JSON.stringify({
            effectType,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${effectType} effect to element ${elementId} (Effect ID: ${result.effectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error adding Hana effect: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createHanaPrototype",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      name: z.string().min(1).describe("Prototype name"),
      startFrame: z.string().min(1).describe("Starting frame/element ID"),
      description: z.string().optional().describe("Prototype description"),
      previewImage: z.string().url().optional().describe("Preview image URL"),
      settings: z.object({
        defaultTransition: z.object({
          type: z.enum(["none", "fade", "slide", "push", "dissolve"]).default("fade")
            .describe("Default transition type"),
          duration: z.number().positive().default(0.3).describe("Default transition duration"),
          easing: z.string().default("ease").describe("Default transition easing"),
        }).optional().describe("Default transition settings"),
        hotspotHinting: z.boolean().default(true).optional().describe("Show hotspot hints"),
        deviceFrame: z.enum(["none", "iphone", "ipad", "macbook", "desktop", "custom"]).default("none")
          .optional().describe("Device frame for preview"),
      }).optional().describe("Prototype settings"),
    },
    async ({ sceneId, name, startFrame, description, previewImage, settings }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/prototypes`, {
          method: "POST",
          body: JSON.stringify({
            name,
            startFrame,
            description,
            previewImage,
            settings,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created Hana prototype "${name}" (Prototype ID: ${result.prototypeId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating Hana prototype: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "exportHanaCanvas",
    {
      sceneId: z.string().min(1).describe("Scene ID for Hana canvas"),
      format: z.enum(["html", "react", "vue", "pdf", "image"]).describe("Export format"),
      includeAssets: z.boolean().default(true).describe("Include all assets in export"),
      includeInteractions: z.boolean().default(true).describe("Include interactions in export"),
      include3D: z.boolean().default(true).describe("Include 3D elements in export"),
      optimizeFor: z.enum(["web", "mobile", "desktop"]).default("web").describe("Platform optimization"),
      scale: z.number().positive().default(1).describe("Scale factor for image exports"),
    },
    async ({ sceneId, format, includeAssets, includeInteractions, include3D, optimizeFor, scale }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/hana/export`, {
          method: "POST",
          body: JSON.stringify({
            format,
            includeAssets,
            includeInteractions,
            include3D,
            optimizeFor,
            scale,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Exported Hana canvas in ${format} format. Download URL: ${result.downloadUrl}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error exporting Hana canvas: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}