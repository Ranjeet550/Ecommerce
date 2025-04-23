# Deploying the Backend to Render

This guide provides step-by-step instructions for deploying the FreshMart e-commerce backend to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) if you don't have an account.
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket).

## Deployment Steps

### 1. Create a Render Account

Sign up for a free account at [render.com](https://render.com).

### 2. Connect Your Git Repository

1. In the Render dashboard, click on the "New +" button and select "Web Service".
2. Connect your GitHub, GitLab, or Bitbucket account.
3. Select the repository containing your e-commerce application.

### 3. Configure Your Web Service

Fill in the following details:

- **Name**: `freshmart-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the region closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty if your repository root is the project root, or specify `server` if your backend is in a subdirectory
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node server.js`

### 4. Configure Environment Variables

Add the following environment variables:

- `NODE_ENV`: `production`
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRE`: `30d`

### 5. Set Up a Database

#### Option A: Use Render's MySQL Database

1. In the Render dashboard, click on the "New +" button and select "MySQL".
2. Fill in the following details:
   - **Name**: `freshmart-db` (or your preferred name)
   - **Database**: `grocery_ecommerce`
   - **User**: Leave as default
   - **Region**: Choose the same region as your web service
   - **Plan**: Free

3. After the database is created, go to the "Environment" tab of your web service.
4. Add a new environment variable:
   - `DATABASE_URL`: Copy the "Connection String" from your MySQL database dashboard

#### Option B: Use an External MySQL Database

You can use an external MySQL database service like:
- [PlanetScale](https://planetscale.com/)
- [Amazon RDS](https://aws.amazon.com/rds/mysql/)
- [DigitalOcean Managed MySQL](https://www.digitalocean.com/products/managed-databases-mysql/)

Add the database connection string as an environment variable:
- `DATABASE_URL`: Your MySQL connection string

### 6. Deploy Your Web Service

Click the "Create Web Service" button to deploy your application.

Render will automatically build and deploy your application. You can monitor the deployment progress in the "Events" tab.

### 7. Verify the Deployment

Once the deployment is complete, click on the URL provided by Render to access your application.

You should see the message "API is running...".

### 8. Update CORS Settings

Make sure your CORS settings in `server.js` include your frontend domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.netlify.app', 'https://your-frontend-domain.vercel.app', 'https://your-frontend-domain.onrender.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Replace the placeholder domains with your actual frontend domains.

### 9. Update Frontend API URL

Update your frontend application to use the new backend URL:

1. In your frontend deployment (Netlify/Vercel/Render), set the `VITE_API_URL` environment variable to your Render app URL:
   ```
   VITE_API_URL=https://freshmart-backend.onrender.com/api
   ```

2. Update the Netlify/Vercel/Render configuration to proxy API requests to your Render backend.

## Using Blueprint for Automated Deployment

Render also supports Blueprint for automated deployment. You can use the `render.yaml` file included in this repository to automatically set up your web service and database.

1. In the Render dashboard, click on the "New +" button and select "Blueprint".
2. Connect your repository.
3. Render will automatically detect the `render.yaml` file and set up your services.

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check your database connection string:
   - Go to your web service in the Render dashboard
   - Click on the "Environment" tab
   - Verify the `DATABASE_URL` environment variable

2. Make sure your database service is running:
   - Go to your database in the Render dashboard
   - Check the status in the "Overview" tab

3. Check the logs for error messages:
   - Go to your web service in the Render dashboard
   - Click on the "Logs" tab

### Application Crashes

If your application crashes on startup:

1. Check the logs:
   - Go to your web service in the Render dashboard
   - Click on the "Logs" tab

2. Make sure all required environment variables are set:
   - Go to your web service in the Render dashboard
   - Click on the "Environment" tab

### CORS Issues

If you're experiencing CORS issues:

1. Make sure your CORS settings include your frontend domain.

2. Check the browser console for CORS error messages.

3. Verify that your frontend is making requests to the correct backend URL.

## Scaling and Monitoring

### Scaling

To scale your application:

1. Go to your web service in the Render dashboard
2. Click on the "Settings" tab
3. Under "Instance Type", select a higher tier

### Monitoring

Render provides basic monitoring tools:

1. Go to your web service in the Render dashboard
2. Click on the "Metrics" tab

For more advanced monitoring, you can integrate with services like:
- [Datadog](https://www.datadoghq.com/)
- [New Relic](https://newrelic.com/)
- [Sentry](https://sentry.io/)

## Maintenance

### Updating Your Application

To update your application:

1. Push changes to your Git repository
2. Render will automatically detect the changes and deploy the new version

### Database Backups

For database backups:

1. Go to your database in the Render dashboard
2. Click on the "Backups" tab
3. Configure automatic backups or create manual backups
