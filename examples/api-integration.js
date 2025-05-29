/**
 * Example: Integrating Spline with external APIs
 * This example demonstrates how to use the Spline.design MCP tools
 * to connect a 3D scene with external data sources
 */

// Example conversation with Claude:

/*
User: I want to create a 3D data visualization in Spline that shows weather data. Can you help me set this up?

Claude: I'd be happy to help you create a 3D weather data visualization in Spline! Let's break this down into steps:

1. Set up the basic 3D objects to represent weather data
2. Configure the API connection to a weather service
3. Map the API data to object properties in the scene
4. Add any interactivity or animations

First, let me know what scene ID you want to work with, and what specific weather data you want to visualize (temperature, precipitation, humidity, etc.).

User: My scene ID is xyz789. I want to visualize temperature and humidity for New York City. The temperature should affect the height of a column, and humidity should change the color intensity.

Claude: Great! I'll help you create a weather visualization for New York City in scene xyz789, with temperature affecting column height and humidity changing color intensity.

First, let's create a column object to represent the temperature:

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "cylinder",
name: "Temperature Column",
position: { x: -1, y: 0, z: 0 },
scale: { x: 1, y: 1, z: 1 },
color: "#3a86ff"]

Now, let's create a sphere that will change color based on humidity:

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "sphere",
name: "Humidity Indicator",
position: { x: 1, y: 0, z: 0 },
scale: { x: 1, y: 1, z: 1 },
color: "#ffffff"]

Let's also add some text objects to display the actual values:

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "text",
name: "Temperature Label",
position: { x: -1, y: -1, z: 0 },
properties: { text: "Temperature: --°F" }]

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "text",
name: "Humidity Label",
position: { x: 1, y: -1, z: 0 },
properties: { text: "Humidity: --%"" }]

Now, let's check the IDs of the objects we've created:

[Claude uses the getObjects tool with parameters:
sceneId: "xyz789"]

Great, I now know the object IDs. Let's set up the weather API connection:

[Claude uses the configureApi tool with parameters:
sceneId: "xyz789",
name: "Weather API",
method: "GET",
url: "https://api.openweathermap.org/data/2.5/weather",
queryParams: {
  q: "New York,US",
  appid: "YOUR_API_KEY",
  units: "imperial"
},
requestOnStart: true,
variableMappings: [
  {
    responseField: "main.temp",
    variableName: "temperature",
    variableType: "number"
  },
  {
    responseField: "main.humidity",
    variableName: "humidity",
    variableType: "number"
  }
]]

Now, let's create states that will be triggered when the temperature and humidity values change:

[Claude uses the createState tool with parameters:
sceneId: "xyz789",
name: "Update Temperature Column",
properties: [
  {
    objectId: "column123",  // The temperature column ID
    property: "scale.y",
    value: "${temperature / 20}"  // Scale based on temperature (divided by 20 to keep proportional)
  },
  {
    objectId: "tempLabel456",  // The temperature label ID
    property: "text",
    value: "Temperature: ${temperature}°F"
  }
],
transitionDuration: 1000,
transitionEasing: "easeOut"]

[Claude uses the createState tool with parameters:
sceneId: "xyz789",
name: "Update Humidity Color",
properties: [
  {
    objectId: "sphere789",  // The humidity sphere ID
    property: "color",
    value: "rgb(0, ${humidity * 2.55}, 255)"  // Blue gets more intense with humidity
  },
  {
    objectId: "humidityLabel012",  // The humidity label ID
    property: "text",
    value: "Humidity: ${humidity}%"
  }
],
transitionDuration: 1000,
transitionEasing: "easeOut"]

Now let's create events that will trigger these states when the variables change:

[Claude uses the createEvent tool with parameters:
sceneId: "xyz789",
name: "Temperature Changed",
type: "variableChange",
objectId: null,  // This is a scene-level event
actions: [
  {
    type: "triggerState",
    target: "tempState345",  // The temperature state ID
    params: {}
  }
]]

[Claude uses the createEvent tool with parameters:
sceneId: "xyz789",
name: "Humidity Changed",
type: "variableChange",
objectId: null,  // This is a scene-level event
actions: [
  {
    type: "triggerState",
    target: "humidityState678",  // The humidity state ID
    params: {}
  }
]]

Perfect! I've set up a complete weather visualization for New York City:

1. A blue cylinder that changes height based on temperature
2. A sphere that changes color intensity based on humidity
3. Text labels that display the actual temperature and humidity values
4. An API connection to OpenWeatherMap to fetch real-time weather data
5. States and events that update the visualization when the data changes

The scene will automatically fetch the weather data when it loads, and the objects will animate to reflect the current temperature and humidity in New York.

Note: You'll need to replace "YOUR_API_KEY" with an actual OpenWeatherMap API key for this to work. Would you like me to help you set that up?

User: Yes, and can you also add a refresh button that updates the data when clicked?

Claude: I'll help you add a refresh button to update the weather data. First, let's create a button object:

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "cube",
name: "Refresh Button",
position: { x: 0, y: -2, z: 0 },
scale: { x: 1.5, y: 0.5, z: 0.2 },
color: "#4ade80"]

Let's also add a text label on the button:

[Claude uses the createObject tool with parameters:
sceneId: "xyz789",
type: "text",
name: "Refresh Label",
position: { x: 0, y: -2, z: 0.15 },
scale: { x: 0.5, y: 0.5, z: 0.5 },
properties: { text: "REFRESH", align: "center" },
color: "#ffffff"]

Now, let's get the IDs of these new objects:

[Claude uses the getObjects tool with parameters:
sceneId: "xyz789"]

Now, let's create hover states for the button to make it interactive:

[Claude uses the createState tool with parameters:
sceneId: "xyz789",
name: "Button Hover",
properties: [
  {
    objectId: "button901",  // The button ID
    property: "color",
    value: "#22c55e"  // Darker green on hover
  }
],
transitionDuration: 200,
transitionEasing: "easeOut"]

[Claude uses the createState tool with parameters:
sceneId: "xyz789",
name: "Button Normal",
properties: [
  {
    objectId: "button901",  // The button ID
    property: "color",
    value: "#4ade80"  // Original green color
  }
],
transitionDuration: 200,
transitionEasing: "easeOut"]

Now, let's create the events for button hover and click:

[Claude uses the createEvent tool with parameters:
sceneId: "xyz789",
name: "Button Hover",
type: "mouseOver",
objectId: "button901",  // The button ID
actions: [
  {
    type: "triggerState",
    target: "hoverState234",  // The button hover state ID
    params: {}
  }
]]

[Claude uses the createEvent tool with parameters:
sceneId: "xyz789",
name: "Button Unhover",
type: "mouseOut",
objectId: "button901",  // The button ID
actions: [
  {
    type: "triggerState",
    target: "normalState567",  // The button normal state ID
    params: {}
  }
]]

Finally, let's create the click event that refreshes the weather data:

[Claude uses the createEvent tool with parameters:
sceneId: "xyz789",
name: "Refresh Weather Data",
type: "mouseDown",
objectId: "button901",  // The button ID
actions: [
  {
    type: "callFunction",
    target: "refreshWeatherAPI",
    params: {}
  }
]]

Now, regarding the API key, you'll need to get an API key from OpenWeatherMap:

1. Go to https://openweathermap.org/
2. Sign up for a free account
3. Navigate to your API keys or dashboard
4. Copy your API key

Then, update the API configuration to include your key:

[Claude uses the configureApi tool with parameters:
sceneId: "xyz789",
name: "Weather API",
method: "GET",
url: "https://api.openweathermap.org/data/2.5/weather",
queryParams: {
  q: "New York,US",
  appid: "YOUR_ACTUAL_API_KEY",  // Replace with your actual API key
  units: "imperial"
},
requestOnStart: true,
variableMappings: [
  {
    responseField: "main.temp",
    variableName: "temperature",
    variableType: "number"
  },
  {
    responseField: "main.humidity",
    variableName: "humidity",
    variableType: "number"
  }
]]

I've now added a refresh button to your weather visualization:

1. A green button labeled "REFRESH" at the bottom of the scene
2. Hover effects that darken the button when you mouse over it
3. A click event that refreshes the weather data
4. Instructions for getting and setting up your OpenWeatherMap API key

Now your weather visualization is complete! When you open the scene, it will automatically load the current weather data, and you can click the refresh button anytime to get the latest updates.

User: That's perfect! Thank you.

Claude: You're welcome! Your weather visualization in Spline is now complete and ready to use. Here's a summary of what we've built:

1. A temperature column that changes height based on the current temperature in New York
2. A humidity sphere that changes color intensity based on humidity levels
3. Text labels displaying the actual temperature and humidity values
4. An interactive refresh button with hover effects
5. API integration with OpenWeatherMap for real-time data

Remember to replace the placeholder API key with your actual OpenWeatherMap API key for the data fetching to work properly.

To view your visualization:
1. Open your scene in Spline (ID: xyz789)
2. The data will load automatically when the scene starts
3. Hover over the green button to see it change color
4. Click the button to refresh the weather data

If you want to modify the visualization later, you can:
- Change the scale factor for the temperature column
- Adjust the color mapping for humidity
- Add more weather metrics like wind speed or air pressure
- Change the location by updating the API query parameters

Is there anything specific you'd like to know about how this visualization works or any other features you'd like to add?
*/
