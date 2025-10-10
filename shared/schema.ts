import { z } from "zod";

export const lectureSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  views: z.number().default(0),
});

export const insertLectureSchema = lectureSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  views: true 
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["student", "teacher"]),
  createdAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Lecture = z.infer<typeof lectureSchema>;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
