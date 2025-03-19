import { 
  User, InsertUser, Friend, 
  Post, InsertPost, 
  Comment, InsertComment, 
  Reaction, InsertReaction 
} from "../shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import * as schema from "../shared/db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Friend methods
  getFriends(userId: number): Promise<User[]>;
  getFriendRequests(userId: number): Promise<Friend[]>;
  createFriendRequest(userId: number, friendId: number): Promise<Friend>;
  acceptFriendRequest(requestId: number, userId: number): Promise<Friend>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getFeedPosts(userId: number): Promise<Post[]>;
  getUserPosts(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Comment methods
  getComments(postId: number): Promise<(Comment & { user: Omit<User, 'password'> })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Reaction methods
  getReactions(postId: number): Promise<(Reaction & { user: Omit<User, 'password'> })[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  
  // Analytics
  getUserAnalytics(userId: number): Promise<any>;
  
  // Search
  searchUsers(query: string): Promise<Omit<User, 'password'>[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private friends: Friend[] = [];
  private posts: Post[] = [];
  private comments: Comment[] = [];
  private reactions: Reaction[] = [];
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      username: user.username,
      password: user.password,
      displayName: user.displayName || user.username,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt || new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) throw new Error("User not found");
    
    const updatedUser = { ...this.users[index], ...userData };
    this.users[index] = updatedUser;
    return updatedUser;
  }
  
  // Friend methods
  async getFriends(userId: number): Promise<User[]> {
    // Get all accepted friend connections where userId is either the user or the friend
    const friendships = this.friends.filter(f => 
      (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
    );
    
    // Extract the ids of all friends
    const friendIds = friendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    // Get the user objects for all friends
    return this.users
      .filter(user => friendIds.includes(user.id))
      .map(({ password, ...user }) => user as User);
  }
  
  async getFriendRequests(userId: number): Promise<Friend[]> {
    // Get friend requests sent to this user
    return this.friends.filter(f => f.friendId === userId && f.status === 'pending');
  }
  
  async createFriendRequest(userId: number, friendId: number): Promise<Friend> {
    // Check if users exist
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    if (!user || !friend) throw new Error("User or friend not found");
    
    // Check if request already exists
    const existingRequest = this.friends.find(f => 
      (f.userId === userId && f.friendId === friendId) || 
      (f.userId === friendId && f.friendId === userId)
    );
    if (existingRequest) throw new Error("Friend request already exists");
    
    const newFriendRequest: Friend = {
      id: this.friends.length + 1,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date()
    };
    this.friends.push(newFriendRequest);
    return newFriendRequest;
  }
  
  async acceptFriendRequest(requestId: number, userId: number): Promise<Friend> {
    const index = this.friends.findIndex(f => f.id === requestId && f.friendId === userId);
    if (index === -1) throw new Error("Friend request not found");
    
    const updatedRequest = { ...this.friends[index], status: 'accepted' as const };
    this.friends[index] = updatedRequest;
    return updatedRequest;
  }
  
  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.find(post => post.id === id);
  }
  
  async getFeedPosts(userId: number): Promise<Post[]> {
    // Get all friend ids
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    // Get posts from user and friends, sorted by creation date
    return this.posts
      .filter(post => post.userId === userId || friendIds.includes(post.userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    return this.posts
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: this.posts.length + 1,
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
      mood: post.mood,
      createdAt: post.createdAt || new Date()
    };
    this.posts.push(newPost);
    return newPost;
  }
  
  // Comment methods
  async getComments(postId: number): Promise<(Comment & { user: Omit<User, 'password'> })[]> {
    const comments = this.comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return comments.map(comment => {
      const user = this.users.find(u => u.id === comment.userId);
      if (!user) throw new Error("Comment user not found");
      
      const { password, ...userWithoutPassword } = user;
      return {
        ...comment,
        user: userWithoutPassword as User
      };
    });
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.comments.length + 1,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt || new Date()
    };
    this.comments.push(newComment);
    return newComment;
  }
  
  // Reaction methods
  async getReactions(postId: number): Promise<(Reaction & { user: Omit<User, 'password'> })[]> {
    const reactions = this.reactions.filter(reaction => reaction.postId === postId);
    
    return reactions.map(reaction => {
      const user = this.users.find(u => u.id === reaction.userId);
      if (!user) throw new Error("Reaction user not found");
      
      const { password, ...userWithoutPassword } = user;
      return {
        ...reaction,
        user: userWithoutPassword as User
      };
    });
  }
  
  async createReaction(reaction: InsertReaction): Promise<Reaction> {
    // Check if user already reacted to this post
    const existingReaction = this.reactions.find(
      r => r.postId === reaction.postId && r.userId === reaction.userId
    );
    
    if (existingReaction) {
      // If user already reacted with the same type, remove the reaction
      if (existingReaction.type === reaction.type) {
        this.reactions = this.reactions.filter(
          r => !(r.postId === reaction.postId && r.userId === reaction.userId)
        );
        return existingReaction;
      }
      
      // If user reacted with a different type, update the reaction
      const index = this.reactions.findIndex(
        r => r.postId === reaction.postId && r.userId === reaction.userId
      );
      const updatedReaction = { ...this.reactions[index], type: reaction.type };
      this.reactions[index] = updatedReaction;
      return updatedReaction;
    }
    
    // Otherwise, create a new reaction
    const newReaction: Reaction = {
      id: this.reactions.length + 1,
      postId: reaction.postId,
      userId: reaction.userId,
      type: reaction.type,
      createdAt: reaction.createdAt || new Date()
    };
    this.reactions.push(newReaction);
    return newReaction;
  }
  
  // Analytics
  async getUserAnalytics(userId: number): Promise<any> {
    const userPosts = await this.getUserPosts(userId);
    
    // Calculate total posts
    const totalPosts = userPosts.length;
    
    // Calculate nicotine consumption
    const totalNicotine = userPosts.reduce((sum, post) => sum + post.nicotineStrength, 0);
    
    // Calculate favorite flavor
    const flavorCounts: Record<string, number> = {};
    userPosts.forEach(post => {
      flavorCounts[post.flavor] = (flavorCounts[post.flavor] || 0) + 1;
    });
    const favoriteFlavorEntries = Object.entries(flavorCounts);
    const favoriteFlavorEntry = favoriteFlavorEntries.length > 0 
      ? favoriteFlavorEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
      : ['None', 0];
    const favoriteFlavorPercentage = totalPosts > 0 
      ? Math.round((favoriteFlavorEntry[1] / totalPosts) * 100) 
      : 0;
    
    // Calculate favorite mood
    const moodCounts: Record<string, number> = {};
    userPosts.forEach(post => {
      moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
    });
    const favoriteMoodEntries = Object.entries(moodCounts);
    const favoriteMoodEntry = favoriteMoodEntries.length > 0 
      ? favoriteMoodEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
      : ['None', 0];
    const favoriteMoodPercentage = totalPosts > 0 
      ? Math.round((favoriteMoodEntry[1] / totalPosts) * 100) 
      : 0;
    
    // Get total reactions received
    let totalReactions = 0;
    for (const post of userPosts) {
      const reactions = await this.getReactions(post.id);
      totalReactions += reactions.length;
    }
    
    // Calculate most active time of day
    const hourCounts: Record<number, number> = {};
    userPosts.forEach(post => {
      const hour = post.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHourEntries = Object.entries(hourCounts);
    const mostActiveHourEntry = mostActiveHourEntries.length > 0 
      ? mostActiveHourEntries.reduce((max, entry) => parseInt(entry[0]) > max[0] ? entry : max, [0, 0])
      : [0, 0];
    
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
      mostActiveHour: parseInt(mostActiveHourEntry[0].toString()),
      mostActiveHourCount: mostActiveHourEntry[1],
    };
  }
  
  // Search
  async searchUsers(query: string): Promise<Omit<User, 'password'>[]> {
    const lowerQuery = query.toLowerCase();
    return this.users
      .filter(user => 
        user.username.toLowerCase().includes(lowerQuery) || 
        user.displayName.toLowerCase().includes(lowerQuery)
      )
      .map(({ password, ...user }) => user as User)
      .slice(0, 10); // Limit to 10 results
  }
}

// PostgreSQL storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(schema.users)
      .where(sql`LOWER(${schema.users.username}) = LOWER(${username})`)
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values({
      username: user.username,
      password: user.password,
      displayName: user.displayName || user.username,
      bio: user.bio,
      avatar: user.avatar
    }).returning();
    
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
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
  async getFriends(userId: number): Promise<User[]> {
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
  
  async getFriendRequests(userId: number): Promise<Friend[]> {
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
  
  async createFriendRequest(userId: number, friendId: number): Promise<Friend> {
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
  
  async acceptFriendRequest(requestId: number, userId: number): Promise<Friend> {
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
  async getPost(id: number): Promise<Post | undefined> {
    const result = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, id))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getFeedPosts(userId: number): Promise<(Post & { user: Omit<User, 'password'> })[]> {
    // Get all friend IDs
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    let userIds = [userId];
    if (friendIds.length > 0) {
      userIds = [...userIds, ...friendIds];
    }
    
    // Get posts from user and friends
    const posts = await db
      .select()
      .from(schema.posts)
      .where(
        sql`${schema.posts.userId} IN (${userIds.join(', ')})`
      )
      .orderBy(desc(schema.posts.createdAt));
      
    // Get all users who made these posts
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
      .where(sql`${schema.users.id} IN (${userIds.join(', ')})`);
    
    // Map users to their posts
    return posts.map(post => {
      const postUser = users.find(u => u.id === post.userId);
      return {
        ...post,
        user: postUser || {
          id: post.userId,
          username: 'unknown',
          displayName: 'Unknown User',
          createdAt: new Date()
        }
      };
    });
  }
  
  async getUserPosts(userId: number): Promise<(Post & { user: Omit<User, 'password'> })[]> {
    // Get posts for user
    const posts = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.userId, userId))
      .orderBy(desc(schema.posts.createdAt));
      
    // Get user data
    const user = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        bio: schema.users.bio,
        avatar: schema.users.avatar,
        createdAt: schema.users.createdAt
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    const userData = user.length > 0 ? user[0] : {
      id: userId,
      username: 'unknown',
      displayName: 'Unknown User',
      createdAt: new Date()
    };
    
    // Map user to posts
    return posts.map(post => ({
      ...post,
      user: userData
    }));
  }
  
  async createPost(post: InsertPost): Promise<Post> {
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
  async getComments(postId: number): Promise<(Comment & { user: Omit<User, 'password'> })[]> {
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
    
    return comments.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user
    }));
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
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
  async getReactions(postId: number): Promise<(Reaction & { user: Omit<User, 'password'> })[]> {
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
    
    return reactions.map(reaction => ({
      id: reaction.id,
      postId: reaction.postId,
      userId: reaction.userId,
      type: reaction.type,
      createdAt: reaction.createdAt,
      user: reaction.user
    }));
  }
  
  async createReaction(reaction: InsertReaction): Promise<Reaction> {
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
  async getUserAnalytics(userId: number): Promise<any> {
    const userPosts = await this.getUserPosts(userId);
    
    // Calculate total posts
    const totalPosts = userPosts.length;
    
    // Calculate nicotine consumption
    const totalNicotine = userPosts.reduce((sum, post) => sum + Number(post.nicotineStrength), 0);
    
    // Calculate favorite flavor
    const flavorCounts: Record<string, number> = {};
    userPosts.forEach(post => {
      flavorCounts[post.flavor] = (flavorCounts[post.flavor] || 0) + 1;
    });
    const favoriteFlavorEntries = Object.entries(flavorCounts);
    const favoriteFlavorEntry = favoriteFlavorEntries.length > 0 
      ? favoriteFlavorEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
      : ['None', 0];
    const favoriteFlavorPercentage = totalPosts > 0 
      ? Math.round((favoriteFlavorEntry[1] / totalPosts) * 100) 
      : 0;
    
    // Calculate favorite mood
    const moodCounts: Record<string, number> = {};
    userPosts.forEach(post => {
      moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
    });
    const favoriteMoodEntries = Object.entries(moodCounts);
    const favoriteMoodEntry = favoriteMoodEntries.length > 0 
      ? favoriteMoodEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
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
    const hourCounts: Record<number, number> = {};
    userPosts.forEach(post => {
      const hour = new Date(post.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHourEntries = Object.entries(hourCounts);
    const mostActiveHourEntry = mostActiveHourEntries.length > 0 
      ? mostActiveHourEntries.reduce((max, entry) => parseInt(entry[0]) > max[0] ? entry : max, [0, 0])
      : [0, 0];
    
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
      mostActiveHour: parseInt(mostActiveHourEntry[0].toString()),
      mostActiveHourCount: mostActiveHourEntry[1],
    };
  }
  
  // Search
  async searchUsers(query: string): Promise<Omit<User, 'password'>[]> {
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
export const storage = new DatabaseStorage();
