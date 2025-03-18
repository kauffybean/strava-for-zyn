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
    // Create a test user
    const hashedPassword = '$2b$10$A7B8C9D0E1F2G3H4I5J6K7.L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2'; // 'password'
    
    // Sample users with military-themed usernames
    this.users = [
      {
        id: 1,
        username: 'commander',
        password: hashedPassword,
        displayName: 'Field Commander',
        bio: 'Leading the Zyn battalion since 2021. Veteran of multiple flavor campaigns.',
        avatar: 'https://robohash.org/commander?set=set4',
        createdAt: new Date('2023-01-01')
      },
      {
        id: 2,
        username: 'sergeant',
        password: hashedPassword,
        displayName: 'Sergeant Pouch',
        bio: 'Tactical Zyn specialist. Mint is my signature deployment.',
        avatar: 'https://robohash.org/sergeant?set=set4',
        createdAt: new Date('2023-02-15')
      },
      {
        id: 3,
        username: 'recruit',
        password: hashedPassword,
        displayName: 'New Recruit',
        bio: 'Fresh to the Zynfantry. Learning the tactics from the veterans.',
        avatar: 'https://robohash.org/recruit?set=set4',
        createdAt: new Date('2023-05-20')
      }
    ];
    
    // Sample friend connections
    this.friends = [
      {
        id: 1,
        userId: 1,
        friendId: 2,
        status: 'accepted',
        createdAt: new Date('2023-03-01')
      },
      {
        id: 2,
        userId: 1,
        friendId: 3,
        status: 'accepted',
        createdAt: new Date('2023-06-01')
      },
      {
        id: 3,
        userId: 2,
        friendId: 3,
        status: 'pending',
        createdAt: new Date('2023-06-15')
      }
    ];
    
    // Sample posts with military-themed content
    this.posts = [
      {
        id: 1,
        userId: 1,
        title: 'Morning Deployment',
        description: 'Starting the day with a tactical mint deployment. Essential for mission readiness.',
        imageUrl: 'https://picsum.photos/seed/zynpost1/500/300',
        latitude: 40.7128,
        longitude: -74.0060,
        locationName: 'Base Camp Alpha',
        startTime: new Date('2023-07-15T08:00:00'),
        duration: 45,
        nicotineStrength: 6,
        flavor: 'Mint',
        mood: 'Focused',
        createdAt: new Date('2023-07-15T08:45:00')
      },
      {
        id: 2,
        userId: 2,
        title: 'Field Operation Success',
        description: 'Completed the afternoon patrol with a wintergreen tactical aid. Morale is high.',
        imageUrl: 'https://picsum.photos/seed/zynpost2/500/300',
        latitude: 34.0522,
        longitude: -118.2437,
        locationName: 'Forward Operating Base',
        startTime: new Date('2023-07-16T14:30:00'),
        duration: 30,
        nicotineStrength: 3,
        flavor: 'Wintergreen',
        mood: 'Energized',
        createdAt: new Date('2023-07-16T15:00:00')
      },
      {
        id: 3,
        userId: 3,
        title: 'First Deployment',
        description: 'Rookie mission with my first citrus pouch. The veterans have trained me well.',
        imageUrl: 'https://picsum.photos/seed/zynpost3/500/300',
        startTime: new Date('2023-07-17T10:15:00'),
        duration: 20,
        nicotineStrength: 1.5,
        flavor: 'Citrus',
        mood: 'Nervous',
        createdAt: new Date('2023-07-17T10:35:00')
      }
    ];
    
    // Sample comments
    this.comments = [
      {
        id: 1,
        postId: 1,
        userId: 2,
        content: 'Solid deployment strategy, Commander!',
        createdAt: new Date('2023-07-15T09:30:00')
      },
      {
        id: 2,
        postId: 1,
        userId: 3,
        content: 'Taking notes on your tactical approach.',
        createdAt: new Date('2023-07-15T10:15:00')
      },
      {
        id: 3,
        postId: 2,
        userId: 1,
        content: 'Well executed, Sergeant. That winter deployment is top-notch.',
        createdAt: new Date('2023-07-16T16:00:00')
      },
      {
        id: 4,
        postId: 3,
        userId: 1,
        content: 'Welcome to the Zynfantry, Recruit! First mission success.',
        createdAt: new Date('2023-07-17T11:00:00')
      }
    ];
    
    // Sample reactions
    this.reactions = [
      {
        id: 1,
        postId: 1,
        userId: 2,
        type: 'like',
        createdAt: new Date('2023-07-15T09:15:00')
      },
      {
        id: 2,
        postId: 1,
        userId: 3,
        type: 'love',
        createdAt: new Date('2023-07-15T09:45:00')
      },
      {
        id: 3,
        postId: 2,
        userId: 1,
        type: 'like',
        createdAt: new Date('2023-07-16T15:30:00')
      },
      {
        id: 4,
        postId: 2,
        userId: 3,
        type: 'like',
        createdAt: new Date('2023-07-16T17:00:00')
      },
      {
        id: 5,
        postId: 3,
        userId: 1,
        type: 'love',
        createdAt: new Date('2023-07-17T11:15:00')
      },
      {
        id: 6,
        postId: 3,
        userId: 2,
        type: 'like',
        createdAt: new Date('2023-07-17T12:00:00')
      }
    ];
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