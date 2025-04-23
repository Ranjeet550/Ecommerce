/**
 * Render deployment helper script
 * 
 * This script helps prepare the application for deployment to Render by:
 * 1. Updating the CORS settings in server.js
 * 2. Creating or updating the render.yaml file
 * 
 * Usage: node deploy-render.js <frontend-domain>
 */

const fs = require('fs');
const path = require('path');

// Get the frontend domain from the command line arguments
const frontendDomain = process.argv[2];

if (!frontendDomain) {
  console.error('Please provide a frontend domain. Usage: node deploy-render.js <frontend-domain>');
  console.error('Example: node deploy-render.js freshmart-frontend.netlify.app');
  process.exit(1);
}

// Function to update CORS settings in server.js
const updateCORSSettings = (frontendDomain) => {
  console.log('Updating CORS settings...');
  
  const serverJsPath = path.join(__dirname, 'server', 'server.js');
  let serverJs = fs.readFileSync(serverJsPath, 'utf8');
  
  // Extract the current origins array
  const originsRegex = /origin: process\.env\.NODE_ENV === 'production'\s*\?\s*\[(.*?)\]\s*:/;
  const originsMatch = serverJs.match(originsRegex);
  
  if (!originsMatch) {
    console.error('Could not find CORS origins in server.js');
    return false;
  }
  
  // Get the current origins
  const currentOrigins = originsMatch[1].split(',').map(origin => origin.trim());
  
  // Format the frontend domain
  let formattedDomain = frontendDomain;
  if (!formattedDomain.startsWith('https://')) {
    formattedDomain = `https://${formattedDomain}`;
  }
  
  // Check if the domain is already in the origins
  if (!currentOrigins.includes(`'${formattedDomain}'`)) {
    // Add the new domain to the origins
    const newOrigins = [...currentOrigins, `'${formattedDomain}'`];
    
    // Update the server.js file
    serverJs = serverJs.replace(
      originsRegex,
      `origin: process.env.NODE_ENV === 'production' ? [${newOrigins.join(', ')}] :`
    );
    
    fs.writeFileSync(serverJsPath, serverJs);
    console.log(`Added ${formattedDomain} to CORS origins`);
  } else {
    console.log(`${formattedDomain} is already in CORS origins`);
  }
  
  return true;
};

// Function to create or update the render.yaml file
const updateRenderYaml = (frontendDomain) => {
  console.log('Creating/updating render.yaml file...');
  
  const renderYamlPath = path.join(__dirname, 'render.yaml');
  
  // Create the render.yaml content
  const renderYaml = `services:
  - type: web
    name: freshmart-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_EXPIRE
        value: 30d
      - key: JWT_SECRET
        sync: false
      - key: CORS_ORIGIN
        value: ${frontendDomain}
      - key: DATABASE_URL
        fromDatabase:
          name: freshmart-db
          property: connectionString

databases:
  - name: freshmart-db
    databaseName: grocery_ecommerce
    plan: free`;
  
  fs.writeFileSync(renderYamlPath, renderYaml);
  console.log('render.yaml file created/updated');
  
  return true;
};

// Main function
const main = () => {
  console.log(`Preparing for deployment to Render with frontend domain: ${frontendDomain}`);
  
  // Update CORS settings
  if (!updateCORSSettings(frontendDomain)) {
    console.error('Failed to update CORS settings');
    process.exit(1);
  }
  
  // Update render.yaml
  if (!updateRenderYaml(frontendDomain)) {
    console.error('Failed to update render.yaml');
    process.exit(1);
  }
  
  console.log('\nDeployment preparation complete!');
  console.log('\nNext steps:');
  console.log('1. Commit and push your changes to your Git repository');
  console.log('2. Go to render.com and create a new Web Service');
  console.log('3. Connect your Git repository');
  console.log('4. Render will automatically detect the render.yaml file and set up your services');
  console.log('5. Update your frontend to use the new backend URL');
};

// Run the main function
main();
