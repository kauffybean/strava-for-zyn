import { pgTable, serial, text, timestamp, integer, varchar, decimal } from 'drizzle-orm/pg-core';
import { sqliteTable, text as sqliteText, integer as sqliteInteger } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Use appropriate schema based on environment
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  latitude: decimal('latitude', { precision: 10, scale: 6 }),
  longitude: decimal('longitude', { precision: 10, scale: 6 }),
  locationName: text('location_name'),
  startTime: timestamp('start_time').notNull(),
  duration: integer('duration'), // in minutes
  nicotineStrength: decimal('nicotine_strength').notNull(), // in mg
  flavor: text('flavor').notNull(),
  mood: text('mood').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'like', 'love', 'laugh', etc.
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
  sid: varchar('sid').primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull()
});

// Database types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Friend = typeof friends.$inferSelect;
export type NewFriend = typeof friends.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;