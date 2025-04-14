# ZYNFANTRY - Front-line Pouchers

A Strava-inspired social tracking application for Zyn consumption that combines user analytics, geographical insights, and community engagement features with military-themed aesthetics.

## Project Overview

Zynfantry is a full-stack social tracking application that allows users to track and share their Zyn (nicotine pouch) consumption with friends. Users can log details such as:

- Nicotine strength
- Flavor profiles
- Duration of use
- Mood during consumption
- Geographic location data

The application includes social features like friend connections, commenting, and reactions to create an engaging community experience.

## Tech Stack

### Frontend
- **React** with **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching and state management
- **React Hook Form** for form validation
- **Leaflet** for interactive maps and location data visualization

### Backend
- **Node.js** and **Express.js** for API server
- **PostgreSQL** database for data persistence 
- **Drizzle ORM** for database interactions
- **Passport.js** for authentication
- **Session-based auth** with PostgreSQL session store

## Architecture

The application follows a modern client-server architecture:

1. **Client**
   - Single Page Application (SPA) built with React
   - Communicates with the server via RESTful API
   - Responsive design for both desktop and mobile experiences

2. **Server**
   - Express.js backend handling API requests
   - RESTful API endpoints for all application features
   - JWT or Session-based authentication

3. **Database**
   - PostgreSQL database with tables for:
     - Users
     - Posts (Zyn consumption records)
     - Comments
     - Reactions
     - Friend relationships
     - Sessions

## Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/zynfantry.git
   cd zynfantry
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add required environment variables (see `.env.example`)

4. Initialize database
   ```
   npm run db:push
   ```

5. Start development server
   ```
   npm run dev
   ```

## Production Deployment

The project includes several scripts to facilitate deployment:

1. **prepare-for-deploy.js**
   - Compiles TypeScript files
   - Fixes module import paths
   - Creates necessary directory structure
   - Generates optimized server entry points

2. **modified-deploy.js**
   - Verifies all required files exist
   - Creates production startup script
   - Performs final checks before deployment

3. **start-prod.js**
   - Production entry point script
   - Sets environment variables
   - Starts server with proper error handling

### Deployment Steps

1. Prepare the application for deployment:
   ```
   node prepare-for-deploy.js
   ```

2. Run the deployment script:
   ```
   node modified-deploy.js
   ```

3. Start the production server:
   ```
   node start-prod.js
   ```

## Project Structure

```
.
├── client/                     # Frontend React application
│   ├── src/                    # React source code
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript type definitions
│   │   └── App.tsx             # Main application component
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite configuration
├── server/                     # Backend Express application
│   ├── auth.ts                 # Authentication logic
│   ├── db.ts                   # Database connection
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API routes
│   └── storage.ts              # Data access layer
├── shared/                     # Shared code between client and server
│   ├── db.ts                   # Database schema
│   └── schema.ts               # Type definitions
├── dist/                       # Compiled output
├── server/dist/                # Server-specific compiled output
├── prepare-for-deploy.js       # Deployment preparation script
├── modified-deploy.js          # Deployment script
├── start-prod.js               # Production startup script
└── package.json                # Project metadata and dependencies
```

## Database Schema

The application uses the following database schema:

### Users
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `displayName`: Display name
- `bio`: User biography
- `avatar`: Profile picture URL
- `createdAt`: Account creation timestamp

### Posts
- `id`: Primary key
- `userId`: Foreign key to users
- `title`: Post title
- `description`: Post description
- `imageUrl`: Optional image URL
- `latitude`/`longitude`: Location coordinates
- `locationName`: Location name
- `startTime`: Time of consumption
- `duration`: Duration in minutes
- `nicotineStrength`: Strength in mg
- `flavor`: Flavor type
- `mood`: User's mood
- `createdAt`: Post creation timestamp

### Comments
- `id`: Primary key
- `postId`: Foreign key to posts
- `userId`: Foreign key to users
- `content`: Comment text
- `createdAt`: Comment timestamp

### Reactions
- `id`: Primary key
- `postId`: Foreign key to posts
- `userId`: Foreign key to users
- `type`: Reaction type
- `createdAt`: Reaction timestamp

### Friends
- `id`: Primary key
- `userId`: User who sent request
- `friendId`: User who received request
- `status`: Status (pending/accepted)
- `createdAt`: Timestamp

## User Testing Information

### Access the Application

The application is deployed and accessible at:
https://{{REPLIT_USERNAME}}.replit.app

### Test Accounts

You can either:
1. Register a new account on the auth page
2. Use the test account:
   - Username: tester2
   - Password: testpass123

### Core Features to Test

1. **User Authentication**
   - Register a new account
   - Log in with existing credentials
   - View and update your profile

2. **Post Creation and Interaction**
   - Create new Zyn consumption posts
   - Add nicotine strength, flavor, mood, and duration
   - Include location data (if available)
   - View your posts on your profile

3. **Social Features**
   - Search for other users
   - Send friend requests
   - View friend activity in your feed
   - Comment on posts

4. **Analytics**
   - Check your weekly deployments
   - View tactical scoring
   - Analyze trends in usage patterns

## Deployment Architecture

The deployment architecture includes:

1. **Build Process**
   - TypeScript compilation targeting both `dist/` and `server/dist/`
   - Proper module path resolution for shared code
   - CommonJS module format for compatibility

2. **Server Configuration**
   - Production mode with environment variables
   - Proper error handling and graceful shutdown
   - Static file serving for client assets

3. **Database Integration**
   - Connection pooling for optimal performance
   - Schema management through Drizzle ORM
   - Session storage in PostgreSQL

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check that all TypeScript files are properly compiled
   - Verify path resolution in the compiled JavaScript files
   - Ensure shared modules are copied to both dist directories

2. **Database connection issues**
   - Verify DATABASE_URL environment variable is correctly set
   - Check database credentials and permissions
   - Ensure PostgreSQL service is running

3. **Static files not serving**
   - Verify client build files exist in the expected location
   - Check server route configuration for static file handling
   - Confirm file permissions are correct

### Getting Help

If you encounter any issues not covered here, please:
1. Check the console logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are properly installed

## Feedback

Please provide feedback on:
- User interface and military theme
- Ease of navigation
- Feature completeness
- Any bugs or issues encountered

Your feedback will help improve the Zynfantry experience for all front-line pouchers!