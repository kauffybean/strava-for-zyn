const { pgTable, serial, varchar, text, timestamp, integer, decimal, unique, boolean } = require('drizzle-orm/pg-core');

// Create the users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  displayName: varchar('displayName', { length: 100 }).notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
});

// Create the friends table
const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: integer('friendId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'accepted'
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
  return {
    userFriendIdx: unique('user_friend_idx').on(table.userId, table.friendId)
  };
});

// Create the posts table
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  latitude: decimal('latitude'),
  longitude: decimal('longitude'),
  locationName: varchar('locationName', { length: 255 }),
  startTime: timestamp('startTime', { withTimezone: true }).notNull(),
  duration: integer('duration'), // in minutes
  nicotineStrength: decimal('nicotineStrength').notNull(),
  flavor: varchar('flavor', { length: 100 }).notNull(),
  mood: varchar('mood', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
});

// Create the comments table
const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
});

// Create the reactions table
const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'like', 'love', etc.
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
  return {
    postUserIdx: unique('post_user_idx').on(table.postId, table.userId)
  };
});

// Create the sessions table for connect-pg-simple
const sessions = pgTable('session', {
  sid: varchar('sid').primaryKey().notNull(),
  sess: text('sess').notNull(),
  expire: timestamp('expire', { precision: 6 }).notNull()
});

module.exports = {
  users,
  friends,
  posts,
  comments,
  reactions,
  sessions
};