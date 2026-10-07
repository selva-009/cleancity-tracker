/* ============ CleanCity Tracker — demo data, helpers, charts, illustrations ============ */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => n.toLocaleString('en-IN');
const money0 = n => fmt(n);

/* ---------- status system (never colour alone — always label + icon) ---------- */
const STATUS = {
  review:  {label:'Under Review', cls:'gold',  ic:'◔'},
  progress:{label:'In Progress',  cls:'orange',ic:'◑'},
  resolved:{label:'Resolved',     cls:'green', ic:'●'},
  overdue: {label:'Overdue',      cls:'red',   ic:'▲'},
  reopened:{label:'Reopened',     cls:'red',   ic:'↺'}
};
const PRIORITY = {high:{label:'High',cls:'red'},medium:{label:'Medium',cls:'orange'},low:{label:'Low',cls:'green'}};

const ISSUE_TYPES = [
  {k:'overflow',  em:'🗑️', t:'Overflowing Bin'},
  {k:'dumping',   em:'🚯', t:'Illegal Dumping'},
  {k:'uncollected',em:'🧺',t:'Uncollected Waste'},
  {k:'roadside',  em:'🛣️', t:'Roadside Waste'},
  {k:'construction',em:'🧱',t:'Construction Waste'},
  {k:'plastic',   em:'🧴', t:'Plastic Waste'},
  {k:'drain',     em:'🌊', t:'Drain / Sewage Waste'},
  {k:'other',     em:'📦', t:'Other'}
];

const WARDS = Array.from({length:16},(_,i)=>'Ward '+(i+1));

/* ---------- demo reports ---------- */
const REPORTS = [
  {id:'CCT-2026-10482', issue:'Overflowing Bin', em:'🗑️', loc:'Market Road, Ward 14', ward:'Ward 14', status:'progress', prio:'high', date:'2026-10-03', progress:55, team:'Team Alpha', dept:'Solid Waste Mgmt', citizen:'You'},
  {id:'CCT-2026-10476', issue:'Illegal Dumping', em:'🚯', loc:'Riverside Lane, Ward 07', ward:'Ward 7', status:'review', prio:'high', date:'2026-10-05', progress:20, team:'—', dept:'Enforcement', citizen:'You'},
  {id:'CCT-2026-10461', issue:'Plastic Waste', em:'🧴', loc:'Green Park Ave, Ward 03', ward:'Ward 3', status:'resolved', prio:'low', date:'2026-09-28', progress:100, team:'Team Delta', dept:'Solid Waste Mgmt', citizen:'You'},
  {id:'CCT-2026-10455', issue:'Drain / Sewage Waste', em:'🌊', loc:'Old Mill Street, Ward 11', ward:'Ward 11', status:'overdue', prio:'high', date:'2026-09-22', progress:40, team:'Team Bravo', dept:'Sanitation', citizen:'You'},
  {id:'CCT-2026-10440', issue:'Roadside Waste', em:'🛣️', loc:'Station Road, Ward 05', ward:'Ward 5', status:'resolved', prio:'medium', date:'2026-09-19', progress:100, team:'Team Alpha', dept:'Solid Waste Mgmt', citizen:'You'},
  {id:'CCT-2026-10421', issue:'Construction Waste', em:'🧱', loc:'New Colony, Ward 09', ward:'Ward 9', status:'progress', prio:'medium', date:'2026-10-01', progress:60, team:'Team Charlie', dept:'Enforcement', citizen:'You'}
];

/* ---------- city-wide complaint pool (for dashboards) ---------- */
const ALL_REPORTS = (()=>{
  const base = REPORTS.map(r=>({...r,citizen:r.citizen}));
  const more = [
    ['Overflowing Bin','Ward 14','high','progress'],['Illegal Dumping','Ward 07','high','review'],
    ['Uncollected Waste','Ward 02','medium','resolved'],['Roadside Waste','Ward 05','low','resolved'],
    ['Plastic Waste','Ward 03','low','resolved'],['Drain / Sewage Waste','Ward 11','high','overdue'],
    ['Construction Waste','Ward 09','medium','progress'],['Overflowing Bin','Ward 14','high','reopened'],
    ['Overflowing Bin','Ward 14','medium','review'],['Uncollected Waste','Ward 08','medium','progress'],
    ['Illegal Dumping','Ward 12','high','review'],['Plastic Waste','Ward 04','low','resolved'],
    ['Roadside Waste','Ward 06','medium','resolved'],['Overflowing Bin','Ward 14','high','overdue'],
    ['Drain / Sewage Waste','Ward 10','high','progress'],['Construction Waste','Ward 13','medium','resolved'],
    ['Uncollected Waste','Ward 01','low','resolved'],['Plastic Waste','Ward 15','low','progress'],
    ['Illegal Dumping','Ward 16','high','review'],['Roadside Waste','Ward 14','medium','progress']
  ];
  more.forEach((m,i)=>{
    const em = (ISSUE_TYPES.find(t=>t.t===m[0])||{em:'📦'}).em;
    base.push({id:'CCT-2026-'+(10300+i*7), issue:m[0], em, loc:m[1]+', '+m[1], ward:m[1], status:m[3], prio:m[2], date:'2026-09-'+String(12+ (i%18)).padStart(2,'0'), progress: m[3]==='resolved'?100:(m[3]==='review'?18:(m[3]==='overdue'?40:65)), team:'Team '+['Alpha','Bravo','Charlie','Delta'][i%4], dept:'Solid Waste Mgmt', citizen:'Citizen #'+(1000+i)});
  });
  return base;
})();

/* ---------- notifications ---------- */
const NOTIFS = [
  {ic:'pin', t:'Report CCT-2026-10482 has been assigned.', m:'Team Alpha · Solid Waste Mgmt', time:'12m ago', unread:true},
  {ic:'check', t:'Cleanup completed. Please verify the result.', m:'CCT-2026-10461 · Green Park Ave', time:'2h ago', unread:true},
  {ic:'refresh', t:'Your report was reopened.', m:'CCT-2026-10455 · Old Mill Street', time:'Yesterday', unread:false},
  {ic:'lightbulb', t:'New cleanliness insights are available for your area.', m:'Ward 14 · AI-generated insight', time:'2d ago', unread:false}
];

/* ---------- hotspot intelligence ---------- */
const HOTSPOTS = [
  {loc:'Market Road', ward:'Ward 14', count:32, trend:'+24%', issue:'Overflowing bins', cause:'Insufficient collection frequency', action:'Increase collection frequency'},
  {loc:'Old Mill Street', ward:'Ward 11', count:21, trend:'+12%', issue:'Drain / sewage waste', cause:'Blocked storm drains', action:'Schedule drain clearing'},
  {loc:'Station Road', ward:'Ward 5', count:17, trend:'-6%', issue:'Roadside waste', cause:'Market spillover', action:'Add public bins'}
];

/* ---------- AI insights ---------- */
const AI_INSIGHTS = [
  'Waste complaints in Ward 14 increased by 32% over the last 30 days.',
  '67% of complaints in this area involve overflowing bins.',
  'Three locations have recurring complaints and may require permanent intervention.'
];

/* ================= charts (inline SVG, no libraries) ================= */
function areaChart(data,{w=560,h=180,color='#C6A02E',fill='rgba(198,160,46,.16)'}={}){
  const max=Math.max(...data)*1.15, min=0;
  const step=(w-10)/(data.length-1);
  const pts=data.map((v,i)=>[5+i*step, h-8-((v-min)/(max-min))*(h-24)]);
  const line=pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area=`${line} L ${pts[pts.length-1][0].toFixed(1)} ${h-8} L ${pts[0][0].toFixed(1)} ${h-8} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="none" style="height:${h}px">
    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6A02E" stop-opacity=".28"/><stop offset="1" stop-color="#C6A02E" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#ag)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.filter((_,i)=>i%Math.ceil(data.length/7)===0).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fff" stroke="${color}" stroke-width="2"/>`).join('')}
  </svg>`;
}
function barChart(data,labels,{w=560,h=200,color='#C6A02E'}={}){
  const max=Math.max(...data)*1.12, n=data.length, bw=(w-20)/n*0.62, gap=(w-20)/n;
  const bars=data.map((v,i)=>{
    const bh=(v/max)*(h-30), x=10+i*gap+(gap-bw)/2, y=h-22-bh;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="5" fill="url(#bg2)"/>
      <text x="${(x+bw/2).toFixed(1)}" y="${h-6}" text-anchor="middle" font-size="11" fill="#9C9686" font-family="Inter">${labels[i]}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="height:${h}px">
    <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6C976"/><stop offset="1" stop-color="#C6A02E"/></linearGradient></defs>
    ${bars}</svg>`;
}
function donut(parts,{size=170,stroke=22}={}){
  const total=parts.reduce((a,p)=>a+p.v,0)||1; const r=(size-stroke)/2, c=2*Math.PI*r;
  let off=0; const segs=parts.map(p=>{
    const len=p.v/total*c; const s=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${stroke}" stroke-dasharray="${len.toFixed(1)} ${(c-len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/>`; off+=len; return s;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#F1ECE0" stroke-width="${stroke}"/>${segs}</svg>`;
}
function ring(score,{size=220,stroke=18}={}){
  const r=(size-stroke)/2, c=2*Math.PI*r, len=score/100*c;
  return `<div class="ring"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#F1ECE0" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} ${(c-len).toFixed(1)}"/>
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6C976"/><stop offset="1" stop-color="#C6A02E"/></linearGradient></defs></svg>
    <div class="val"><b>${score}</b><small>Cleanliness Score</small></div></div>`;
}
function heatmap(rows,cols,{cell=20,gap=5}={}){
  let s=`<svg width="${cols*(cell+gap)}" height="${rows*(cell+gap)}" viewBox="0 0 ${cols*(cell+gap)} ${rows*(cell+gap)}">`;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const v=(Math.sin(x*1.3+y*0.7)*0.5+0.5); const a=(0.12+v*0.75).toFixed(2);
    s+=`<rect x="${x*(cell+gap)}" y="${y*(cell+gap)}" width="${cell}" height="${cell}" rx="4" fill="rgba(198,160,46,${a})"/>`;
  }
  return s+'</svg>';
}
function sparkline(data,color='#C6A02E'){
  const w=120,h=40,max=Math.max(...data),min=Math.min(...data);
  const pts=data.map((v,i)=>[i/(data.length-1)*w, h-((v-min)/((max-min)||1))*(h-6)-3]);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="${pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ================= before / after illustrations (inline SVG) ================= */
function beforeSVG(){
  return `<svg viewBox="0 0 640 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b6f5f"/><stop offset="1" stop-color="#3f4436"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#bsky)"/>
    <rect y="240" width="640" height="120" fill="#2c2f26"/>
    <rect x="30" y="70" width="150" height="170" fill="#4a4d41"/><rect x="470" y="50" width="150" height="190" fill="#4a4d41"/>
    <g fill="#565a4a">${Array.from({length:6},(_,i)=>`<rect x="${60+i*18}" y="90" width="12" height="16"/>`).join('')}</g>
    <g><rect x="210" y="150" width="52" height="90" rx="6" fill="#5a5f4c"/><rect x="205" y="140" width="62" height="16" rx="6" fill="#6b7059"/></g>
    <g fill="#3a3d31"><path d="M300 250 q14 -46 34 -10 q10 -34 30 -4 q8 -26 26 -2 q6 -20 24 2 z" opacity=".9"/></g>
    <ellipse cx="360" cy="262" rx="70" ry="20" fill="#20231c" opacity=".6"/>
    <g fill="#7a7f66"><circle cx="250" cy="256" r="13"/><circle cx="272" cy="262" r="10"/><circle cx="410" cy="258" r="12"/><circle cx="432" cy="264" r="9"/></g>
    <g fill="#8f9480"><rect x="150" y="250" width="26" height="14" rx="3" transform="rotate(-12 150 250)"/><rect x="480" y="252" width="30" height="14" rx="3" transform="rotate(8 480 252)"/></g>
    <text x="24" y="34" font-family="Inter" font-size="15" fill="#d9d3bd" opacity=".85">Citizen photo · reported 03 Oct</text>
  </svg>`;
}
function afterSVG(){
  return `<svg viewBox="0 0 640 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3d0"/><stop offset="1" stop-color="#8fc7ab"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#asky)"/>
    <circle cx="540" cy="70" r="34" fill="#fff4cf"/>
    <rect y="248" width="640" height="112" fill="#c9c4b2"/>
    <rect y="244" width="640" height="8" fill="#b3ad98"/>
    <rect x="30" y="70" width="150" height="170" fill="#e6e2d4"/><rect x="470" y="50" width="150" height="190" fill="#e6e2d4"/>
    <g fill="#c9d8c6">${Array.from({length:6},(_,i)=>`<rect x="${60+i*18}" y="90" width="12" height="16"/>`).join('')}</g>
    <g><rect x="205" y="140" width="62" height="104" rx="8" fill="#3f7a5c"/><rect x="200" y="128" width="72" height="18" rx="7" fill="#2e7d5b"/><rect x="226" y="160" width="20" height="6" rx="3" fill="#dff0e5"/></g>
    <g fill="#3f7a5c"><circle cx="330" cy="236" r="26"/><rect x="326" y="236" width="8" height="30" fill="#6b5a3a"/></g>
    <g fill="#3f7a5c"><circle cx="430" cy="238" r="22"/><rect x="426" y="238" width="8" height="28" fill="#6b5a3a"/></g>
    <g fill="#3f7a5c"><circle cx="120" cy="240" r="20"/><rect x="116" y="240" width="8" height="26" fill="#6b5a3a"/></g>
    <text x="24" y="34" font-family="Inter" font-size="15" fill="#2f5f47">Municipal cleanup photo · 05 Oct</text>
  </svg>`;
}

/* ---------- tiny icons (inline svg) ---------- */
const IC = {
  home:'M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z',
  report:'M12 5v14M5 12h14',
  track:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l4 2',
  dash:'M4 13h7V4H4zm9 7h7V11h-7zM4 20h7v-4H4zm9-16v7h7V4z',
  insight:'M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2zM9 21h6',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z',
  bell:'M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm0 18a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z',
  users:'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 7-5s7 2 7 5v1H2zM17 21v-1c0-2-1-3.4-3-4 4 .2 6 2 6 4v1z',
  assign:'M9 11l3 3 7-7M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z',
  teams:'M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8z',
  hotspot:'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
  analytics:'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9-3l-1.6-.9.3-1.8-1.7-1-1.5 1-1.5-1-1.7 1 .3 1.8L10 12l1.6.9-.3 1.8 1.7 1 1.5-1 1.5 1 1.7-1-.3-1.8z',
  check:'M20 6L9 17l-5-5',
  shield:'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z',
  camera:'M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm8 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  arrow:'M5 12h14M13 6l6 6-6 6',
  bin:'M6 7h12l-1 13H7L6 7zm3-3h6l1 3H8l1-3z',
  dump:'M4 20h16M6 20l2-6 3.5 1.6L14 11l4 9',
  basket:'M5 10h14l-2 9H7zM9 10l2-6M15 10l-2-6',
  road:'M12 3v18M8 5l-2 15M16 5l2 15',
  brick:'M4 20V10l8-5 8 5v10M9 20v-6h6v6M4 14h16',
  bottle:'M10 3h4v3l1 2v12H9V8l1-2zM10 12h4',
  drain:'M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  box:'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  map:'M9 4l6 2 6-2v14l-6 2-6-2-6 2V6zM9 4v14M15 6v14',
  keyboard:'M4 7h16v10H4zM7 11h.01M11 11h.01M15 11h.01M7 14h10',
  image:'M4 5h16v14H4zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 16l5-4 4 3 3-2 4 3',
  clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l4 2',
  building:'M6 21V5l6-3 6 3v16M9 9h2M13 9h2M9 13h2M13 13h2M9 17h6',
  broom:'M14 3l7 7M4 20l6-6 4 4-6 6zM9 15l-4-4',
  spark:'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  radar:'M12 12l7-7M12 12a4 4 0 1 1-4-4M12 3a9 9 0 1 0 9 9',
  alert:'M12 3l9 16H3zM12 9v5M12 17h.01',
  star:'M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8z',
  pin:'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
  chat:'M4 5h16v11H9l-5 4z',
  rupee:'M7 4h10M7 9h10M7 4c5 0 6 2 6 5s-1 5-6 5l6 6',
  refresh:'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M18 4v5h-5M6 20v-5h5',
  lightbulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3z'
};
function icon(name,cls=''){ return `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[name]||IC.home}"/></svg>`; }
function ic(name,size=22,sw=1.9){ return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[name]||IC.home}"/></svg>`; }
/* issue-type → icon mapping */
const ISSUE_IC = {overflow:'bin',dumping:'dump',uncollected:'basket',roadside:'road',construction:'brick',plastic:'bottle',drain:'drain',other:'box'};
function inl(name,size=13){ return `<span style="display:inline-flex;vertical-align:-2px;color:var(--gold-deep)">${ic(name,size)}</span>`; }
function issueIconByName(name,size=22){ const t=ISSUE_TYPES.find(x=>x.t===name); return ic(ISSUE_IC[t?t.k:'other'],size); }
