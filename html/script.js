// ======= State =======
let currentSection = 0; // 0=closed, 1=players, 2=whitelist, 3=heist
const sections = { 1:'playersSection', 2:'whitelistSection', 3:'heistSection' };

// enabled sections
let enabled = { players:true, whitelist:true, heist:true };

// Players
let currentPage = 1;
let playersPerPage = 60;
let totalPlayers = [];

// Heists
let heistItems = [];
let heistCurrentPage = 1;
let heistPerPage = 10;

// NUI resource name
const RES = (typeof GetParentResourceName === 'function') ? GetParentResourceName() : 'watari_scoreboard';

// Auto refresh
let refreshInterval = null;
const REFRESH_INTERVAL_MS = 15000;

// Close race condition guard
let hideToken = 0;
let closingTimer = null;

// ======= Utils =======
function getOrder() {
  const o = [];
  if (enabled.players)   o.push(1);
  if (enabled.whitelist) o.push(2);
  if (enabled.heist)     o.push(3);
  return o;
}
function setActiveSection(num) {
  document.querySelectorAll('.sb-section').forEach(s => s.classList.remove('active'));
  const id = sections[num];
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ======= Open / Close / Toggle =======
function openScoreboard() {
  // cancel pending close
  hideToken++;
  if (closingTimer) { clearTimeout(closingTimer); closingTimer = null; }

  const order = getOrder();
  if (order.length === 0) return;

  const panel = document.getElementById('scoreboardPanel');
  panel.style.display = 'flex';
  requestAnimationFrame(() => panel.classList.add('open'));

  currentSection = order[0];
  setActiveSection(currentSection);

  if (currentSection === 1) initializePlayers();
  if (currentSection === 3) renderHeistPage();

  startAutoRefresh();
  requestDataRefresh();
}

function closeScoreboard() {
  currentSection = 0;
  const panel = document.getElementById('scoreboardPanel');

  panel.classList.remove('open');

  hideToken++;
  const myToken = hideToken;
  if (closingTimer) { clearTimeout(closingTimer); }
  closingTimer = setTimeout(() => {
    if (myToken !== hideToken) return;
    panel.style.display = 'none';
    try {
      fetch(`https://${RES}/notifyClosed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: '{}'
      });
    } catch (_) {}
    closingTimer = null;
  }, 400);
  stopAutoRefresh();
}

function toggleNext() {
  const order = getOrder();
  if (order.length === 0) return;

  if (currentSection === 0) { openScoreboard(); return; }

  if (currentSection === 1) {
    const totalPages = Math.max(1, Math.ceil(totalPlayers.length / playersPerPage));
    if (totalPages > 1) {
      if (currentPage < totalPages) {
        currentPage++;
        renderPlayersPage();
        return;
      } else {
        if (order.length === 1) {
          currentPage = 1;
          renderPlayersPage();
          return;
        }
      }
    }
  }

  if (currentSection === 3) {
    const totalHeistPages = Math.max(1, Math.ceil(heistItems.length / heistPerPage));
    if (totalHeistPages > 1) {
      if (heistCurrentPage < totalHeistPages) {
        heistCurrentPage++;
        renderHeistPage();
        return;
      } else {
        if (order.length === 1) {
          heistCurrentPage = 1;
          renderHeistPage();
          return;
        }
      }
    }
  }

  const idx = order.indexOf(currentSection);
  const next = (idx === -1) ? order[0] : order[(idx + 1) % order.length];

  if (order.length > 1 && idx !== -1 && next === order[0]) { closeScoreboard(); return; }

  currentSection = next;
  currentPage = 1;
  heistCurrentPage = 1;
  setActiveSection(currentSection);

  if (currentSection === 1) initializePlayers();
  if (currentSection === 3) renderHeistPage();
}

// ======= Players =======
function initializePlayers() { renderPlayersPage(); }

function renderPlayersPage() {
  const grid = document.getElementById('playersGrid');
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = Math.min(startIndex + playersPerPage, totalPlayers.length);
  const playersToShow = totalPlayers.slice(startIndex, endIndex);

  grid.classList.add('changing');
  setTimeout(() => {
    grid.innerHTML = '';
    playersToShow.forEach((player, index) => {
      const card = createPlayerCard(player, index);
      grid.appendChild(card);
    });
    updatePaginationInfo();
    grid.classList.remove('changing');
    restartCardAnimations();
  }, 80);
}

function createPlayerCard(player, index) {
  const card = document.createElement('div');
  card.className = 'player-card';
  card.style.animationDelay = `${index * 16}ms`;

  const avatar = (player.name || '?').charAt(0).toUpperCase();
  const jobTag = player.job ? `<div class="job-tag visible">${player.job}</div>` : '';

  card.innerHTML = `
    <div class="player-card-header">
      <div class="player-avatar">${avatar}</div>
      <div class="player-info">
        <div class="player-name">${player.name ?? 'Unknown'}</div>
        <div class="player-id">ID: ${player.id ?? '-'}</div>
      </div>
    </div>
    <div class="player-card-footer">
      <div class="player-stats">
        <div class="ping-badge">${player.ping ?? 0}ms</div>
        ${jobTag}
      </div>
    </div>
  `;
  return card;
}

function updatePaginationInfo() {
  const totalPages = Math.max(1, Math.ceil(totalPlayers.length / playersPerPage));
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
}

function restartCardAnimations() {
  document.querySelectorAll('.player-card').forEach((card) => {
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = `cardFadeIn 260ms ease-out forwards`;
  });
}

// ======= Heist (paging) =======
function renderHeistPage() {
  const content = document.getElementById('heistContent');
  if (!content) return;

  const totalPages = Math.max(1, Math.ceil(heistItems.length / heistPerPage));
  const startIndex = (heistCurrentPage - 1) * heistPerPage;
  const endIndex = Math.min(startIndex + heistPerPage, heistItems.length);
  const items = heistItems.slice(startIndex, endIndex);

  content.innerHTML = '';
  items.forEach(item => {
    const statusClass = item.policeCount >= item.requiredPolice ? 'ready' : 'locked';
    const statusText  = item.policeCount >= item.requiredPolice ? 'READY' : 'LOCKED';
    const el = document.createElement('div');
    el.className = 'heist-item';
    el.innerHTML = `
      <div class="heist-header">
        <div class="heist-label">${item.name}</div>
        <div class="heist-status ${statusClass}">${statusText}</div>
      </div>
      <div class="heist-count">
        Police: <span class="number">${item.policeCount}</span>
        / Need: <span class="number">${item.requiredPolice}</span>
      </div>
    `;
    content.appendChild(el);
  });
  updateHeistPaginationInfo();
}

function updateHeistPaginationInfo() {
  const el = document.getElementById('heistPageInfo');
  if (!el) return;
  const totalPages = Math.max(1, Math.ceil(heistItems.length / heistPerPage));
  el.textContent = `${heistCurrentPage} / ${totalPages}`;
}

// ======= Auto refresh =======
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => requestDataRefresh(), REFRESH_INTERVAL_MS);
}
function stopAutoRefresh() {
  if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
}
function requestDataRefresh() {
  try {
    fetch(`https://${RES}/requestRefresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({})
    });
  } catch (_) {}
}

// ======= NUI Message Handlers =======
window.addEventListener('message', (event) => {
  const data = event.data || {};
  switch (data.action) {
    case 'setup':
      if (data.payload) {
        if (data.payload.sections) {
          enabled.players   = !!data.payload.sections.players;
          enabled.whitelist = !!data.payload.sections.whitelist;
          enabled.heist     = !!data.payload.sections.heist;
        }
        if (typeof data.payload.playersPerPage === 'number' && data.payload.playersPerPage > 0) {
          playersPerPage = data.payload.playersPerPage | 0;
        }
        if (typeof data.payload.heistPerPage === 'number' && data.payload.heistPerPage > 0) {
          heistPerPage = data.payload.heistPerPage | 0;
        }
      }
      break;

    case 'open':
      openScoreboard();
      break;

    case 'toggle':
      toggleNext();
      break;

    case 'close':
      closeScoreboard();
      break;

    case 'refresh':
      if (data.payload) {
        const badge = document.querySelector('.sb-players-count');
        badge.textContent = `Players ${data.payload.players} / ${data.payload.max}`;
      }
      break;

    case 'updateCounts':
      if (data.payload) {
        if (Array.isArray(data.payload.playersOnline)) {
          totalPlayers = [...data.payload.playersOnline].sort((a,b)=>(a.id||0)-(b.id||0));
          currentPage = 1;
          if (currentSection === 1) renderPlayersPage(); else updatePaginationInfo();
        }
        if (Array.isArray(data.payload.whitelistJobs)) updateWhitelistJobs(data.payload.whitelistJobs);
        if (Array.isArray(data.payload.heist)) {
          heistItems = data.payload.heist;
          heistCurrentPage = 1;
          if (currentSection === 3) renderHeistPage(); else updateHeistPaginationInfo();
        }
      }
      break;
  }
});

// Init / Cleanup
document.addEventListener('DOMContentLoaded', () => { totalPlayers = []; heistItems = []; });
window.addEventListener('beforeunload', () => stopAutoRefresh());

/* ======= Whitelist / Heist helpers (unchanged besides paging) ======= */
function updateWhitelistJobs(jobs) {
  if (!Array.isArray(jobs)) return;
  const content = document.getElementById('whitelistContent');
  content.innerHTML = '';
  jobs.forEach(job => {
    const item = document.createElement('div');
    item.className = 'job-item';
    item.innerHTML = `
      <div class="job-left">
        <div class="job-status ${job.count > 0 ? 'active' : ''}"></div>
        <div class="job-label">${job.name}</div>
      </div>
      <div class="job-count">${job.count} OnDuty</div>
    `;
    content.appendChild(item);
  });
}