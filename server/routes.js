const { createServer } = require('http');
const { setupAuth } = require('./auth');
const { storage } = require('./storage');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

function registerRoutes(app) {
  // Sets up auth routes
  setupAuth(app);
  
  // Test route that doesn't require authentication
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working properly' });
  });
  
  // Session check route
  app.get('/api/session-check', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Friend routes
  app.get("/api/friends", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  });
  
  // Get pending friend requests sent to the user
  app.get("/api/friends/requests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await storage.getFriendRequests(userId);
      
      // Get user details for each request
      const requestsWithUsers = await Promise.all(requests.map(async (request) => {
        const user = await storage.getUser(request.userId);
        if (!user) return null;
        
        const { password, ...userWithoutPassword } = user;
        return {
          ...request,
          sender: userWithoutPassword
        };
      }));
      
      // Filter out any null values (in case a user was deleted)
      const validRequests = requestsWithUsers.filter(req => req !== null);
      
      res.json(validRequests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ error: "Failed to fetch friend requests" });
    }
  });

  app.post("/api/friends/request", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      
      // Validate friend ID
      if (!friendId || isNaN(parseInt(friendId))) {
        return res.status(400).json({ error: "Invalid friend ID" });
      }
      
      // Check that user is not trying to add themselves
      if (parseInt(friendId) === userId) {
        return res.status(400).json({ error: "Cannot add yourself as a friend" });
      }
      
      const result = await storage.createFriendRequest(userId, parseInt(friendId));
      res.status(201).json(result);
    } catch (error) {
      if (error.message === "User or friend not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Friend request already exists") {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error creating friend request:', error);
      res.status(500).json({ error: "Failed to create friend request" });
    }
  });

  app.put("/api/friends/accept/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }
      
      const result = await storage.acceptFriendRequest(requestId, userId);
      res.json(result);
    } catch (error) {
      if (error.message === "Friend request not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error accepting friend request:', error);
      res.status(500).json({ error: "Failed to accept friend request" });
    }
  });

  // Post routes - Feed (combined posts from user and friends)
  app.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const posts = await storage.getFeedPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  
  // Friend-only posts
  app.get("/api/posts/friends", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const posts = await storage.getFriendPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch friend posts" });
    }
  });
  
  // Public feed (all recent posts, paginated)
  app.get("/api/posts/public", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const posts = await storage.getPublicPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public posts" });
    }
  });

  app.get("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const postData = {
        ...req.body,
        userId,
        startTime: new Date(req.body.startTime)
      };
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Comment routes
  app.get("/api/posts/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);
      const commentData = {
        postId,
        userId,
        content: req.body.content
      };
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Reaction routes
  app.get("/api/posts/:id/reactions", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const reactions = await storage.getReactions(postId);
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  app.post("/api/posts/:id/reactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);
      const reactionData = {
        postId,
        userId,
        type: req.body.type
      };
      const reaction = await storage.createReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reaction" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  app.get("/api/users/:id/analytics", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  // Search users route
  app.get("/api/search/users", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

module.exports = { registerRoutes };