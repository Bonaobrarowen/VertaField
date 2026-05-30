const STORAGE_KEY = 'vf_records_v1';
let records = [];

function loadData() {
  try { records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { records = []; }
  if (records.length === 0) {
    records = [
      { id: 's1', origin: 'Quezon City Farm', destination: 'Quiapo Market', distance: 12, travelTime: 1.5, userRole: 'Farmer', productType: 'Vegetables', productWeight: 50, freshness: 4, damageLevel: 1, tempCondition: 'Ambient (room temp)', handling: 'Careful', notes: '', date: '2025-01-10' },
      { id: 's2', origin: 'Bulacan Fields', destination: 'Divisoria', distance: 35, travelTime: 3, userRole: 'Distributor', productType: 'Fruits', productWeight: 120, freshness: 3, damageLevel: 2, tempCondition: 'Ambient (room temp)', handling: 'Normal', notes: '', date: '2025-01-11' },
      { id: 's3', origin: 'Laguna Farm', destination: 'Pasay Market', distance: 58, travelTime: 4, userRole: 'Distributor', productType: 'Vegetables', productWeight: 80, freshness: 2, damageLevel: 3, tempCondition: 'Hot / exposed to sun', handling: 'Rough', notes: 'Heavy traffic', date: '2025-01-12' },
    ];
    saveData();
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }

let freshRating = 0;
let filterMode = 'all';
let prevScreen = 'dash';

const freshLabels = ['', 'Very poor', 'Poor', 'Acceptable', 'Good', 'Excellent'];
const dmgLabels = ['', 'None', 'Minor', 'Moderate', 'Severe'];

function qualityScore(r) {
  return Math.round(((6 - r.damageLevel) * 0.4 + r.freshness * 0.6) * 10) / 10;
}
function qualityTier(r) {
  const q = qualityScore(r);
  return q >= 3.5 ? 'good' : q >= 2 ? 'medium' : 'poor';
}
function qualityBadgeHTML(r) {
  const t = qualityTier(r);
  const map = { good: 'badge-green', medium: 'badge-amber', poor: 'badge-red' };
  return `<span class="badge ${map[t]}">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

const NAV_SCREENS = ['dash', 'log', 'logs', 'analytics'];
const TITLES = { dash: 'VertaField', log: 'Log Transport', logs: 'Records', analytics: 'Analytics', detail: 'Record detail' };

function showScreen(id) {
  if (id !== 'detail') prevScreen = id;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');

  NAV_SCREENS.forEach(n => {
    const el = document.getElementById('nav-' + n);
    if (el) el.classList.toggle('active', n === id);
  });

  document.getElementById('navTitle').textContent = TITLES[id] || 'VertaField';
  document.getElementById('backBtn').style.display = id === 'detail' ? 'block' : 'none';
  document.getElementById('bottomNav').style.display = id === 'detail' ? 'none' : 'flex';

  if (id === 'dash') renderDash();
  if (id === 'logs') renderLogs();
  if (id === 'analytics') renderAnalytics();
  if (id === 'log') resetForm();
}

function goBack() { showScreen(prevScreen); }

function resetForm() {
  ['origin', 'destination', 'distance', 'travelTime', 'notes', 'productWeight']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['userRole', 'productType', 'damageLevel', 'tempCondition', 'handling']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  freshRating = 0;
  updateStars(0);
  document.getElementById('freshLabel').textContent = 'Tap to rate';
  goStep(1, true);
}

function goStep(n, silent) {
  if (!silent) {
    if (n === 2) {
      const o = document.getElementById('origin').value.trim();
      const d = document.getElementById('destination').value.trim();
      const dist = document.getElementById('distance').value;
      const role = document.getElementById('userRole').value;
      if (!o || !d || !dist || !role) { toast('Please fill in all transport fields'); return; }
    }
    if (n === 3) {
      const pt = document.getElementById('productType').value;
      const dl = document.getElementById('damageLevel').value;
      if (!pt || !freshRating || !dl) { toast('Please complete all product quality fields'); return; }
    }
  }
  [1, 2, 3].forEach(i => {
    document.getElementById('step' + i).style.display = i === n ? '' : 'none';
    document.getElementById('sbar' + i).classList.toggle('done', i <= n);
  });
  const lbls = ['Step 1 of 3 — Transport info', 'Step 2 of 3 — Product quality', 'Step 3 of 3 — Conditions'];
  document.getElementById('stepLabel').textContent = lbls[n - 1];
}

function setRating(val) {
  freshRating = val;
  updateStars(val);
  document.getElementById('freshLabel').textContent = freshLabels[val];
}
function updateStars(val) {
  document.querySelectorAll('#freshStars .star').forEach((s, i) => s.classList.toggle('filled', i < val));
}

function submitLog() {
  const tc = document.getElementById('tempCondition').value;
  const h = document.getElementById('handling').value;
  if (!tc || !h) { toast('Please fill in transport conditions'); return; }

  const rec = {
    id: 'r' + Date.now(),
    origin: document.getElementById('origin').value.trim(),
    destination: document.getElementById('destination').value.trim(),
    distance: parseFloat(document.getElementById('distance').value),
    travelTime: parseFloat(document.getElementById('travelTime').value) || 0,
    userRole: document.getElementById('userRole').value,
    productType: document.getElementById('productType').value,
    productWeight: parseFloat(document.getElementById('productWeight').value) || 0,
    freshness: freshRating,
    damageLevel: parseInt(document.getElementById('damageLevel').value, 10),
    tempCondition: tc,
    handling: h,
    notes: document.getElementById('notes').value.trim(),
    date: todayStr(),
  };

  records.unshift(rec);
  saveData();
  toast('Transport logged successfully!');
  setTimeout(() => showScreen('dash'), 700);
}

function setFilter(mode, btn) {
  filterMode = mode;
  document.querySelectorAll('#filterSeg .seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLogs();
}

function renderDash() {
  document.getElementById('m-total').textContent = records.length;
  const todayCt = records.filter(r => r.date === todayStr()).length;
  document.getElementById('m-today').textContent = '+' + todayCt + ' today';

  if (records.length) {
    const avgD = (records.reduce((a, r) => a + r.distance, 0) / records.length).toFixed(1);
    const avgQ = (records.reduce((a, r) => a + qualityScore(r), 0) / records.length).toFixed(1);
    document.getElementById('m-dist').textContent = avgD;
    document.getElementById('m-quality').textContent = avgQ;

    const poor = records.filter(r => qualityScore(r) < 2).length;
    const sp = Math.round(poor / records.length * 100);
    document.getElementById('m-spoilage').textContent = sp + '%';
    document.getElementById('m-spoilage-badge').textContent = sp === 0 ? 'no risk' : sp < 20 ? 'low risk' : 'high risk';
    document.getElementById('m-spoilage-badge').className = 'badge ' + (sp >= 20 ? 'badge-red' : 'badge-amber');

    const avgDf = parseFloat(avgD), avgQf = parseFloat(avgQ);
    document.getElementById('insightText').textContent =
      avgDf > 30 && avgQf < 3 ? 'Long distances are reducing quality. Consider refrigerated transport.' :
      avgQf >= 4 ? 'Great quality scores! Your transport practices are effective.' :
      'Monitor freshness closely on routes over 25 km.';
  }

  renderChart('week');

  const recent = records.slice(0, 3);
  const el = document.getElementById('dashRecent');
  el.innerHTML = recent.length
    ? recent.map(logItemHTML).join('')
    : '<div class="empty">No records yet. Log your first transport!</div>';
}

function renderLogs() {
  const search = (document.getElementById('searchInput').value || '').toLowerCase();
  const filtered = records.filter(r => {
    const tier = qualityTier(r);
    if (filterMode === 'good' && tier !== 'good') return false;
    if (filterMode === 'medium' && tier !== 'medium') return false;
    if (filterMode === 'poor' && tier !== 'poor') return false;
    if (search && !(r.origin + r.destination + r.productType).toLowerCase().includes(search)) return false;
    return true;
  });

  const el = document.getElementById('logsList');
  el.innerHTML = filtered.length
    ? filtered.map(logItemHTML).join('')
    : '<div class="empty">No records match.</div>';
}

function logItemHTML(r) {
  const tier = qualityTier(r);
  const iconMap = { good: 'green', medium: 'amber', poor: 'red' };
  return `
    <div class="log-item" onclick="showDetail('${r.id}')">
      <div class="log-icon ${iconMap[tier]}"><i class="ti ti-package"></i></div>
      <div class="log-details">
        <div class="log-route">${r.origin} → ${r.destination}</div>
        <div class="log-meta">${r.productType} · ${r.userRole} · ${qualityBadgeHTML(r)}</div>
      </div>
      <div class="log-right">
        <div class="log-dist">${r.distance} km</div>
        <div class="log-date">${r.date}</div>
      </div>
    </div>`;
}

function showDetail(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;

  const q = qualityScore(r);
  const tier = qualityTier(r);
  const orbColors = { good: ['var(--green-50)', 'var(--green-800)'], medium: ['var(--amber-50)', 'var(--amber-800)'], poor: ['var(--red-50)', 'var(--red-800)'] };
  const [orbBg, orbFg] = orbColors[tier];
  const stars = '★'.repeat(r.freshness) + '☆'.repeat(5 - r.freshness);

  document.getElementById('detailHeader').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;justify-content:center">
      <div class="quality-orb" style="background:${orbBg};color:${orbFg}">
        ${q}<div style="font-size:10px;font-weight:400">/ 5.0</div>
      </div>
      <div style="text-align:left">
        <div style="font-size:16px;font-weight:500">${r.origin}</div>
        <div style="font-size:13px;color:var(--text-secondary)">→ ${r.destination}</div>
        <div style="margin-top:4px">${qualityBadgeHTML(r)}</div>
      </div>
    </div>`;

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-row"><span class="detail-key">Distance</span><span class="detail-val">${r.distance} km</span></div>
    <div class="detail-row"><span class="detail-key">Travel time</span><span class="detail-val">${r.travelTime} hrs</span></div>
    <div class="detail-row"><span class="detail-key">Handler role</span><span class="detail-val">${r.userRole}</span></div>
    <div class="detail-row"><span class="detail-key">Date</span><span class="detail-val">${r.date}</span></div>
    <div class="detail-row"><span class="detail-key">Temperature</span><span class="detail-val">${r.tempCondition}</span></div>
    <div class="detail-row"><span class="detail-key">Handling</span><span class="detail-val">${r.handling}</span></div>
    ${r.notes ? `<div class="detail-row"><span class="detail-key">Notes</span><span class="detail-val">${r.notes}</span></div>` : ''}`;

  document.getElementById('detailQuality').innerHTML = `
    <div class="detail-row"><span class="detail-key">Product</span><span class="detail-val">${r.productType} (${r.productWeight} kg)</span></div>
    <div class="detail-row"><span class="detail-key">Freshness</span><span class="detail-val" style="color:var(--amber-400)">${stars}</span></div>
    <div class="detail-row"><span class="detail-key">Damage level</span><span class="detail-val">${dmgLabels[r.damageLevel]}</span></div>
    <div class="detail-row"><span class="detail-key">Quality score</span><span class="detail-val">${q} / 5.0</span></div>`;

  document.getElementById('detailDeleteBtn').onclick = () => {
    records = records.filter(x => x.id !== id);
    saveData();
    toast('Record deleted');
    goBack();
  };

  showScreen('detail');
}

function switchChart(mode, btn) {
  document.querySelectorAll('.seg-ctrl .seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderChart(mode);
}

function renderChart(mode) {
  const el = document.getElementById('chartBars');
  if (!records.length) { el.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);padding:10px">No data yet</div>'; return; }
  const days = mode === 'week' ? 7 : 4;
  const labels = mode === 'week' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['W1', 'W2', 'W3', 'W4'];
  const cols = labels.map((lbl, i) => {
    const recs = records.filter((_, idx) => idx % days === (days - 1 - i) % days);
    const q = recs.length ? recs.reduce((a, r) => a + qualityScore(r), 0) / recs.length : 0;
    const d = recs.length ? recs.reduce((a, r) => a + r.distance, 0) / recs.length : 0;
    return { q, d, lbl };
  });
  const maxD = Math.max(...cols.map(c => c.d), 1);
  el.innerHTML = cols.map(c => `
    <div class="bar-col">
      <div style="display:flex;gap:2px;align-items:flex-end;height:70px">
        <div class="bar" style="width:12px;height:${Math.round(c.q / 5 * 70)}px;background:var(--green-400)"></div>
        <div class="bar" style="width:12px;height:${Math.round(c.d / maxD * 70)}px;background:var(--amber-200)"></div>
      </div>
      <span class="bar-label">${c.lbl}</span>
    </div>`).join('');
}

function renderAnalytics() {
  if (!records.length) return;

  const canvas = document.getElementById('scatterCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxDist = Math.max(...records.map(r => r.distance), 1);

  ctx.strokeStyle = 'rgba(136,135,128,0.2)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = canvas.height - i * (canvas.height / 5);
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(canvas.width - 10, y); ctx.stroke();
    ctx.fillStyle = '#888780'; ctx.font = '10px sans-serif'; ctx.fillText(i, 4, y + 4);
  }

  records.forEach(r => {
    const x = 30 + (r.distance / maxDist) * (canvas.width - 42);
    const y = canvas.height - (qualityScore(r) / 5) * canvas.height;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    const tier = qualityTier(r);
    ctx.fillStyle = tier === 'good' ? '#3B6D11' : tier === 'medium' ? '#854F0B' : '#A32D2D';
    ctx.fill();
  });

  const n = records.length;
  const xs = records.map(r => r.distance);
  const ys = records.map(r => qualityScore(r));
  const mx = xs.reduce((a, b) => a + b) / n;
  const my = ys.reduce((a, b) => a + b) / n;
  const num = xs.reduce((a, r, i) => a + (r - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(xs.reduce((a, r) => a + (r - mx) ** 2, 0) * ys.reduce((a, y) => a + (y - my) ** 2, 0));
  const corr = den ? Math.round(num / den * 100) / 100 : 0;
  document.getElementById('corrLabel').textContent = n < 3
    ? 'Need at least 3 records to compute correlation'
    : `Correlation r = ${corr}${corr < -0.3 ? ' — longer distance = lower quality' : ' — no strong correlation'}`;

  const good = records.filter(r => qualityTier(r) === 'good').length;
  const med = records.filter(r => qualityTier(r) === 'medium').length;
  const poor = records.filter(r => qualityTier(r) === 'poor').length;
  document.getElementById('qualityBreakdown').innerHTML = [
    { label: 'Good quality', count: good, color: 'var(--green-400)' },
    { label: 'Medium quality', count: med, color: 'var(--amber-200)' },
    { label: 'Poor quality', count: poor, color: 'var(--red-400)' },
  ].map(item => `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>${item.label}</span>
        <span style="color:var(--text-secondary)">${item.count} / ${n}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${n ? Math.round(item.count / n * 100) : 0}%;background:${item.color}"></div>
      </div>
    </div>`).join('');

  const vols = {};
  records.forEach(r => { vols[r.productType] = (vols[r.productType] || 0) + r.productWeight; });
  const pvArr = Object.entries(vols).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxV = Math.max(...pvArr.map(x => x[1]), 1);
  document.getElementById('productVolumes').innerHTML = pvArr.map(([type, vol]) => `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>${type}</span>
        <span style="color:var(--text-secondary)">${vol} kg</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${Math.round(vol / maxV * 100)}%;background:var(--teal-400)"></div>
      </div>
    </div>`).join('');

  const routes = {};
  records.forEach(r => {
    const key = r.origin + ' → ' + r.destination;
    routes[key] = (routes[key] || { count: 0, dist: r.distance });
    routes[key].count++;
  });
  const routeArr = Object.entries(routes).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  document.getElementById('routeSummary').innerHTML = routeArr.length
    ? routeArr.map(([route, d]) => `
        <div class="detail-row">
          <span class="detail-key" style="font-size:12px">${route}</span>
          <span class="detail-val"><span class="badge badge-teal">${d.count}×</span> ${d.dist} km</span>
        </div>`).join('')
    : '<div class="empty">No data yet.</div>';
}

function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('clockDisplay').textContent = h + ':' + m;
}
setInterval(updateClock, 10000);
updateClock();

loadData();
showScreen('dash');
