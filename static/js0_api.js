/* ============ CleanCity Tracker — live API client (with graceful demo fallback) ============
   When the FastAPI backend is running, the SPA talks to it. When it is not
   (e.g. the file is opened directly), the app falls back to embedded demo data
   so the UI still works — but every write action requires the live API.
*/
const API_BASE = (() => {
  const q = new URLSearchParams(location.search).get('api');
  if (q) return q.replace(/\/$/, '');
  if (location.protocol === 'file:') return 'http://localhost:8000';
  return ''; // same origin when served by the backend
})();

const api = {
  token: localStorage.getItem('cct_token') || null,
  online: false,
  setToken(t) { this.token = t; if (t) localStorage.setItem('cct_token', t); else localStorage.removeItem('cct_token'); },
  headers(extra) { const h = Object.assign({}, extra || {}); if (this.token) h['Authorization'] = 'Bearer ' + this.token; return h; },
  async call(path, opts = {}) {
    const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers: this.headers(opts.headers) }));
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) { const msg = (data && (data.detail || data.message)) || ('Request failed (' + res.status + ')'); const err = new Error(msg); err.status = res.status; throw err; }
    return data;
  },
  // ---- auth ----
  login(email, password) { return this.call('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); },
  register(name, email, password, ward) { return this.call('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, ward }) }); },
  me() { return this.call('/api/auth/me'); },
  // ---- reports ----
  listReports() { return this.call('/api/reports'); },
  getReport(id) { return this.call('/api/reports/' + encodeURIComponent(id)); },
  createReport(payload) { return this.call('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },
  setStatus(id, status, note) { return this.call('/api/reports/' + encodeURIComponent(id) + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note }) }); },
  assign(id, team_id, deadline) { return this.call('/api/reports/' + encodeURIComponent(id) + '/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team_id, deadline }) }); },
  verify(id, result, note) { return this.call('/api/reports/' + encodeURIComponent(id) + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ result, note }) }); },
  async uploadEvidence(id, kind, file) {
    const fd = new FormData(); fd.append('kind', kind); fd.append('file', file);
    return this.call('/api/reports/' + encodeURIComponent(id) + '/evidence', { method: 'POST', body: fd });
  },
  // ---- data ----
  cityStats() { return this.call('/api/stats/city'); },
  officerStats() { return this.call('/api/stats/officer'); },
  notifications() { return this.call('/api/notifications'); },
  readNotif(id) { return this.call('/api/notifications/' + id + '/read', { method: 'POST' }); },
  teams() { return this.call('/api/teams'); },
  users() { return this.call('/api/users'); },
  setRole(id, role) { return this.call('/api/users/' + id + '/role', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }); },
  audit() { return this.call('/api/audit'); },
  uploadUrl(filename) { return API_BASE + '/api/uploads/' + encodeURIComponent(filename) + '?token=' + encodeURIComponent(this.token || ''); }
};

/* map an API report into the shape the views already expect */
function mapReport(r) {
  const t = ISSUE_TYPES.find(x => x.t === r.issue_type) || { k: 'other' };
  return {
    id: r.id, issue: r.issue_type, icon: ISSUE_IC[t.k], loc: r.location, ward: r.ward,
    status: r.status, prio: r.priority, date: (r.created_at || '').slice(0, 10),
    progress: r.progress, team: r.team || '—', dept: r.dept || '—',
    events: r.events || null, evidence: r.evidence || null, verification: r.verification || null
  };
}
