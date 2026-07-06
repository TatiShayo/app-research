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

11. **Job posting by URL + more resume formats**: paste a URL → server-side fetch + readability extraction (graceful fallback to manual paste on failure/paywalled sites). Resume upload accepts PDF (`pdf-parse`) AND DOCX (`mammoth`). Onboarding also asks interview type (phone screen / behavioral / technical / panel) — this changes the prep-pack question mix.
12. **Blurred-teaser paywall (conversion booster)**: the "Building your prep plan…" step actually generates the pack; paywall screen then shows 3 real questions unblurred + 12 locked/blurred with category labels visible. Personalized proof beats generic promises.
13. **Cheat Sheet PDF**: one-page export — top 8 questions, the user's best answers (condensed), company facts, 3 questions-to-ask — via @react-pdf/renderer, small app watermark footer (shareable = growth).
14. **Interview-day mode**: when the countdown hits day-of: send a "You've got this" email (Resend) with the cheat sheet attached, and the app home switches to a condensed flashcard review mode (flip through answer bank).
15. **Outcome loop**: after the interview date passes (and in the cancel flow), one-question survey: "Get the offer?" → YES: request testimonial + give referral code (1 free week per signup); NO: offer to regenerate prep for the next application. Store aggregate outcome stats (fuel for landing-page proof once real).
16. **Cost guards**: per-user daily token budget; prep packs cached by hash(posting+resume); Anthropic prompt caching enabled on system prompts; mock sessions capped at 3/day.

## AI prompt engineering (implement exactly)
Create `/lib/prompts.ts` with system prompts for: prep-pack (role: veteran recruiter at the target company; must output valid JSON matching zod schema; questions must be specific to the posting, never generic), scoring (strict rubric, calibrated — average answer scores 5-6, not 8), rewriting (keep user's real experiences, never fabricate). Validate all AI JSON with zod; on parse failure retry once with the error appended.

## Design rules
Confident, calm, professional — this user is anxious. Navy (#0F2A43) + warm white + single green accent for scores. Inter font. Big touch targets (mobile PWA). No confetti, no purple gradients, no robot imagery. Progress and countdowns everywhere (urgency = conversion).

## Cross-cutting requirements (non-negotiable)
- **Analytics**: PostHog from day one. Instrument every onboarding step (drop-off per screen is your #1 optimization lever), paywall view, trial start, trial→paid conversion, feature usage, cancellation. Internal `/admin` page (email-allowlist gated): MRR, trials active, trial conversion %, mock sessions/day, AI cost/user.
- **Error monitoring**: Sentry client + server; alert on checkout and AI-generation failures.
- **Payments hygiene**: Stripe webhooks idempotent; dunning emails; cancellation survey wired to the outcome loop.
- **Legal & privacy**: Privacy Policy + Terms (plain language). Resumes are sensitive personal data: state retention (deleted 90 days after last activity), self-serve account deletion + data export (GDPR).
- **Build continuity**: maintain `PROJECT_STATE.md` at repo root — update after every milestone: done / next / NEEDS HUMAN (keys, accounts). Assume the build may resume in a fresh session with zero memory.
- **Never stall on missing keys**: all third-party calls (Anthropic, OpenAI, Stripe, Resend) behind typed provider interfaces with mocks; missing key → run mock, log NEEDS HUMAN, keep building.
- **Placeholder honesty**: any testimonials/social proof clearly marked placeholder in code until real ones exist.
- Extra env vars: NEXT_PUBLIC_POSTHOG_KEY, SENTRY_DSN.

## Agent orchestration
1. **Scaffold agent**: app + Supabase schema + auth + PostHog/Sentry wiring + PROJECT_STATE.md + CI.
2. **Onboarding+paywall agent**: the full 6-step flow + Stripe trial subscription, end-to-end FIRST (this is the money path).
3. **AI core agent**: prompts.ts, prep pack generation, zod validation, streaming UI.
4. **Voice agent**: recorder, Whisper, TTS playback, scoring loop.
5. **Modules agents (parallel)**: STAR builder + answer bank; negotiation; cover letter/emails; dashboard; cheat-sheet PDF; interview-day mode; outcome loop.
6. **Marketing agent**: landing + SEO pages.
7. **QA agent**: Playwright e2e (signup→onboarding→trial checkout test-mode→generate pack→text-mode mock→see scores), plus unit tests for AI JSON parsing with recorded fixtures. Fix everything.
8. **Deploy agent**: Vercel prod, webhooks registered, README with env setup.
Env vars: SUPABASE (3), STRIPE (3), ANTHROPIC_API_KEY, OPENAI_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_APP_URL.

## Definition of done
Deployed; a new user can go signup → onboarding → start trial (test mode) → get a real AI prep pack for a pasted job posting → complete a voice mock with scores → see dashboard readiness. All e2e green. AI cost per active user/day ≤ $0.15 (cache prep packs, cap mock sessions at 3/day).

## Out of scope v1
Native iOS/Android, live interview overlay/desktop copilot, team/B2B plans, auto-apply, multi-language.
