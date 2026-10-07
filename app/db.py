"""
CleanCity Tracker — database layer (SQLite, stdlib only).
Schema + idempotent seed data. No secrets here.
"""
import os, sqlite3, secrets, datetime, json

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cleancity.db")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

def now():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def connect():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('citizen','worker','officer','admin')),
  ward TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  zone TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  zone TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  citizen_id INTEGER NOT NULL REFERENCES users(id),
  issue_type TEXT NOT NULL,
  location TEXT NOT NULL,
  ward TEXT NOT NULL,
  lat REAL, lng REAL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('review','progress','resolved','overdue','reopened')),
  priority TEXT NOT NULL CHECK(priority IN ('high','medium','low')),
  team_id INTEGER REFERENCES teams(id),
  dept TEXT,
  progress INTEGER NOT NULL DEFAULT 10,
  created_at TEXT NOT NULL,
  deadline TEXT,
  resolved_at TEXT
);
CREATE TABLE IF NOT EXISTS report_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  note TEXT,
  actor_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('before','after')),
  filename TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  citizen_id INTEGER NOT NULL REFERENCES users(id),
  result TEXT NOT NULL CHECK(result IN ('resolved','reopened')),
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  prev_state TEXT,
  new_state TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_citizen ON reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_events_report ON report_events(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
"""

ISSUE_TYPES = ["Overflowing Bin","Illegal Dumping","Uncollected Waste","Roadside Waste",
               "Construction Waste","Plastic Waste","Drain / Sewage Waste","Other"]

def init_db():
    con = connect()
    con.executescript(SCHEMA)
    con.commit()
    seed(con)
    con.close()

def seed(con):
    if con.execute("SELECT COUNT(*) c FROM users").fetchone()["c"] > 0:
        return  # already seeded
    from .security import hash_password  # local import avoids cycle at module load
    ts = now()
    # ---- users (demo accounts; passwords hashed, never plaintext) ----
    demo = [
        ("Selva Kumar","selva@cleancity.app","citizen","Ward 14"),
        ("Officer R. Menon","officer@cleancity.app","officer","Ward 14"),
        ("Field Worker A. Das","worker@cleancity.app","worker","Ward 14"),
        ("System Administrator","admin@cleancity.app","admin",None),
    ]
    for name,email,role,ward in demo:
        con.execute("INSERT INTO users(name,email,phone,password_hash,role,ward,created_at) VALUES(?,?,?,?,?,?,?)",
                    (name,email,"+919892486347",hash_password("demo1234"),role,ward,ts))
    # ---- wards ----
    zones = ["Central","South","East","West","North"]
    for i in range(1,17):
        con.execute("INSERT INTO wards(name,zone) VALUES(?,?)",(f"Ward {i}",zones[i%5]))
    # ---- teams ----
    for n,z,m in [("Team Alpha","Central",8),("Team Bravo","South",6),("Team Charlie","East",7),("Team Delta","West",5),("Team Echo","North",6)]:
        con.execute("INSERT INTO teams(name,zone,members) VALUES(?,?,?)",(n,z,m))
    # ---- reports ----
    teams = {r["name"]:r["id"] for r in con.execute("SELECT id,name FROM teams")}
    citizen_id = con.execute("SELECT id FROM users WHERE role='citizen' LIMIT 1").fetchone()["id"]
    officer_id = con.execute("SELECT id FROM users WHERE role='officer' LIMIT 1").fetchone()["id"]
    seed_reports = [
        ("CCT-2026-10482","Overflowing Bin","Market Road, Ward 14","Ward 14","high","progress",55,"Team Alpha","Solid Waste Mgmt","2026-10-03"),
        ("CCT-2026-10476","Illegal Dumping","Riverside Lane, Ward 7","Ward 7","high","review",20,None,"Enforcement","2026-10-05"),
        ("CCT-2026-10461","Plastic Waste","Green Park Ave, Ward 3","Ward 3","low","resolved",100,"Team Delta","Solid Waste Mgmt","2026-09-28"),
        ("CCT-2026-10455","Drain / Sewage Waste","Old Mill Street, Ward 11","Ward 11","high","overdue",40,"Team Bravo","Sanitation","2026-09-22"),
        ("CCT-2026-10440","Roadside Waste","Station Road, Ward 5","Ward 5","medium","resolved",100,"Team Alpha","Solid Waste Mgmt","2026-09-19"),
        ("CCT-2026-10421","Construction Waste","New Colony, Ward 9","Ward 9","medium","progress",60,"Team Charlie","Enforcement","2026-10-01"),
        ("CCT-2026-10412","Overflowing Bin","Market Road, Ward 14","Ward 14","high","reopened",45,"Team Alpha","Solid Waste Mgmt","2026-09-05"),
        ("CCT-2026-10398","Uncollected Waste","Lake View Road, Ward 8","Ward 8","medium","progress",65,"Team Echo","Solid Waste Mgmt","2026-09-27"),
        ("CCT-2026-10388","Uncollected Waste","Hill Street, Ward 2","Ward 2","low","resolved",100,"Team Delta","Solid Waste Mgmt","2026-08-28"),
        ("CCT-2026-10377","Illegal Dumping","Canal Road, Ward 12","Ward 12","high","review",18,None,"Enforcement","2026-10-06"),
    ]
    stages = ["Reported","Verified","Assigned","Cleanup in Progress","Cleanup Completed","Citizen Verification","Closed"]
    for rid,issue,loc,ward,prio,status,prog,team,dept,created in seed_reports:
        con.execute("""INSERT INTO reports(id,citizen_id,issue_type,location,ward,lat,lng,description,status,priority,team_id,dept,progress,created_at,deadline,resolved_at)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (rid,citizen_id,issue,loc,ward,17.385+0.01*len(rid),78.486,None,status,prio,
                     teams.get(team) if team else None,dept,prog,created+"T10:24:00Z",
                     created+"T23:59:00Z", created+"T16:10:00Z" if status=="resolved" else None))
        # events up to progress
        upto = 7 if prog>=100 else (6 if prog>=75 else (3 if prog>=55 else (2 if prog>=35 else (1 if prog>=18 else 0))))
        for i in range(min(upto, len(stages))):
            note = {"Reported":"Submitted by citizen with photo & location",
                    "Verified":"AI pre-check complete; officer confirmed (human decision)",
                    "Assigned":f"Assigned to {team or 'team'} · Dept: {dept}",
                    "Cleanup in Progress":"Field team on site",
                    "Cleanup Completed":"Evidence uploaded by the field team",
                    "Citizen Verification":"Awaiting citizen confirmation",
                    "Closed":"Case closed and archived"}.get(stages[i],"")
            con.execute("INSERT INTO report_events(report_id,stage,note,actor_id,created_at) VALUES(?,?,?,?,?)",
                        (rid,stages[i],note,officer_id if stages[i] in ("Verified","Assigned") else citizen_id, created+"T10:24:00Z"))
        if prog>=75:
            con.execute("INSERT INTO evidence(report_id,kind,filename,uploaded_by,created_at) VALUES(?,?,?,?,?)",
                        (rid,"before","seed_before.svg",citizen_id,created+"T10:24:00Z"))
            con.execute("INSERT INTO evidence(report_id,kind,filename,uploaded_by,created_at) VALUES(?,?,?,?,?)",
                        (rid,"after","seed_after.svg",officer_id,created+"T16:10:00Z"))
        if status=="resolved":
            con.execute("INSERT INTO verifications(report_id,citizen_id,result,note,created_at) VALUES(?,?,?,?,?)",
                        (rid,citizen_id,"resolved","Problem solved",created+"T18:00:00Z"))
    # ---- additional generated reports so aggregates resemble a real city ----
    locs = ["Market Road","Riverside Lane","Green Park Ave","Old Mill Street","Station Road",
            "New Colony","Lake View Road","Hill Street","Canal Road","Temple Street","MG Road","Park Avenue"]
    statuses = (["resolved"]*62 + ["progress"]*3 + ["review"]*2 + ["overdue"]*2 + ["reopened"]*1)
    for i, st in enumerate(statuses):
        rid = f"CCT-2026-{20000+i}"
        issue = ISSUE_TYPES[i % len(ISSUE_TYPES)]
        ward = f"Ward {(i % 16) + 1}"
        loc = f"{locs[i % len(locs)]}, {ward}"
        prio = ["high","medium","low"][i % 3]
        prog = {"resolved":100,"progress":60,"review":20,"overdue":40,"reopened":45}[st]
        team = f"Team {['Alpha','Bravo','Charlie','Delta','Echo'][i % 5]}"
        con.execute("""INSERT INTO reports(id,citizen_id,issue_type,location,ward,lat,lng,status,priority,team_id,dept,progress,created_at,deadline,resolved_at)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (rid, citizen_id, issue, loc, ward, 17.38+0.002*i, 78.48, st, prio,
                     teams.get(team), "Solid Waste Mgmt", prog,
                     f"2026-09-{10+(i%20):02d}T09:00:00Z", f"2026-09-{12+(i%18):02d}T23:59:00Z",
                     f"2026-09-{14+(i%15):02d}T15:00:00Z" if st == "resolved" else None))
        con.execute("INSERT INTO report_events(report_id,stage,note,actor_id,created_at) VALUES(?,?,?,?,?)",
                    (rid, "Reported", "Submitted by citizen with photo & location", citizen_id, f"2026-09-{10+(i%20):02d}T09:00:00Z"))
    # ---- notifications ----
    for title,body in [("Report CCT-2026-10482 has been assigned.","Team Alpha · Solid Waste Mgmt"),
                       ("Cleanup completed. Please verify the result.","CCT-2026-10461 · Green Park Ave"),
                       ("Your report was reopened.","CCT-2026-10455 · Old Mill Street"),
                       ("New cleanliness insights are available for your area.","Ward 14 · AI-generated insight")]:
        con.execute("INSERT INTO notifications(user_id,title,body,is_read,created_at) VALUES(?,?,?,?,?)",
                    (citizen_id,title,body,0,ts))
    # ---- audit seed ----
    con.execute("INSERT INTO audit_log(actor_id,actor_role,action,entity,entity_id,prev_state,new_state,created_at) VALUES(?,?,?,?,?,?,?,?)",
                (officer_id,"officer","status_change","report","CCT-2026-10482","review","progress",ts))
    con.commit()
