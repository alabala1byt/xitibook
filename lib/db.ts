import { createClient } from '@/lib/supabase/client'
import type { Chapter, Question, WrongAnswer, QuizSession } from '@/lib/types'

// Async data layer backed by Supabase. Replaces the old localStorage layer
// (lib/storage.ts). Every query is scoped to the signed-in user by RLS, and
// inserts never send user_id (the column defaults to auth.uid()).

const supabase = createClient()

/* ----------------------------- row mappers ----------------------------- */

type ChapterRow = { id: string; name: string; description: string | null }
const mapChapter = (r: ChapterRow): Chapter => ({
  id: r.id,
  name: r.name,
  desc: r.description ?? undefined,
})

type QuestionRow = {
  id: string
  chapter_id: string
  question: string
  options: string[]
  answer: number
  explanation: string | null
}
const mapQuestion = (r: QuestionRow): Question => ({
  id: r.id,
  chapterId: r.chapter_id,
  question: r.question,
  options: r.options,
  answer: r.answer,
  explanation: r.explanation ?? undefined,
})

type WrongRow = { id: string; question_id: string; selected_index: number }
const mapWrong = (r: WrongRow): WrongAnswer => ({
  id: r.id,
  questionId: r.question_id,
  selectedIndex: r.selected_index,
})

type SessionRow = {
  id: string
  chapter_id: string | null
  started_at: string
  completed_at: string | null
  total_questions: number
  correct_count: number
  accuracy: number | null
}
const mapSession = (r: SessionRow): QuizSession => ({
  id: r.id,
  chapterId: r.chapter_id ?? '',
  startedAt: r.started_at,
  completedAt: r.completed_at ?? undefined,
  totalQ: r.total_questions,
  correct: r.correct_count,
  accuracy: r.accuracy ?? undefined,
})

/* ------------------------------- chapters ------------------------------ */

export async function listChapters(): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ChapterRow[]).map(mapChapter)
}

export async function createChapter(name: string, desc?: string): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .insert({ name, description: desc?.trim() || null })
    .select()
    .single()
  if (error) throw error
  return mapChapter(data as ChapterRow)
}

export async function updateChapter(id: string, name: string, desc?: string): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .update({ name, description: desc?.trim() || null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteChapter(id: string): Promise<void> {
  const { error } = await supabase.from('chapters').delete().eq('id', id)
  if (error) throw error
}

/* ------------------------------ questions ------------------------------ */

export async function listQuestions(chapterId?: string): Promise<Question[]> {
  let query = supabase.from('questions').select('*')
  if (chapterId) query = query.eq('chapter_id', chapterId)
  const { data, error } = await query.order('created_at', { ascending: true })
  if (error) throw error
  return (data as QuestionRow[]).map(mapQuestion)
}

export async function createQuestion(input: {
  chapterId: string
  question: string
  options: string[]
  answer: number
  explanation?: string
}): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      chapter_id: input.chapterId,
      question: input.question,
      options: input.options,
      answer: input.answer,
      explanation: input.explanation?.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return mapQuestion(data as QuestionRow)
}

export async function updateQuestion(
  id: string,
  input: { question: string; options: string[]; answer: number; explanation?: string }
): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .update({
      question: input.question,
      options: input.options,
      answer: input.answer,
      explanation: input.explanation?.trim() || null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

/* --------------------------- wrong answers ----------------------------- */

export async function listWrong(): Promise<WrongAnswer[]> {
  const { data, error } = await supabase
    .from('wrong_answers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as WrongRow[]).map(mapWrong)
}

// Upsert keyed on (user_id, question_id): answering the same question wrong
// again updates the stored answer instead of creating a duplicate.
export async function upsertWrong(questionId: string, selectedIndex: number): Promise<void> {
  const { error } = await supabase
    .from('wrong_answers')
    .upsert(
      { question_id: questionId, selected_index: selectedIndex },
      { onConflict: 'user_id,question_id' }
    )
  if (error) throw error
}

/* --------------------------- quiz sessions ----------------------------- */

export async function createSession(input: { chapterId: string; totalQ: number }): Promise<string> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({ chapter_id: input.chapterId, total_questions: input.totalQ, correct_count: 0 })
    .select('id')
    .single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function completeSession(id: string, correct: number, totalQ: number): Promise<void> {
  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      completed_at: new Date().toISOString(),
      correct_count: correct,
      accuracy: Math.round((correct / totalQ) * 100),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_sessions').delete().eq('id', id)
  if (error) throw error
}

export async function listSessions(): Promise<QuizSession[]> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false })
  if (error) throw error
  return (data as SessionRow[]).map(mapSession)
}
