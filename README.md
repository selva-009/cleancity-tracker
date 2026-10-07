# CleanCity Tracker — Municipal Waste Transparency & Accountability

> Cleaner streets. Smarter cities. Total transparency.

A full-stack civic-tech platform where citizens **report** waste problems, the system **tracks** and routes them, officials **act**, and results are **verified** in the open. The core flow is **Report → Track → Act → Verify → Improve**.

This is a complete, runnable application: a FastAPI backend with a real SQLite database, real authentication, role-based access control, photo uploads and an audit trail — plus a premium single-page frontend that talks to it live.

---

## Quick start

**macOS / Linux**
```bash
./run.sh
```

**Windows**
```bat
run.bat
```

**Manual / Docker**
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# or:  docker build -t cleancity . && docker run -p 8000:8000 cleancity
```

Then open **http://127.0.0.1:8000**.

The database and demo data are created automatically on first run.

### Demo accounts (password for all: `demo1234`)

| Role | Email | What they see |
|------|-------|---------------|
| Citizen | `selva@cleancity.app` | Personal home, report wizard, tracking, verification |
| Municipal Officer | `officer@cleancity.app` | Officer dashboard, complaint table, assignments, analytics |
| Field Worker | `worker@cleancity.app` | Simple task list, evidence upload |
| Administrator | `admin@cleancity.app` | User & role management, the audit trail |

You can also self-register — new accounts are always created as **Citizen** (least privilege).

---

## What's implemented

**Citizen**
- 5-step report wizard (location → issue type → photo → details → confirm) issuing an ID like `CCT-2026-10483`
- Personal dashboard with status-coloured report cards
- Tracking timeline built from real database events
- **Before/After verification** with a drag-to-compare slider; *No, still an issue* reopens the case

**Municipal Officer**
- Dashboard with today's overview (new, pending verification, active, overdue, resolved)
- Complaint management table with search, plus a case screen to change status and assign teams
- Analytics, teams, hotspots and report-generation screens

**Field Worker**
- Today's tasks with navigate / start / upload evidence / complete

**Public (no login)**
- City Transparency Dashboard: cleanliness score, performance cards, charts, interactive map, hotspot intelligence, AI insights, and a Municipal Transparency Score

**Administrator**
- User and role management, and the immutable-style audit trail (who → what → when)

---

## Architecture

```
full/
├── app/
│   ├── main.py       FastAPI app — all routes, RBAC, validation
│   ├── db.py         SQLite schema + idempotent seed data
│   └── security.py   Password hashing, signed tokens, upload validation
├── static/
│   ├── index.html    Built single-page app (self-contained)
│   ├── js0_api.js    Live API client (with offline demo fallback)
│   ├── js1..js5      Data, core, citizen, views, live-integration layer
│   └── style.css     Premium gold design system
├── tests/
│   ├── test_api.py   End-to-end API + RBAC + security tests (28 assertions)
│   └── test_live.py  Boots the real server and checks UI + API over HTTP
├── requirements.txt
├── Dockerfile
├── run.sh / run.bat
└── README.md
```

**Stack:** Python 3.12 · FastAPI · Uvicorn · SQLite (stdlib) · vanilla JS frontend (no build step).

---

## Security model

Implemented and verified by the test suite:

- **Passwords** hashed with PBKDF2-HMAC-SHA256, 200k rounds, per-user salt. Never stored or logged in plaintext.
- **Sessions** are stateless HMAC-signed tokens with an 8-hour expiry. The signing key comes from the `CCT_SECRET` environment variable or is generated once into a git-ignored `.secret` file — no secret is ever hard-coded.
- **Role-based access control enforced server-side** on every route. The client's claimed id or role is never trusted; identity comes from the signed token.
- **Ownership checks**: a citizen can only read or verify their *own* reports; workers only touch assigned tasks; only officers/admins change status or assign; only admins read the audit log or change roles.
- **Uploads** are validated by magic bytes (not just extension), size-limited to 10 MB, stored under random filenames **outside** the static/executable tree, and served only to authenticated users (path-traversal guarded).
- **Rate limiting** on login, plus generic error messages so account existence is never revealed.
- **Audit trail** — every privileged action records actor, role, action, entity, previous state and new state. Municipal staff cannot silently rewrite complaint history.
- **Public endpoints expose aggregated data only** — no emails, phone numbers, or personal details. A test asserts the public stats payload leaks no personal data.
- **AI features are decision-support only** and clearly labelled; they never auto-reject citizens, ban users or close complaints.
- **Safe defaults**: self-registration = citizen, uploads private, public data aggregated.

### Honest limitations

This is a strong, working reference implementation — not a certified-secure system, and it should not be described as "100% secure". Before production you would additionally want: HTTPS/TLS termination, HttpOnly secure cookies instead of localStorage tokens, database encryption at rest, managed backups, malware scanning on uploads, external secret management, and an independent security review. Location is stored for routing and is not exposed publicly, but fine-grained geo-privacy (fuzzing precise coordinates) is not yet implemented.

---

## API reference (summary)

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/register` | public (creates Citizen) |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |
| GET | `/api/reports` | citizen = own · worker = assigned · officer/admin = all |
| POST | `/api/reports` | authenticated |
| GET | `/api/reports/{id}` | owner or officer/admin |
| POST | `/api/reports/{id}/status` | officer / admin |
| POST | `/api/reports/{id}/assign` | officer / admin |
| POST | `/api/reports/{id}/verify` | reporting citizen |
| POST | `/api/reports/{id}/evidence` | worker / officer / admin |
| GET | `/api/uploads/{file}` | authenticated |
| GET | `/api/stats/city` | public (aggregated) |
| GET | `/api/stats/officer` | officer / admin |
| GET | `/api/notifications` | authenticated |
| GET | `/api/users`, `/api/audit` | admin |
| PATCH | `/api/users/{id}/role` | admin |

Interactive docs are available at **http://127.0.0.1:8000/docs** while the server runs.

---

## Tests

```bash
python3 tests/test_api.py     # 28 assertions: auth, RBAC, uploads, audit, privacy
python3 tests/test_live.py    # boots the server, checks UI + API over HTTP
```

---

## Offline mode

The frontend also works without the backend. Open `static/index.html` directly in a browser (or the standalone `CleanCity-Tracker.html`) and it falls back to embedded demo data — read-only, for previewing the interface. Every real action (reporting, verifying, status changes) requires the running backend.
