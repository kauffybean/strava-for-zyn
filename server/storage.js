const createMemoryStore = require('memorystore');
const session = require('express-session');

const MemoryStore = createMemoryStore(session);

class MemStorage {
  constructor() {
    this.users = [];
    this.friends = [];
    this.posts = [];
    this.comments = [];
    this.reactions = [];
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add sample data for development
    this._createSampleData();
  }

  _createSampleData() {
    // We'll leave this empty for now and populate when needed
  }

  // User methods
  async getUser(id) {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, userData) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...this.users[index],
      ...userData,
    };
    this.users[index] = updatedUser;
    return updatedUser;
  }

  // Friend methods
  async getFriends(userId) {
    const acceptedFriendships = this.friends.filter(
      f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
    );
    
    return Promise.all(
      acceptedFriendships.map(async (friendship) => {
        const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
        const friend = await this.getUser(friendId);
        if (!friend) return null;
        
        const { password, ...friendWithoutPassword } = friend;
        return friendWithoutPassword;
      })
    ).then(friends => friends.filter(Boolean));
  }

  async getFriendRequests(userId) {
    return this.friends.filter(
      f => f.friendId === userId && f.status === 'pending'
    );
  }

  async createFriendRequest(userId, friendId) {
    // Check if friendship already exists
    const existing = this.friends.find(
      f => (f.userId === userId && f.friendId === friendId) ||
           (f.userId === friendId && f.friendId === userId)
    );
    
    if (existing) {
      return existing;
    }
    
    const newFriendRequest = {
      id: this.friends.length + 1,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date(),
    };
    
    this.friends.push(newFriendRequest);
    return newFriendRequest;
  }

  async acceptFriendRequest(requestId, userId) {
    const index = this.friends.findIndex(
      f => f.id === requestId && f.friendId === userId
    );
    
    if (index === -1) {
      throw new Error('Friend request not found');
    }
    
    const updatedRequest = {
      ...this.friends[index],
      status: 'accepted',
    };
    
    this.friends[index] = updatedRequest;
    return updatedRequest;
  }

  // Post methods
  async getPost(id) {
    const post = this.posts.find(post => post.id === id);
    if (!post) return null;
    
    // Add user data to post
    const user = await this.getUser(post.userId);
    if (!user) return post;
    
    const { password, ...userWithoutPassword } = user;
    return {
      ...post,
      user: userWithoutPassword,
    };
  }

  async getFeedPosts(userId) {
    // Get all friend IDs
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    // Get posts from user and friends, sorted by creation date (newest first)
    const feedPosts = this.posts
      .filter(post => post.userId === userId || friendIds.includes(post.userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add user data to posts
    return Promise.all(
      feedPosts.map(async (post) => {
        const user = await this.getUser(post.userId);
        if (!user) return post;
        
        const { password, ...userWithoutPassword } = user;
        return {
          ...post,
          user: userWithoutPassword,
        };
      })
    );
  }

  async getUserPosts(userId) {
    // Get user's posts, sorted by creation date (newest first)
    const userPosts = this.posts
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add user data to posts
    return Promise.all(
      userPosts.map(async (post) => {
        const user = await this.getUser(post.userId);
        if (!user) return post;
        
        const { password, ...userWithoutPassword } = user;
        return {
          ...post,
          user: userWithoutPassword,
        };
      })
    );
  }

  async createPost(postData) {
    const newPost = {
      id: this.posts.length + 1,
      ...postData,
      createdAt: new Date(),
    };
    
    this.posts.push(newPost);
    
    // Add user data to post
    const user = await this.getUser(newPost.userId);
    if (!user) return newPost;
    
    const { password, ...userWithoutPassword } = user;
    return {
      ...newPost,
      user: userWithoutPassword,
    };
  }

  // Comment methods
  async getComments(postId) {
    const postComments = this.comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Add user data to comments
    return Promise.all(
      postComments.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        if (!user) return comment;
        
        const { password, ...userWithoutPassword } = user;
        return {
          ...comment,
          user: userWithoutPassword,
        };
      })
    );
  }

  async createComment(commentData) {
    const newComment = {
      id: this.comments.length + 1,
      ...commentData,
      createdAt: new Date(),
    };
    
    this.comments.push(newComment);
    
    // Add user data to comment
    const user = await this.getUser(newComment.userId);
    if (!user) return newComment;
    
    const { password, ...userWithoutPassword } = user;
    return {
      ...newComment,
      user: userWithoutPassword,
    };
  }

  // Reaction methods
  async getReactions(postId) {
    const postReactions = this.reactions.filter(
      reaction => reaction.postId === postId
    );
    
    // Add user data to reactions
    return Promise.all(
      postReactions.map(async (reaction) => {
        const user = await this.getUser(reaction.userId);
        if (!user) return reaction;
        
        const { password, ...userWithoutPassword } = user;
        return {
          ...reaction,
          user: userWithoutPassword,
        };
      })
    );
  }

  async createReaction(reactionData) {
    // Check if user already reacted to the post
    const existingIndex = this.reactions.findIndex(
      r => r.postId === reactionData.postId && r.userId === reactionData.userId
    );
    
    let newReaction;
    
    if (existingIndex !== -1) {
      // Update existing reaction
      newReaction = {
        ...this.reactions[existingIndex],
        type: reactionData.type,
      };
      this.reactions[existingIndex] = newReaction;
    } else {
      // Create new reaction
      newReaction = {
        id: this.reactions.length + 1,
        ...reactionData,
        createdAt: new Date(),
      };
      this.reactions.push(newReaction);
    }
    
    // Add user data to reaction
    const user = await this.getUser(newReaction.userId);
    if (!user) return newReaction;
    
    const { password, ...userWithoutPassword } = user;
    return {
      ...newReaction,
      user: userWithoutPassword,
    };
  }

  // Analytics methods
  async getUserAnalytics(userId) {
    const userPosts = this.posts.filter(post => post.userId === userId);
    
    // Calculate analytics
    const totalPosts = userPosts.length;
    
    // Group posts by nicotine strength
    const nicotineStrengthData = {};
    userPosts.forEach(post => {
      const strength = post.nicotineStrength.toString();
      nicotineStrengthData[strength] = (nicotineStrengthData[strength] || 0) + 1;
    });
    
    // Group posts by flavor
    const flavorData = {};
    userPosts.forEach(post => {
      flavorData[post.flavor] = (flavorData[post.flavor] || 0) + 1;
    });
    
    // Group posts by mood
    const moodData = {};
    userPosts.forEach(post => {
      moodData[post.mood] = (moodData[post.mood] || 0) + 1;
    });
    
    // Calculate total reactions received
    const totalReactions = this.reactions.filter(
      reaction => userPosts.some(post => post.id === reaction.postId)
    ).length;
    
    // Calculate total comments received
    const totalComments = this.comments.filter(
      comment => userPosts.some(post => post.id === comment.postId)
    ).length;
    
    return {
      totalPosts,
      nicotineStrengthData,
      flavorData,
      moodData,
      totalReactions,
      totalComments,
    };
  }

  // Search methods
  async searchUsers(query) {
    const matchingUsers = this.users.filter(
      user => user.username.toLowerCase().includes(query.toLowerCase()) ||
              user.displayName.toLowerCase().includes(query.toLowerCase())
    );
    
    return matchingUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }
}

const storage = new MemStorage();

module.exports = { storage };