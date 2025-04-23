/**
 * Heroku deployment helper script
 * 
 * This script helps prepare the application for deployment to Heroku by:
 * 1. Creating a Heroku app if it doesn't exist
 * 2. Adding the JawsDB MySQL add-on
 * 3. Setting environment variables
 * 4. Deploying the application
 * 
 * Usage: node deploy-heroku.js <app-name>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the app name from the command line arguments
const appName = process.argv[2];

if (!appName) {
  console.error('Please provide an app name. Usage: node deploy-heroku.js <app-name>');
  process.exit(1);
}

// Function to execute shell commands
const execCommand = (command) => {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
};

// Function to check if Heroku CLI is installed
const checkHerokuCLI = () => {
  try {
    execSync('heroku --version', { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error('Heroku CLI is not installed. Please install it from https://devcenter.heroku.com/articles/heroku-cli');
    return false;
  }
};

// Function to check if user is logged in to Heroku
const checkHerokuLogin = () => {
  try {
    execSync('heroku auth:whoami', { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.log('You are not logged in to Heroku. Please log in:');
    execCommand('heroku login');
    return true;
  }
};

// Function to check if the app exists
const checkAppExists = (appName) => {
  try {
    execSync(`heroku apps:info -a ${appName}`, { encoding: 'utf8' });
    return true;
  } catch (error) {
    return false;
  }
};

// Function to create a new Heroku app
const createHerokuApp = (appName) => {
  console.log(`Creating Heroku app: ${appName}`);
  return execCommand(`heroku create ${appName}`);
};

// Function to add JawsDB MySQL add-on
const addJawsDB = (appName) => {
  console.log('Adding JawsDB MySQL add-on...');
  return execCommand(`heroku addons:create jawsdb:kitefin -a ${appName}`);
};

// Function to set environment variables
const setEnvironmentVariables = (appName) => {
  console.log('Setting environment variables...');
  
  // Set NODE_ENV to production
  execCommand(`heroku config:set NODE_ENV=production -a ${appName}`);
  
  // Ask for JWT secret
  rl.question('Enter JWT secret key: ', (jwtSecret) => {
    execCommand(`heroku config:set JWT_SECRET=${jwtSecret} -a ${appName}`);
    
    // Set JWT expiration
    execCommand(`heroku config:set JWT_EXPIRE=30d -a ${appName}`);
    
    // Ask for frontend domain
    rl.question('Enter your frontend domain (e.g., https://your-app.netlify.app): ', (frontendDomain) => {
      // Update CORS settings in server.js
      updateCORSSettings(frontendDomain);
      
      console.log('Environment variables set successfully.');
      
      // Deploy the application
      deployToHeroku(appName);
      
      rl.close();
    });
  });
};

// Function to update CORS settings in server.js
const updateCORSSettings = (frontendDomain) => {
  console.log('Updating CORS settings...');
  
  const serverJsPath = path.join(__dirname, 'server', 'server.js');
  let serverJs = fs.readFileSync(serverJsPath, 'utf8');
  
  // Update CORS settings
  serverJs = serverJs.replace(
    /origin: process\.env\.NODE_ENV === 'production'\s*\?\s*\[.*?\]\s*:/,
    `origin: process.env.NODE_ENV === 'production' ? ['${frontendDomain}'] :`
  );
  
  fs.writeFileSync(serverJsPath, serverJs);
  console.log('CORS settings updated successfully.');
};

// Function to deploy to Heroku
const deployToHeroku = (appName) => {
  console.log('Deploying to Heroku...');
  
  // Add and commit changes
  execCommand('git add .');
  execCommand('git commit -m "Prepare for Heroku deployment"');
  
  // Push to Heroku
  execCommand(`git push heroku main`);
  
  console.log(`Deployment complete! Your app is available at: https://${appName}.herokuapp.com`);
  console.log('To view the logs, run:');
  console.log(`heroku logs --tail -a ${appName}`);
};

// Main function
const main = async () => {
  // Check if Heroku CLI is installed
  if (!checkHerokuCLI()) {
    process.exit(1);
  }
  
  // Check if user is logged in to Heroku
  if (!checkHerokuLogin()) {
    process.exit(1);
  }
  
  // Check if the app exists
  const appExists = checkAppExists(appName);
  
  if (!appExists) {
    // Create a new Heroku app
    createHerokuApp(appName);
  } else {
    console.log(`App ${appName} already exists.`);
  }
  
  // Add JawsDB MySQL add-on
  addJawsDB(appName);
  
  // Set environment variables
  setEnvironmentVariables(appName);
};

// Run the main function
main().catch(error => {
  console.error('Deployment failed:', error.message);
  process.exit(1);
});
