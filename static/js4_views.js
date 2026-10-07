/* ============ CleanCity Tracker — public dashboard, insights, officer, worker, profile, engine ============ */

/* ---------------- map component ---------------- */
function cityMap({h=440}={}){
  const roads=[['6%','40%','88%','6px'],['10%','72%','70%','6px'],['40%','8%','4px','84%'],['72%','12%','4px','72%'],['0','58%','100%','8px']];
  const pins=[[16,26,'gold'],[30,58,'green'],[46,22,'orange'],[62,54,'gold'],[74,30,'green'],[40,70,'red'],[22,74,'gold'],[84,62,'orange'],[54,40,'green'],[68,78,'gold']];
  return `<div class="map" style="height:${h}px">
    <div class="grid-lines"></div>
    ${roads.map(r=>`<div class="road" style="left:${r[0]};top:${r[1]};width:${r[2]};height:${r[3]}"></div>`).join('')}
    ${pins.map(([x,y,c])=>`<div class="pin ${c}" style="left:${x}%;top:${y}%" data-act="pin" title="Click for details"></div>`).join('')}
    <div style="position:absolute;left:16px;bottom:16px;background:rgba(255,255,255,.94);border:1px solid var(--line);border-radius:14px;padding:12px 14px;font-size:12.5px;box-shadow:var(--shadow-sm)">
      <b style="display:block;margin-bottom:6px">Legend</b>
      <span class="row gap6"><i class="sw" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#C6A02E"></i> New</span>
      &nbsp;&nbsp;<span class="row gap6"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#C07716"></i> In Progress</span>
      &nbsp;&nbsp;<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#2E7D5B"></i> Resolved</span>
      &nbsp;&nbsp;<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#B23A32"></i> Overdue</span>
    </div>
    <div class="hint" style="position:absolute;right:16px;bottom:16px;background:rgba(255,255,255,.9);padding:6px 12px;border-radius:999px">${icon('shield')} Approximate markers only</div>
  </div>`;
}

/* ---------------- PUBLIC CITY DASHBOARD ---------------- */
function viewDashboard(){
  const perf=[['Reports Received','12,482','+8% vs last month'],['Resolved','11,806','94.6% of total'],['Resolution Rate','94.6%','▲ 2.1 pts'],['Average Response','18.4 hrs','▼ 3.2 hrs faster'],['Overdue','326','Needs attention']];
  const scoreParts=[['Waste Collection',88],['Response Time',79],['Resolution Rate',95],['Citizen Satisfaction',84],['Repeat Complaints',72]];
  return `<div class="wrap" style="padding-top:34px">
    <span class="kicker">Public transparency</span>
    <h1 class="mt8" style="font-size:34px">City Transparency Dashboard</h1>
    <p class="muted mt8">See how your city is responding.</p>

    <div class="grid mt24" style="grid-template-columns:auto 1fr">
      <div class="card pad-lg center" style="display:grid;place-items:center">${ring(86)}
        <div class="mt16 hint" style="max-width:260px">Aggregated from waste collection, response time, resolution rate, satisfaction and repeat complaints.</div></div>
      <div class="col gap16">
        <div class="kpis">${perf.map(([l,v,s],i)=>`<div class="kpi ${i===0?'accent':''}"><div class="k-lbl">${l}</div><div class="k-val">${v}</div><div class="k-sub">${s}</div></div>`).join('')}</div>
        <div class="chart-card"><div class="between"><h3 style="font-size:17px">Cleanliness score breakdown</h3><span class="pill gold">Composite</span></div>
          <div class="col gap10 mt16">${scoreParts.map(([l,v])=>`<div><div class="between" style="font-size:13.5px"><span>${l}</span><b>${v}</b></div><div class="progress" style="max-width:none;margin-top:6px"><i style="width:${v}%"></i></div></div>`).join('')}</div>
        </div>
      </div>
    </div>

    <div class="grid mt24" style="grid-template-columns:1.4fr 1fr">
      <div class="chart-card"><div class="between"><h3 style="font-size:18px">Complaints vs resolutions</h3><div class="legend"><span><i class="sw" style="background:#C6A02E"></i>Received</span><span><i class="sw" style="background:#2E7D5B"></i>Resolved</span></div></div>
        <div class="mt16">${areaChart([420,460,430,510,480,540,500,580,560,610,590,640])}</div></div>
      <div class="chart-card"><h3 style="font-size:18px">Status mix</h3><div class="donut-wrap mt16" style="justify-content:center">${donut([{v:1240,c:'#C07716'},{v:860,c:'#C6A02E'},{v:11806,c:'#2E7D5B'},{v:326,c:'#B23A32'}])}
        <div class="legend col gap6"><span><i class="sw" style="background:#C07716"></i>In Progress</span><span><i class="sw" style="background:#C6A02E"></i>Under Review</span><span><i class="sw" style="background:#2E7D5B"></i>Resolved</span><span><i class="sw" style="background:#B23A32"></i>Overdue</span></div></div></div>
    </div>

    <div class="grid mt24" style="grid-template-columns:1.2fr 1fr">
      <div class="chart-card"><div class="between"><h3 style="font-size:18px">Interactive city map</h3><span class="pill neutral">${icon('hotspot')} Issue locations</span></div>
        <div class="toolbar mt16"><select><option>All types</option>${ISSUE_TYPES.map(t=>`<option>${t.t}</option>`).join('')}</select><select><option>All wards</option>${WARDS.map(w=>`<option>${w}</option>`).join('')}</select><select><option>All statuses</option><option>New</option><option>In Progress</option><option>Resolved</option><option>Overdue</option></select><select><option>Any severity</option><option>High</option><option>Medium</option><option>Low</option></select></div>
        ${cityMap({h:360})}</div>
      <div class="col gap16">
        <div class="chart-card"><h3 style="font-size:18px">Municipal Transparency Score</h3>
          <div class="row gap18 mt16" style="align-items:center;flex-wrap:wrap"><div style="font-family:var(--display);font-size:52px;font-weight:800;color:var(--gold-deep);white-space:nowrap">91<span style="font-size:20px;color:var(--faint);margin-left:2px">/100</span></div>
            <div style="flex:1">${[['Resolution transparency',94],['Evidence availability',89],['Response speed',79],['Citizen verification',92],['Overdue & reopened',84]].map(([l,v])=>`<div style="margin-bottom:8px"><div class="between" style="font-size:12.5px"><span>${l}</span><b>${v}</b></div><div class="progress" style="max-width:none;margin-top:4px;height:5px"><i style="width:${v}%"></i></div></div>`).join('')}</div></div>
          <details class="mt16"><summary style="cursor:pointer;font-size:13.5px;color:var(--gold-deep);font-weight:600">How is this calculated?</summary><p class="hint mt8">Weighted blend of resolution transparency, evidence availability, response speed, citizen verification rate, and overdue/reopened penalties. Higher is better.</p></details>
        </div>
        <div class="chart-card" style="background:linear-gradient(160deg,#FFFDF6,#FBF4E0);border-color:var(--gold-3)"><div class="row gap10">${icon('insight')}<h3 style="font-size:17px">AI City Insight</h3><span class="pill gold">AI-generated</span></div>
          <div class="col gap10 mt16">${AI_INSIGHTS.map(t=>`<p style="font-size:14px">• ${t}</p>`).join('')}</div>
          <p class="hint mt16">${icon('shield')} Decision-support only — requires human confirmation.</p></div>
      </div>
    </div>

    <div class="mt40"><div class="between"><h2 style="font-size:24px">Waste Hotspot Intelligence</h2><span class="pill neutral">${icon('hotspot')} Repeat-complaint locations</span></div>
      <div class="grid mt16" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
        ${HOTSPOTS.map(h=>`<div class="card"><div class="between"><b style="font-size:17px">${h.loc}</b><span class="pill ${h.trend.startsWith('+')?'red':'green'}">${h.trend}</span></div>
          <div class="hint mt8">${h.ward} · ${h.count} complaints</div>
          <hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
          <div style="font-size:13.5px"><span class="muted">Main issue</span><br><b>${h.issue}</b></div>
          <div style="font-size:13.5px;margin-top:10px"><span class="muted">Possible cause</span><br>${h.cause}</div>
          <div style="font-size:13.5px;margin-top:10px"><span class="muted">Recommended action</span><br><b style="color:var(--gold-deep)">${h.action}</b></div>
          <span class="pill gold mt16">AI Insight</span></div>`).join('')}
      </div></div>
  </div>`;
}

/* ---------------- INSIGHTS ---------------- */
function viewInsights(){
  return `<div class="wrap" style="padding-top:34px">
    <span class="kicker">Insights</span><h1 class="mt8" style="font-size:32px">What the data is telling the city</h1>
    <p class="muted mt8">Patterns, hotspots and delays — surfaced for human review.</p>
    <div class="grid mt24" style="grid-template-columns:1.3fr 1fr">
      <div class="chart-card"><h3 style="font-size:18px">Complaint volume · 12 weeks</h3><div class="mt16">${areaChart([320,360,340,420,400,460,430,500,470,530,510,560])}</div>
        <div class="legend mt16"><span><i class="sw" style="background:#C6A02E"></i>City-wide complaints</span></div></div>
      <div class="chart-card" style="background:linear-gradient(160deg,#FFFDF6,#FBF4E0);border-color:var(--gold-3)"><div class="row gap10">${icon('insight')}<h3 style="font-size:18px">AI City Insight</h3><span class="pill gold">AI-generated</span></div>
        <div class="col gap14 mt16">${AI_INSIGHTS.map(t=>`<div class="card" style="padding:14px 16px"><p style="font-size:14px">${t}</p></div>`).join('')}</div></div>
    </div>
    <div class="grid mt24" style="grid-template-columns:1fr 1fr">
      <div class="chart-card"><h3 style="font-size:18px">Complaints by ward</h3><div class="mt16">${barChart([38,22,18,26,31,20,24,28,19,33,41,27,16,52,21,25],WARDS.map(w=>w.replace('Ward ','W')))}</div></div>
      <div class="chart-card"><h3 style="font-size:18px">Density heatmap · ward × week</h3><div class="mt16" style="overflow:auto">${heatmap(12,10)}</div>
        <p class="hint mt16">Darker cells = more complaints. Useful for spotting emerging problem areas.</p></div>
    </div>
    <div class="mt40"><h2 style="font-size:24px">AI-detected signals</h2>
      <div class="grid mt16" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        ${[['Complaint patterns','Cluster by issue type and locality'],['Hotspots','Repeat-complaint locations'],['Repeat locations','Same spot, recurring failures'],['Increasing problem areas','Rising trend in specific wards'],['Response delays','Cases trending past deadline'],['Resource requirements','Where crews are stretched']].map(([t,d])=>`<div class="card"><div class="row gap10">${icon('insight')}<b>${t}</b></div><p class="muted mt8" style="font-size:14px">${d}</p></div>`).join('')}
      </div></div>
  </div>`;
}

/* ---------------- OFFICER DASHBOARD ---------------- */
const OFFICER_TABS=[['overview','Overview','dash'],['complaints','Complaints','report'],['assignments','Assignments','assign'],['teams','Teams','teams'],['hotspots','Hotspots','hotspot'],['analytics','Analytics','analytics'],['reports','Reports','track'],['settings','Settings','settings']];
function viewOfficer(){
  const tab = state.officerTab||'overview';
  return `<div class="shell">
    <aside class="side">
      <div class="brand"><span class="mark">CC</span>CleanCity Tracker</div>
      <nav>${OFFICER_TABS.map(([k,l,ic])=>`<a href="#/officer" data-act="otab" data-tab="${k}" class="${tab===k?'active':''}">${icon(ic)}<span>${l}</span></a>`).join('')}</nav>
      <div class="side-foot">Signed in as <b style="color:#fff">Municipal Officer</b><br>Jurisdiction: Ward 14 · Central Zone</div>
    </aside>
    <main class="main">
      <div class="page-head"><div><h1>${OFFICER_TABS.find(t=>t[0]===tab)[1]}</h1><p>${officerSub(tab)}</p></div>
        <div class="row gap10"><span class="pill green">● Live</span><button class="btn btn-gold btn-sm" data-act="toast" data-msg="Bulk action queued (demo)">Bulk action</button></div></div>
      ${tab==='overview'?officerOverview():tab==='complaints'?officerComplaints():tab==='analytics'?officerAnalytics():tab==='hotspots'?officerViewHotspots():tab==='teams'?officerTeams():tab==='assignments'?officerAssignments():tab==='reports'?officerReports():officerSettings()}
    </main>
  </div>`;
}
function officerSub(t){ return {overview:"Today's operational picture at a glance.",complaints:'Review, prioritise and act on every case.',assignments:'Route cases to the right field teams.',teams:'Field team workload and performance.',hotspots:'Where complaints keep returning.',analytics:'Trends, response times and load.',reports:'Generate and export statutory reports.',settings:'Jurisdiction, roles and notification rules.'}[t]||''; }
function officerOverview(){
  const tiles=[['New complaints','48','▲ 6 today','gold'],['Pending verification','12','Awaiting officer','orange'],['Active cleanups','23','On site now','gold'],['Overdue cases','7','Past deadline','red'],['Resolved today','31','94.6% rate','green']];
  return `<div class="kpis">${tiles.map(([l,v,s,c])=>`<div class="kpi ${c==='gold'?'accent':''}"><div class="k-lbl">${l}</div><div class="k-val">${v}</div><div class="k-sub">${s}</div></div>`).join('')}</div>
  <div class="grid mt24" style="grid-template-columns:1.5fr 1fr">
    <div class="chart-card"><div class="between"><h3 style="font-size:18px">Case load vs capacity</h3><div class="legend"><span><i class="sw" style="background:#C6A02E"></i>Incoming</span><span><i class="sw" style="background:#5B6448"></i>Closed</span></div></div><div class="mt16">${areaChart([30,42,38,52,46,60,54,66,58,72,64,78])}</div></div>
    <div class="chart-card"><h3 style="font-size:18px">Priority mix</h3><div class="donut-wrap mt16" style="justify-content:center">${donut([{v:34,c:'#B23A32'},{v:52,c:'#C07716'},{v:60,c:'#2E7D5B'}],{size:150})}
      <div class="legend col gap6"><span><i class="sw" style="background:#B23A32"></i>High</span><span><i class="sw" style="background:#C07716"></i>Medium</span><span><i class="sw" style="background:#2E7D5B"></i>Low</span></div></div></div>
  </div>
  <div class="grid mt24" style="grid-template-columns:1fr 1fr">
    <div class="chart-card"><h3 style="font-size:18px">Avg response time by team (hrs)</h3><div class="mt16">${barChart([22,18,26,15,20],['Alpha','Bravo','Charlie','Delta','Echo'])}</div></div>
    <div class="card"><h3 style="font-size:18px">Today's queue</h3><div class="col gap10 mt16">${state.reports.slice(0,4).map(r=>`<div class="between" style="padding:10px 0;border-bottom:1px solid var(--line-2)"><span><b>${r.id}</b> <span class="faint">· ${r.issue}</span></span>${statusPill(r.status)}</div>`).join('')}</div></div>
  </div>`;
}
function officerComplaints(){
  return `<div class="toolbar"><input placeholder="Search complaints…" oninput="filterRows(this.value)" style="min-width:280px"><select><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><select><option>All statuses</option>${Object.values(STATUS).map(s=>`<option>${s.label}</option>`).join('')}</select><select><option>All teams</option><option>Team Alpha</option><option>Team Bravo</option><option>Team Charlie</option><option>Team Delta</option></select>
    <span class="hint" style="margin-left:auto">${ALL_REPORTS.length} cases</span></div>
  <div class="tablewrap"><table><thead><tr><th>Complaint ID</th><th>Location</th><th>Issue</th><th>Priority</th><th>Team</th><th>Status</th><th>Reported</th><th>Deadline</th><th></th></tr></thead>
    <tbody id="rows">${ALL_REPORTS.slice(0,22).map(r=>`<tr data-act="caseopen" data-id="${r.id}">
      <td><b>${r.id}</b></td><td>${esc(r.loc)}</td><td>${esc(r.issue)}</td><td class="prio">${prioPill(r.prio)}</td><td>${r.team}</td><td>${statusPill(r.status)}</td><td>${r.date}</td><td>${r.status==='overdue'?'<span style="color:var(--red)">Overdue</span>':'+48h'}</td><td>${icon('arrow')}</td></tr>`).join('')}</tbody></table></div>`;
}
function filterRows(q){ q=q.toLowerCase(); $$('#rows tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none'); }
function officerAnalytics(){
  return `<div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="chart-card"><h3 style="font-size:18px">Resolution rate trend</h3><div class="mt16">${areaChart([88,89,91,90,92,93,92,94,94,95,95,94.6])}</div></div>
    <div class="chart-card"><h3 style="font-size:18px">Complaints by issue type</h3><div class="mt16">${barChart([42,18,26,22,14,20,12,8],['Bin','Dump','Uncol','Road','Const','Plastic','Drain','Other'],{h:190})}</div></div>
    <div class="chart-card"><h3 style="font-size:18px">Response time distribution (hrs)</h3><div class="mt16">${barChart([8,14,22,18,12,7,4],['<6','6-12','12-24','24-36','36-48','48-72','>72'],{h:190})}</div></div>
    <div class="chart-card"><h3 style="font-size:18px">Load heatmap · team × day</h3><div class="mt16" style="overflow:auto">${heatmap(5,7)}</div></div>
  </div>`;
}
function officerViewHotspots(){ return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${HOTSPOTS.concat([{loc:'Green Park Ave',ward:'Ward 3',count:14,trend:'+9%',issue:'Plastic waste',cause:'Low bin coverage',action:'Install 4 public bins'},{loc:'New Colony',ward:'Ward 9',count:11,trend:'-3%',issue:'Construction waste',cause:'Ongoing site work',action:'Coordinate with contractor'}]).map(h=>`<div class="card"><div class="between"><b style="font-size:17px">${h.loc}</b><span class="pill ${h.trend.startsWith('+')?'red':'green'}">${h.trend}</span></div><div class="hint mt8">${h.ward} · ${h.count} complaints</div><hr style="border:none;border-top:1px solid var(--line);margin:14px 0"><div style="font-size:13.5px"><span class="muted">Main issue</span><br><b>${h.issue}</b></div><div style="font-size:13.5px;margin-top:10px"><span class="muted">Recommended</span><br><b style="color:var(--gold-deep)">${h.action}</b></div><span class="pill gold mt16">AI Insight</span></div>`).join('')}</div>`; }
function officerTeams(){ return `<div class="tablewrap"><table><thead><tr><th>Team</th><th>Zone</th><th>Members</th><th>Active tasks</th><th>Avg response</th><th>Resolution rate</th><th>Status</th></tr></thead><tbody>
  ${[['Team Alpha','Central',8,6,'18.2 hrs','95%'],['Team Bravo','South',6,9,'26.4 hrs','88%'],['Team Charlie','East',7,4,'24.1 hrs','90%'],['Team Delta','West',5,3,'15.0 hrs','97%'],['Team Echo','North',6,5,'20.6 hrs','92%']].map(t=>`<tr><td><b>${t[0]}</b></td><td>${t[1]}</td><td>${t[2]}</td><td>${t[3]}</td><td>${t[4]}</td><td>${t[5]}</td><td><span class="pill green">● Active</span></td></tr>`).join('')}</tbody></table></div>`; }
function officerAssignments(){ return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${state.reports.filter(r=>r.status!=='resolved').map(r=>`<div class="card"><div class="between"><b>${r.id}</b>${prioPill(r.prio)}</div><p class="muted mt8" style="font-size:14px">${esc(r.issue)} · ${esc(r.loc)}</p><hr style="border:none;border-top:1px solid var(--line);margin:14px 0"><div class="field"><label>Assign team</label><select><option>Team Alpha</option><option>Team Bravo</option><option>Team Charlie</option><option>Team Delta</option></select></div><button class="btn btn-gold btn-sm btn-block" data-act="toast" data-msg="Assigned (demo) — deadline set to +48 hrs">Assign &amp; set deadline</button></div>`).join('')}</div>`; }
function officerReports(){ return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${[['Monthly resolution report','PDF · all wards'],['Overdue cases audit','CSV · compliance'],['Hotspot analysis','PDF · AI insights'],['Team performance','XLSX · quarterly'],['Public transparency extract','PDF · aggregated only'],['Audit trail export','CSV · privileged actions']].map(([t,d])=>`<div class="card"><div class="row gap10">${icon('track')}<b>${t}</b></div><p class="muted mt8" style="font-size:14px">${d}</p><button class="btn btn-ghost btn-sm mt16" data-act="toast" data-msg="Report generated (demo)">Generate</button></div>`).join('')}</div>`; }
function officerSettings(){ return `<div class="grid" style="grid-template-columns:1fr 1fr">
  <div class="card"><h3 style="font-size:18px">Jurisdiction</h3><div class="field mt16"><label>Zone</label><select><option>Central Zone</option><option>South Zone</option><option>East Zone</option></select></div><div class="field"><label>Wards in scope</label><input value="Ward 14, Ward 15"></div></div>
  <div class="card"><h3 style="font-size:18px">Security &amp; audit</h3><div class="col gap10 mt16" style="font-size:14px">
    <div class="between"><span>Two-factor authentication</span><span class="pill green">On</span></div>
    <div class="between"><span>Session expiry</span><b>30 min</b></div>
    <div class="between"><span>Audit logging</span><span class="pill green">On</span></div>
    <div class="between"><span>Login rate limiting</span><span class="pill green">On</span></div>
    <div class="between"><span>Upload validation</span><span class="pill green">On</span></div></div>
    <p class="hint mt16">${icon('shield')} Every privileged action is recorded with actor, action and timestamp. Municipal staff cannot silently rewrite complaint history.</p></div>
  </div>`;
}

/* ---------------- WORKER ---------------- */
function viewWorker(){
  const tasks=[
    ['Overflowing Garbage Bin','Market Road, Ward 14','High','1.2 km','Today 18:00','bin'],
    ['Illegal Dumping','Riverside Lane, Ward 7','High','3.4 km','Today 20:00','dump'],
    ['Uncollected Waste','Station Road, Ward 5','Medium','2.1 km','Tomorrow 12:00','basket'],
    ['Plastic Waste','Green Park Ave, Ward 3','Low','4.0 km','Tomorrow 17:00','bottle']
  ];
  return `<div class="wrap" style="padding-top:30px;max-width:760px">
    <span class="kicker">Field worker</span><h1 class="mt8" style="font-size:30px">Today's Tasks</h1>
    <p class="muted mt8">Keep it simple — navigate, clean, upload evidence, done.</p>
    <div class="kpis mt24"><div class="kpi accent"><div class="k-lbl">Assigned</div><div class="k-val">4</div></div><div class="kpi"><div class="k-lbl">Completed</div><div class="k-val">11</div></div><div class="kpi"><div class="k-lbl">On-time rate</div><div class="k-val">96%</div></div></div>
    <div class="col gap16 mt24">${tasks.map(t=>`<div class="card">
      <div class="between"><div class="row gap14"><div style="color:var(--gold-deep)">${ic(t[5],28)}</div><div><b style="font-size:17px">${t[0]}</b><div class="hint mt8">${inl('pin')} ${t[1]}</div></div></div>${prioPill(t[2].toLowerCase())}</div>
      <div class="row gap24 mt16" style="font-size:13.5px;color:var(--muted)"><span>${inl('road')} ${t[3]}</span><span>${inl('clock')} ${t[4]}</span></div>
      <div class="row gap10 mt16" style="flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Opening navigation…">Navigate</button><button class="btn btn-gold btn-sm" data-act="toast" data-msg="Cleanup started — status updated">Start Cleanup</button><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Evidence upload opened">Upload Evidence</button><button class="btn btn-dark btn-sm" data-act="toast" data-msg="Task completed — sent for verification">Complete Task</button></div>
    </div>`).join('')}</div>
  </div>`;
}

/* ---------------- PROFILE ---------------- */
function viewProfile(){
  return `<div class="wrap" style="padding-top:34px;max-width:920px">
    <span class="kicker">Profile</span><h1 class="mt8" style="font-size:30px">${esc(state.user.name)}</h1>
    <div class="grid mt24" style="grid-template-columns:auto 1fr">
      <div class="card pad-lg center" style="min-width:220px"><div style="width:88px;height:88px;border-radius:50%;background:var(--grad-gold);display:grid;place-items:center;margin:0 auto;font-size:34px;color:#3B2F07;font-weight:800">${state.user.initials}</div>
        <h3 class="mt16" style="font-size:19px">${esc(state.user.name)}</h3><p class="muted" style="font-size:14px">Ward 14 · Central Zone</p>
        <span class="pill gold mt16">Verified citizen</span></div>
      <div class="col gap16">
        <div class="kpis"><div class="kpi accent"><div class="k-lbl">Reports submitted</div><div class="k-val">27</div></div><div class="kpi"><div class="k-lbl">Reports resolved</div><div class="k-val">24</div></div><div class="kpi"><div class="k-lbl">Impact score</div><div class="k-val">86</div></div></div>
        <div class="card" style="background:linear-gradient(160deg,#FFFDF6,#FBF4E0);border-color:var(--gold-3)"><span class="kicker">Civic Impact</span><h3 class="mt8" style="font-size:20px">You've helped flag 27 issues in your community.</h3><p class="muted mt8" style="font-size:14px">Your verifications have closed 24 cases and contributed to a cleaner Ward 14.</p></div>
      </div>
    </div>
    <div class="card mt24"><h3 style="font-size:18px">Verification history</h3><div class="tablewrap mt16" style="border:none"><table><thead><tr><th>Complaint</th><th>Issue</th><th>Your verification</th><th>Date</th></tr></thead><tbody>
      ${[['CCT-2026-10461','Plastic Waste','Resolved','28 Sep'],['CCT-2026-10440','Roadside Waste','Resolved','19 Sep'],['CCT-2026-10412','Overflowing Bin','Reopened → Resolved','05 Sep'],['CCT-2026-10388','Uncollected Waste','Resolved','28 Aug']].map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td><span class="pill ${r[2].startsWith('Reopened')?'orange':'green'}">${r[2]}</span></td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div></div>
  </div>`;
}

/* ---------------- ENGINE: layer, toast, router, events ---------------- */
function openLayer(html){ $('#layer').innerHTML=`<div class="overlay" data-act="closelayer-bg">${html}</div>`; }
function closeLayer(){ $('#layer').innerHTML=''; }
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.innerHTML=`<span class="dot"></span>${esc(msg)}`; $('#layer').appendChild(t); setTimeout(()=>t.remove(),2600); }
function notifDrawer(){
  openLayer(`<div class="overlay" data-act="closelayer-bg" style="align-items:stretch;justify-content:flex-end;padding:0"><div class="drawer" onclick="event.stopPropagation()">
    <div class="between"><h2 style="font-size:22px">Notifications</h2><button class="icon-btn" data-act="closelayer">✕</button></div>
    <p class="hint mt8">Updates on your reports and your area.</p>
    <div class="mt24">${state.notif.map(n=>`<div class="notif"><div class="ic">${ic(n.ic,18)}</div><div><b style="font-size:14.5px">${n.t}</b><div class="hint mt8">${n.m} · ${n.time}</div></div></div>`).join('')}</div>
  </div></div>`);
}
function caseModal(id){
  const r=ALL_REPORTS.find(x=>x.id===id)||state.reports.find(x=>x.id===id)||state.reports[0];
  openLayer(`<div class="modal" style="max-width:720px" onclick="event.stopPropagation()">
    <div class="between"><div class="row gap10"><h2 style="font-size:22px">${r.id}</h2>${statusPill(r.status)}</div><button class="icon-btn" data-act="closelayer">✕</button></div>
    <p class="muted mt8">${esc(r.issue)} · ${inl('pin')} ${esc(r.loc)}</p>
    <div class="grid mt24" style="grid-template-columns:1fr 1fr;gap:12px;font-size:14px">
      <div class="card" style="padding:14px 16px"><span class="muted">Priority</span><br>${prioPill(r.prio)}</div>
      <div class="card" style="padding:14px 16px"><span class="muted">Team</span><br><b>${r.team}</b></div>
      <div class="card" style="padding:14px 16px"><span class="muted">Department</span><br><b>${r.dept}</b></div>
      <div class="card" style="padding:14px 16px"><span class="muted">Reported</span><br><b>${r.date}</b></div>
    </div>
    <div class="field mt16"><label>Officer note (logged to audit trail)</label><textarea rows="3" placeholder="Add a note — recorded with your identity and timestamp."></textarea></div>
    <div class="row gap10" style="flex-wrap:wrap"><button class="btn btn-gold btn-sm" data-act="toast" data-msg="Status updated & logged to audit trail">Update status</button><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Team assigned">Assign team</button><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Evidence review opened">Review evidence</button><button class="btn btn-dark btn-sm" data-act="closelayer">Close</button></div>
    <p class="hint mt16">${icon('shield')} Changes here create an immutable audit entry (who → what → when) and cannot be silently rewritten.</p>
  </div>`);
}
function pinModal(){ openLayer(`<div class="modal" style="max-width:420px" onclick="event.stopPropagation()"><div class="between"><h3 style="font-size:20px">Hotspot details</h3><button class="icon-btn" data-act="closelayer">✕</button></div><p class="muted mt16">Approximate location · Ward 14</p><div class="col gap10 mt16" style="font-size:14px"><div class="between"><span class="muted">Open reports</span><b>6</b></div><div class="between"><span class="muted">Resolved (30d)</span><b>19</b></div><div class="between"><span class="muted">Avg response</span><b>16.2 hrs</b></div></div><span class="pill gold mt16">AI Insight: recurring overflow</span></div>`); }

/* router */
function route(){
  const h=(location.hash||'#/home').replace('#/','').split('/')[0]||'home';
  state.route=h; return h;
}
function viewFor(h){
  switch(h){
    case 'home': return viewHome();
    case 'signin': return viewSignin();
    case 'citizen': return state.role?viewCitizen():viewSignin();
    case 'report': return viewReport();
    case 'track': return viewTrack();
    case 'dashboard': return viewDashboard();
    case 'insights': return viewInsights();
    case 'about': return viewAbout();
    case 'officer': return state.role==='officer'||state.role==='admin'?viewOfficer():viewSignin();
    case 'worker': return state.role==='worker'?viewWorker():viewSignin();
    case 'profile': return state.role?viewProfile():viewSignin();
    default: return viewHome();
  }
}
function render(){
  const h=route();
  $('#topnav').innerHTML=navHTML();
  $('#app').innerHTML=viewFor(h);
  $('#bottomnav').innerHTML=bottomNavHTML();
  window.scrollTo({top:0,behavior:'instant'});
  animateCounters();
}
function animateCounters(){
  $$('[data-count]').forEach(el=>{
    const target=el.getAttribute('data-count'); const num=parseFloat(target.replace(/[^\d.]/g,''));
    if(isNaN(num)) return; const suffix=target.replace(/[\d.,]/g,''); const dec=(target.split('.')[1]||'').replace(/[^\d]/g,'').length;
    let cur=0; const t0=performance.now();
    const step=ts=>{ const p=Math.min((ts-t0)/1100,1); cur=num*(1-Math.pow(1-p,3)); el.textContent=cur.toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec})+suffix; if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* events (delegated) */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const a=t.getAttribute('data-act');
  if(a==='notif'){ notifDrawer(); }
  else if(a==='pickrole'){ state.role=t.getAttribute('data-role'); $$('.role').forEach(r=>r.classList.toggle('sel',r===t)); }
  else if(a==='signin'){ doSignin(); }
  else if(a==='setloc'){ state.wizard.data.loc=t.getAttribute('data-v'); render(); }
  else if(a==='setissue'){ state.wizard.data.issue=t.getAttribute('data-v'); render(); }
  else if(a==='addphoto'){ state.wizard.data.photos=Math.min(3,(state.wizard.data.photos||0)+1); render(); }
  else if(a==='wiznext'){ state.wizard.step=Math.min(5,state.wizard.step+1); render(); }
  else if(a==='wizback'){ state.wizard.step=Math.max(1,state.wizard.step-1); render(); }
  else if(a==='submit'){ submitReport(); }
  else if(a==='tracknew'){ closeLayer(); state.selReport=t.getAttribute('data-id'); go('track'); }
  else if(a==='openreport'){ state.selReport=t.getAttribute('data-id'); go('track'); }
  else if(a==='backtrack'){ state.selReport=null; render(); }
  else if(a==='verifyyes'){ verifyAction(t.getAttribute('data-id'),true); }
  else if(a==='verifyno'){ verifyAction(t.getAttribute('data-id'),false); }
  else if(a==='otab'){ state.officerTab=t.getAttribute('data-tab'); render(); }
  else if(a==='caseopen'){ caseModal(t.getAttribute('data-id')); }
  else if(a==='pin'){ pinModal(); }
  else if(a==='toast'){ toast(t.getAttribute('data-msg')); }
  else if(a==='rolemenu'){ go('signin'); }
  else if(a==='closelayer'){ closeLayer(); }
  else if(a==='closelayer-bg'){ if(e.target===t) closeLayer(); }
});
document.addEventListener('input',e=>{ if(e.target.getAttribute&&e.target.getAttribute('data-act')==='desc'){ state.wizard.data.desc=e.target.value; } });

/* before/after slider drag */
document.addEventListener('pointerdown',e=>{
  const ba=e.target.closest('.ba'); if(!ba) return; ba.setPointerCapture(e.pointerId); ba.dataset.drag='1'; moveBA(ba,e);
});
document.addEventListener('pointermove',e=>{ const ba=e.target.closest('.ba')||document.querySelector('.ba[data-drag="1"]'); if(ba&&ba.dataset.drag) moveBA(ba,e); });
document.addEventListener('pointerup',e=>{ const ba=document.querySelector('.ba[data-drag="1"]'); if(ba){ ba.dataset.drag=''; } });
function moveBA(ba,e){
  const rect=ba.getBoundingClientRect(); let x=((e.clientX-rect.left)/rect.width)*100; x=Math.max(2,Math.min(98,x));
  const al=ba.querySelector('.after-layer'); const hd=ba.querySelector('.handle');
  if(al) al.style.clipPath=`inset(0 0 0 ${x}%)`; if(hd) hd.style.left=x+'%';
}

window.addEventListener('hashchange',render);
/* shareable role links: ?role=citizen|officer|worker|admin */
try{ const qp=new URLSearchParams(location.search); const r=qp.get('role'); if(r&&ROLE_LABEL[r]){ state.role=r; } const rep=qp.get('report'); if(rep){ state.selReport=rep; } }catch(e){}
render();
