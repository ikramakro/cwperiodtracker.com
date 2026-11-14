/*
 * CycleWise waitlist — the ONE setting you need to change.
 *
 * Paste your form endpoint between the quotes, e.g.
 *   Formspree:  "https://formspree.io/f/abcdwxyz"
 *   Getform:    "https://getform.io/f/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *   Your API:   "https://srv1813447.hstgr.cloud/api/waitlist"   (must accept POST multipart/form-data and return 2xx)
 *
 * While this is empty:
 *   - Opening the page locally (file://, localhost, 127.0.0.1) or with ?preview=1 runs a PREVIEW:
 *     the form validates and shows the success screen, but nothing is saved or sent.
 *   - On a public host the form shows a gentle "please try again soon" message and saves nothing.
 *     So set this BEFORE you share the link.
 *
 * No passwords, API keys, or secrets ever go in this file — it is public.
 */
window.CYCLEWISE_CONFIG = {
  FORM_ENDPOINT: "",

  // Optional: subject line Formspree uses for the notification email it sends YOU.
  NOTIFY_SUBJECT: "New CycleWise waitlist sign-up"
};
