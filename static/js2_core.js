/* ============ CleanCity Tracker — core: state, router, nav, landing, auth ============ */
const state = {
  role: null,              // null | 'citizen' | 'officer' | 'worker' | 'admin'
  route: 'home',
  user: {name:'Selva', initials:'S'},
  notif: NOTIFS.map(n=>({...n})),
  reports: REPORTS.map(r=>({...r})),
  wizard: {step:1, data:{loc:'', issue:'', photos:0, desc:''}},
  lastSubmitted: null,
  selReport: null
};

const ROLE_LABEL = {citizen:'Citizen', officer:'Municipal Officer', worker:'Field Worker', admin:'Administrator'};
const NAV_PUBLIC = [
  ['home','Home'], ['report','Report Issue'], ['track','Track Report'],
  ['dashboard','City Dashboard'], ['insights','Insights'], ['about','About']
];

function go(route){ location.hash = '#/'+route; }
function navHTML(){
  const links = NAV_PUBLIC.map(([r,l])=>`<a href="#/${r}" class="${state.route===r?'active':''}">${l}</a>`).join('');
  const roleChip = state.role
    ? `<button class="pill gold" data-act="rolemenu">${ROLE_LABEL[state.role]}</button>`
    : `<a href="#/signin" class="btn btn-ghost btn-sm">Sign In</a>`;
  return `<div class="topnav"><div class="inner">
    <a href="#/home" class="logo"><span class="mark">CC</span>CleanCity Tracker</a>
    <nav class="navlinks">${links}</nav>
    <div class="nav-right">
      <button class="icon-btn" data-act="notif" aria-label="Notifications">${icon('bell')}<span class="dot-badge"></span></button>
      ${roleChip}
      <a href="#/report" class="btn btn-gold btn-sm">Report Issue</a>
    </div>
  </div></div>`;
}
function bottomNavHTML(){
  if(!state.role) return '';
  const items = state.role==='worker'
    ? [['worker','Tasks','assign'],['profile','Profile','user'],['dashboard','Dashboard','dash'],['about','About','insight']]
    : [['citizen','Home','home'],['report','Reports','report'],['dashboard','Dashboard','dash'],['profile','Profile','user']];
  return `<div class="bottomnav">${items.map(([r,l,ic])=>`<a href="#/${r}" class="${state.route===r?'active':''}"><span class="ic">${icon(ic)}</span>${l}</a>`).join('')}</div>`;
}

/* ---------------- LANDING ---------------- */
function viewHome(){
  const stats=[['12,482','Reports Resolved'],['94.6%','Resolution Rate'],['18.4 hrs','Average Response'],['86/100','City Cleanliness Score']];
  const features=[
    ['pin','Report in seconds','Drop a pin, pick the issue, add a photo. Under 30 seconds — no forms to fight.'],
    ['radar','Track every action','A live timeline shows who is handling your report and exactly where it stands.'],
    ['check','Verify the result','Before-and-after evidence, then you confirm whether the problem is truly solved.'],
    ['analytics','See your city','Public dashboards expose resolution rates, hotspots and a Municipal Transparency Score.']
  ];
  const steps=[['01','Report','Photo, location, issue type — captured automatically.'],['02','Track','A public ID and live status from submission to closure.'],['03','Act','Routed to the right municipal team with a deadline.'],['04','Verify','Before-and-after evidence, confirmed by the citizen.'],['05','Improve','AI hotspots reveal where the city must change for good.']];
  return `
  <section class="hero">
    <div class="hero-bg">${heroMapSVG()}<div class="particles">${Array.from({length:14},(_,i)=>`<span class="particle" style="left:${(i*7+4)%96}%;top:${(i*13+10)%80}%;animation-delay:${(i*.6).toFixed(1)}s"></span>`).join('')}</div></div>
    <div class="wrap">
      <div>
        <span class="eyebrow">✦ Municipal Waste Transparency</span>
        <h1>A cleaner city starts with <em style="font-style:italic;color:var(--gold-deep)">visibility</em>.</h1>
        <p class="lead">Report waste problems, track municipal action, verify results, and see how your city is performing — all in one transparent platform.</p>
        <div class="hero-cta">
          <a href="#/report" class="btn btn-gold">Report an Issue ${icon('arrow')}</a>
          <a href="#/dashboard" class="btn btn-ghost">Explore City Dashboard</a>
        </div>
        <p class="hint mt16">${icon('shield','')} Privacy-first · Your exact location and photos are never published publicly.</p>
      </div>
      <div class="hero-visual">
        <div class="hv-card hv-float1">
          <div class="between"><span class="kicker">Live</span><span class="pill green">● Resolved</span></div>
          <div class="row gap10 mt16" style="align-items:center"><div style="color:var(--gold-deep)">${ic('bin',26)}</div><div><div style="font-weight:700">Overflowing Bin</div><div class="hint">Market Road · Ward 14</div></div></div>
          <div class="spark">${[40,62,48,80,58,90,70].map(h=>`<i style="height:${h}%"></i>`).join('')}</div>
        </div>
        <div class="hv-card hv-float2">
          <div class="between"><span class="kicker">Transparency</span><b style="font-family:var(--display);font-size:22px">91<span style="color:var(--faint);font-size:13px">/100</span></b></div>
          <div class="mt16">${areaChart([8,12,10,16,14,20,18,24,22,28,26,32],{w:260,h:90})}</div>
          <div class="hint mt8">Ward 14 complaint trend · 30 days</div>
        </div>
      </div>
    </div>
  </section>
  <div class="wrap">
    <div class="statband">${stats.map(([n,l])=>`<div class="stat"><div class="num" data-count="${n}">0</div><div class="lbl">${l}</div></div>`).join('')}</div>

    <section class="mt40">
      <div class="sec-head center" style="max-width:640px;margin:64px auto 30px"><span class="kicker">Why it matters</span><h2 class="mt8">Accountability, by default</h2><p>Cities lose trust when complaints vanish into a void. CleanCity Tracker makes every report visible, every action traceable, and every result verifiable.</p></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        ${features.map(([em,t,d])=>`<div class="card"><div style="color:var(--gold-deep)">${ic(em,26)}</div><h3 class="mt8" style="font-size:19px">${t}</h3><p class="muted mt8" style="font-size:14.5px">${d}</p></div>`).join('')}
      </div>
    </section>

    <section class="mt40">
      <div class="card pad-lg" style="background:linear-gradient(160deg,#FFFDF6,#FBF4E0);border-color:var(--gold-3)">
        <div class="sec-head"><span class="kicker">The flow</span><h2 class="mt8">Report → Track → Act → Verify → Improve</h2></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
          ${steps.map(([n,t,d])=>`<div><div class="kicker" style="color:var(--gold)">${n}</div><h3 style="font-size:18px;margin-top:8px">${t}</h3><p class="muted" style="font-size:14px;margin-top:6px">${d}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="mt40 center" style="padding:30px 0">
      <h2>“Don't just report the problem. Track the action. Verify the result.”</h2>
      <div class="hero-cta" style="justify-content:center"><a href="#/signin" class="btn btn-gold">Get started</a><a href="#/dashboard" class="btn btn-ghost">View transparency data</a></div>
    </section>
  </div>
  ${footer()}`;
}
function heroMapSVG(){
  const pins=[[18,30,'gold'],[34,62,'green'],[52,26,'orange'],[66,58,'gold'],[78,34,'green'],[44,74,'red'],[24,78,'gold'],[86,66,'orange']];
  return `<svg viewBox="0 0 600 600" width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="hg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#C6A02E" stop-opacity=".22"/><stop offset="1" stop-color="#C6A02E" stop-opacity="0"/></radialGradient></defs>
    <circle cx="300" cy="300" r="260" fill="url(#hg)"/>
    ${[60,120,180,240].map(r=>`<circle cx="300" cy="300" r="${r}" fill="none" stroke="#C6A02E" stroke-opacity=".18" stroke-width="1"/>`).join('')}
    <g stroke="#C6A02E" stroke-opacity=".22" stroke-width="1.4">${Array.from({length:9},(_,i)=>`<line x1="300" y1="300" x2="${300+250*Math.cos(i/9*6.28)}" y2="${300+250*Math.sin(i/9*6.28)}"/>`).join('')}</g>
    ${pins.map(([x,y,c])=>`<circle cx="${x*6}" cy="${y*6}" r="7" fill="${c==='gold'?'#C6A02E':c==='green'?'#2E7D5B':c==='orange'?'#C07716':'#B23A32'}" opacity=".9"/><circle cx="${x*6}" cy="${y*6}" r="14" fill="none" stroke="${c==='gold'?'#C6A02E':c==='green'?'#2E7D5B':c==='orange'?'#C07716':'#B23A32'}" stroke-opacity=".35"/>`).join('')}
  </svg>`;
}
function footer(){
  return `<footer class="foot"><div class="wrap">
    <div class="cols">
      <div><div class="logo" style="margin-bottom:12px"><span class="mark">CC</span>CleanCity Tracker</div><p style="max-width:300px">Cleaner streets. Smarter cities. Total transparency. A municipal waste transparency & accountability platform.</p></div>
      <div><h5>Product</h5><a href="#/report">Report an Issue</a><a href="#/track">Track Report</a><a href="#/dashboard">City Dashboard</a><a href="#/insights">Insights</a></div>
      <div><h5>Roles</h5><a href="#/signin">Citizen</a><a href="#/signin">Municipal Officer</a><a href="#/signin">Field Worker</a><a href="#/signin">Administrator</a></div>
      <div><h5>Trust</h5><a href="#/about">Privacy</a><a href="#/about">Security</a><a href="#/about">Accessibility</a><a href="#/about">About</a></div>
    </div>
    <div class="disclaimer"><span class="ic">${icon('shield')}</span><div><b>Privacy &amp; security.</b> Uploads default to private; public dashboards show aggregated data only. AI features are decision-support and are always labelled — never automated enforcement. This is a demonstration build with simulated authentication and demo data; server-side hardening, encryption and audit infrastructure would be added for production. We do not claim the system is 100% secure.</div></div>
    <div class="between mt24" style="flex-wrap:wrap;gap:10px"><span>© 2026 CleanCity Tracker · Demo build</span><span>Built for civic accountability · “Collect less. Expose less. Trust nothing by default.”</span></div>
  </div></footer>`;
}

/* ---------------- AUTH (demo role switch) ---------------- */
function viewSignin(){
  const roles=[['citizen','user','Citizen','Report, track & verify your issues'],['officer','building','Municipal Officer','Manage complaints & teams'],['worker','broom','Field Worker','See & complete today\'s tasks'],['admin','settings','Administrator','Users, roles & audit logs']];
  return `<div class="authwrap"><div class="authcard card pad-lg">
    <div class="center"><div class="logo" style="justify-content:center"><span class="mark">CC</span>CleanCity Tracker</div>
      <h2 class="mt16" style="font-size:26px">Welcome back</h2><p class="muted mt8">Choose a role to explore the demo. No password needed in this build.</p></div>
    <div class="role-pick mt24">${roles.map(([r,em,t,d])=>`<button class="role ${state.role===r?'sel':''}" data-act="pickrole" data-role="${r}"><div class="em" style="color:var(--gold-deep)">${ic(em,22)}</div><div class="tt">${t}</div><div class="dd">${d}</div></button>`).join('')}</div>
    <div class="field mt24"><label>Email or phone</label><input placeholder="you@city.gov" value="selva@cleancity.app"></div>
    <button class="btn btn-gold btn-block" data-act="signin">Continue ${icon('arrow')}</button>
    <p class="hint center mt16">${icon('shield')} Demo build — authentication is simulated. Production would use hashed credentials, session expiry and rate limiting.</p>
  </div></div>`;
}
function doSignin(){
  state.role = state.role || 'citizen';
  toast('Signed in as '+ROLE_LABEL[state.role]);
  go(state.role==='officer'?'officer':state.role==='worker'?'worker':state.role==='admin'?'officer':'citizen');
}

/* ---------------- ABOUT ---------------- */
function viewAbout(){
  return `<div class="wrap" style="padding-top:44px">
    <span class="kicker">About the platform</span>
    <h1 class="mt8" style="font-size:42px">Built for municipal accountability</h1>
    <p class="lead muted mt16" style="max-width:720px;font-size:18px">CleanCity Tracker turns scattered complaints into a transparent, verifiable record of municipal action. Citizens report; the system tracks and routes; officials act; and results are verified in the open.</p>
    <div class="grid mt40" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <div class="card"><div class="row gap10">${icon('shield')}<h3>Security-first architecture</h3></div><p class="muted mt8" style="font-size:14.5px">Role-based access control, hashed credentials, session expiry, upload validation, and an immutable-style audit trail recording actor, action, timestamp and before/after state for every privileged change.</p></div>
      <div class="card"><div class="row gap10">${icon('radar')}<h3>Privacy by default</h3></div><p class="muted mt8" style="font-size:14.5px">Uploads are private on arrival; public dashboards expose aggregated statistics only — never phone numbers, emails, internal notes or exact addresses. Location is collected only as needed to resolve an issue.</p></div>
      <div class="card"><div class="row gap10">${icon('lightbulb')}<h3>AI as decision-support</h3></div><p class="muted mt8" style="font-size:14.5px">AI surfaces hotspots and patterns, always clearly labelled. It never rejects citizens, bans users, deletes complaints or closes cases — important decisions require authorised human confirmation.</p></div>
      <div class="card"><div class="row gap10">${icon('star')}<h3>Accessible &amp; responsive</h3></div><p class="muted mt8" style="font-size:14.5px">High contrast, large touch targets, keyboard support, screen-reader labels, and status shown by label and icon — never colour alone. Optimised for mobile first, right up to large desktops.</p></div>
    </div>
    <div class="disclaimer mt40"><span class="ic">${icon('alert')}</span><div><b>Scope of this build.</b> This is a high-fidelity demonstration with simulated authentication and realistic demo data. The security controls described here are implemented at the interface level and documented as an architecture; production deployment would add server-side enforcement, encrypted storage, backups and monitoring. We do not claim the system is 100% secure.</div></div>
    ${footer()}
  </div>`;
}
