/**
 * Deployment helper script
 * 
 * This script helps prepare the application for deployment by:
 * 1. Building the client
 * 2. Copying the necessary files to a deployment directory
 * 3. Creating the necessary configuration files
 * 
 * Usage: node deploy.js [netlify|vercel]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the deployment platform from the command line arguments
const platform = process.argv[2]?.toLowerCase() || 'netlify';

// Validate the platform
if (!['netlify', 'vercel'].includes(platform)) {
  console.error('Invalid platform. Please specify "netlify" or "vercel".');
  process.exit(1);
}

console.log(`Preparing for deployment to ${platform}...`);

// Create the deployment directory if it doesn't exist
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Build the client
console.log('Building the client...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the client:', error.message);
  process.exit(1);
}

// Copy the client build to the deployment directory
console.log('Copying the client build to the deployment directory...');
try {
  // Create the client directory in the deployment directory if it doesn't exist
  const deployClientDir = path.join(deployDir, 'client');
  if (!fs.existsSync(deployClientDir)) {
    fs.mkdirSync(deployClientDir);
  }

  // Copy the client build to the deployment directory
  const clientBuildDir = path.join(__dirname, 'client', 'dist');
  const deployClientBuildDir = path.join(deployClientDir, 'dist');
  
  // Create the dist directory in the deployment directory if it doesn't exist
  if (!fs.existsSync(deployClientBuildDir)) {
    fs.mkdirSync(deployClientBuildDir);
  }

  // Copy all files from the client build directory to the deployment directory
  fs.readdirSync(clientBuildDir).forEach(file => {
    const srcPath = path.join(clientBuildDir, file);
    const destPath = path.join(deployClientBuildDir, file);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      // If it's a directory, copy it recursively
      execSync(`xcopy "${srcPath}" "${destPath}" /E /I /H /Y`, { stdio: 'inherit' });
    } else {
      // If it's a file, copy it
      fs.copyFileSync(srcPath, destPath);
    }
  });
} catch (error) {
  console.error('Failed to copy the client build:', error.message);
  process.exit(1);
}

// Create the necessary configuration files based on the platform
console.log(`Creating configuration files for ${platform}...`);
try {
  if (platform === 'netlify') {
    // Create the netlify.toml file
    const netlifyConfig = `[build]
  base = "client"
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api-url.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
    
    fs.writeFileSync(path.join(deployDir, 'netlify.toml'), netlifyConfig);
  } else if (platform === 'vercel') {
    // Create the vercel.json file
    const vercelConfig = `{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-api-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}`;
    
    fs.writeFileSync(path.join(deployDir, 'vercel.json'), vercelConfig);
  }
} catch (error) {
  console.error(`Failed to create configuration files for ${platform}:`, error.message);
  process.exit(1);
}

console.log('Deployment preparation complete!');
console.log(`The deployment files are in the "${deployDir}" directory.`);
console.log('Please update the API URL in the configuration files before deploying.');
