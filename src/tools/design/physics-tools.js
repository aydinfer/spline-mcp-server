/**
 * Physics Tools for Spline.design
 * 
 * Tools for adding and configuring physics simulation for objects.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register physics tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerPhysicsTools(server) {
  server.tool(
    "addPhysicsBody",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      bodyType: z.enum(["dynamic", "static", "kinematic"]).describe("Physics body type"),
      shape: z.enum(["auto", "box", "sphere", "capsule", "cylinder", "convex", "mesh"])
        .default("auto").describe("Collision shape type"),
      mass: z.number().min(0).default(1).describe("Mass in kg (0 for static bodies)"),
      parameters: z.object({
        // Friction properties
        friction: z.number().min(0).max(1).default(0.5).describe("Friction coefficient"),
        restitution: z.number().min(0).max(1).default(0.2).describe("Bounciness/restitution"),
        
        // Linear properties
        linearDamping: z.number().min(0).max(1).default(0.01).describe("Linear damping"),
        angularDamping: z.number().min(0).max(1).default(0.01).describe("Angular damping"),
        linearVelocity: z.object({
          x: z.number().default(0),
          y: z.number().default(0),
          z: z.number().default(0),
        }).optional().describe("Initial linear velocity"),
        angularVelocity: z.object({
          x: z.number().default(0),
          y: z.number().default(0),
          z: z.number().default(0),
        }).optional().describe("Initial angular velocity"),
        
        // Collision properties
        collisionGroup: z.number().int().min(0).max(31).default(0).describe("Collision group (0-31)"),
        collidesWith: z.array(z.number().int().min(0).max(31)).optional()
          .describe("Collision groups to collide with (0-31)"),
        isTrigger: z.boolean().default(false).describe("Is this a trigger volume"),
        
        // Constraints
        fixedRotation: z.boolean().default(false).describe("Lock rotation"),
        lockAxisX: z.boolean().default(false).describe("Lock movement along X axis"),
        lockAxisY: z.boolean().default(false).describe("Lock movement along Y axis"),
        lockAxisZ: z.boolean().default(false).describe("Lock movement along Z axis"),
        
        // Advanced properties
        ccdEnabled: z.boolean().default(false).describe("Enable continuous collision detection"),
        sleepThreshold: z.number().positive().default(0.005).describe("Sleep velocity threshold"),
        autoSleep: z.boolean().default(true).describe("Enable automatic sleeping"),
      }).optional().describe("Physics body parameters"),
    },
    async ({ sceneId, objectId, bodyType, shape, mass, parameters }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/physics`, {
          method: "POST",
          body: JSON.stringify({
            bodyType,
            shape,
            mass,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${bodyType} physics body to object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error adding physics body: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updatePhysicsBody",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      bodyType: z.enum(["dynamic", "static", "kinematic"]).optional().describe("Physics body type"),
      mass: z.number().min(0).optional().describe("Mass in kg"),
      parameters: z.record(z.any()).optional().describe("Updated physics parameters"),
    },
    async ({ sceneId, objectId, bodyType, mass, parameters }) => {
      try {
        await updateSplineObject(sceneId, objectId, { 
          physics: {
            bodyType,
            mass,
            parameters,
          }
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated physics body for object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating physics body: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "applyForce",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Physics body object ID"),
      force: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).describe("Force vector to apply"),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).optional().describe("Position to apply force (if different from center of mass)"),
      impulse: z.boolean().default(false).describe("Apply as impulse (instantaneous)"),
    },
    async ({ sceneId, objectId, force, position, impulse }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/physics/force`, {
          method: "POST",
          body: JSON.stringify({
            force,
            position,
            impulse,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Applied ${impulse ? 'impulse' : 'force'} to object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error applying force: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "applyTorque",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Physics body object ID"),
      torque: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).describe("Torque vector to apply"),
      impulse: z.boolean().default(false).describe("Apply as impulse (instantaneous)"),
    },
    async ({ sceneId, objectId, torque, impulse }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/physics/torque`, {
          method: "POST",
          body: JSON.stringify({
            torque,
            impulse,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Applied ${impulse ? 'impulse' : 'torque'} to object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error applying torque: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createJoint",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      jointType: z.enum([
        "fixed", "hinge", "ball", "slider", "distance", "spring", "prismatic", "universal"
      ]).describe("Joint type"),
      bodyAId: z.string().min(1).describe("First body object ID"),
      bodyBId: z.string().min(1).describe("Second body object ID"),
      parameters: z.object({
        // Connection points
        anchorA: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Connection point on first body (local space)"),
        anchorB: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Connection point on second body (local space)"),
        
        // Axis parameters (for hinge, slider, prismatic)
        axis: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Joint axis direction"),
        
        // Limits
        lowerLimit: z.number().optional().describe("Lower movement/rotation limit"),
        upperLimit: z.number().optional().describe("Upper movement/rotation limit"),
        
        // Spring parameters
        stiffness: z.number().positive().optional().describe("Spring stiffness"),
        damping: z.number().min(0).optional().describe("Spring damping"),
        equilibriumPoint: z.number().optional().describe("Spring equilibrium point"),
        
        // Universal joint parameters
        axis1: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("First axis for universal joint"),
        axis2: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Second axis for universal joint"),
        
        // Motor parameters
        enableMotor: z.boolean().default(false).optional().describe("Enable motor"),
        motorSpeed: z.number().optional().describe("Motor speed"),
        maxMotorForce: z.number().positive().optional().describe("Maximum motor force/torque"),
        
        // Common parameters
        collideConnected: z.boolean().default(false).optional()
          .describe("Whether the connected bodies can collide"),
      }).describe("Joint-specific parameters"),
    },
    async ({ sceneId, jointType, bodyAId, bodyBId, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/physics/joints`, {
          method: "POST",
          body: JSON.stringify({
            jointType,
            bodyAId,
            bodyBId,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created ${jointType} joint between objects ${bodyAId} and ${bodyBId} (Joint ID: ${result.jointId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating joint: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updatePhysicsWorld",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      gravity: z.object({
        x: z.number().default(0),
        y: z.number().default(-9.81),
        z: z.number().default(0),
      }).optional().describe("Gravity vector"),
      timeScale: z.number().positive().default(1).describe("Physics simulation time scale"),
      fixedTimeStep: z.number().positive().default(1/60).describe("Fixed time step for simulation"),
      maxSubSteps: z.number().int().positive().default(10).describe("Maximum physics sub-steps"),
      enablePhysics: z.boolean().optional().describe("Enable/disable physics simulation"),
    },
    async ({ sceneId, gravity, timeScale, fixedTimeStep, maxSubSteps, enablePhysics }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/physics/world`, {
          method: "POST",
          body: JSON.stringify({
            gravity,
            timeScale,
            fixedTimeStep,
            maxSubSteps,
            enablePhysics,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Updated physics world parameters for scene ${sceneId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating physics world: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}