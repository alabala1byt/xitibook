# CLAUDE.md — 习题本 (xiti-book)

## Project Overview

A Chinese-language homework/exercise platform built with Next.js and Tailwind CSS. Target users: students and teachers on an educational website.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React `useState` + `localStorage` (no backend yet)

## User Roles

There are two roles, selected at login:

| Role | Chinese | What they can do |
|------|---------|-----------------|
| **Administrator** (管理员) | 老师/管理员 | Manage chapters, add/edit/delete questions, view all student stats |
| **Student** (学生) | 学生 | Do quizzes, view their own wrong answers and personal stats |

## Pages

### Shared
| Route | Description |
|-------|-------------|
| `/login` | Choose role (管理员 or 学生), enter username — no password needed for now |

### Student Pages
| Route | Description |
|-------|-------------|
| `/quiz` | Pick a chapter, then answer one multiple-choice question at a time; show correct/wrong + explanation immediately after each answer |
| `/wrong-answers` | List all questions the user got wrong, with the correct answer and explanation |
| `/profile` | 个人中心 — personal stats: questions attempted, accuracy rate, wrong-answer count per chapter |

### Administrator Pages
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard landing — shows 题库管理, 学生统计, and other admin options |
| `/admin/chapters` | List all chapters; create new chapter (name + optional description); delete or rename a chapter |
| `/admin/chapters/[id]` | View all questions in a chapter; add, edit, or delete questions |
| `/admin/students` | List of all students who have ever logged in; click a student to see their detail |
| `/admin/students/[username]` | Per-student detail: chapters attempted, accuracy per chapter, wrong answers, last active time |

## Data

All data is stored in `localStorage` (no backend yet).

### Chapters
Key: `chapters` — array of:
```ts
{
  id: number
  name: string
  description?: string
}
```

### Questions
Key: `questions` — array of:
```ts
{
  id: number
  chapterId: number       // which chapter this belongs to
  question: string        // question text
  options: string[]       // 4 choices (A/B/C/D)
  answer: number          // index of correct option
  explanation: string     // shown after answering
}
```

### User Session
Key: `user` — `{ username: string, role: 'admin' | 'student' }`

### Wrong Answers
Key: `wrongAnswers` — array of `{ questionId: number, selectedIndex: number, username: string }`

### Quiz Sessions (student activity log)
Key: `quizSessions` — array of:
```ts
{
  id: number
  username: string
  chapterId: number
  startedAt: string      // ISO timestamp — when they opened the quiz
  completedAt?: string   // ISO timestamp — when they finished (undefined if abandoned)
  totalQuestions: number
  correctCount: number   // how many they got right
  accuracy: number       // 0–100 percentage
}
```
A new session is written when a student starts a quiz. `completedAt` and scores are filled in when they finish.

### Known Students
Key: `students` — array of:
```ts
{
  username: string
  firstSeenAt: string    // ISO timestamp — first login
  lastActiveAt: string   // ISO timestamp — updated on every login
}
```
A student entry is created/updated every time a student logs in.

## Admin Student Analytics

The `/admin/students` page shows a table/list of all known students with:
- Username
- Last active time
- Total quizzes completed
- Overall accuracy rate (% correct across all sessions)
- Total wrong answers

The `/admin/students/[username]` detail page shows:
- Per-chapter breakdown: chapters attempted, accuracy per chapter, number of wrong answers per chapter
- Full session history: date, chapter name, score, accuracy
- All wrong answers for that student (question text, their answer, correct answer, explanation)

All of this is derived from `quizSessions` + `wrongAnswers` + `students` in localStorage.

## Conventions

- UI language is Chinese (zh-CN)
- No external UI libraries — plain Tailwind only
- No backend, no database — localStorage only for now
- Keep components in `app/` co-located with their page (no separate `components/` folder unless shared across 2+ pages)
- Color theme: blue primary (`blue-600`), white background, clean minimal look

## Dev Commands

```powershell
cd xiti-book
npm install
npm run dev
```

Open in browser: http://localhost:3000

## Route Guards

- If `localStorage` has no `user`, redirect any page to `/login`.
- If a student navigates to `/admin/*`, redirect to `/quiz`.
- If an admin navigates to `/quiz` or `/wrong-answers`, redirect to `/admin`.

## Future Features (not in scope yet)

- Real backend + database (student data currently only persists on the same device/browser)
- AI-generated questions via Claude API
- Class/student management (admin assigns students to classes)
- Password-based authentication
