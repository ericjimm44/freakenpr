// Vibe Projects Hub — loads projects.json and renders cards with progress bars.

const STATUS_LABEL = {
  'completed': 'Completed',
  'in-progress': 'In Progress'
};

let allProjects = [];
let activeFilter = 'all';

async function loadProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allProjects = Array.isArray(data.projects) ? data.projects : [];
    renderStats();
    renderProjects();
  } catch (err) {
    document.getElementById('projects').innerHTML =
      `<p class="loading">Couldn't load projects.json (${err.message}).<br>
       If you opened this file directly, run a local server:
       <code>python3 -m http.server</code> then visit the hub URL.</p>`;
  }
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
  const list = allProjects.filter(p =>
    activeFilter === 'all' ? true : p.status === activeFilter
  );

  if (!list.length) {
    container.innerHTML = `<p class="loading">No projects in this view yet.</p>`;
    return;
  }

  container.innerHTML = list.map(projectCard).join('');

  // Animate progress bars after they're in the DOM.
  requestAnimationFrame(() => {
    container.querySelectorAll('.progress-fill').forEach(el => {
      el.style.width = el.style.getPropertyValue('--target');
    });
  });
}

function setupFilters() {
  document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b === btn));
    renderProjects();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

setupFilters();
loadProjects();
