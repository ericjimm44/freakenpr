// Vibe Projects Hub — loads projects.json and renders cards with progress bars.

const STATUS_LABEL = {
  'completed': 'Completed',
  'in-progress': 'In Progress'
};

let allProjects = [];
let activeFilter = 'all';
let searchTerm = '';
let sortBy = 'updated';

async function loadProjects() {
  let data;
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    document.getElementById('projects').innerHTML =
      `<p class="loading">Couldn't load projects.json (${err.message}).<br>
       If you opened this file directly, run a local server:
       <code>python3 -m http.server</code> then visit the hub URL.</p>`;
    return;
  }

  allProjects = Array.isArray(data.projects) ? data.projects : [];
  // Show curated projects immediately, then enrich with GitHub branches.
  renderStats();
  renderProjects();

  if (data.github && data.github.autoDiscover) {
    const discovered = await discoverFromGitHub(data.github);
    if (discovered.length) {
      allProjects = allProjects.concat(discovered);
      renderStats();
      renderProjects();
    }
  }
}

// Pull branches from the GitHub REST API and turn any not already listed
// in projects.json into auto-discovered "in progress" project cards.
async function discoverFromGitHub(cfg) {
  const { owner, repo } = cfg;
  if (!owner || !repo) return [];
  const ignore = new Set((cfg.ignoreBranches || []).map(b => b.toLowerCase()));
  const known = new Set(
    allProjects.map(p => (p.branch || '').toLowerCase()).filter(Boolean)
  );

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      { headers: { 'Accept': 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const branches = await res.json();

    return branches
      .map(b => b.name)
      .filter(name => !ignore.has(name.toLowerCase()) && !known.has(name.toLowerCase()))
      .map(name => ({
        name: prettyBranchName(name),
        description: `Auto-discovered from branch \`${name}\`. Add details in projects.json.`,
        status: 'in-progress',
        progress: 0,
        tags: ['auto-discovered'],
        branch: name,
        repo: `https://github.com/${owner}/${repo}/tree/${name}`
      }));
  } catch (err) {
    console.warn('Auto-discovery skipped:', err.message);
    return [];
  }
}

// Turn a branch like "claude/cool-thing-x1y2" into "Cool Thing".
function prettyBranchName(branch) {
  let s = branch.split('/').pop();
  s = s.replace(/-[a-z0-9]{6,}$/i, '');      // drop trailing random suffix
  s = s.replace(/[-_]+/g, ' ').trim();
  return s.replace(/\b\w/g, c => c.toUpperCase()) || branch;
}

function renderStats() {
  const total = allProjects.length;
  const completed = allProjects.filter(p => p.status === 'completed').length;
  const inProgress = total - completed;
  const avg = total
    ? Math.round(allProjects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / total)
    : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-avg').textContent = avg + '%';

  document.getElementById('overall-pct').textContent = avg + '%';
  const fill = document.getElementById('overall-fill');
  fill.style.setProperty('--target', avg + '%');
  requestAnimationFrame(() => { fill.style.width = avg + '%'; });
}

// Apply the active filter, search term and sort order to the project list.
function visibleProjects() {
  let list = allProjects.filter(p =>
    activeFilter === 'all' ? true : p.status === activeFilter
  );

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(p => {
      const haystack = [
        p.name, p.description, (p.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  const byProgress = p => Number(p.progress) || 0;
  const sorters = {
    'updated': (a, b) => String(b.updated || '').localeCompare(String(a.updated || '')),
    'progress-desc': (a, b) => byProgress(b) - byProgress(a),
    'progress-asc': (a, b) => byProgress(a) - byProgress(b),
    'name': (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
    'status': (a, b) => String(a.status || '').localeCompare(String(b.status || ''))
  };
  return list.slice().sort(sorters[sortBy] || sorters['updated']);
}

function projectCard(p) {
  const progress = Math.max(0, Math.min(100, Number(p.progress) || 0));
  const isDone = p.status === 'completed';
  const statusLabel = STATUS_LABEL[p.status] || p.status || 'Unknown';

  const tags = (p.tags || [])
    .map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

  const links = [];
  if (p.link) links.push(`<a href="${escapeAttr(p.link)}">Open ▸</a>`);
  if (p.repo) links.push(`<a href="${escapeAttr(p.repo)}" target="_blank" rel="noopener">Code ▸</a>`);

  const updated = p.updated ? `<span class="updated">Updated ${escapeHtml(p.updated)}</span>` : '';

  return `
    <article class="project-card" data-status="${escapeAttr(p.status)}">
      <div class="card-top">
        <h3 class="project-name">${escapeHtml(p.name || 'Untitled')}</h3>
        <span class="badge ${escapeAttr(p.status)}">${escapeHtml(statusLabel)}</span>
      </div>
      <p class="project-desc">${escapeHtml(p.description || '')}</p>
      <div class="progress-wrap">
        <div class="progress-meta">
          <span>Progress</span><span>${progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${isDone ? 'done' : ''}" style="--target:${progress}%"></div>
        </div>
      </div>
      ${tags ? `<div class="tags">${tags}</div>` : ''}
      <div class="card-links">${links.join('')} ${updated}</div>
    </article>`;
}

function renderProjects() {
  const container = document.getElementById('projects');
  const list = visibleProjects();

  if (!list.length) {
    const msg = searchTerm
      ? `No projects match “${escapeHtml(searchTerm)}”.`
      : 'No projects in this view yet.';
    container.innerHTML = `<p class="loading">${msg}</p>`;
    return;
  }

  container.innerHTML = list.map(projectCard).join('');

  // Animate progress bars + stagger the card fade-in after they're in the DOM.
  requestAnimationFrame(() => {
    container.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.animationDelay = (i * 60) + 'ms';
    });
    container.querySelectorAll('.progress-fill').forEach(el => {
      el.style.width = el.style.getPropertyValue('--target');
    });
  });
}

function setupControls() {
  document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b === btn));
    renderProjects();
  });

  document.getElementById('search').addEventListener('input', e => {
    searchTerm = e.target.value.trim();
    renderProjects();
  });

  document.getElementById('sort').addEventListener('change', e => {
    sortBy = e.target.value;
    renderProjects();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

setupControls();
loadProjects();
