/* ============ CleanCity Tracker — citizen home, report wizard, tracking ============ */
function statusPill(s){ const st=STATUS[s]; return `<span class="pill ${st.cls}">${st.ic} ${st.label}</span>`; }
function prioPill(p){ const x=PRIORITY[p]; return `<span class="pill ${x.cls}">${x.label}</span>`; }

/* ---------------- CITIZEN HOME ---------------- */
function viewCitizen(){
  const my = state.reports;
  const open = my.filter(r=>r.status!=='resolved').length;
  const done = my.filter(r=>r.status==='resolved').length;
  return `
  <div class="wrap" style="padding-top:34px">
    <div class="between" style="flex-wrap:wrap;gap:16px">
      <div><h1 style="font-size:32px">Good afternoon, ${esc(state.user.name)} 👋</h1><p class="muted mt8" style="font-size:17px">Let's keep your city cleaner.</p></div>
      <a href="#/report" class="btn btn-gold">${icon('report')} Report a Waste Issue</a>
    </div>

    <div class="card pad-lg mt24" style="background:linear-gradient(150deg,#FFFDF6,#FBF3DE);border-color:var(--gold-3);display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center">
      <div><span class="kicker">See something that needs attention?</span>
        <h2 class="mt8" style="font-size:30px">Report a Waste Issue</h2>
        <p class="muted mt8" style="max-width:520px">Snap a photo, confirm the location, pick the type — done in under 30 seconds. You'll get a public ID to track every step.</p>
        <a href="#/report" class="btn btn-gold mt16">Report Now ${icon('arrow')}</a>
      </div>
      <div style="color:var(--gold-deep);filter:drop-shadow(0 10px 20px rgba(198,160,46,.3))">${ic('camera',92,1.5)}</div>
    </div>

    <div class="kpis mt24">
      <div class="kpi accent"><div class="k-lbl">Open reports</div><div class="k-val">${open}</div><div class="k-sub">Being tracked now</div></div>
      <div class="kpi"><div class="k-lbl">Resolved</div><div class="k-val">${done}</div><div class="k-sub">Verified cleanups</div></div>
      <div class="kpi"><div class="k-lbl">Civic Impact</div><div class="k-val">27</div><div class="k-sub">Issues flagged in your community</div></div>
      <div class="kpi"><div class="k-lbl">Your area</div><div class="k-val" style="font-size:24px">Ward 14</div><div class="k-sub">Cleanliness score 78/100</div></div>
    </div>

    <div class="between mt40" style="margin-bottom:16px"><h2 style="font-size:24px">My Reports</h2><a href="#/track" class="btn btn-ghost btn-sm">View all</a></div>
    <div class="col gap14">
      ${my.slice(0,5).map(r=>`
        <div class="report-item" data-act="openreport" data-id="${r.id}">
          <div class="thumb">${issueIconByName(r.issue,24)}</div>
          <div>
            <div class="rid">${r.id} <span class="faint" style="font-weight:400">· ${esc(r.issue)}</span></div>
            <div class="rmeta">${inl('pin')} ${esc(r.loc)} &nbsp;·&nbsp; Reported ${r.date}</div>
            <div class="progress"><i style="width:${r.progress}%"></i></div>
          </div>
          <div class="col gap6" style="align-items:flex-end">${statusPill(r.status)}${prioPill(r.prio)}</div>
        </div>`).join('')}
    </div>

    <div class="grid mt40" style="grid-template-columns:1.4fr 1fr">
      <div class="chart-card"><div class="between"><h3 style="font-size:18px">Your area · complaints trend</h3><span class="pill neutral">Ward 14 · 30 days</span></div><div class="mt16">${areaChart([6,9,8,12,11,15,13,18,16,21,19,24])}</div></div>
      <div class="chart-card"><h3 style="font-size:18px">Status breakdown</h3><div class="donut-wrap mt16" style="justify-content:center">${donut([{v:2,c:'#C07716'},{v:1,c:'#C6A02E'},{v:2,c:'#2E7D5B'},{v:1,c:'#B23A32'}])}
        <div class="legend col gap6"><span><i class="sw" style="background:#C07716"></i>In Progress</span><span><i class="sw" style="background:#C6A02E"></i>Under Review</span><span><i class="sw" style="background:#2E7D5B"></i>Resolved</span><span><i class="sw" style="background:#B23A32"></i>Overdue</span></div></div></div>
    </div>
  </div>`;
}

/* ---------------- REPORT WIZARD ---------------- */
const WSTEPS=['Location','Issue','Photo','Details','Confirm'];
function viewReport(){
  const w=state.wizard, d=w.data;
  const stepper = WSTEPS.map((s,i)=>`<div class="wstep ${w.step===i+1?'active':''} ${w.step>i+1?'done':''}"><span class="n">${w.step>i+1?'✓':i+1}</span>${s}</div>`).join('');
  let body='';
  if(w.step===1){
    body=`<h2 style="font-size:26px">Where is the problem?</h2><p class="muted mt8">We only use your location to route the issue to the right team.</p>
    <div class="opt-grid mt24">
      <button class="opt ${d.loc==='Current location'?'sel':''}" data-act="setloc" data-v="Current location"><span class="em">${ic('pin')}</span><span class="tt">Use Current Location</span></button>
      <button class="opt ${d.loc==='Selected on map'?'sel':''}" data-act="setloc" data-v="Selected on map"><span class="em">${ic('map')}</span><span class="tt">Select on Map</span></button>
      <button class="opt ${d.loc==='Address entered'?'sel':''}" data-act="setloc" data-v="Address entered"><span class="em">${ic('keyboard')}</span><span class="tt">Enter Address</span></button>
    </div>
    ${d.loc?`<div class="field mt24"><label>Confirm location</label><input value="Market Road, Ward 14, near the vegetable market"><span class="hint">Approximate marker will be shown publicly — never your exact address.</span></div>`:''}`;
  }
  if(w.step===2){
    body=`<h2 style="font-size:26px">What did you find?</h2><p class="muted mt8">Pick the closest match — it helps us prioritise.</p>
    <div class="opt-grid mt24">${ISSUE_TYPES.map(t=>`<button class="opt ${d.issue===t.t?'sel':''}" data-act="setissue" data-v="${t.t}"><span class="em">${ic(ISSUE_IC[t.k])}</span><span class="tt">${t.t}</span></button>`).join('')}</div>`;
  }
  if(w.step===3){
    body=`<h2 style="font-size:26px">Show us the problem</h2><p class="muted mt8">A photo helps us act faster.</p>
    <div class="dropzone mt24" data-act="addphoto"><div style="font-size:44px">${icon('camera')}</div><div style="font-weight:600;margin-top:10px">Take a photo or upload</div><div class="hint mt8">Camera · Gallery · Multiple images · JPG/PNG up to 10 MB</div></div>
    ${d.photos?`<div class="row gap14 mt16">${Array.from({length:d.photos},(_,i)=>`<div style="width:88px;height:88px;border-radius:14px;background:linear-gradient(135deg,#FBF4E0,#F1E6C8);color:var(--gold-deep);display:grid;place-items:center">${ic('image',30)}</div>`).join('')}<div class="hint">${d.photos} photo(s) attached</div></div>`:''}
    <p class="hint mt16">${icon('shield')} Photos default to private. Faces and number plates can be blurred before anything becomes public.</p>`;
  }
  if(w.step===4){
    body=`<h2 style="font-size:26px">Anything else? <span class="faint" style="font-family:var(--sans);font-size:15px">(optional)</span></h2>
    <div class="field mt24"><label>Description</label><textarea rows="5" data-act="desc" placeholder="e.g. Bin hasn't been emptied for four days; waste is spilling onto the footpath.">${esc(d.desc)}</textarea><span class="hint">Please avoid including personal information about others.</span></div>`;
  }
  if(w.step===5){
    body=`<div class="center"><h2 style="font-size:26px">Report ready.</h2><p class="muted mt8">Please review before submitting.</p></div>
    <div class="card mt24" style="background:var(--paper-2)">
      <div class="between"><span class="muted">Location</span><b>${esc(d.loc||'Market Road, Ward 14')}</b></div><hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
      <div class="between"><span class="muted">Issue type</span><b>${esc(d.issue||'Overflowing Bin')}</b></div><hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
      <div class="between"><span class="muted">Evidence</span><b>${d.photos||1} photo(s)</b></div><hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
      <div class="between"><span class="muted">Description</span><b style="max-width:60%;text-align:right;font-weight:500">${esc(d.desc||'—')}</b></div>
    </div>`;
  }
  const canNext = (w.step===1&&d.loc)||(w.step===2&&d.issue)||(w.step===3&&d.photos>0)||w.step===4||w.step===5;
  return `<div class="wrap" style="padding-top:34px;max-width:900px">
    <span class="kicker">Report an issue</span><h1 class="mt8" style="font-size:30px">Tell us what you found</h1>
    <div class="wizard-steps mt24">${stepper}</div>
    <div class="card pad-lg">${body}
      <div class="between mt24" style="gap:12px">
        <button class="btn btn-ghost" data-act="wizback" ${w.step===1?'disabled':''}>Back</button>
        ${w.step<5?`<button class="btn btn-gold" data-act="wiznext" ${canNext?'':'disabled'}>Continue ${icon('arrow')}</button>`
          :`<button class="btn btn-gold" data-act="submit">Submit Report ${icon('check')}</button>`}
      </div>
    </div>
    <p class="hint center mt16">Target: a citizen can complete a report in under 30 seconds.</p>
  </div>`;
}
function submitReport(){
  const id='CCT-2026-'+(10483+Math.floor(Math.random()*90));
  const d=state.wizard.data;
  const rec={id, issue:d.issue||'Overflowing Bin', em:(ISSUE_TYPES.find(t=>t.t===(d.issue||'Overflowing Bin'))||{em:'🗑️'}).em, loc:d.loc==='Current location'?'Market Road, Ward 14':(d.loc||'Market Road, Ward 14'), ward:'Ward 14', status:'review', prio:'medium', date:'2026-10-07', progress:12, team:'—', dept:'Solid Waste Mgmt', citizen:'You'};
  state.reports.unshift(rec); state.lastSubmitted=rec; state.wizard={step:1,data:{loc:'',issue:'',photos:0,desc:''}};
  successModal(id);
}
function successModal(id){
  openLayer(`<div class="modal" style="text-align:center;max-width:520px">
    <div class="success-ring"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#3B2F07" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
    <h2 class="mt24" style="font-size:28px">Report submitted</h2>
    <p class="muted mt8">Thank you — your report is now in the system and being verified.</p>
    <div class="card mt24" style="background:var(--paper-2)"><div class="k-lbl muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.06em">Your complaint ID</div>
      <div style="font-family:var(--display);font-size:28px;font-weight:800;color:var(--char);margin-top:6px">${id}</div>
      <p class="hint mt8">Keep this ID to track progress. You'll get a notification at every stage.</p></div>
    <div class="row gap10 mt24" style="justify-content:center"><button class="btn btn-gold" data-act="tracknew" data-id="${id}">Track this report</button><button class="btn btn-ghost" data-act="closelayer">Done</button></div>
  </div>`);
}

/* ---------------- TRACK REPORT ---------------- */
const TIMELINE=[
  ['Reported','Citizen submitted report with photo & location'],
  ['Verified','AI pre-check + officer confirmation (human decision)'],
  ['Assigned','Routed to the correct municipal team with a deadline'],
  ['Cleanup in Progress','Field team on site'],
  ['Cleanup Completed','Evidence uploaded by the field team'],
  ['Citizen Verification','You confirm whether the problem is solved'],
  ['Closed','Case closed and archived in the public record']
];
function viewTrack(){
  if(state.selReport){ const r=state.reports.find(x=>x.id===state.selReport)||REPORTS.find(x=>x.id===state.selReport)||state.reports[0]; return trackDetail(r); }
  return `<div class="wrap" style="padding-top:34px">
    <span class="kicker">Track report</span><h1 class="mt8" style="font-size:30px">Every step, in the open</h1>
    <p class="muted mt8">Select a report to see its live timeline and verify the cleanup.</p>
    <div class="toolbar mt24"><input placeholder="Search by complaint ID or location" oninput="filterTrack(this.value)" style="min-width:320px"><select><option>All statuses</option>${Object.values(STATUS).map(s=>`<option>${s.label}</option>`).join('')}</select><select><option>All wards</option>${WARDS.map(w=>`<option>${w}</option>`).join('')}</select></div>
    <div class="col gap14" id="tracklist">
      ${state.reports.map(r=>`
        <div class="report-item" data-act="openreport" data-id="${r.id}">
          <div class="thumb">${issueIconByName(r.issue,24)}</div>
          <div><div class="rid">${r.id} <span class="faint" style="font-weight:400">· ${esc(r.issue)}</span></div>
            <div class="rmeta">${inl('pin')} ${esc(r.loc)} &nbsp;·&nbsp; ${r.ward} &nbsp;·&nbsp; Reported ${r.date}</div>
            <div class="progress"><i style="width:${r.progress}%"></i></div></div>
          <div class="col gap6" style="align-items:flex-end">${statusPill(r.status)}<span class="hint">${r.team!=='—'?'👷 '+r.team:''}</span></div>
        </div>`).join('')}
    </div>
  </div>`;
}
function filterTrack(q){
  q=q.toLowerCase();
  $$('#tracklist .report-item').forEach(el=>{ el.style.display = el.textContent.toLowerCase().includes(q)?'':'none'; });
}
function trackDetail(r){
  // stage index from progress
  const idx = r.progress>=100?6 : r.progress>=75?5 : r.progress>=55?3 : r.progress>=35?2 : r.progress>=18?1 : 0;
  const tl = TIMELINE.map(([t,m],i)=>`
    <div class="tl-item ${i<idx?'done':''} ${i===idx?'current':''}">
      <div class="node">${i<idx?'✓':i+1}</div>
      <div class="tl-t">${t}</div><div class="tl-m">${m}</div>
      ${i<=idx?`<div class="tl-card">${i===0?`Submitted by citizen · ${r.date} 10:24 · Location captured`:
        i===1?`Verified by officer R. Menon · AI flagged no duplicate · Human confirmed`:
        i===2?`Assigned to <b>${r.team!=='—'?r.team:'Team Alpha'}</b> · Dept: ${r.dept} · Deadline in 48 hrs`:
        i===3?`Field team on site · ETA 40 min`:
        i===4?`Cleanup completed · Evidence uploaded · 05 Oct 16:10`:
        i===5?`Awaiting your confirmation`:'Case closed and archived'}</div>`:''}
    </div>`).join('');
  return `<div class="wrap" style="padding-top:34px;max-width:1000px">
    <button class="btn btn-ghost btn-sm" data-act="backtrack">← All reports</button>
    <div class="between mt16" style="flex-wrap:wrap;gap:14px">
      <div><div class="row gap10" style="align-items:center"><h1 style="font-size:28px">${r.id}</h1>${statusPill(r.status)}</div>
        <p class="muted mt8">${esc(r.issue)} · ${inl('pin')} ${esc(r.loc)} · ${r.ward}</p></div>
      <div class="row gap10">${prioPill(r.prio)}<span class="pill neutral">${r.team!=='—'?'👷 '+r.team:'Unassigned'}</span></div>
    </div>
    <div class="grid mt24" style="grid-template-columns:1.1fr 1fr">
      <div class="card"><h3 style="font-size:19px;margin-bottom:20px">Timeline</h3><div class="timeline">${tl}</div></div>
      <div class="col gap18">
        ${r.progress>=75?`<div class="card pad-lg">
          <span class="kicker">Before / After verification</span>
          <h3 style="font-size:20px;margin:8px 0 16px">Drag to compare</h3>
          <div class="ba" data-act="ba" style="height:260px">
            <div class="layer">${beforeSVG()}</div>
            <div class="layer after-layer" id="afterlayer">${afterSVG()}</div>
            <span class="tag l">Before</span><span class="tag r">After</span>
            <div class="handle" id="bhandle"></div>
          </div>
          <div class="grid mt16" style="grid-template-columns:1fr 1fr;gap:10px;font-size:13.5px">
            <div><span class="muted">Completed</span><br><b>05 Oct 2026 · 16:10</b></div>
            <div><span class="muted">Team</span><br><b>${r.team!=='—'?r.team:'Team Alpha'}</b></div>
            <div><span class="muted">Location</span><br><b>${esc(r.loc)}</b></div>
            <div><span class="muted">Evidence</span><br><b>2 photos · verified</b></div>
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
function verifyAction(id,yes){
  const r=state.reports.find(x=>x.id===id);
  if(yes){ if(r){r.status='resolved';r.progress=100;} toast('Thank you — case marked resolved and closed.'); }
  else { if(r){r.status='reopened';r.progress=45;} toast('Report reopened — please upload additional evidence.'); }
  render();
}
