import { z } from "zod";

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export const simulationChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  nextStepId: z.string().nullable(),
});

export const simulationStepSchema = z.object({
  id: z.string(),
  scenario: z.string(),
  choices: z.array(simulationChoiceSchema),
});

export const simulationSchema = z.object({
  startStepId: z.string(),
  steps: z.array(simulationStepSchema),
});

export const lectureSchema = z.object({
  id: z.string(),
  title: z.string(),
  cardImageUrl: z.string().optional(),
  cardDescription: z.string().optional(),
  content: z.string(),
  author: z.string(),
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  views: z.number().default(0),
  simulation: simulationSchema.optional(),
  quiz: z.array(quizQuestionSchema).optional(),
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

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Simulation = z.infer<typeof simulationSchema>;
export type SimulationStep = z.infer<typeof simulationStepSchema>;
export type SimulationChoice = z.infer<typeof simulationChoiceSchema>;
export type Lecture = z.infer<typeof lectureSchema>;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
