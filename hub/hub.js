// ============ Vibe Coding Hub ============
// Renders a gamified, read-only dashboard from data.json.

let DATA = {};
let projects = [];

async function init() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  } catch (err) {
    document.getElementById('project-grid').innerHTML =
      `<p class="loading">Couldn't load data.json (${err.message}). Run a local
       server: <code>python3 -m http.server</code> then open the hub URL.</p>`;
    return;
  }

  projects = Array.isArray(DATA.projects) ? DATA.projects : [];
  renderProfile();
  renderGreeting();
  renderStats();
  renderProjects();
  renderRoadmap();
  renderMissions();
  renderSkills();
  renderQuests();
  renderActivity();
  renderAchievements();
  animateBars();
  setupNav();

  if (DATA.github && DATA.github.autoDiscover) {
    const found = await discoverFromGitHub(DATA.github);
    if (found.length) {
      projects = projects.concat(found);
      renderStats();
      renderProjects();
      animateBars();
    }
  }
}

/* ---------- sidebar profile ---------- */
function renderProfile() {
  const b = DATA.builder || {};
  const xpPct = b.xpMax ? Math.round((b.xp / b.xpMax) * 100) : 0;
  document.getElementById('profile-card').innerHTML = `
    <div class="avatar">🧑‍💻</div>
    <div class="who-wrap">
      <div class="who">${esc(b.handle || b.name || 'builder')}</div>
      <div class="role">${esc(b.title || '')} · Lvl ${b.level || 1}</div>
      <div class="xp-bar"><span data-w="${xpPct}%"></span></div>
    </div>`;
}

function renderGreeting() {
  const b = DATA.builder || {};
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const art = h < 7 ? '🌅' : h < 18 ? '☀️' : '🌇';
  document.getElementById('greeting-title').textContent =
    `${part}, ${b.name || 'builder'} ${art}`;
  document.getElementById('greeting-art').textContent = art;
}

/* ---------- stat cards ---------- */
function renderStats() {
  const b = DATA.builder || {};
  const inProgress = projects.filter(p => p.status !== 'completed').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const xpPct = b.xpMax ? Math.round((b.xp / b.xpMax) * 100) : 0;

  document.getElementById('stat-row').innerHTML = [
    statCard('⚡', 'Builder Level', b.level ?? 0,
      `${b.xp ?? 0} / ${b.xpMax ?? 0} XP`, xpPct, 'var(--accent)'),
    statCard('📁', 'Projects', inProgress, 'In progress', null),
    statCard('✅', 'Completed', completed, 'Keep pushing!', null),
    statCard('🔥', 'Current Streak', b.streak ?? 0, 'days in a row', null, 'var(--orange)')
  ].join('');
}

function statCard(ico, label, value, foot, pct, color) {
  const bar = pct != null
    ? `<div class="mini-bar"><span data-w="${pct}%" style="background:${color || 'var(--accent)'}"></span></div>`
    : '';
  return `
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">${label}</span>
        <span class="stat-ico">${ico}</span>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-foot">${esc(foot)}</div>
      ${bar}
    </div>`;
}

/* ---------- project cards ---------- */
function renderProjects() {
  const grid = document.getElementById('project-grid');
  if (!projects.length) { grid.innerHTML = `<p class="loading">No projects yet.</p>`; return; }

  grid.innerHTML = projects.map(p => {
    const pct = clampPct(p.progress);
    const done = p.status === 'completed';
    const cover = p.cover || 'linear-gradient(135deg,#7c5cff,#3db4ff)';
    const badge = done ? 'COMPLETED' : 'IN PROGRESS';
    const next = p.nextUp
      ? `<div class="pc-next">⏭️ Next up: <b>${esc(p.nextUp)}</b></div>` : '';
    return `
      <article class="project-card">
        <div class="pc-cover" style="background:${esc(cover)}">
          <span class="pc-badge ${done ? 'completed' : ''}">${badge}</span>
        </div>
        <div class="pc-body">
          <div class="pc-name">${esc(p.name || 'Untitled')}</div>
          <div class="pc-desc">${esc(p.description || '')}</div>
          <div class="pc-progress-meta"><span>Progress</span><span>${pct}%</span></div>
          <div class="bar"><span class="${done ? 'done' : ''}" data-w="${pct}%"></span></div>
          ${next}
        </div>
      </article>`;
  }).join('');
}

/* ---------- roadmap (featured project) ---------- */
function featuredProject() {
  return projects.find(p => p.featured && p.roadmap)
      || projects.find(p => p.roadmap)
      || null;
}

function renderRoadmap() {
  const p = featuredProject();
  const host = document.getElementById('roadmap');
  document.getElementById('roadmap-project').textContent = p ? p.name : '—';
  if (!p) { host.innerHTML = `<p class="loading">No roadmap defined.</p>`; return; }

  const icons = { complete: '✅', 'in-progress': '⚙️', locked: '🔒' };
  host.innerHTML = (p.roadmap || []).map(s => `
    <div class="road-step ${s.state}">
      <div class="road-dot">${icons[s.state] || '•'}</div>
      <div class="road-name">${esc(s.stage)}</div>
      <div class="road-state">${stateLabel(s.state)}</div>
    </div>`).join('');
}

function renderMissions() {
  const p = featuredProject();
  const host = document.getElementById('mission-board');
  const missions = (p && p.missions) || [];
  if (!missions.length) { host.innerHTML = `<p class="loading">No missions yet.</p>`; return; }

  host.innerHTML = missions.map((m, i) => {
    const pct = clampPct(m.progress);
    const ico = pct >= 100 ? '🏆' : pct > 0 ? '🚧' : '🔒';
    return `
      <div class="mission">
        <div class="mission-top">${ico} Mission ${i + 1}</div>
        <div class="mission-sub">${esc(m.name)}</div>
        <div class="bar"><span class="${pct >= 100 ? 'done' : ''}" data-w="${pct}%"></span></div>
        <div class="mission-pct">${pct}%</div>
      </div>`;
  }).join('');
}

/* ---------- right rail ---------- */
function renderSkills() {
  document.getElementById('skills').innerHTML = (DATA.skills || []).map(s => `
    <div class="skill">
      <div class="skill-top"><span>${esc(s.name)}</span><b>${s.value}</b></div>
      <div class="bar"><span data-w="${clampPct(s.value)}%" style="background:${esc(s.color || 'var(--accent)')}"></span></div>
    </div>`).join('');
}

function renderQuests() {
  const quests = DATA.quests || [];
  const completed = quests.filter(q => (q.progress || 0) >= (q.goal || 1)).length;
  const cnt = document.getElementById('quest-progress');
  if (cnt) cnt.textContent = quests.length ? `${completed}/${quests.length}` : '';

  document.getElementById('quests').innerHTML = quests.map(q => {
    const done = (q.progress || 0) >= (q.goal || 1);
    const ratio = `${q.progress || 0}/${q.goal || 1}`;
    return `
      <div class="quest ${done ? 'done' : ''}">
        <div class="quest-check">✓</div>
        <div class="quest-label">${esc(q.label)}</div>
        <div class="quest-xp">${ratio}</div>
      </div>`;
  }).join('');

  const r = DATA.questReward;
  document.getElementById('quest-reward').innerHTML = r ? `
    <div class="qr-ico">🎁</div>
    <div>
      <div class="qr-title">+${r.xp} XP</div>
      <div class="qr-sub">${esc(r.bonus || '')}</div>
    </div>` : '';
}

function renderActivity() {
  document.getElementById('activity').innerHTML = (DATA.activity || []).map(a => `
    <div class="act">
      <span class="act-ico">${esc(a.icon || '•')}</span>
      <span class="act-text">${esc(a.text)}</span>
      <span class="act-time">${esc(a.time || '')}</span>
    </div>`).join('');
}

function renderAchievements() {
  const list = DATA.achievements || [];
  const unlocked = list.filter(a => a.unlocked).length;
  const cnt = document.getElementById('ach-count');
  if (cnt) cnt.textContent = list.length ? `${unlocked}/${list.length}` : '';

  document.getElementById('achievements').innerHTML = list.map(a => `
    <div class="badge ${a.unlocked ? '' : 'locked'}" title="${esc(a.name)}${a.unlocked ? '' : ' (locked)'}">
      <div class="badge-ico">${esc(a.icon || '🏅')}</div>
      <div class="badge-name">${esc(a.name)}</div>
    </div>`).join('');
}

/* ---------- nav: smooth scroll + active-on-scroll ---------- */
function setupNav() {
  const items = Array.from(document.querySelectorAll('.nav-item'));

  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Highlight the nav item whose section is in view.
  const sections = items
    .map(i => document.getElementById(i.dataset.target))
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const active = items.find(i => i.dataset.target === e.target.id);
      if (!active) return;
      items.forEach(i => i.classList.toggle('active', i === active));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ---------- GitHub auto-discovery ---------- */
async function discoverFromGitHub(cfg) {
  const { owner, repo } = cfg;
  if (!owner || !repo) return [];
  const ignore = new Set((cfg.ignoreBranches || []).map(b => b.toLowerCase()));
  const known = new Set(projects.map(p => (p.branch || '').toLowerCase()).filter(Boolean));
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      { headers: { 'Accept': 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const branches = await res.json();
    const covers = ['linear-gradient(135deg,#ff6a88,#ff99ac)',
                    'linear-gradient(135deg,#36d1dc,#5b86e5)',
                    'linear-gradient(135deg,#56ab2f,#a8e063)'];
    return branches.map(b => b.name)
      .filter(n => !ignore.has(n.toLowerCase()) && !known.has(n.toLowerCase()))
      .map((n, i) => ({
        name: prettyBranch(n),
        description: `Auto-discovered from branch ${n}.`,
        status: 'in-progress',
        progress: 0,
        cover: covers[i % covers.length],
        nextUp: 'Add details in data.json',
        tags: ['auto-discovered'],
        branch: n
      }));
  } catch (err) {
    console.warn('Auto-discovery skipped:', err.message);
    return [];
  }
}

function prettyBranch(branch) {
  let s = branch.split('/').pop().replace(/-[a-z0-9]{6,}$/i, '');
  s = s.replace(/[-_]+/g, ' ').trim();
  return s.replace(/\b\w/g, c => c.toUpperCase()) || branch;
}

/* ---------- helpers ---------- */
function animateBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-w]').forEach(el => {
      el.style.width = el.getAttribute('data-w');
    });
    document.querySelectorAll('.project-card').forEach((c, i) => {
      c.style.animationDelay = (i * 60) + 'ms';
    });
  });
}

function clampPct(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }
function stateLabel(s) {
  return { complete: 'Complete', 'in-progress': 'In Progress', locked: 'Locked' }[s] || s;
}
function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

init();
