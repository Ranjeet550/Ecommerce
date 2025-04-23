# Deploying the Backend to Heroku

This guide provides step-by-step instructions for deploying the FreshMart e-commerce backend to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com) if you don't have an account.
2. **Heroku CLI**: Install the Heroku CLI from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli).
3. **Git**: Make sure Git is installed on your computer.

## Deployment Steps

### 1. Login to Heroku

Open your terminal/command prompt and log in to Heroku:

```bash
heroku login
```

Follow the prompts to complete the login process.

### 2. Create a Heroku App

Create a new Heroku app:

```bash
heroku create freshmart-backend
```

Replace `freshmart-backend` with your preferred app name. This will create a new Heroku app and add a remote to your Git repository.

### 3. Set Up a MySQL Database

Heroku doesn't provide MySQL as a built-in service. You have two options:

#### Option A: Use JawsDB MySQL Add-on

```bash
heroku addons:create jawsdb:kitefin
```

This will create a MySQL database and set the `JAWSDB_URL` environment variable.

To get your database credentials:

```bash
heroku config:get JAWSDB_URL
```

The URL format is: `mysql://username:password@hostname:port/database_name`

#### Option B: Use an External MySQL Database

You can use an external MySQL database service like:
- [Amazon RDS](https://aws.amazon.com/rds/mysql/)
- [DigitalOcean Managed MySQL](https://www.digitalocean.com/products/managed-databases-mysql/)
- [PlanetScale](https://planetscale.com/)

### 4. Configure Environment Variables

Set the required environment variables:

```bash
# If using JawsDB
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret-key
heroku config:set JWT_EXPIRE=30d

# If using external MySQL database
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=your-db-name
heroku config:set JWT_SECRET=your-jwt-secret-key
heroku config:set JWT_EXPIRE=30d
```

### 5. Update CORS Settings

Make sure your CORS settings in `server.js` include your frontend domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.netlify.app', 'https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Replace `your-frontend-domain.netlify.app` and `your-frontend-domain.vercel.app` with your actual frontend domains.

### 6. Deploy to Heroku

Deploy your application to Heroku:

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

If you're deploying from a subdirectory (e.g., the `server` directory), use:

```bash
git subtree push --prefix server heroku main
```

### 7. Verify the Deployment

Check if your application is running:

```bash
heroku open
```

This will open your application in a browser. You should see the message "API is running...".

You can also check the logs:

```bash
heroku logs --tail
```

### 8. Update Frontend API URL

Update your frontend application to use the new backend URL:

1. In your frontend deployment (Netlify/Vercel), set the `VITE_API_URL` environment variable to your Heroku app URL:
   ```
   VITE_API_URL=https://freshmart-backend.herokuapp.com/api
   ```

2. Update the Netlify/Vercel configuration to proxy API requests to your Heroku app.

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check your database credentials:
   ```bash
   heroku config
   ```

2. Make sure your database service is running and accessible from Heroku.

3. Check the Heroku logs for error messages:
   ```bash
   heroku logs --tail
   ```

### Application Crashes

If your application crashes on startup:

1. Check the Heroku logs:
   ```bash
   heroku logs --tail
   ```

2. Make sure all required environment variables are set:
   ```bash
   heroku config
   ```

3. Try running the application locally with the production environment:
   ```bash
   NODE_ENV=production node server.js
   ```

### CORS Issues

If you're experiencing CORS issues:

1. Make sure your CORS settings include your frontend domain.

2. Check the browser console for CORS error messages.

3. Verify that your frontend is making requests to the correct backend URL.

## Scaling

To scale your application:

```bash
heroku ps:scale web=1
```

This sets the number of web dynos to 1. You can increase this number as needed.

## Monitoring

Heroku provides basic monitoring tools:

```bash
heroku addons:create papertrail:choklad
```

This adds the Papertrail add-on for log management.

## Maintenance

### Updating Your Application

To update your application:

1. Make your changes locally
2. Commit the changes
3. Push to Heroku:
   ```bash
   git push heroku main
   ```

### Database Backups

If using JawsDB:

```bash
heroku addons:create jawsdb-backup:standard
```

This adds the JawsDB Backup add-on for automated backups.
