"""End-to-end API tests (in-process, no live server needed)."""
import os, sys, io, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# fresh DB for the test run
DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
if os.path.isdir(DATA):
    for f in os.listdir(DATA):
        os.remove(os.path.join(DATA, f))

from fastapi.testclient import TestClient
from app import db as dbmod
from app.main import app
dbmod.init_db()   # ensure schema + seed exist for the in-process test run

c = TestClient(app)
ok = 0; fail = 0
def check(name, cond):
    global ok, fail
    print(("PASS " if cond else "FAIL ") + name)
    ok += cond; fail += (not cond)

# health
r = c.get("/api/health"); check("health", r.status_code == 200 and r.json()["status"] == "ok")

# login as seeded citizen
r = c.post("/api/auth/login", json={"email": "selva@cleancity.app", "password": "demo1234"})
check("citizen login", r.status_code == 200 and r.json()["user"]["role"] == "citizen")
cit = r.json()["token"]; H = {"Authorization": f"Bearer {cit}"}

# bad login is generic
r = c.post("/api/auth/login", json={"email": "selva@cleancity.app", "password": "wrongpass"})
check("bad login rejected (generic)", r.status_code == 401 and "Invalid email or password" in r.json()["detail"])

# register a new citizen (self-registration must be least-privilege)
r = c.post("/api/auth/register", json={"name": "New Person", "email": "new@x.com", "password": "secret123"})
check("register new citizen", r.status_code == 200 and r.json()["user"]["role"] == "citizen")
NEW = {"Authorization": f"Bearer {r.json()['token']}"}
# cannot self-register as admin
r = c.post("/api/auth/register", json={"name": "Sneaky", "email": "sneaky@x.com", "password": "secret123", "role": "admin"})
check("cannot self-register elevated role", r.status_code == 200 and r.json()["user"]["role"] == "citizen")
# duplicate email
r = c.post("/api/auth/register", json={"name": "Dup", "email": "new@x.com", "password": "secret123"})
check("duplicate email rejected", r.status_code == 409)
# weak password
r = c.post("/api/auth/register", json={"name": "Weak", "email": "weak@x.com", "password": "short"})
check("weak password rejected", r.status_code == 400)

# citizen sees only their own reports
r = c.get("/api/reports", headers=H); mine = r.json()["reports"]
check("citizen lists own reports", r.status_code == 200 and len(mine) > 0 and all(x["citizen_id"] == 1 for x in mine))

# create a report
r = c.post("/api/reports", headers=H, json={"issue_type": "Plastic Waste", "location": "Test Street, Ward 14", "ward": "Ward 14", "description": "test"})
check("create report", r.status_code == 200 and r.json()["id"].startswith("CCT-2026-"))
newid = r.json()["id"]

# detail includes events
r = c.get(f"/api/reports/{newid}", headers=H)
check("report detail with events", r.status_code == 200 and len(r.json()["report"]["events"]) >= 1)

# citizen cannot change status (RBAC enforced server-side)
r = c.post(f"/api/reports/{newid}/status", headers=H, json={"status": "resolved"})
check("citizen blocked from status change", r.status_code == 403)

# a different citizen cannot read someone else's report
r = c.get("/api/reports/CCT-2026-10482", headers=NEW)
check("cross-citizen access blocked", r.status_code == 403)

# officer login + status change
r = c.post("/api/auth/login", json={"email": "officer@cleancity.app", "password": "demo1234"})
off = r.json()["token"]; HO = {"Authorization": f"Bearer {off}"}
check("officer login", r.status_code == 200 and r.json()["user"]["role"] == "officer")
r = c.post(f"/api/reports/{newid}/status", headers=HO, json={"status": "progress", "note": "On it"})
check("officer status change", r.status_code == 200 and r.json()["status"] == "progress")
# officer assigns a team
r = c.get("/api/teams", headers=HO); teams = r.json()["teams"]
r = c.post(f"/api/reports/{newid}/assign", headers=HO, json={"team_id": teams[0]["id"]})
check("officer assign team", r.status_code == 200)

# worker uploads evidence (valid PNG)
png = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154a24f5f0000000049454e44ae426082")
r = c.post("/api/auth/login", json={"email": "worker@cleancity.app", "password": "demo1234"})
wrk = r.json()["token"]; HW = {"Authorization": f"Bearer {wrk}"}
r = c.post(f"/api/reports/{newid}/evidence", headers=HW, data={"kind": "after"}, files={"file": ("x.png", png, "image/png")})
check("worker uploads evidence", r.status_code == 200)
# reject non-image
r = c.post(f"/api/reports/{newid}/evidence", headers=HW, data={"kind": "after"}, files={"file": ("x.txt", b"not an image", "text/plain")})
check("non-image upload rejected", r.status_code == 400)
# citizen cannot upload evidence
r = c.post(f"/api/reports/{newid}/evidence", headers=H, data={"kind": "after"}, files={"file": ("x.png", png, "image/png")})
check("citizen blocked from evidence upload", r.status_code == 403)

# citizen verifies
r = c.post(f"/api/reports/{newid}/verify", headers=H, json={"result": "resolved"})
check("citizen verifies resolved", r.status_code == 200 and r.json()["status"] == "resolved")

# public stats (no auth) — aggregated only
r = c.get("/api/stats/city")
check("public city stats", r.status_code == 200 and "cleanliness_score" in r.json() and "ai_insights" in r.json())
body = json.dumps(r.json())
check("public stats leak no personal data", "@" not in body and "phone" not in body.lower())

# officer stats require officer
r = c.get("/api/stats/officer", headers=H); check("citizen blocked from officer stats", r.status_code == 403)
r = c.get("/api/stats/officer", headers=HO); check("officer stats ok", r.status_code == 200)

# admin-only audit + users
r = c.post("/api/auth/login", json={"email": "admin@cleancity.app", "password": "demo1234"})
ad = r.json()["token"]; HA = {"Authorization": f"Bearer {ad}"}
r = c.get("/api/audit", headers=H); check("citizen blocked from audit", r.status_code == 403)
r = c.get("/api/audit", headers=HA); check("admin reads audit log", r.status_code == 200 and len(r.json()["audit"]) > 0)
r = c.get("/api/users", headers=HA); check("admin lists users", r.status_code == 200)
r = c.patch("/api/users/1/role", headers=HA, json={"role": "officer"}); check("admin changes role", r.status_code == 200)
# no auth
r = c.get("/api/reports"); check("unauthenticated blocked", r.status_code == 401)

print(f"\n{ok} passed, {fail} failed")
sys.exit(1 if fail else 0)
