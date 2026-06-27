// Domain types used across the app. IDs are UUID strings (Supabase primary keys).
// The DB columns use snake_case; lib/db.ts maps rows <-> these camelCase shapes.

export interface Chapter {
  id: string
  name: string
  desc?: string
}

export interface Question {
  id: string
  chapterId: string
  question: string
  options: string[]
  answer: number
  explanation?: string
}

export interface User {
  id: string
  email: string
}

export interface WrongAnswer {
  id: string
  questionId: string
  selectedIndex: number
}

export interface QuizSession {
  id: string
  chapterId: string
  startedAt: string
  completedAt?: string
  totalQ: number
  correct: number
  accuracy?: number
}
