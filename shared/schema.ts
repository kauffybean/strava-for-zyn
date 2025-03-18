export type User = {
  id: number;
  username: string;
  password: string; // hashed
  displayName: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
};

export type InsertUser = Omit<User, "id" | "createdAt"> & {
  id?: number;
  createdAt?: Date;
};

export const insertUserSchema = {
  username: "string",
  password: "string",
  displayName: "string",
  bio: "string?",
  avatar: "string?",
};

export type Friend = {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted'; // pending if request is sent but not accepted
  createdAt: Date;
};

export type Post = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  startTime: Date;
  duration?: number; // in minutes
  nicotineStrength: number; // in mg
  flavor: string;
  mood: string;
  createdAt: Date;
};

export type InsertPost = Omit<Post, "id" | "createdAt"> & {
  id?: number;
  createdAt?: Date;
};

export type Comment = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
};

export type InsertComment = Omit<Comment, "id" | "createdAt"> & {
  id?: number;
  createdAt?: Date;
};

export type Reaction = {
  id: number;
  postId: number;
  userId: number;
  type: string; // 'like', 'love', 'laugh', etc.
  createdAt: Date;
};

export type InsertReaction = Omit<Reaction, "id" | "createdAt"> & {
  id?: number;
  createdAt?: Date;
};

// Pre-defined options
export const FLAVORS = [
  'Cool Mint',
  'Citrus Chill',
  'Wintergreen',
  'Spearmint',
  'Peppermint',
  'Coffee',
  'Cinnamon',
  'Smooth',
  'Menthol'
];

export const MOODS = [
  'Buzzing',
  'Focused',
  'Chillaxed',
  'Energized',
  'Stress-Relief',
  'Social Hour',
  'Post-Meal',
  'Craving Crusher'
];

export const NICOTINE_STRENGTHS = [1.5, 3, 6, 8];

export const REACTION_TYPES = [
  'Nic Hit',
  'Love',
  'Impressive',
  'Wow',
  'Lol'
];
