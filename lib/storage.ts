import type { Chapter, Question, User, WrongAnswer, QuizSession, Student } from './types'

const get = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
const set = <T>(key: string, val: T) => localStorage.setItem(key, JSON.stringify(val))

export const nextId = (arr: { id: number }[]) =>
  arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1

export const getUser     = ()  => get<User>('xt_user')
export const setUser     = (v: User) => set('xt_user', v)
export const removeUser  = ()  => localStorage.removeItem('xt_user')

export const getChapters  = ()  => get<Chapter[]>('xt_chs') ?? []
export const setChapters  = (v: Chapter[]) => set('xt_chs', v)

export const getQuestions = ()  => get<Question[]>('xt_qs') ?? []
export const setQuestions = (v: Question[]) => set('xt_qs', v)

export const getWrong     = ()  => get<WrongAnswer[]>('xt_wrong') ?? []
export const setWrong     = (v: WrongAnswer[]) => set('xt_wrong', v)

export const getSessions  = ()  => get<QuizSession[]>('xt_sess') ?? []
export const setSessions  = (v: QuizSession[]) => set('xt_sess', v)

export const getStudents  = ()  => get<Student[]>('xt_stus') ?? []
export const setStudents  = (v: Student[]) => set('xt_stus', v)

export function seedData() {
  if (getChapters().length) return
  setChapters([
    { id: 1, name: '第一章 · 基础概念', desc: '入门必备知识' },
    { id: 2, name: '第二章 · 进阶练习', desc: '提升解题能力' },
  ])
  setQuestions([
    { id: 1, chapterId: 1, question: 'JavaScript 中，哪个关键字用于声明常量？', options: ['var', 'let', 'const', 'def'], answer: 2, explanation: 'const 声明的变量不能重新赋值，适合存储不变的值。' },
    { id: 2, chapterId: 1, question: 'HTML 中哪个标签用于创建超链接？', options: ['<link>', '<a>', '<href>', '<nav>'], answer: 1, explanation: '<a> 标签配合 href 属性创建超链接。' },
    { id: 3, chapterId: 1, question: 'CSS 中哪个属性控制文字颜色？', options: ['font-color', 'text-color', 'color', 'foreground'], answer: 2, explanation: 'CSS 使用 color 属性设置文字颜色。' },
    { id: 4, chapterId: 2, question: 'Python 中正确的函数定义语法是？', options: ['function foo():', 'def foo():', 'func foo():', 'define foo():'], answer: 1, explanation: 'Python 使用 def 关键字定义函数。' },
    { id: 5, chapterId: 2, question: '数组第一个元素的索引是？', options: ['1', '0', '-1', 'none'], answer: 1, explanation: '大多数编程语言中数组索引从 0 开始。' },
  ])
}
