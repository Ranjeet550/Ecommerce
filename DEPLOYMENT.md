# Deployment Guide for FreshMart E-commerce

This guide provides instructions for deploying the FreshMart e-commerce application to Netlify and Vercel.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- A Netlify or Vercel account
- A database hosting service (e.g., AWS RDS, DigitalOcean, Planetscale, etc.)

## Deploying the Frontend (Client)

### Option 1: Deploy to Netlify

1. **Push your code to a Git repository**

2. **Connect your repository to Netlify**
   - Log in to Netlify
   - Click "New site from Git"
   - Select your Git provider and repository

3. **Configure the build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `client`

4. **Set environment variables**
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variable:
     - `VITE_API_URL`: Your backend API URL (e.g., https://your-backend-api.com/api)

5. **Deploy the site**
   - Click "Deploy site"

### Option 2: Deploy to Vercel

1. **Push your code to a Git repository**

2. **Connect your repository to Vercel**
   - Log in to Vercel
   - Click "New Project"
   - Import your repository

3. **Configure the project settings**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set environment variables**
   - Go to Project Settings > Environment Variables
   - Add the following environment variable:
     - `VITE_API_URL`: Your backend API URL (e.g., https://your-backend-api.com/api)

5. **Deploy the project**
   - Click "Deploy"

## Deploying the Backend (Server)

### Option 1: Deploy to Render

1. **Create a new Web Service on Render**
   - Connect your Git repository
   - Set the Root Directory to `server`
   - Set the Build Command to `npm install`
   - Set the Start Command to `npm start`

2. **Set environment variables**
   - Add all the environment variables from `.env.production`

3. **Deploy the service**

### Option 2: Deploy to Heroku

1. **Create a new app on Heroku**

2. **Set the buildpack**
   - Go to Settings > Buildpacks
   - Add the Node.js buildpack

3. **Set environment variables**
   - Go to Settings > Config Vars
   - Add all the environment variables from `.env.production`

4. **Deploy the app**
   - Connect your Git repository
   - Deploy the `server` directory

### Option 3: Deploy to Railway

1. **Create a new project on Railway**

2. **Connect your Git repository**

3. **Set the root directory to `server`**

4. **Set environment variables**
   - Add all the environment variables from `.env.production`

5. **Deploy the project**

## Setting Up the Database

1. **Create a MySQL database**
   - You can use services like AWS RDS, DigitalOcean, Planetscale, etc.

2. **Update the database connection settings**
   - Update the environment variables in your backend deployment:
     - `DB_HOST`: Your database host
     - `DB_USER`: Your database user
     - `DB_PASSWORD`: Your database password
     - `DB_NAME`: Your database name

3. **Initialize the database**
   - The database tables will be created automatically when the server starts

## Connecting Frontend and Backend

1. **Update the API URL in the frontend**
   - Make sure the `VITE_API_URL` environment variable in your frontend deployment points to your backend API URL

2. **Update the CORS settings in the backend**
   - Update the `origin` array in `server.js` to include your frontend domain

## Testing the Deployment

1. **Test the frontend**
   - Visit your deployed frontend URL
   - Verify that you can browse products, register, login, etc.

2. **Test the backend**
   - Visit your backend API URL (e.g., https://your-backend-api.com/api/test)
   - Verify that you get a response

## Troubleshooting

### Frontend Issues

- **API connection errors**
  - Check that the `VITE_API_URL` environment variable is set correctly
  - Verify that your backend is running and accessible

- **Missing images**
  - Make sure the image paths in the database are correct
  - Check that the `API_BASE_URL` in `imageUtils.js` is set correctly

### Backend Issues

- **Database connection errors**
  - Check that the database environment variables are set correctly
  - Verify that your database is running and accessible

- **CORS errors**
  - Make sure the `origin` array in `server.js` includes your frontend domain

## Maintenance

- **Updating the application**
  - Push changes to your Git repository
  - Your deployment platform will automatically rebuild and deploy the application

- **Monitoring**
  - Set up monitoring tools to track the performance and availability of your application
  - Use logging tools to track errors and issues
