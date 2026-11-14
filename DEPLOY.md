# Deploy the CycleWise waitlist page

**Before any deploy:** paste your form endpoint into `config.js` (see README → "Connect Formspree"). Without it, sign-ups on a public host are not saved.

Upload only the site files — `index.html`, `styles.css`, `config.js`, `app.js`, `assets/`. The `serverless/` folder and the `.md` files don't need to be public (harmless if they are, but there's no reason to).

---

## Option A — your Hostinger VPS at `https://srv1813447.hstgr.cloud/waitlist/` (recommended)

The legal pages live at `/cw-legal/` (privacy + delete — Google Play needs them). **Do not overwrite or move them.** The waitlist goes in its own folder.

The server runs nginx. From your Mac, in the folder that contains `landing/`:

```bash
# 1) upload to a NEW folder (replace USER with your SSH user; no passwords in files)
ssh USER@srv1813447.hstgr.cloud 'sudo mkdir -p /var/www/cyclewise-waitlist && sudo chown $USER /var/www/cyclewise-waitlist'
rsync -av --delete \
  --exclude 'serverless' --exclude '*.md' \
  landing/ USER@srv1813447.hstgr.cloud:/var/www/cyclewise-waitlist/
```

`--delete` only affects `/var/www/cyclewise-waitlist/`, never `/cw-legal/`. Double-check the destination path before running it.

```bash
# 2) see how /cw-legal/ is currently served, so you add /waitlist/ next to it
ssh USER@srv1813447.hstgr.cloud 'sudo grep -Rn "cw-legal" /etc/nginx/'
```

Add this block **inside the same `server { … }`** that contains the `cw-legal` location. Don't edit the `cw-legal` block:

```nginx
location = /waitlist { return 301 /waitlist/; }
location /waitlist/ {
    alias /var/www/cyclewise-waitlist/;
    index index.html;
    try_files $uri $uri/ /waitlist/index.html;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ~* \.(jpg|webp|svg|css|js)$ { expires 7d; }
}
```

```bash
# 3) test + reload
ssh USER@srv1813447.hstgr.cloud 'sudo nginx -t && sudo systemctl reload nginx'

# 4) check: both must return 200
curl -sI https://srv1813447.hstgr.cloud/waitlist/ | head -1
curl -sI https://srv1813447.hstgr.cloud/cw-legal/privacy.html | head -1
```

If the server uses a control panel (e.g. a Hostinger template with its own web root) instead of hand-edited nginx, upload `landing/*` into a new `waitlist/` folder next to `cw-legal/` in that web root — same rule, a separate folder.

**Subdomain instead?** If you add a DNS record such as `waitlist.yourdomain.com`, give it its own `server { … }` with `root /var/www/cyclewise-waitlist;` and update `canonical`, `og:url`, and `og:image` in `index.html`.

---

## Option B — Netlify (free, 2 minutes, no git)

1. Open <https://app.netlify.com/drop> and sign in.
2. Drag the `landing` folder onto the page.
3. Netlify gives you `https://something.netlify.app`. Rename it in **Site configuration → Change site name** (e.g. `cyclewise-waitlist`).
4. In `index.html`, change `canonical`, `og:url`, and `og:image` to the Netlify URL and drag the folder again to redeploy.

---

## Option C — GitHub Pages (free)

```bash
cd landing
git init && git add index.html styles.css config.js app.js assets
git commit -m "CycleWise waitlist page"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cyclewise-waitlist.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root → Save**. The site appears at `https://YOUR_GITHUB_USERNAME.github.io/cyclewise-waitlist/` after about a minute. Update `canonical`, `og:url`, and `og:image` to match.

(`config.js` is public by design. It only holds the form URL, which isn't a secret.)

---

## After deploy — 2-minute checklist

- [ ] Submit a real test sign-up with your own email → it shows up in Formspree (or `signups.jsonl`).
- [ ] Open the page on your phone: the hero, screenshots, and form all look right.
- [ ] Privacy and delete links in the footer open the `/cw-legal/` pages.
- [ ] Paste the URL into <https://www.opengraph.xyz/> or a DM to yourself and check the preview image.
- [ ] Replace `YOUR_WAITLIST_URL` in `FREE_MARKETING.md` with the real URL.

## When the Play listing goes live

Edit `index.html`: change the hero eyebrow to "Now on Google Play", add a **Get it on Google Play** button linking to
`https://play.google.com/store/apps/details?id=com.cwperiodtracker.app`, update the FAQ "Can I download it today?", and change JSON-LD `availability` to `https://schema.org/InStock`. Keep the waitlist for iPhone interest.
