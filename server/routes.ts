import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { InsertPost, InsertComment, InsertReaction } from "@shared/schema";

// Helper middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

export function registerRoutes(app: Express): Server {
  // Sets up auth routes
  setupAuth(app);
  
  // Add middleware to sanitize API responses for consistent user objects
  app.use((req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Helper function to sanitize user objects
      const sanitizeUser = (user: any) => {
        if (!user) return null;
        return {
          id: user.id || 0,
          username: user.username || 'unknown',
          displayName: user.displayName || 'Unknown User',
          avatar: user.avatar || null,
          bio: user.bio || undefined,
          createdAt: user.createdAt || new Date()
        };
      };
      
      // Process arrays of objects that might contain user property
      if (Array.isArray(body)) {
        body = body.map(item => {
          if (item && typeof item === 'object') {
            if (item.user) {
              item.user = sanitizeUser(item.user);
            }
          }
          return item;
        });
      } 
      // Process single object with user property
      else if (body && typeof body === 'object') {
        if (body.user) {
          body.user = sanitizeUser(body.user);
        }
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  });

  // Friend routes
  app.get("/api/friends", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  });

  app.post("/api/friends/request", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { friendId } = req.body;
      const result = await storage.createFriendRequest(userId, friendId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create friend request" });
    }
  });

  app.put("/api/friends/accept/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const friendId = parseInt(req.params.id);
      const result = await storage.acceptFriendRequest(friendId, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept friend request" });
    }
  });

  // Post routes
  app.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const posts = await storage.getFeedPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Get user who created the post
      const postUser = await storage.getUser(post.userId);
      if (!postUser) {
        return res.status(404).json({ error: "Post user not found" });
      }
      
      // Remove password from user
      const { password, ...userWithoutPassword } = postUser;
      
      // Return post with user info
      res.json({
        ...post,
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const postData: InsertPost = {
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
      const userId = req.user!.id;
      const postId = parseInt(req.params.id);
      const commentData: InsertComment = {
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
      const userId = req.user!.id;
      const postId = parseInt(req.params.id);
      const reactionData: InsertReaction = {
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

  // Current user analytics route for homepage (must come before wildcard routes)
  app.get("/api/users/analytics", isAuthenticated, async (req, res) => {
    console.log('GET /api/users/analytics - User:', req.user);
    try {
      if (!req.user || !req.user.id) {
        console.log('GET /api/users/analytics - No user found in request');
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user.id;
      console.log('GET /api/users/analytics - Fetching analytics for userId:', userId);
      
      try {
        const analytics = await storage.getUserAnalytics(userId);
        console.log('GET /api/users/analytics - Analytics result:', analytics);
        res.json(analytics);
      } catch (analyticsError) {
        console.error('GET /api/users/analytics - Error fetching analytics:', analyticsError);
        res.status(500).json({ error: "Failed to fetch user analytics" });
      }
    } catch (error) {
      console.error('GET /api/users/analytics - Unexpected error:', error);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });
  
  // User analytics route with ID parameter
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
      const query = req.query.q as string;
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
