import apiClient from '../utils/api-client.js';

/**
 * State and Event resources for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerStateEventResources = (server) => {
  // State resource
  server.resource(
    'spline://scene/{sceneId}/state/{stateId}',
    async (uri) => {
      const parts = uri.pathname.split('/');
      const sceneId = parts[2];
      const stateId = parts[4];
      try {
        const state = await apiClient.getState(sceneId, stateId);
        
        let propertiesText = '';
        if (state.properties && state.properties.length > 0) {
          propertiesText = '## Properties Changed\n\n';
          state.properties.forEach((prop, index) => {
            propertiesText += `### Property ${index + 1}\n` +
                              `- Object: ${prop.objectId}\n` +
                              `- Property: ${prop.property}\n` +
                              `- Value: ${JSON.stringify(prop.value)}\n\n`;
          });
        } else {
          propertiesText = 'No properties defined for this state.';
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: `# Spline State: ${state.name}\n\n` +
                  `## State Details\n\n` +
                  `- ID: ${state.id}\n` +
                  `- Name: ${state.name}\n` +
                  `- Transition Duration: ${state.transitionDuration || 'N/A'} ms\n` +
                  `- Transition Easing: ${state.transitionEasing || 'N/A'}\n\n` +
                  propertiesText
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving state information: ${error.message}`
          }]
        };
      }
    }
  );

  // List states resource
  server.resource(
    'spline://scene/{sceneId}/states',
    async (uri) => {
      const sceneId = uri.pathname.split('/')[2];
      try {
        const states = await apiClient.getStates(sceneId);
        
        let text = `# States in Scene (ID: ${sceneId})\n\n`;
        
        if (states.length === 0) {
          text += 'No states available in this scene.';
        } else {
          states.forEach(state => {
            text += `## ${state.name}\n\n` +
                    `- ID: ${state.id}\n` +
                    `- Transition Duration: ${state.transitionDuration || 'N/A'} ms\n` +
                    `- Affected Properties: ${state.properties?.length || 0}\n` +
                    `- Resource URI: spline://scene/${sceneId}/state/${state.id}\n\n`;
          });
        }
        
        return {
          contents: [{
            uri: uri.href,
            text
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving states: ${error.message}`
          }]
        };
      }
    }
  );

  // Event resource
  server.resource(
    'spline://scene/{sceneId}/event/{eventId}',
    async (uri) => {
      const parts = uri.pathname.split('/');
      const sceneId = parts[2];
      const eventId = parts[4];
      try {
        const event = await apiClient.getEvent(sceneId, eventId);
        
        let actionsText = '';
        if (event.actions && event.actions.length > 0) {
          actionsText = '## Actions\n\n';
          event.actions.forEach((action, index) => {
            actionsText += `### Action ${index + 1}\n` +
                           `- Type: ${action.type}\n` +
                           `- Target: ${action.target || 'N/A'}\n` +
                           `- Parameters: ${JSON.stringify(action.params || {}, null, 2)}\n\n`;
          });
        } else {
          actionsText = 'No actions defined for this event.';
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: `# Spline Event: ${event.name}\n\n` +
                  `## Event Details\n\n` +
                  `- ID: ${event.id}\n` +
                  `- Name: ${event.name}\n` +
                  `- Type: ${event.type || 'N/A'}\n` +
                  `- Object: ${event.objectId || 'N/A'}\n\n` +
                  actionsText
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving event information: ${error.message}`
          }]
        };
      }
    }
  );

  // List events resource
  server.resource(
    'spline://scene/{sceneId}/events',
    async (uri) => {
      const sceneId = uri.pathname.split('/')[2];
      try {
        const events = await apiClient.getEvents(sceneId);
        
        let text = `# Events in Scene (ID: ${sceneId})\n\n`;
        
        if (events.length === 0) {
          text += 'No events available in this scene.';
        } else {
          events.forEach(event => {
            text += `## ${event.name}\n\n` +
                    `- ID: ${event.id}\n` +
                    `- Type: ${event.type || 'N/A'}\n` +
                    `- Object: ${event.objectId ? `ID: ${event.objectId}` : 'Scene-level event'}\n` +
                    `- Actions: ${event.actions?.length || 0}\n` +
                    `- Resource URI: spline://scene/${sceneId}/event/${event.id}\n\n`;
          });
        }
        
        return {
          contents: [{
            uri: uri.href,
            text
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving events: ${error.message}`
          }]
        };
      }
    }
  );
};
