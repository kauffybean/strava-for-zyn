"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = exports.MemStorage = void 0;
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../shared/db"));
const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
const PostgresSessionStore = (0, connect_pg_simple_1.default)(express_session_1.default);
// In-memory storage implementation
class MemStorage {
    users = [];
    friends = [];
    posts = [];
    comments = [];
    reactions = [];
    sessionStore;
    constructor() {
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        });
    }
    // User methods
    async getUser(id) {
        return this.users.find(user => user.id === id);
    }
    async getUserByUsername(username) {
        return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
    }
    async createUser(user) {
        const newUser = {
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
    async updateUser(id, userData) {
        const index = this.users.findIndex(user => user.id === id);
        if (index === -1)
            throw new Error("User not found");
        const updatedUser = { ...this.users[index], ...userData };
        this.users[index] = updatedUser;
        return updatedUser;
    }
    // Friend methods
    async getFriends(userId) {
        // Get all accepted friend connections where userId is either the user or the friend
        const friendships = this.friends.filter(f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted');
        // Extract the ids of all friends
        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
        // Get the user objects for all friends
        return this.users
            .filter(user => friendIds.includes(user.id))
            .map(({ password, ...user }) => user);
    }
    async getFriendRequests(userId) {
        // Get friend requests sent to this user
        return this.friends.filter(f => f.friendId === userId && f.status === 'pending');
    }
    async createFriendRequest(userId, friendId) {
        // Check if users exist
        const user = await this.getUser(userId);
        const friend = await this.getUser(friendId);
        if (!user || !friend)
            throw new Error("User or friend not found");
        // Check if request already exists
        const existingRequest = this.friends.find(f => (f.userId === userId && f.friendId === friendId) ||
            (f.userId === friendId && f.friendId === userId));
        if (existingRequest)
            throw new Error("Friend request already exists");
        const newFriendRequest = {
            id: this.friends.length + 1,
            userId,
            friendId,
            status: 'pending',
            createdAt: new Date()
        };
        this.friends.push(newFriendRequest);
        return newFriendRequest;
    }
    async acceptFriendRequest(requestId, userId) {
        const index = this.friends.findIndex(f => f.id === requestId && f.friendId === userId);
        if (index === -1)
            throw new Error("Friend request not found");
        const updatedRequest = { ...this.friends[index], status: 'accepted' };
        this.friends[index] = updatedRequest;
        return updatedRequest;
    }
    // Post methods
    async getPost(id) {
        return this.posts.find(post => post.id === id);
    }
    async getFeedPosts(userId) {
        // Get all friend ids
        const friends = await this.getFriends(userId);
        const friendIds = friends.map(f => f.id);
        // Get posts from user and friends, sorted by creation date
        return this.posts
            .filter(post => post.userId === userId || friendIds.includes(post.userId))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getUserPosts(userId) {
        return this.posts
            .filter(post => post.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async createPost(post) {
        const newPost = {
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
    async getComments(postId) {
        const comments = this.comments
            .filter(comment => comment.postId === postId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return comments.map(comment => {
            const user = this.users.find(u => u.id === comment.userId);
            if (!user)
                throw new Error("Comment user not found");
            const { password, ...userWithoutPassword } = user;
            return {
                ...comment,
                user: userWithoutPassword
            };
        });
    }
    async createComment(comment) {
        const newComment = {
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
    async getReactions(postId) {
        const reactions = this.reactions.filter(reaction => reaction.postId === postId);
        return reactions.map(reaction => {
            const user = this.users.find(u => u.id === reaction.userId);
            if (!user)
                throw new Error("Reaction user not found");
            const { password, ...userWithoutPassword } = user;
            return {
                ...reaction,
                user: userWithoutPassword
            };
        });
    }
    async createReaction(reaction) {
        // Check if user already reacted to this post
        const existingReaction = this.reactions.find(r => r.postId === reaction.postId && r.userId === reaction.userId);
        if (existingReaction) {
            // If user already reacted with the same type, remove the reaction
            if (existingReaction.type === reaction.type) {
                this.reactions = this.reactions.filter(r => !(r.postId === reaction.postId && r.userId === reaction.userId));
                return existingReaction;
            }
            // If user reacted with a different type, update the reaction
            const index = this.reactions.findIndex(r => r.postId === reaction.postId && r.userId === reaction.userId);
            const updatedReaction = { ...this.reactions[index], type: reaction.type };
            this.reactions[index] = updatedReaction;
            return updatedReaction;
        }
        // Otherwise, create a new reaction
        const newReaction = {
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
    async getUserAnalytics(userId) {
        const userPosts = await this.getUserPosts(userId);
        // Calculate total posts
        const totalPosts = userPosts.length;
        // Calculate nicotine consumption
        const totalNicotine = userPosts.reduce((sum, post) => sum + post.nicotineStrength, 0);
        // Calculate favorite flavor
        const flavorCounts = {};
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
        const moodCounts = {};
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
        const hourCounts = {};
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
    async searchUsers(query) {
        const lowerQuery = query.toLowerCase();
        return this.users
            .filter(user => user.username.toLowerCase().includes(lowerQuery) ||
            user.displayName.toLowerCase().includes(lowerQuery))
            .map(({ password, ...user }) => user)
            .slice(0, 10); // Limit to 10 results
    }
}
exports.MemStorage = MemStorage;
// PostgreSQL storage implementation
class DatabaseStorage {
    sessionStore;
    constructor() {
        this.sessionStore = new PostgresSessionStore({
            pool: db_1.pool,
            createTableIfMissing: true
        });
    }
    // User methods
    async getUser(id) {
        const result = await db_1.db.select().from(schema.users).where((0, drizzle_orm_1.eq)(schema.users.id, id)).limit(1);
        return result.length > 0 ? result[0] : undefined;
    }
    async getUserByUsername(username) {
        const result = await db_1.db
            .select()
            .from(schema.users)
            .where((0, drizzle_orm_1.sql) `LOWER(${schema.users.username}) = LOWER(${username})`)
            .limit(1);
        return result.length > 0 ? result[0] : undefined;
    }
    async createUser(user) {
        const result = await db_1.db.insert(schema.users).values({
            username: user.username,
            password: user.password,
            displayName: user.displayName || user.username,
            bio: user.bio,
            avatar: user.avatar
        }).returning();
        return result[0];
    }
    async updateUser(id, userData) {
        const result = await db_1.db
            .update(schema.users)
            .set(userData)
            .where((0, drizzle_orm_1.eq)(schema.users.id, id))
            .returning();
        if (result.length === 0) {
            throw new Error("User not found");
        }
        return result[0];
    }
    // Friend methods
    async getFriends(userId) {
        // Get all user ids who are friends with this user
        const friendships = await db_1.db
            .select()
            .from(schema.friends)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.friends.userId, userId), (0, drizzle_orm_1.eq)(schema.friends.friendId, userId)), (0, drizzle_orm_1.eq)(schema.friends.status, 'accepted')));
        // Extract friend IDs
        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
        if (friendIds.length === 0) {
            return [];
        }
        // Get user objects for all friends
        const friends = await db_1.db
            .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatar: schema.users.avatar,
            createdAt: schema.users.createdAt
        })
            .from(schema.users)
            .where((0, drizzle_orm_1.sql) `${schema.users.id} IN (${friendIds.join(', ')})`);
        return friends;
    }
    async getFriendRequests(userId) {
        return await db_1.db
            .select()
            .from(schema.friends)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.friends.friendId, userId), (0, drizzle_orm_1.eq)(schema.friends.status, 'pending')));
    }
    async createFriendRequest(userId, friendId) {
        // Check if users exist
        const user = await this.getUser(userId);
        const friend = await this.getUser(friendId);
        if (!user || !friend) {
            throw new Error("User or friend not found");
        }
        // Check if request already exists
        const existingRequests = await db_1.db
            .select()
            .from(schema.friends)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.friends.userId, userId), (0, drizzle_orm_1.eq)(schema.friends.friendId, friendId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.friends.userId, friendId), (0, drizzle_orm_1.eq)(schema.friends.friendId, userId))));
        if (existingRequests.length > 0) {
            throw new Error("Friend request already exists");
        }
        // Create the friendship request
        const result = await db_1.db
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
        const result = await db_1.db
            .update(schema.friends)
            .set({ status: 'accepted' })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.friends.id, requestId), (0, drizzle_orm_1.eq)(schema.friends.friendId, userId)))
            .returning();
        if (result.length === 0) {
            throw new Error("Friend request not found");
        }
        return result[0];
    }
    // Post methods
    async getPost(id) {
        const result = await db_1.db
            .select()
            .from(schema.posts)
            .where((0, drizzle_orm_1.eq)(schema.posts.id, id))
            .limit(1);
        return result.length > 0 ? result[0] : undefined;
    }
    async getFeedPosts(userId) {
        // Get all friend IDs
        const friends = await this.getFriends(userId);
        const friendIds = friends.map(f => f.id);
        let userIds = [userId];
        if (friendIds.length > 0) {
            userIds = [...userIds, ...friendIds];
        }
        // Get posts from user and friends
        const posts = await db_1.db
            .select()
            .from(schema.posts)
            .where((0, drizzle_orm_1.sql) `${schema.posts.userId} IN (${userIds.join(', ')})`)
            .orderBy((0, drizzle_orm_1.desc)(schema.posts.createdAt));
        // Get all users who made these posts
        const users = await db_1.db
            .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatar: schema.users.avatar,
            createdAt: schema.users.createdAt
        })
            .from(schema.users)
            .where((0, drizzle_orm_1.sql) `${schema.users.id} IN (${userIds.join(', ')})`);
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
    async getUserPosts(userId) {
        // Get posts for user
        const posts = await db_1.db
            .select()
            .from(schema.posts)
            .where((0, drizzle_orm_1.eq)(schema.posts.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema.posts.createdAt));
        // Get user data
        const user = await db_1.db
            .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatar: schema.users.avatar,
            createdAt: schema.users.createdAt
        })
            .from(schema.users)
            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
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
    async createPost(post) {
        const result = await db_1.db
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
        const comments = await db_1.db
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
            .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.comments.userId, schema.users.id))
            .where((0, drizzle_orm_1.eq)(schema.comments.postId, postId))
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
    async createComment(comment) {
        const result = await db_1.db
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
        const reactions = await db_1.db
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
            .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.reactions.userId, schema.users.id))
            .where((0, drizzle_orm_1.eq)(schema.reactions.postId, postId));
        return reactions.map(reaction => ({
            id: reaction.id,
            postId: reaction.postId,
            userId: reaction.userId,
            type: reaction.type,
            createdAt: reaction.createdAt,
            user: reaction.user
        }));
    }
    async createReaction(reaction) {
        // Check if user already reacted to this post
        const existingReactions = await db_1.db
            .select()
            .from(schema.reactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.reactions.postId, reaction.postId), (0, drizzle_orm_1.eq)(schema.reactions.userId, reaction.userId)));
        const existingReaction = existingReactions.length > 0 ? existingReactions[0] : null;
        if (existingReaction) {
            // If user reacted with the same type, remove the reaction
            if (existingReaction.type === reaction.type) {
                await db_1.db
                    .delete(schema.reactions)
                    .where((0, drizzle_orm_1.eq)(schema.reactions.id, existingReaction.id));
                return existingReaction;
            }
            // If user reacted with a different type, update the reaction
            const result = await db_1.db
                .update(schema.reactions)
                .set({ type: reaction.type })
                .where((0, drizzle_orm_1.eq)(schema.reactions.id, existingReaction.id))
                .returning();
            return result[0];
        }
        // Otherwise, create a new reaction
        const result = await db_1.db
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
            ? favoriteFlavorEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
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
        const hourCounts = {};
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
    async searchUsers(query) {
        const users = await db_1.db
            .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatar: schema.users.avatar,
            createdAt: schema.users.createdAt
        })
            .from(schema.users)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `LOWER(${schema.users.username}) LIKE LOWER(${'%' + query + '%'})`, (0, drizzle_orm_1.sql) `LOWER(${schema.users.displayName}) LIKE LOWER(${'%' + query + '%'})`))
            .limit(10);
        return users;
    }
}
exports.DatabaseStorage = DatabaseStorage;
// Create and export the storage instance
exports.storage = new DatabaseStorage();
