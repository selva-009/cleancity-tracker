/* ============ CleanCity Tracker — live integration layer ============
   Overrides the demo screens with API-backed versions. Loaded AFTER js1–js4,
   so these function declarations take precedence. If the API is unreachable,
   the app degrades to the embedded demo data (read-only).
*/

/* ---------------- nav (with sign-out) ---------------- */
function navHTML(){
  const links = NAV_PUBLIC.map(([r,l])=>`<a href="#/${r}" class="${state.route===r?'active':''}">${l}</a>`).join('');
  const right = state.role
    ? `<span class="pill gold">${ROLE_LABEL[state.role]}${api.online?'':''}</span>
       <button class="icon-btn" data-act="notif" aria-label="Notifications">${icon('bell')}${(state.notifs&&state.notifs.some(n=>!n.is_read))?'<span class="dot-badge"></span>':''}</button>
       <button class="btn btn-ghost btn-sm" data-act="signout">Sign out</button>`
    : `<button class="icon-btn" data-act="notif" aria-label="Notifications">${icon('bell')}</button>
       <a href="#/signin" class="btn btn-ghost btn-sm">Sign In</a>`;
  return `<div class="topnav"><div class="inner">
    <a href="#/home" class="logo"><span class="mark">CC</span>CleanCity Tracker</a>
    <nav class="navlinks">${links}</nav>
    <div class="nav-right">${right}<a href="#/report" class="btn btn-gold btn-sm">Report Issue</a></div>
  </div></div>`;
}

/* ---------------- auth ---------------- */
function viewSignin(){
  const demo=[['citizen','user','Citizen'],['officer','building','Officer'],['worker','broom','Field Worker'],['admin','settings','Admin']];
  return `<div class="authwrap"><div class="authcard card pad-lg">
    <div class="center"><div class="logo" style="justify-content:center"><span class="mark">CC</span>CleanCity Tracker</div>
      <h2 class="mt16" style="font-size:26px">Sign in</h2>
      <p class="muted mt8">Real authentication — passwords are hashed and sessions are signed tokens.</p></div>
    ${state.authError?`<div class="disclaimer" style="border-color:#f0c9c4;background:#fdf3f1"><span class="ic">${icon('alert')}</span><div>${esc(state.authError)}</div></div>`:''}
    <div class="field mt16"><label>Email</label><input id="li_email" type="email" placeholder="you@example.com" value="selva@cleancity.app"></div>
    <div class="field"><label>Password</label><input id="li_pw" type="password" placeholder="••••••••" value="demo1234"></div>
    <button class="btn btn-gold btn-block" data-act="signin">Sign in ${icon('arrow')}</button>
    <div class="center mt16"><button class="btn btn-ghost btn-sm" data-act="showregister">Create an account</button></div>
    <div class="mt24"><p class="kicker center">Or explore with a demo account</p>
      <div class="role-pick mt16">${demo.map(([r,em,t])=>`<button class="role" data-act="demo" data-role="${r}"><div class="em" style="color:var(--gold-deep)">${ic(em,22)}</div><div class="tt">${t}</div><div class="dd">demo1234</div></button>`).join('')}</div>
    </div>
    <p class="hint center mt16">${icon('shield')} Demo accounts use the password <b>demo1234</b>. Self-registration always creates a Citizen.</p>
  </div></div>`;
}
function viewRegister(){
  return `<div class="authwrap"><div class="authcard card pad-lg">
    <div class="center"><h2 style="font-size:24px">Create your citizen account</h2><p class="muted mt8">Report, track and verify issues in your area.</p></div>
    ${state.authError?`<div class="disclaimer" style="border-color:#f0c9c4;background:#fdf3f1"><span class="ic">${icon('alert')}</span><div>${esc(state.authError)}</div></div>`:''}
    <div class="field mt16"><label>Full name</label><input id="rg_name" placeholder="Your name"></div>
    <div class="field"><label>Email</label><input id="rg_email" type="email" placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input id="rg_pw" type="password" placeholder="At least 8 characters"><span class="hint">Minimum 8 characters. Stored only as a salted hash.</span></div>
    <div class="field"><label>Ward (optional)</label><select id="rg_ward"><option value="">Select…</option>${WARDS.map(w=>`<option>${w}</option>`).join('')}</select></div>
    <button class="btn btn-gold btn-block" data-act="register">Create account ${icon('arrow')}</button>
    <div class="center mt16"><button class="btn btn-ghost btn-sm" data-act="showsignin">Back to sign in</button></div>
  </div></div>`;
}
async function doSignin(email,pw){
  if(!email || !pw) return;            // ignore arg-less calls from the legacy handler
  state.authError=null;
  try{
    const res = await api.login(email,pw);
    api.setToken(res.token); api.online=true;
    state.role=res.user.role; state.user={name:res.user.name, initials:(res.user.name||'U').slice(0,1).toUpperCase()};
    await loadAll(); toast('Signed in as '+ROLE_LABEL[state.role]);
    go(state.role==='officer'?'officer':state.role==='worker'?'worker':state.role==='admin'?'admin':'citizen');
  }catch(e){
    if(e.status){ state.authError=e.message; render(); }
    else { state.authError=null; api.online=false; toast('Backend not reachable — starting demo mode'); go('home'); }
  }
}
async function doRegister(){
  const name=($('#rg_name')||{}).value, email=($('#rg_email')||{}).value, pw=($('#rg_pw')||{}).value, ward=($('#rg_ward')||{}).value;
  state.authError=null;
  try{
    const res = await api.register(name,email,pw,ward||null);
    api.setToken(res.token); api.online=true;
    state.role=res.user.role; state.user={name:res.user.name, initials:(res.user.name||'U').slice(0,1).toUpperCase()};
    await loadAll(); toast('Welcome, '+res.user.name); go('citizen');
  }catch(e){ state.authError = e.status? e.message : 'Backend not reachable.'; render(); }
}
function signout(){ api.setToken(null); api.online=false; state.role=null; state.reports=REPORTS.map(r=>({...r})); state.notifs=null; state.city=null; state.authError=null; toast('Signed out'); go('home'); }

/* ---------------- data loading ---------------- */
async function loadAll(){
  const rs = await api.listReports();
  state.reports = rs.reports.map(mapReport);
  try{ state.city = await api.cityStats(); }catch(e){}
  try{ state.notifs = (await api.notifications()).notifications; }catch(e){}
  if(state.role==='officer'||state.role==='admin'){
    try{ state.officerStats = await api.officerStats(); }catch(e){}
    try{ state.teams = (await api.teams()).teams; }catch(e){}
  }
  if(state.role==='admin'){
    try{ state.users = (await api.users()).users; }catch(e){}
    try{ state.auditRows = (await api.audit()).audit; }catch(e){}
  }
}

/* ---------------- citizen: submit ---------------- */
async function submitReport(){
  const d=state.wizard.data;
  try{
    const res = await api.createReport({issue_type:d.issue||'Overflowing Bin', location:d.loc==='Current location'?'Market Road, Ward 14':(d.loc||'Market Road, Ward 14'), ward:state.user.ward||'Ward 14', description:d.desc||null});
    state.lastSubmitted=res.id;
    state.wizard={step:1,data:{loc:'',issue:'',photos:0,desc:''}};
    await loadAll();
    successModal(res.id);
  }catch(e){
    if(!e.status){ // offline → demo behaviour
      const id='CCT-2026-'+(10483+Math.floor(Math.random()*90));
      state.reports.unshift({id,issue:d.issue||'Overflowing Bin',loc:d.loc||'Market Road, Ward 14',ward:'Ward 14',status:'review',prio:'medium',date:'2026-10-07',progress:12,team:'—',dept:'Solid Waste Mgmt'});
      state.wizard={step:1,data:{loc:'',issue:'',photos:0,desc:''}}; successModal(id);
    } else { toast(e.message); }
  }
}

/* ---------------- citizen: verify ---------------- */
async function verifyAction(id,yes){
  try{
    await api.verify(id, yes?'resolved':'reopened');
    await loadAll();
    toast(yes?'Thank you — case marked resolved and closed.':'Report reopened — please upload additional evidence.');
  }catch(e){
    const r=state.reports.find(x=>x.id===id);
    if(!e.status && r){ r.status=yes?'resolved':'reopened'; r.progress=yes?100:45; toast(yes?'Marked resolved (demo).':'Reopened (demo).'); }
    else toast(e.message);
  }
  render();
}

/* ---------------- track detail (real events + evidence) ---------------- */
function trackDetail(r){
  const idx = r.progress>=100?6 : r.progress>=75?5 : r.progress>=55?3 : r.progress>=35?2 : r.progress>=18?1 : 0;
  const evByStage = {}; (r.events||[]).forEach(e=>evByStage[e.stage]=e);
  const tl = TIMELINE.map(([t,m],i)=>{
    const ev = evByStage[t];
    return `<div class="tl-item ${i<idx?'done':''} ${i===idx?'current':''}">
      <div class="node">${i<idx?'✓':i+1}</div>
      <div class="tl-t">${t}</div><div class="tl-m">${m}</div>
      ${i<=idx?`<div class="tl-card">${ev?esc(ev.note||t):(i===0?`Submitted by citizen · ${r.date}`:'')} ${ev&&ev.created_at?`<span class="faint">· ${esc((ev.created_at||'').slice(0,16).replace('T',' '))}</span>`:''}</div>`:''}
    </div>`;
  }).join('');
  const ev = r.evidence||[];
  const before = ev.find(e=>e.kind==='before' && !String(e.filename).startsWith('seed_'));
  const after  = ev.find(e=>e.kind==='after'  && !String(e.filename).startsWith('seed_'));
  const beforeLayer = before ? `<img src="${api.uploadUrl(before.filename)}" style="width:100%;height:100%;object-fit:cover">` : beforeSVG();
  const afterLayer  = after  ? `<img src="${api.uploadUrl(after.filename)}"  style="width:100%;height:100%;object-fit:cover">` : afterSVG();
  return `<div class="wrap" style="padding-top:34px;max-width:1000px">
    <button class="btn btn-ghost btn-sm" data-act="backtrack">← All reports</button>
    <div class="between mt16" style="flex-wrap:wrap;gap:14px">
      <div><div class="row gap10" style="align-items:center"><h1 style="font-size:28px">${r.id}</h1>${statusPill(r.status)}</div>
        <p class="muted mt8">${esc(r.issue)} · ${inl('pin')} ${esc(r.loc)} · ${r.ward}</p></div>
      <div class="row gap10">${prioPill(r.prio)}<span class="pill neutral">${r.team!=='—'?r.team:'Unassigned'}</span></div>
    </div>
    <div class="grid mt24" style="grid-template-columns:1.1fr 1fr">
      <div class="card"><h3 style="font-size:19px;margin-bottom:20px">Timeline</h3><div class="timeline">${tl}</div></div>
      <div class="col gap18">
        ${r.progress>=75?`<div class="card pad-lg">
          <span class="kicker">Before / After verification</span>
          <h3 style="font-size:20px;margin:8px 0 16px">Drag to compare</h3>
          <div class="ba" data-act="ba" style="height:260px">
            <div class="layer">${beforeLayer}</div>
            <div class="layer after-layer">${afterLayer}</div>
            <span class="tag l">Before</span><span class="tag r">After</span>
            <div class="handle"></div>
          </div>
          <div class="card mt16" style="background:var(--paper-2)">
            <b>Did this actually solve the problem?</b>
            <div class="row gap10 mt16"><button class="btn btn-gold btn-sm" data-act="verifyyes" data-id="${r.id}">Yes, resolved</button>
              <button class="btn btn-ghost btn-sm" data-act="verifyno" data-id="${r.id}">No, still an issue</button></div>
          </div>
        </div>`:`<div class="card pad-lg center"><div style="color:var(--gold-deep)">${ic('clock',44,1.6)}</div><h3 class="mt8" style="font-size:20px">Verification opens after cleanup</h3><p class="muted mt8">Once the field team uploads evidence, you'll be asked to confirm the result here.</p></div>`}
        <div class="card"><h3 style="font-size:17px">Case notes</h3><p class="muted mt8" style="font-size:14px">${icon('shield')} Municipal status changes are logged with actor, action and timestamp and cannot be silently rewritten.</p></div>
      </div>
    </div>
  </div>`;
}

/* ---------------- public dashboard (live stats) ---------------- */
function viewDashboard(){
  const C = state.city || {reports_received:12482,resolved:11806,resolution_rate:94.6,avg_response_hours:18.4,overdue:326,cleanliness_score:86,transparency_score:91,
    breakdown:{"Waste Collection":88,"Response Time":79,"Resolution Rate":95,"Citizen Satisfaction":84,"Repeat Complaints":72},
    transparency_parts:{"Resolution transparency":94,"Evidence availability":89,"Response speed":79,"Citizen verification":92,"Overdue & reopened":84},
    hotspots:[], ai_insights:AI_INSIGHTS};
  const perf=[['Reports Received',fmt(C.reports_received),'all wards'],['Resolved',fmt(C.resolved),C.resolution_rate+'% of total'],['Resolution Rate',C.resolution_rate+'%','▲ improving'],['Average Response',C.avg_response_hours+' hrs','city-wide'],['Overdue',fmt(C.overdue),'needs attention']];
  const hotspots = (C.hotspots&&C.hotspots.length?C.hotspots:HOTSPOTS.map(h=>({location:h.loc,ward:h.ward,n:h.count})));
  const insights = C.ai_insights||AI_INSIGHTS;
  return `<div class="wrap" style="padding-top:34px">
    <div class="between" style="flex-wrap:wrap;gap:10px"><div><span class="kicker">Public transparency</span>
      <h1 class="mt8" style="font-size:34px">City Transparency Dashboard</h1>
      <p class="muted mt8">See how your city is responding.</p></div>
      <span class="pill ${api.online?'green':'neutral'}">${api.online?'● Live data':'Demo data'}</span></div>
    <div class="grid mt24" style="grid-template-columns:auto 1fr">
      <div class="card pad-lg center" style="display:grid;place-items:center">${ring(C.cleanliness_score)}
        <div class="mt16 hint" style="max-width:260px">Aggregated from waste collection, response time, resolution rate, satisfaction and repeat complaints.</div></div>
      <div class="col gap16">
        <div class="kpis">${perf.map(([l,v,s],i)=>`<div class="kpi ${i===0?'accent':''}"><div class="k-lbl">${l}</div><div class="k-val">${v}</div><div class="k-sub">${s}</div></div>`).join('')}</div>
        <div class="chart-card"><div class="between"><h3 style="font-size:17px">Cleanliness score breakdown</h3><span class="pill gold">Composite</span></div>
          <div class="col gap10 mt16">${Object.entries(C.breakdown).map(([l,v])=>`<div><div class="between" style="font-size:13.5px"><span>${l}</span><b>${v}</b></div><div class="progress" style="max-width:none;margin-top:6px"><i style="width:${v}%"></i></div></div>`).join('')}</div></div>
      </div>
    </div>
    <div class="grid mt24" style="grid-template-columns:1.4fr 1fr">
      <div class="chart-card"><div class="between"><h3 style="font-size:18px">Complaints vs resolutions</h3><div class="legend"><span><i class="sw" style="background:#C6A02E"></i>Received</span><span><i class="sw" style="background:#2E7D5B"></i>Resolved</span></div></div><div class="mt16">${areaChart([420,460,430,510,480,540,500,580,560,610,590,640])}</div></div>
      <div class="chart-card"><h3 style="font-size:18px">Status mix</h3><div class="donut-wrap mt16" style="justify-content:center">${donut([{v:1240,c:'#C07716'},{v:860,c:'#C6A02E'},{v:11806,c:'#2E7D5B'},{v:326,c:'#B23A32'}])}
        <div class="legend col gap6"><span><i class="sw" style="background:#C07716"></i>In Progress</span><span><i class="sw" style="background:#C6A02E"></i>Under Review</span><span><i class="sw" style="background:#2E7D5B"></i>Resolved</span><span><i class="sw" style="background:#B23A32"></i>Overdue</span></div></div></div>
    </div>
    <div class="grid mt24" style="grid-template-columns:1.2fr 1fr">
      <div class="chart-card"><div class="between"><h3 style="font-size:18px">Interactive city map</h3><span class="pill neutral">${icon('hotspot')} Issue locations</span></div>
        <div class="toolbar mt16"><select><option>All types</option>${ISSUE_TYPES.map(t=>`<option>${t.t}</option>`).join('')}</select><select><option>All wards</option>${WARDS.map(w=>`<option>${w}</option>`).join('')}</select><select><option>All statuses</option><option>New</option><option>In Progress</option><option>Resolved</option><option>Overdue</option></select></div>
        ${cityMap({h:340})}</div>
      <div class="col gap16">
        <div class="chart-card"><h3 style="font-size:18px">Municipal Transparency Score</h3>
          <div class="row gap18 mt16" style="align-items:center;flex-wrap:wrap"><div style="font-family:var(--display);font-size:52px;font-weight:800;color:var(--gold-deep);white-space:nowrap">${C.transparency_score}<span style="font-size:20px;color:var(--faint);margin-left:2px">/100</span></div>
            <div style="flex:1">${Object.entries(C.transparency_parts).map(([l,v])=>`<div style="margin-bottom:8px"><div class="between" style="font-size:12.5px"><span>${l}</span><b>${v}</b></div><div class="progress" style="max-width:none;margin-top:4px;height:5px"><i style="width:${v}%"></i></div></div>`).join('')}</div></div>
          <details class="mt16"><summary style="cursor:pointer;font-size:13.5px;color:var(--gold-deep);font-weight:600">How is this calculated?</summary><p class="hint mt8">Weighted blend of resolution transparency, evidence availability, response speed, citizen verification rate, and overdue/reopened penalties.</p></details></div>
        <div class="chart-card" style="background:linear-gradient(160deg,#FFFDF6,#FBF4E0);border-color:var(--gold-3)"><div class="row gap10">${icon('insight')}<h3 style="font-size:17px">AI City Insight</h3><span class="pill gold">AI-generated</span></div>
          <div class="col gap10 mt16">${insights.map(t=>`<p style="font-size:14px">• ${esc(t)}</p>`).join('')}</div>
          <p class="hint mt16">${icon('shield')} Decision-support only — requires human confirmation.</p></div>
      </div>
    </div>
    <div class="mt40"><div class="between"><h2 style="font-size:24px">Waste Hotspot Intelligence</h2><span class="pill neutral">${icon('hotspot')} Repeat-complaint locations</span></div>
      <div class="grid mt16" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
        ${hotspots.slice(0,3).map(h=>`<div class="card"><div class="between"><b style="font-size:17px">${esc(h.location)}</b><span class="pill gold">${h.n} reports</span></div>
          <div class="hint mt8">${esc(h.ward||'')}</div><hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
          <div style="font-size:13.5px"><span class="muted">Recommended action</span><br><b style="color:var(--gold-deep)">Review collection frequency at this location</b></div>
          <span class="pill gold mt16">AI Insight</span></div>`).join('')}
      </div></div>
  </div>`;
}

/* ---------------- officer (live) ---------------- */
function officerOverview(){
  const S = state.officerStats || {new_complaints:0,pending_verification:0,active_cleanups:0,overdue:0,resolved_today:0};
  const tiles=[['New complaints',S.new_complaints,'Awaiting review'],['Pending verification',S.pending_verification,'Reopened by citizens'],['Active cleanups',S.active_cleanups,'On site now'],['Overdue cases',S.overdue,'Past deadline'],['Resolved today',S.resolved_today,'Closed']];
  const byWard = {}; (state.reports||[]).forEach(r=>byWard[r.ward]=(byWard[r.ward]||0)+1);
  const wardVals = Object.values(byWard).slice(0,8); const wardKeys=Object.keys(byWard).slice(0,8).map(w=>w.replace('Ward ','W'));
  return `<div class="kpis">${tiles.map(([l,v,s],i)=>`<div class="kpi ${i===0?'accent':''}"><div class="k-lbl">${l}</div><div class="k-val">${v}</div><div class="k-sub">${s}</div></div>`).join('')}</div>
  <div class="grid mt24" style="grid-template-columns:1.5fr 1fr">
    <div class="chart-card"><h3 style="font-size:18px">Complaints by ward</h3><div class="mt16">${wardVals.length?barChart(wardVals,wardKeys,{h:190}):'<p class="muted">No data</p>'}</div></div>
    <div class="chart-card"><h3 style="font-size:18px">Today's queue</h3><div class="col gap10 mt16">${(state.reports||[]).slice(0,4).map(r=>`<div class="between" style="padding:10px 0;border-bottom:1px solid var(--line-2)"><span><b>${r.id}</b> <span class="faint">· ${esc(r.issue)}</span></span>${statusPill(r.status)}</div>`).join('')||'<p class="muted">Nothing pending</p>'}</div></div>
  </div>`;
}
function officerComplaints(){
  const rows = state.reports || [];
  return `<div class="toolbar"><input placeholder="Search complaints…" oninput="filterRows(this.value)" style="min-width:280px"><select><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><select><option>All statuses</option>${Object.values(STATUS).map(s=>`<option>${s.label}</option>`).join('')}</select><span class="hint" style="margin-left:auto">${rows.length} cases</span></div>
  <div class="tablewrap"><table><thead><tr><th>Complaint ID</th><th>Location</th><th>Issue</th><th>Priority</th><th>Team</th><th>Status</th><th>Reported</th><th></th></tr></thead>
    <tbody id="rows">${rows.map(r=>`<tr data-act="caseopen" data-id="${r.id}"><td><b>${r.id}</b></td><td>${esc(r.loc)}</td><td>${esc(r.issue)}</td><td>${prioPill(r.prio)}</td><td>${r.team}</td><td>${statusPill(r.status)}</td><td>${r.date}</td><td>${icon('arrow')}</td></tr>`).join('')}</tbody></table></div>`;
}
function officerTeams(){
  const teams = state.teams || [];
  return `<div class="tablewrap"><table><thead><tr><th>Team</th><th>Zone</th><th>Members</th><th>Status</th></tr></thead><tbody>
  ${teams.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.zone)}</td><td>${t.members}</td><td><span class="pill green">● Active</span></td></tr>`).join('')||'<tr><td colspan="4" class="muted">No teams</td></tr>'}</tbody></table></div>`;
}
function caseModal(id){
  const r=(state.reports||[]).find(x=>x.id===id) || {id,issue:'',loc:'',status:'review',prio:'medium',team:'—',dept:'—',date:''};
  const teamOpts=(state.teams||[]).map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  openLayer(`<div class="modal" style="max-width:720px" onclick="event.stopPropagation()">
    <div class="between"><div class="row gap10"><h2 style="font-size:22px">${r.id}</h2>${statusPill(r.status)}</div><button class="icon-btn" data-act="closelayer">✕</button></div>
    <p class="muted mt8">${esc(r.issue)} · ${inl('pin')} ${esc(r.loc)}</p>
    <div class="grid mt24" style="grid-template-columns:1fr 1fr;gap:12px;font-size:14px">
      <div class="card" style="padding:14px 16px"><span class="muted">Priority</span><br>${prioPill(r.prio)}</div>
      <div class="card" style="padding:14px 16px"><span class="muted">Team</span><br><b>${r.team}</b></div>
      <div class="card" style="padding:14px 16px"><span class="muted">Department</span><br><b>${esc(r.dept)}</b></div>
      <div class="card" style="padding:14px 16px"><span class="muted">Reported</span><br><b>${r.date}</b></div>
    </div>
    <div class="field mt16"><label>Change status (logged to audit trail)</label><select id="cm_status">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${k===r.status?'selected':''}>${v.label}</option>`).join('')}</select></div>
    <div class="field"><label>Assign team</label><select id="cm_team"><option value="">— keep current —</option>${teamOpts}</select></div>
    <div class="field"><label>Officer note</label><textarea id="cm_note" rows="2" placeholder="Recorded with your identity and timestamp."></textarea></div>
    <div class="row gap10" style="flex-wrap:wrap"><button class="btn btn-gold btn-sm" data-act="casesave" data-id="${r.id}">Save changes</button><button class="btn btn-ghost btn-sm" data-act="caseevidence" data-id="${r.id}">Upload after-photo</button><button class="btn btn-dark btn-sm" data-act="closelayer">Close</button></div>
    <p class="hint mt16">${icon('shield')} Changes create an immutable audit entry (who → what → when).</p>
  </div>`);
}
async function caseSave(id){
  const status=($('#cm_status')||{}).value, team=($('#cm_team')||{}).value, note=($('#cm_note')||{}).value;
  try{
    if(team) await api.assign(id, parseInt(team));
    if(status) await api.setStatus(id, status, note||null);
    await loadAll(); closeLayer(); toast('Saved and logged to the audit trail.'); render();
  }catch(e){ toast(e.message||'Could not save.'); }
}
async function caseEvidence(id){
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=async()=>{ if(!input.files[0]) return;
    try{ await api.uploadEvidence(id,'after',input.files[0]); await loadAll(); toast('After-photo uploaded.'); }
    catch(e){ toast(e.message||'Upload failed.'); } };
  input.click();
}

/* ---------------- notifications (live) ---------------- */
async function notifDrawer(){
  let items = state.notifs;
  if(api.online){ try{ items=(await api.notifications()).notifications; state.notifs=items; }catch(e){} }
  items = items || NOTIFS.map((n,i)=>({id:i,title:n.t,body:n.m,is_read:!n.unread,created_at:n.time}));
  openLayer(`<div class="overlay" data-act="closelayer-bg" style="align-items:stretch;justify-content:flex-end;padding:0"><div class="drawer" onclick="event.stopPropagation()">
    <div class="between"><h2 style="font-size:22px">Notifications</h2><button class="icon-btn" data-act="closelayer">✕</button></div>
    <p class="hint mt8">Updates on your reports and your area.</p>
    <div class="mt24">${items.map(n=>`<div class="notif"><div class="ic">${ic(n.is_read?'check':'pin',18)}</div><div><b style="font-size:14.5px">${esc(n.title)}</b><div class="hint mt8">${esc(n.body||'')} ${n.created_at?('· '+esc(String(n.created_at).slice(0,16).replace('T',' '))):''}</div></div></div>`).join('')||'<p class="muted">No notifications yet.</p>'}</div>
  </div></div>`);
}

/* ---------------- admin ---------------- */
function viewAdmin(){
  const users = state.users||[], audit = state.auditRows||[];
  return `<div class="shell">
    <aside class="side"><div class="brand"><span class="mark">CC</span>CleanCity Tracker</div>
      <nav><a class="active">${icon('settings')}<span>Administration</span></a></nav>
      <div class="side-foot">Signed in as <b style="color:#fff">Administrator</b><br>Role &amp; audit management</div></aside>
    <main class="main">
      <div class="page-head"><div><h1>Administration</h1><p>Users, roles and the immutable audit trail.</p></div><span class="pill green">● Live</span></div>
      <div class="card"><h3 style="font-size:18px">Users &amp; roles</h3>
        <div class="tablewrap mt16"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Ward</th><th>Change role</th></tr></thead><tbody>
        ${users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td><span class="pill gold">${u.role}</span></td><td>${esc(u.ward||'—')}</td>
          <td><select data-act="setrole" data-id="${u.id}">${['citizen','worker','officer','admin'].map(r=>`<option value="${r}" ${r===u.role?'selected':''}>${r}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card mt24"><h3 style="font-size:18px">Audit trail <span class="faint" style="font-size:13px;font-weight:400">· who → what → when</span></h3>
        <div class="tablewrap mt16"><table><thead><tr><th>When</th><th>Actor</th><th>Role</th><th>Action</th><th>Entity</th><th>Change</th></tr></thead><tbody>
        ${audit.slice(0,40).map(a=>`<tr><td>${esc(String(a.created_at||'').slice(0,16).replace('T',' '))}</td><td>${esc(a.actor||'—')}</td><td>${esc(a.actor_role||'')}</td><td><b>${esc(a.action)}</b></td><td>${esc(a.entity)} ${esc(a.entity_id||'')}</td><td class="muted">${esc((a.prev_state||'')+' → '+(a.new_state||''))}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">No entries</td></tr>'}</tbody></table></div></div>
    </main>
  </div>`;
}

/* ---------------- router override (adds admin) ---------------- */
function viewFor(h){
  switch(h){
    case 'home': return viewHome();
    case 'signin': return state.showRegister?viewRegister():viewSignin();
    case 'citizen': return state.role?viewCitizen():viewSignin();
    case 'report': return viewReport();
    case 'track': return viewTrack();
    case 'dashboard': return viewDashboard();
    case 'insights': return viewInsights();
    case 'about': return viewAbout();
    case 'officer': return (state.role==='officer'||state.role==='admin')?viewOfficer():viewSignin();
    case 'worker': return state.role==='worker'?viewWorker():viewSignin();
    case 'admin': return state.role==='admin'?viewAdmin():viewSignin();
    case 'profile': return state.role?viewProfile():viewSignin();
    default: return viewHome();
  }
}

/* ---------------- extra event handlers ---------------- */
document.addEventListener('click', async (e)=>{
  const t=e.target.closest('[data-act]'); if(!t) return; const a=t.getAttribute('data-act');
  if(a==='signin'){ const em=($('#li_email')||{}).value, pw=($('#li_pw')||{}).value; doSignin(em,pw); }
  else if(a==='register'){ doRegister(); }
  else if(a==='showregister'){ state.showRegister=true; state.authError=null; render(); }
  else if(a==='showsignin'){ state.showRegister=false; state.authError=null; render(); }
  else if(a==='demo'){ state.role=t.getAttribute('data-role'); api.online=false; state.user={name:'Demo User',initials:'D'}; go(state.role==='officer'?'officer':state.role==='worker'?'worker':state.role==='admin'?'admin':'citizen'); }
  else if(a==='signout'){ signout(); }
  else if(a==='casesave'){ caseSave(t.getAttribute('data-id')); }
  else if(a==='caseevidence'){ caseEvidence(t.getAttribute('data-id')); }
  else if(a==='setrole'){ /* handled on change */ }
});
document.addEventListener('change', async (e)=>{
  const t=e.target.closest('[data-act="setrole"]'); if(!t) return;
  try{ await api.setRole(parseInt(t.getAttribute('data-id')), t.value); state.users=(await api.users()).users; state.auditRows=(await api.audit()).audit; toast('Role updated and logged.'); render(); }
  catch(err){ toast(err.message||'Could not change role.'); }
});

/* ---------------- bootstrap: resume session ---------------- */
(async function bootstrap(){
  if(api.token){
    try{ const me=await api.me(); api.online=true; state.role=me.user.role; state.user={name:me.user.name,initials:(me.user.name||'U').slice(0,1).toUpperCase()}; await loadAll(); render(); return; }
    catch(e){ api.setToken(null); }
  }
  // probe backend so the UI can show Live vs Demo
  try{ await fetch(API_BASE+'/api/health'); api.online=true; try{ state.city = await api.cityStats(); }catch(e){} }catch(e){ api.online=false; }
  render();
})();
