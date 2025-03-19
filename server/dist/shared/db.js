"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = exports.reactions = exports.comments = exports.posts = exports.friends = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Use appropriate schema based on environment
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    displayName: (0, pg_core_1.text)('display_name').notNull(),
    bio: (0, pg_core_1.text)('bio'),
    avatar: (0, pg_core_1.text)('avatar'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.friends = (0, pg_core_1.pgTable)('friends', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    friendId: (0, pg_core_1.integer)('friend_id').notNull().references(() => exports.users.id),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'accepted'] }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    imageUrl: (0, pg_core_1.text)('image_url'),
    latitude: (0, pg_core_1.decimal)('latitude', { precision: 10, scale: 6 }),
    longitude: (0, pg_core_1.decimal)('longitude', { precision: 10, scale: 6 }),
    locationName: (0, pg_core_1.text)('location_name'),
    startTime: (0, pg_core_1.timestamp)('start_time').notNull(),
    duration: (0, pg_core_1.integer)('duration'), // in minutes
    nicotineStrength: (0, pg_core_1.decimal)('nicotine_strength').notNull(), // in mg
    flavor: (0, pg_core_1.text)('flavor').notNull(),
    mood: (0, pg_core_1.text)('mood').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.comments = (0, pg_core_1.pgTable)('comments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id').notNull().references(() => exports.posts.id),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.reactions = (0, pg_core_1.pgTable)('reactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    postId: (0, pg_core_1.integer)('post_id').notNull().references(() => exports.posts.id),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    type: (0, pg_core_1.text)('type').notNull(), // 'like', 'love', 'laugh', etc.
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    sid: (0, pg_core_1.varchar)('sid').primaryKey(),
    sess: (0, pg_core_1.text)('sess').notNull(),
    expire: (0, pg_core_1.timestamp)('expire').notNull()
});
