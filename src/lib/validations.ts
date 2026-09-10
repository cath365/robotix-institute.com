import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  // Public registration is for learners only. Staff accounts are provisioned by an administrator.
  role: z.literal('STUDENT').optional().default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.number().min(0).optional().default(0),
});

export const codeProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  language: z.enum(['python', 'javascript', 'cpp', 'arduino', 'micropython']),
  code: z.string().min(1, 'Code is required'),
  isPublic: z.boolean().optional().default(false),
});

export const forumPostSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
});

export const competitionSubmissionSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  videoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one item is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
});

export const profileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  bio: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.enum(['news', 'tutorial', 'industry', 'event', 'announcement']),
  tags: z.array(z.string()).optional().default([]),
  thumbnail: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional().default(false),
});

export const blogCommentSchema = z.object({
  content: z.string().min(2, 'Comment must be at least 2 characters'),
  postId: z.string().min(1, 'Post ID is required'),
});

export const learningPathSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  thumbnail: z.string().url().optional().or(z.literal('')),
  duration: z.number().min(0).optional().default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CodeProjectInput = z.infer<typeof codeProjectSchema>;
export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogCommentInput = z.infer<typeof blogCommentSchema>;
export type LearningPathInput = z.infer<typeof learningPathSchema>;
