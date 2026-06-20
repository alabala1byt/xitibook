export interface Chapter {
  id: number
  name: string
  desc?: string
}

export interface Question {
  id: number
  chapterId: number
  question: string
  options: string[]
  answer: number
  explanation?: string
}

export interface User {
  username: string
  role: 'admin' | 'student'
}

export interface WrongAnswer {
  questionId: number
  selectedIndex: number
  username: string
}

export interface QuizSession {
  id: number
  username: string
  chapterId: number
  startedAt: string
  completedAt?: string
  totalQ: number
  correct: number
  accuracy?: number
}

export interface Student {
  username: string
  firstSeenAt: string
  lastActiveAt: string
}
