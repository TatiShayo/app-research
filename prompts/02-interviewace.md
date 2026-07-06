# BUILD: InterviewAce — AI Interview Prep Copilot (Web-first PWA)

## Your role
You are the lead engineer-orchestrator building this from scratch to deployed completion. Every decision you need is here; where unspecified, choose the simplest shippable option. Do not pause for questions.

## Product overview & business model
InterviewAce gets job seekers ready for a specific interview in under an hour: paste the job posting + upload your resume → get the questions you'll actually be asked, practice them out loud with an AI interviewer, get scored feedback, and walk in with a salary-negotiation script. Users churn when hired — that's fine, the market replenishes. Incumbent (Final Round AI) charges $148/mo; we win on price and speed.
- Monetization: hard paywall after onboarding. $6.99/week with 3-day free trial (card required), or $19.99/month. Stripe subscriptions.
- Positioning: "Your interview is Thursday. Be ready by tonight."

## Tech stack (fixed)
- Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, PWA manifest (installable, mobile-first layouts)
- Supabase (Postgres, Auth, Storage for resumes/audio)
- Anthropic API — model `claude-sonnet-5` for all generation/scoring (use structured JSON outputs)
- Voice: browser MediaRecorder → OpenAI `whisper-1` transcription; AI interviewer voice via OpenAI TTS `tts-1` (streamed)
- `pdf-parse` for resume PDF extraction; Stripe Billing (subscriptions + trials); Resend email; Vercel deploy

## Data model
- `profiles` (id, email, target_role, experience_level, created_at)
- `jobs` (id, user_id, title, company, posting_text, parsed_requirements jsonb, created_at)
- `resumes` (id, user_id, storage_path, extracted_text, created_at)
- `prep_packs` (id, job_id, questions jsonb[{question, category, why_asked, strong_answer_outline}], company_intel text, created_at)
- `mock_sessions` (id, job_id, mode enum[voice,text], started_at, completed_at)
- `mock_answers` (id, session_id, question, transcript, audio_path, scores jsonb{structure,relevance,confidence,conciseness, each 1-10}, feedback text, improved_answer text)
- `subscriptions` (user_id, stripe_customer_id, stripe_sub_id, status, current_period_end)

## Features & implementation
1. **Multi-step onboarding (before paywall — this drives conversion, invest here)**: 6 screens — target role → experience level → "When is your interview?" (urgency!) → biggest fear (multiple choice: freezing up / behavioral questions / technical / salary talk) → paste job posting → animated "Building your prep plan…" progress screen that previews real extracted insights ("We found 7 likely behavioral questions for this Amazon PM role…") → PAYWALL. Paywall screen: personalized headline ("Be ready for your interview on {date}"), plan comparison, trial CTA, social proof, restore link. No feature access without trial start.
2. **Prep Pack generation**: single Claude call with job posting + resume text → JSON: 15 likely questions (5 behavioral, 5 role-specific, 3 company/culture, 2 curveballs), each with why-they-ask and a strong-answer outline referencing THE USER'S resume. Show as swipeable cards. Regenerate button.
3. **Voice mock interview**: AI interviewer asks a question (TTS audio + text), user records answer, transcribe with Whisper, Claude scores against rubric (structure/STAR, relevance to role, confidence markers, conciseness — each 1-10 with one-line justification) + rewrites their answer stronger, keeping their real facts. Session = 5 questions, summary screen with radar chart (recharts) and share-safe scorecard image.
4. **STAR answer builder**: user picks a question → guided form (Situation/Task/Action/Result, each with AI suggestion button pulling from resume) → saved to Answer Bank.
5. **Answer Bank**: all saved/improved answers, searchable, "practice again" per answer.
6. **Salary negotiation module**: inputs (offer amount, market, location, competing offers y/n) → Claude generates negotiation script with exact phrases, email templates, and role-play mode (user responds to AI hardball recruiter).
7. **Cover letter + follow-up email generators**: from job + resume; copy button; tone selector.
8. **Dashboard**: upcoming interview countdown, readiness score (avg of mock scores), streak, "next best action".
9. **Subscription mechanics**: Stripe Checkout with `trial_period_days:3`, webhook syncs `subscriptions`, middleware gates all app routes on active status (trialing counts), cancel flow in settings (Stripe portal), dunning emails via Resend.
10. **Landing page**: hero with 15-sec demo loop, pricing, FAQ, "How it compares" table vs $148/mo competitors. Plus 5 SEO pages: /amazon-interview-questions-prep, /star-method-practice, /ai-mock-interview, /salary-negotiation-script, /behavioral-interview-practice.

## AI prompt engineering (implement exactly)
Create `/lib/prompts.ts` with system prompts for: prep-pack (role: veteran recruiter at the target company; must output valid JSON matching zod schema; questions must be specific to the posting, never generic), scoring (strict rubric, calibrated — average answer scores 5-6, not 8), rewriting (keep user's real experiences, never fabricate). Validate all AI JSON with zod; on parse failure retry once with the error appended.

## Design rules
Confident, calm, professional — this user is anxious. Navy (#0F2A43) + warm white + single green accent for scores. Inter font. Big touch targets (mobile PWA). No confetti, no purple gradients, no robot imagery. Progress and countdowns everywhere (urgency = conversion).

## Agent orchestration
1. **Scaffold agent**: app + Supabase schema + auth + CI.
2. **Onboarding+paywall agent**: the full 6-step flow + Stripe trial subscription, end-to-end FIRST (this is the money path).
3. **AI core agent**: prompts.ts, prep pack generation, zod validation, streaming UI.
4. **Voice agent**: recorder, Whisper, TTS playback, scoring loop.
5. **Modules agents (parallel)**: STAR builder + answer bank; negotiation; cover letter/emails; dashboard.
6. **Marketing agent**: landing + SEO pages.
7. **QA agent**: Playwright e2e (signup→onboarding→trial checkout test-mode→generate pack→text-mode mock→see scores), plus unit tests for AI JSON parsing with recorded fixtures. Fix everything.
8. **Deploy agent**: Vercel prod, webhooks registered, README with env setup.
Env vars: SUPABASE (3), STRIPE (3), ANTHROPIC_API_KEY, OPENAI_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_APP_URL.

## Definition of done
Deployed; a new user can go signup → onboarding → start trial (test mode) → get a real AI prep pack for a pasted job posting → complete a voice mock with scores → see dashboard readiness. All e2e green. AI cost per active user/day ≤ $0.15 (cache prep packs, cap mock sessions at 3/day).

## Out of scope v1
Native iOS/Android, live interview overlay/desktop copilot, team/B2B plans, auto-apply, multi-language.
