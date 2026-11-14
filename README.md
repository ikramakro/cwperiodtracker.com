# CycleWise waitlist landing page

A static, single-page waitlist site for **CycleWise** (Google Play name: *CW Period & Pregnancy Tracker*, package `com.cwperiodtracker.app`).

No build step, no framework, no trackers, no third-party fonts. Total size ≈ 0.8 MB (mostly screenshots, served as WebP with JPG fallback).

```
landing/
├── index.html      ← the page (SEO title/description, Open Graph, JSON-LD)
├── styles.css      ← all styling (brand colours from the app)
├── config.js       ← ★ the ONE setting: FORM_ENDPOINT
├── app.js          ← validation, submit, success state, share button
├── assets/         ← resized real app screenshots, OG image, favicon
├── README.md       ← this file
├── DEPLOY.md       ← copy-paste hosting instructions
└── serverless/     ← optional: your own endpoint instead of Formspree
```

## How the form works (read this before sharing the link)

* Fields: first name (required), email (required), phone type Android/iPhone/Both (optional), notes (optional), consent to waitlist emails (required), "I'm 13 or older" (required). A hidden honeypot field (`_gotcha`) silently drops bots.
* Validation happens in the browser with clear inline errors, `aria-invalid`, and focus moved to the first problem.
* On submit, `app.js` sends a normal `multipart/form-data` POST to `FORM_ENDPOINT` with `Accept: application/json`. Any 2xx response shows the in-page "You're on the list" success state.
* **While `FORM_ENDPOINT` is empty, nothing is saved.**
  * Opened locally (`file://`, `localhost`) or with `?preview=1` → preview mode: you see the success screen, the would-be submission is logged to the browser console, nothing leaves the page.
  * On a public host → visitors see "Sorry — we couldn't save your spot just now. Please try again a little later." and the console logs `FORM_ENDPOINT is not set`. **So connect an endpoint before you post the link anywhere.**

Fields sent: `first_name`, `email`, `platform`, `notes`, `consent`, `age_13_plus`, `source`, `page`, `_subject`, `_gotcha`.

## Connect Formspree (free) in 5 minutes

1. Go to <https://formspree.io/register> and sign up with the email address where you want sign-up notifications.
2. Click **+ New Form** → name it `CycleWise waitlist` → **Create**.
3. Copy the endpoint it shows, e.g. `https://formspree.io/f/abcdwxyz`.
4. Open `config.js` and paste it:
   ```js
   FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
   ```
5. Deploy (see `DEPLOY.md`), open the live page, submit one test sign-up with your own email, and confirm it appears in the Formspree dashboard. Formspree may ask you to confirm the form the first time.
6. In the form's **Settings**, turn on reCAPTCHA / spam filtering if you start getting junk, and optionally restrict submissions to your domain.

Formspree's free tier has a monthly submission cap — check their current pricing page. When you need more, export the CSV from the dashboard, or switch to Getform (<https://www.getform.io/>) or your own endpoint: only `FORM_ENDPOINT` changes.

When the app is live on Google Play, export the list (CSV) and send **one** launch email (template in `../FREE_MARKETING.md`). Only email people who ticked the consent box — which is everyone, because it's required.

## Your own endpoint instead (optional)

See `serverless/README.md` — a ~60-line Node handler you can run on your Hostinger VPS (or any serverless host) that appends sign-ups to a JSONL file outside the web root. Static hosting alone can't save submissions; something has to receive the POST.

## Things to keep honest

The copy deliberately says:

* Android first, **coming** to Google Play — not "download now". When the Play listing is published, change the hero eyebrow, the FAQ "Can I download it today?", and add the Play badge/link `https://play.google.com/store/apps/details?id=com.cwperiodtracker.app`.
* Core tracking free, no ads, **optional CycleWise Plus** for advanced insights — not "no subscription".
* Educational estimates, not a medical device, not contraception, ages 13+.
* No user counts, testimonials, press logos, or "encrypted" claims. Add them only when they're real and verifiable.

## Waitlist privacy note

The page promises sign-ups are used only for waitlist updates and never sold, and that people can unsubscribe by replying. Keep that promise: reply-to-unsubscribe must actually work (remove them from your list), and don't import this list into anything else. The app's privacy policy at `/cw-legal/privacy.html` covers the **app**; if you want a formal waitlist privacy notice, add a short section to that policy covering "waitlist sign-ups (name, email, optional phone type and notes) stored with Formspree to send launch emails."

## Preview locally

```bash
cd landing
python3 -m http.server 8080
# open http://localhost:8080  (preview mode — nothing is sent)
```
