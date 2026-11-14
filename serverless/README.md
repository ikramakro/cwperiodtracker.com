# Optional: self-hosted waitlist endpoint

Use this only if you'd rather not use Formspree. It's a tiny Node server (no dependencies) that accepts the form POST and appends one JSON line per sign-up to a file **outside** the web root.

## Run on the VPS

```bash
# on srv1813447 (as a non-root user)
mkdir -p ~/cyclewise-waitlist-api && cd ~/cyclewise-waitlist-api
# copy waitlist-server.mjs here, then:
ALLOWED_ORIGIN="https://srv1813447.hstgr.cloud" PORT=8787 DATA_FILE="$HOME/cyclewise-waitlist-api/signups.jsonl" \
  node waitlist-server.mjs
```

Keep it running with `pm2 start waitlist-server.mjs --name cw-waitlist` or a systemd unit.

## nginx

Add inside the existing `server { … }` block for srv1813447.hstgr.cloud (do not touch the `/cw-legal/` location):

```nginx
location = /api/waitlist {
    limit_except POST OPTIONS { deny all; }
    client_max_body_size 16k;
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header X-Forwarded-For $remote_addr;
}
```

Then set in `landing/config.js`:

```js
FORM_ENDPOINT: "https://srv1813447.hstgr.cloud/api/waitlist",
```

## Notes

* `signups.jsonl` contains names and emails — keep it out of `/var/www`, back it up, and delete it after the launch email if you no longer need it.
* There's a basic per-IP rate limit and honeypot check. No secrets are needed.
* To export: `jq -r '[.first_name,.email,.platform,.created_at]|@csv' signups.jsonl > waitlist.csv`
