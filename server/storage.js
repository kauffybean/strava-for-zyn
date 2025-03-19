const { db, pool } = require('./db');
const { and, or, eq, desc, sql } = require('drizzle-orm');
const schema = require('../shared/db');
const session = require('express-session');
const connectPg = require('connect-pg-simple');

const PostgresSessionStore = connectPg(session);

// Storage interface for PostgreSQL database
class DatabaseStorage {
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id) {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username) {
    const result = await db
      .select()
      .from(schema.users)
      .where(sql`LOWER(${schema.users.username}) = LOWER(${username})`)
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(userData) {
    const result = await db.insert(schema.users).values({
      username: userData.username,
      password: userData.password,
      displayName: userData.displayName || userData.username,
      bio: userData.bio,
      avatar: userData.avatar
    }).returning();
    
    return result[0];
  }
  
  async updateUser(id, userData) {
    const result = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0];
  }
  
  // Friend methods
  async getFriends(userId) {
    // Get all user ids who are friends with this user
    const friendships = await db
      .select()
      .from(schema.friends)
      .where(
        and(
          or(
            eq(schema.friends.userId, userId),
            eq(schema.friends.friendId, userId)
          ),
          eq(schema.friends.status, 'accepted')
        )
      );
    
    // Extract friend IDs
    const friendIds = friendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    if (friendIds.length === 0) {
      return [];
    }
    
    // Get user objects for all friends
    const friends = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        bio: schema.users.bio,
        avatar: schema.users.avatar,
        createdAt: schema.users.createdAt
      })
      .from(schema.users)
      .where(sql`${schema.users.id} IN (${friendIds.join(', ')})`);
    
    return friends;
  }
  
  async getFriendRequests(userId) {
    return await db
      .select()
      .from(schema.friends)
      .where(
        and(
          eq(schema.friends.friendId, userId),
          eq(schema.friends.status, 'pending')
        )
      );
  }
  
  async createFriendRequest(userId, friendId) {
    // Check if users exist
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    
    if (!user || !friend) {
      throw new Error("User or friend not found");
    }
    
    // Check if request already exists
    const existingRequests = await db
      .select()
      .from(schema.friends)
      .where(
        or(
          and(
            eq(schema.friends.userId, userId),
            eq(schema.friends.friendId, friendId)
          ),
          and(
            eq(schema.friends.userId, friendId),
            eq(schema.friends.friendId, userId)
          )
        )
      );
    
    if (existingRequests.length > 0) {
      throw new Error("Friend request already exists");
    }
    
    // Create the friendship request
    const result = await db
      .insert(schema.friends)
      .values({
        userId,
        friendId,
        status: 'pending'
      })
      .returning();
    
    return result[0];
  }
  
  async acceptFriendRequest(requestId, userId) {
    const result = await db
      .update(schema.friends)
      .set({ status: 'accepted' })
      .where(
        and(
          eq(schema.friends.id, requestId),
          eq(schema.friends.friendId, userId)
        )
      )
      .returning();
    
    if (result.length === 0) {
      throw new Error("Friend request not found");
    }
    
    return result[0];
  }
  
  // Post methods
  async getPost(id) {
    const result = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, id))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getFeedPosts(userId) {
    // Get all friend IDs
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    if (friendIds.length === 0) {
      // If no friends, just return user's posts
      return this.getUserPosts(userId);
    }
    
    // Get posts from user and friends
    return await db
      .select()
      .from(schema.posts)
      .where(
        or(
          eq(schema.posts.userId, userId),
          sql`${schema.posts.userId} IN (${friendIds.join(', ')})`
        )
      )
      .orderBy(desc(schema.posts.createdAt));
  }
  
  async getUserPosts(userId) {
    return await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.userId, userId))
      .orderBy(desc(schema.posts.createdAt));
  }
  
  async createPost(post) {
    const result = await db
      .insert(schema.posts)
      .values({
        userId: post.userId,
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        latitude: post.latitude,
        longitude: post.longitude,
        locationName: post.locationName,
        startTime: post.startTime || new Date(),
        duration: post.duration,
        nicotineStrength: post.nicotineStrength,
        flavor: post.flavor,
        mood: post.mood
      })
      .returning();
    
    return result[0];
  }
  
  // Comment methods
  async getComments(postId) {
    const comments = await db
      .select({
        id: schema.comments.id,
        postId: schema.comments.postId,
        userId: schema.comments.userId,
        content: schema.comments.content,
        createdAt: schema.comments.createdAt,
        user: {
          id: schema.users.id,
          username: schema.users.username,
          displayName: schema.users.displayName,
          bio: schema.users.bio,
          avatar: schema.users.avatar,
          createdAt: schema.users.createdAt
        }
      })
      .from(schema.comments)
      .innerJoin(schema.users, eq(schema.comments.userId, schema.users.id))
      .where(eq(schema.comments.postId, postId))
      .orderBy(schema.comments.createdAt);
    
    return comments;
  }
  
  async createComment(comment) {
    const result = await db
      .insert(schema.comments)
      .values({
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content
      })
      .returning();
    
    return result[0];
  }
  
  // Reaction methods
  async getReactions(postId) {
    const reactions = await db
      .select({
        id: schema.reactions.id,
        postId: schema.reactions.postId,
        userId: schema.reactions.userId,
        type: schema.reactions.type,
        createdAt: schema.reactions.createdAt,
        user: {
          id: schema.users.id,
          username: schema.users.username,
          displayName: schema.users.displayName,
          bio: schema.users.bio,
          avatar: schema.users.avatar,
          createdAt: schema.users.createdAt
        }
      })
      .from(schema.reactions)
      .innerJoin(schema.users, eq(schema.reactions.userId, schema.users.id))
      .where(eq(schema.reactions.postId, postId));
    
    return reactions;
  }
  
  async createReaction(reaction) {
    // Check if user already reacted to this post
    const existingReactions = await db
      .select()
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.postId, reaction.postId),
          eq(schema.reactions.userId, reaction.userId)
        )
      );
    
    const existingReaction = existingReactions.length > 0 ? existingReactions[0] : null;
    
    if (existingReaction) {
      // If user reacted with the same type, remove the reaction
      if (existingReaction.type === reaction.type) {
        await db
          .delete(schema.reactions)
          .where(eq(schema.reactions.id, existingReaction.id));
        
        return existingReaction;
      }
      
      // If user reacted with a different type, update the reaction
      const result = await db
        .update(schema.reactions)
        .set({ type: reaction.type })
        .where(eq(schema.reactions.id, existingReaction.id))
        .returning();
      
      return result[0];
    }
    
    // Otherwise, create a new reaction
    const result = await db
      .insert(schema.reactions)
      .values({
        postId: reaction.postId,
        userId: reaction.userId,
        type: reaction.type
      })
      .returning();
    
    return result[0];
  }
  
  // Analytics
  async getUserAnalytics(userId) {
    const userPosts = await this.getUserPosts(userId);
    
    // Calculate total posts
    const totalPosts = userPosts.length;
    
    // Calculate nicotine consumption
    const totalNicotine = userPosts.reduce((sum, post) => sum + Number(post.nicotineStrength), 0);
    
    // Calculate favorite flavor
    const flavorCounts = {};
    userPosts.forEach(post => {
      flavorCounts[post.flavor] = (flavorCounts[post.flavor] || 0) + 1;
    });
    const favoriteFlavorEntries = Object.entries(flavorCounts);
    const favoriteFlavorEntry = favoriteFlavorEntries.length > 0 
      ? favoriteFlavorEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max, ['None', 0])
      : ['None', 0];
    const favoriteFlavorPercentage = totalPosts > 0 
      ? Math.round((favoriteFlavorEntry[1] / totalPosts) * 100) 
      : 0;
    
    // Calculate favorite mood
    const moodCounts = {};
    userPosts.forEach(post => {
      moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
    });
    const favoriteMoodEntries = Object.entries(moodCounts);
    const favoriteMoodEntry = favoriteMoodEntries.length > 0 
      ? favoriteMoodEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max, ['None', 0])
      : ['None', 0];
    const favoriteMoodPercentage = totalPosts > 0 
      ? Math.round((favoriteMoodEntry[1] / totalPosts) * 100) 
      : 0;
    
    // Get total reactions
    let totalReactions = 0;
    for (const post of userPosts) {
      const reactions = await this.getReactions(post.id);
      totalReactions += reactions.length;
    }
    
    // Most active hour
    const hourCounts = {};
    userPosts.forEach(post => {
      const hour = new Date(post.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHourEntries = Object.entries(hourCounts);
    const mostActiveHourEntry = mostActiveHourEntries.length > 0 
      ? mostActiveHourEntries.reduce((max, entry) => parseInt(entry[0]) > parseInt(max[0]) ? entry : max, ['0', 0])
      : ['0', 0];
    
    return {
      totalPosts,
      totalNicotine,
      favoriteFlavorName: favoriteFlavorEntry[0],
      favoriteFlavorCount: favoriteFlavorEntry[1],
      favoriteFlavorPercentage,
      favoriteMoodName: favoriteMoodEntry[0],
      favoriteMoodCount: favoriteMoodEntry[1],
      favoriteMoodPercentage,
      totalReactions,
      mostActiveHour: parseInt(mostActiveHourEntry[0]),
      mostActiveHourCount: mostActiveHourEntry[1],
    };
  }
  
  // Search
  async searchUsers(query) {
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        bio: schema.users.bio,
        avatar: schema.users.avatar,
        createdAt: schema.users.createdAt
      })
      .from(schema.users)
      .where(
        or(
          sql`LOWER(${schema.users.username}) LIKE LOWER(${'%' + query + '%'})`,
          sql`LOWER(${schema.users.displayName}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .limit(10);
    
    return users;
  }
}

// Create and export the storage instance
const storage = new DatabaseStorage();

module.exports = { storage };