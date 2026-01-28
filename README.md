# AWS Exam Readiness Coach

A Next.js (App Router) practice app for AWS certification exam prep with coach-style explanations.

## What this app does
- Presents AWS-style practice questions
- Explains why answers are correct or incorrect
- Designed for iterative study and review

## Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Running locally
npm install
npm run dev

Open http://localhost:3000

## Project structure
- app/ — routes and UI
- data/ — question bank
- lib/ — helpers (scoring, selection, etc.)
- public/ — static assets

## Adding questions
Edit or add files in `data/` following the existing structure:
- id
- prompt
- answers
- correctAnswer
- explanation
- tags

## Planned improvements
- Persist progress (localStorage)
- Review missed questions
- CLF-C02 domain filtering
- Timed exam mode