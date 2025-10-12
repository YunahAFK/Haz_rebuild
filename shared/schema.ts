import { z } from "zod";

/* ===============================
   CATEGORIZATION GAME SCHEMAS
   =============================== */

// defines a single category within a categorization game
export const categorizationGameCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.string()),
});

// defines the entire categorization game structure
export const categorizationGameSchema = z.object({
  title: z.string(),
  categories: z.array(categorizationGameCategorySchema),
});

/* ===============================
   QUIZ SCHEMAS
   =============================== */

// defines a single quiz question with options and correct answer
export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

/* ===============================
   SIMULATION SCHEMAS
   =============================== */

// defines a single choice leading to another simulation step
export const simulationChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  nextStepId: z.string().nullable(),
});

// defines a simulation step containing scenario text and choices
export const simulationStepSchema = z.object({
  id: z.string(),
  scenario: z.string(),
  choices: z.array(simulationChoiceSchema),
});

// defines the full simulation flow starting from an initial step
export const simulationSchema = z.object({
  startStepId: z.string(),
  steps: z.array(simulationStepSchema),
});

/* ===============================
   LECTURE SCHEMA
   =============================== */

// defines lecture metadata, content, and linked learning activities
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
  quiz: z.array(quizQuestionSchema).optional(),
  simulation: simulationSchema.optional(),
  categorizationGame: categorizationGameSchema.optional(),
  earthquakeMiniGame: z.boolean().default(false).optional(),
});

// defines allowed fields when inserting a new lecture (auto fields excluded)
export const insertLectureSchema = lectureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true
});

/* ===============================
   USER SCHEMAS
   =============================== */

// defines user data structure
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["student", "teacher"]),
  createdAt: z.date(),
});

// defines allowed fields when inserting a new user
export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
});

/* ===============================
   TYPE INFERENCES
   =============================== */

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Simulation = z.infer<typeof simulationSchema>;
export type SimulationStep = z.infer<typeof simulationStepSchema>;
export type SimulationChoice = z.infer<typeof simulationChoiceSchema>;
export type Lecture = z.infer<typeof lectureSchema>;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;