// ============================================================
// Folketingsvalg 2026 – Application
// ============================================================

let modelResults = null;
let currentView = 'overview';
let currentSort = { field: 'probability', dir: 'desc' };
let currentPage = 0;
const PAGE_SIZE = 30;

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    showLoading();
    setTimeout(() => {
        const model = new ElectionModel();
        modelResults = model.runMonteCarlo(1000);
        hideLoading();
        populateFilters();
        renderView('overview');
        bindEvents();
        updateHeroStats();
    }, 50);
});

function showLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Beregner valgprognose...</p>
            <p class="loading-sub">Kører 1.000 simuleringer</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}

function updateHeroStats() {
    document.getElementById('total-candidates').textContent = modelResults.candidates.length;
    document.getElementById('total-parties').textContent = Object.keys(PARTIES).length;
}

// ---- Event Binding ----
function bindEvents() {
    // Nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderView(tab.dataset.view);
        });
    });

    // Filters
    document.getElementById('filter-party').addEventListener('change', () => renderCurrentView());
    document.getElementById('filter-constituency').addEventListener('change', () => renderCurrentView());
    document.getElementById('filter-status').addEventListener('change', () => renderCurrentView());
    document.getElementById('filter-search').addEventListener('input', debounce(() => renderCurrentView(), 200));

    // Sort headers
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (currentSort.field === field) {
                currentSort.dir = currentSort.dir === 'desc' ? 'asc' : 'desc';
            } else {
                currentSort = { field, dir: field === 'name' ? 'asc' : 'desc' };
            }
            document.querySelectorAll('.sortable').forEach(t => t.classList.remove('active-sort', 'sort-asc', 'sort-desc'));
            th.classList.add('active-sort', currentSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');
            renderCurrentView();
        });
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('candidate-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// ---- Filters ----
function populateFilters() {
    const partySelect = document.getElementById('filter-party');
    Object.entries(PARTIES)
        .sort((a, b) => (modelResults.parties[b[0]]?.meanSeats || 0) - (modelResults.parties[a[0]]?.meanSeats || 0))
        .forEach(([key, p]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${p.short} – ${p.name}`;
            partySelect.appendChild(opt);
        });

    const constSelect = document.getElementById('filter-constituency');
    Object.keys(CONSTITUENCIES).sort().forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        constSelect.appendChild(opt);
    });
}

function getFilteredCandidates() {
    const partyFilter = document.getElementById('filter-party').value;
    const constFilter = document.getElementById('filter-constituency').value;
    const statusFilter = document.getElementById('filter-status').value;
    const searchFilter = document.getElementById('filter-search').value.toLowerCase();

    let candidates = [...modelResults.candidates];

    if (partyFilter) candidates = candidates.filter(c => c.party === partyFilter);
    if (constFilter) candidates = candidates.filter(c => c.constituency === constFilter);
    if (statusFilter) candidates = candidates.filter(c => c.status === statusFilter);
    if (searchFilter) candidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchFilter) ||
        PARTIES[c.party]?.name.toLowerCase().includes(searchFilter)
    );

    // Sort
    candidates.sort((a, b) => {
        let va, vb;
        switch (currentSort.field) {
            case 'name': va = a.name; vb = b.name; break;
            case 'party': va = a.party; vb = b.party; break;
            case 'constituency': va = a.constituency; vb = b.constituency; break;
            case 'probability': va = a.probability; vb = b.probability; break;
            case 'status': va = statusOrder(a.status); vb = statusOrder(b.status); break;
            default: va = a.probability; vb = b.probability;
        }
        if (typeof va === 'string') {
            return currentSort.dir === 'asc' ? va.localeCompare(vb, 'da') : vb.localeCompare(va, 'da');
        }
        return currentSort.dir === 'asc' ? va - vb : vb - va;
    });

    return candidates;
}

function statusOrder(s) {
    return { safe: 4, likely: 3, tossup: 2, unlikely: 1 }[s] || 0;
}

// ---- View Rendering ----
function renderView(view) {
    currentView = view;
    currentPage = 0;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');

    const filtersBar = document.getElementById('filters-bar');
    filtersBar.style.display = (view === 'candidates') ? '' : 'none';

    switch (view) {
        case 'overview': renderOverview(); break;
        case 'parties': renderParties(); break;
        case 'candidates': renderCandidates(); break;
        case 'constituencies': renderConstituencies(); break;
    }
}

function renderCurrentView() {
    currentPage = 0;
    switch (currentView) {
        case 'candidates': renderCandidates(); break;
    }
}

// ---- Overview ----
function renderOverview() {
    renderSeatChart();
    renderPartyBars();
    renderBlocs();
    renderTopCandidates();
}

function renderSeatChart() {
    const container = document.getElementById('seat-chart');
    const seats = modelResults.nationalSeats;

    // Create a parliament-style hemicycle
    const partyOrder = Object.entries(seats)
        .filter(([, s]) => s > 0)
        .sort((a, b) => {
            const blocOrder = { 'rød': 0, 'midten': 1, 'blå': 2 };
            return (blocOrder[PARTIES[a[0]].bloc] || 1) - (blocOrder[PARTIES[b[0]].bloc] || 1);
        });

    let seatDots = '';
    const allSeats = [];
    for (const [party, count] of partyOrder) {
        for (let i = 0; i < count; i++) {
            allSeats.push(party);
        }
    }

    // Arrange in hemicycle rows
    const rows = 8;
    const seatsPerRow = [];
    let remaining = allSeats.length;
    for (let r = 0; r < rows; r++) {
        const n = Math.round(remaining / (rows - r));
        seatsPerRow.push(n);
        remaining -= n;
    }

    let seatIdx = 0;
    const svgWidth = 600;
    const svgHeight = 320;
    const cx = svgWidth / 2;
    const cy = svgHeight - 20;

    let svgContent = '';
    for (let r = 0; r < rows; r++) {
        const radius = 100 + r * 28;
        const n = seatsPerRow[r];
        for (let i = 0; i < n && seatIdx < allSeats.length; i++) {
            const angle = Math.PI * (0.08 + (i / (n - 1 || 1)) * 0.84);
            const x = cx - radius * Math.cos(angle);
            const y = cy - radius * Math.sin(angle);
            const party = allSeats[seatIdx];
            svgContent += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="${PARTIES[party].color}" class="seat-dot" data-party="${party}">
                <title>${PARTIES[party].name}: ${seats[party]} mandater</title>
            </circle>`;
            seatIdx++;
        }
    }

    container.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="hemicycle">
            ${svgContent}
            <text x="${cx}" y="${cy - 20}" text-anchor="middle" class="hemicycle-total">${TOTAL_SEATS}</text>
            <text x="${cx}" y="${cy}" text-anchor="middle" class="hemicycle-label">mandater</text>
        </svg>
    `;
}

function renderPartyBars() {
    const container = document.getElementById('party-bars');
    const parties = Object.entries(modelResults.parties)
        .filter(([, p]) => p.meanSeats > 0)
        .sort((a, b) => b[1].meanSeats - a[1].meanSeats);

    container.innerHTML = parties.map(([key, p]) => {
        const change = p.meanSeats - p.seats2022;
        const changeStr = change > 0 ? `+${change}` : `${change}`;
        const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        const barWidth = (p.meanSeats / 50) * 100;

        return `
            <div class="party-bar-row" onclick="showPartyDetail('${key}')">
                <div class="party-bar-label">
                    <span class="party-dot" style="background:${p.color}"></span>
                    <span class="party-letter">${p.short}</span>
                    <span class="party-name-short">${p.name}</span>
                </div>
                <div class="party-bar-track">
                    <div class="party-bar-fill" style="width:${barWidth}%;background:${p.color}">
                        <span class="party-bar-seats">${p.meanSeats}</span>
                    </div>
                    <div class="party-bar-range" style="left:${(p.minSeats/50)*100}%;width:${((p.maxSeats-p.minSeats)/50)*100}%"></div>
                </div>
                <div class="party-bar-change ${changeClass}">${changeStr}</div>
                <div class="party-bar-pct">${p.pollPct.toFixed(1)}%</div>
            </div>
        `;
    }).join('');
}

function renderBlocs() {
    const container = document.getElementById('bloc-container');
    const blocs = { rød: { name: 'Rød blok', seats: 0, parties: [], color: '#e74c3c' },
                    midten: { name: 'Midten', seats: 0, parties: [], color: '#8e44ad' },
                    blå: { name: 'Blå blok', seats: 0, parties: [], color: '#3498db' } };

    for (const [key, p] of Object.entries(modelResults.parties)) {
        const bloc = PARTIES[key].bloc;
        if (blocs[bloc]) {
            blocs[bloc].seats += p.meanSeats;
            if (p.meanSeats > 0) blocs[bloc].parties.push({ key, ...p });
        }
    }

    container.innerHTML = Object.values(blocs).map(b => `
        <div class="bloc-card">
            <div class="bloc-header" style="border-color:${b.color}">
                <h3>${b.name}</h3>
                <span class="bloc-seats">${b.seats} mandater</span>
            </div>
            <div class="bloc-parties">
                ${b.parties.sort((a, b) => b.meanSeats - a.meanSeats).map(p => `
                    <div class="bloc-party">
                        <span class="party-dot" style="background:${p.color}"></span>
                        <span>${p.short}</span>
                        <span class="bloc-party-seats">${p.meanSeats}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bloc-bar" style="background:${b.color};width:${(b.seats/TOTAL_SEATS)*100}%"></div>
        </div>
    `).join('');
}

function renderTopCandidates() {
    const container = document.getElementById('top-candidates');
    const top = modelResults.candidates.slice(0, 12);

    container.innerHTML = top.map((c, i) => `
        <div class="candidate-card" onclick="openCandidateModal('${escapeAttr(c.name)}', '${c.party}', '${escapeAttr(c.constituency)}')">
            <div class="candidate-rank">#${i + 1}</div>
            <div class="candidate-avatar" style="background:${PARTIES[c.party].color}">
                ${getInitials(c.name)}
            </div>
            <div class="candidate-info">
                <h4>${c.name}</h4>
                <div class="candidate-meta">
                    <span class="party-badge" style="background:${PARTIES[c.party].color}">${c.party}</span>
                    <span class="constituency-tag">${c.constituency.replace(' Storkreds', '')}</span>
                </div>
                ${c.notable ? `<div class="candidate-notable">${c.notable}</div>` : ''}
            </div>
            <div class="candidate-prob">
                <div class="prob-circle ${c.status}">
                    <svg viewBox="0 0 36 36">
                        <path class="prob-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        <path class="prob-fill" stroke="${PARTIES[c.party].color}" stroke-dasharray="${(c.probability * 100).toFixed(0)}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    </svg>
                    <span class="prob-text">${(c.probability * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ---- Parties View ----
function renderParties() {
    const container = document.getElementById('parties-grid');
    const parties = Object.entries(modelResults.parties)
        .sort((a, b) => b[1].meanSeats - a[1].meanSeats);

    container.innerHTML = parties.map(([key, p]) => {
        const change = p.meanSeats - p.seats2022;
        const changeStr = change > 0 ? `+${change}` : `${change}`;
        const aboveThresholdPct = (p.aboveThreshold * 100).toFixed(0);

        return `
            <div class="party-detail-card" onclick="showPartyDetail('${key}')" style="border-top:4px solid ${p.color}">
                <div class="party-detail-header">
                    <div class="party-detail-letter" style="background:${p.color}">${p.short}</div>
                    <div>
                        <h3>${p.name}</h3>
                        <p class="party-leader">${p.leader}</p>
                    </div>
                </div>
                <div class="party-detail-stats">
                    <div class="party-stat">
                        <span class="stat-value">${p.pollPct.toFixed(1)}%</span>
                        <span class="stat-desc">Meningsmåling</span>
                    </div>
                    <div class="party-stat">
                        <span class="stat-value">${p.meanSeats}</span>
                        <span class="stat-desc">Forventede mandater</span>
                    </div>
                    <div class="party-stat">
                        <span class="stat-value ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}">${changeStr}</span>
                        <span class="stat-desc">Ift. 2022</span>
                    </div>
                    <div class="party-stat">
                        <span class="stat-value">${p.minSeats}–${p.maxSeats}</span>
                        <span class="stat-desc">90% interval</span>
                    </div>
                </div>
                <div class="party-seat-bar">
                    <div class="party-seat-fill" style="width:${(p.meanSeats/TOTAL_SEATS)*100}%;background:${p.color}"></div>
                </div>
                ${p.pollPct < THRESHOLD ? `<div class="threshold-warning">Under spærregrænsen (${THRESHOLD}%)</div>` : ''}
                ${p.aboveThreshold < 1 ? `<div class="threshold-chance">${aboveThresholdPct}% chance for at komme over spærregrænsen</div>` : ''}
            </div>
        `;
    }).join('');
}

function showPartyDetail(partyKey) {
    // Filter candidates by party
    document.getElementById('filter-party').value = partyKey;
    document.getElementById('filter-constituency').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-search').value = '';
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-view="candidates"]').classList.add('active');
    renderView('candidates');
}

// ---- Candidates Table ----
function renderCandidates() {
    const candidates = getFilteredCandidates();
    const start = currentPage * PAGE_SIZE;
    const pageCandidates = candidates.slice(start, start + PAGE_SIZE);

    const tbody = document.getElementById('candidates-tbody');
    tbody.innerHTML = pageCandidates.map((c, i) => `
        <tr class="candidate-row" onclick="openCandidateModal('${escapeAttr(c.name)}', '${c.party}', '${escapeAttr(c.constituency)}')">
            <td class="rank-cell">${start + i + 1}</td>
            <td class="name-cell">
                <div class="candidate-avatar-sm" style="background:${PARTIES[c.party].color}">${getInitials(c.name)}</div>
                <div>
                    <span class="candidate-name">${c.name}</span>
                    ${c.notable ? `<span class="notable-badge">${c.notable}</span>` : ''}
                    ${c.incumbent ? '<span class="incumbent-badge">MF</span>' : ''}
                </div>
            </td>
            <td>
                <span class="party-badge" style="background:${PARTIES[c.party].color}">${c.party} – ${PARTIES[c.party].name}</span>
            </td>
            <td class="const-cell">${c.constituency.replace(' Storkreds', '')}</td>
            <td class="prob-cell">
                <div class="prob-bar-wrapper">
                    <div class="prob-bar" style="width:${(c.probability*100)}%;background:${getStatusColor(c.status)}"></div>
                    <span class="prob-label">${(c.probability * 100).toFixed(1)}%</span>
                </div>
            </td>
            <td>
                <span class="status-badge status-${c.status}">${statusLabel(c.status)}</span>
            </td>
        </tr>
    `).join('');

    // Pagination
    const totalPages = Math.ceil(candidates.length / PAGE_SIZE);
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
        pagination.innerHTML = `<span class="page-info">Viser ${candidates.length} kandidater</span>`;
    } else {
        let paginationHtml = `<span class="page-info">Side ${currentPage + 1} af ${totalPages} (${candidates.length} kandidater)</span><div class="page-buttons">`;
        if (currentPage > 0) paginationHtml += `<button onclick="changePage(${currentPage - 1})" class="page-btn">Forrige</button>`;
        for (let p = 0; p < totalPages; p++) {
            paginationHtml += `<button onclick="changePage(${p})" class="page-btn ${p === currentPage ? 'active' : ''}">${p + 1}</button>`;
        }
        if (currentPage < totalPages - 1) paginationHtml += `<button onclick="changePage(${currentPage + 1})" class="page-btn">Næste</button>`;
        paginationHtml += '</div>';
        pagination.innerHTML = paginationHtml;
    }
}

function changePage(page) {
    currentPage = page;
    renderCandidates();
    document.getElementById('candidates-table').scrollIntoView({ behavior: 'smooth' });
}

// ---- Constituencies ----
function renderConstituencies() {
    const container = document.getElementById('constituencies-grid');

    container.innerHTML = Object.entries(CONSTITUENCIES).map(([name, c]) => {
        const constCandidates = modelResults.candidates.filter(
            cand => cand.constituency === name && cand.probability > 0.1
        ).slice(0, 10);

        // Party seat breakdown for this constituency
        const partySeats = {};
        for (const party of Object.keys(PARTIES)) {
            const seats = modelResults.nationalSeats[party] || 0;
            if (seats > 0) {
                const model = new ElectionModel();
                const cSeats = model.allocateConstituencySeats(party, seats);
                if (cSeats[name] > 0) {
                    partySeats[party] = cSeats[name];
                }
            }
        }

        return `
            <div class="constituency-card">
                <div class="constituency-header">
                    <h3>${name.replace(' Storkreds', '')}</h3>
                    <span class="constituency-seats">${c.seats} mandater</span>
                </div>
                <div class="constituency-region">${c.region}</div>
                <div class="constituency-party-dots">
                    ${Object.entries(partySeats).sort((a,b) => b[1]-a[1]).map(([party, seats]) => `
                        <div class="const-party-tag" style="background:${PARTIES[party].color}20;color:${PARTIES[party].color};border:1px solid ${PARTIES[party].color}40">
                            ${party}: ${seats}
                        </div>
                    `).join('')}
                </div>
                <div class="constituency-candidates">
                    ${constCandidates.map(c => `
                        <div class="const-candidate" onclick="openCandidateModal('${escapeAttr(c.name)}', '${c.party}', '${escapeAttr(c.constituency)}')">
                            <span class="const-cand-name">${c.name}</span>
                            <span class="party-dot-sm" style="background:${PARTIES[c.party].color}"></span>
                            <span class="const-cand-prob">${(c.probability*100).toFixed(0)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ---- Candidate Modal ----
function openCandidateModal(name, party, constituency) {
    const candidate = modelResults.candidates.find(
        c => c.name === name && c.party === party && c.constituency === constituency
    );
    if (!candidate) return;

    const key = candidate.name + '|' + candidate.party + '|' + candidate.constituency;
    const history = modelResults.probabilityHistory[key] || [];

    const modal = document.getElementById('candidate-modal');
    const content = document.getElementById('modal-content');

    // Build sparkline chart
    const chartWidth = 500;
    const chartHeight = 180;
    let chartSvg = '';

    if (history.length > 1) {
        const maxProb = Math.max(...history.map(h => h.probability), 0.1);
        const points = history.map((h, i) => {
            const x = (i / (history.length - 1)) * (chartWidth - 40) + 20;
            const y = chartHeight - 30 - (h.probability / Math.max(maxProb, 1)) * (chartHeight - 60);
            return { x, y, ...h };
        });

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
        const areaD = pathD + ` L ${points[points.length-1].x.toFixed(1)} ${chartHeight - 30} L ${points[0].x.toFixed(1)} ${chartHeight - 30} Z`;

        chartSvg = `
            <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="trend-chart">
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${PARTIES[candidate.party].color}" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="${PARTIES[candidate.party].color}" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>
                <!-- Grid lines -->
                ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = chartHeight - 30 - pct * (chartHeight - 60);
                    return `<line x1="20" y1="${y}" x2="${chartWidth-20}" y2="${y}" stroke="#e0e0e0" stroke-width="0.5"/>
                            <text x="16" y="${y + 4}" text-anchor="end" class="chart-label">${(pct * maxProb * 100).toFixed(0)}%</text>`;
                }).join('')}
                <!-- Date labels -->
                ${points.filter((_, i) => i % 3 === 0 || i === points.length - 1).map(p =>
                    `<text x="${p.x}" y="${chartHeight - 8}" text-anchor="middle" class="chart-label">${p.date.slice(5)}</text>`
                ).join('')}
                <path d="${areaD}" fill="url(#chartGrad)"/>
                <path d="${pathD}" fill="none" stroke="${PARTIES[candidate.party].color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                ${points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${PARTIES[candidate.party].color}" stroke="white" stroke-width="1.5">
                    <title>${p.date}: ${(p.probability * 100).toFixed(1)}%</title>
                </circle>`).join('')}
            </svg>
        `;
    }

    const change = history.length >= 2
        ? ((history[history.length-1].probability - history[0].probability) * 100).toFixed(1)
        : null;
    const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';

    content.innerHTML = `
        <div class="modal-candidate-header">
            <div class="modal-avatar" style="background:${PARTIES[candidate.party].color}">
                ${getInitials(candidate.name)}
            </div>
            <div class="modal-candidate-info">
                <h2>${candidate.name}</h2>
                <div class="modal-meta">
                    <span class="party-badge" style="background:${PARTIES[candidate.party].color}">${candidate.party} – ${PARTIES[candidate.party].name}</span>
                    <span class="constituency-tag">${candidate.constituency}</span>
                </div>
                ${candidate.notable ? `<div class="modal-notable">${candidate.notable}</div>` : ''}
            </div>
            <div class="modal-prob">
                <div class="modal-prob-number" style="color:${PARTIES[candidate.party].color}">${(candidate.probability * 100).toFixed(1)}%</div>
                <div class="modal-prob-label">sandsynlighed</div>
                <span class="status-badge status-${candidate.status}">${statusLabel(candidate.status)}</span>
            </div>
        </div>

        <div class="modal-stats-grid">
            <div class="modal-stat">
                <span class="modal-stat-value">${candidate.listPosition}</span>
                <span class="modal-stat-label">Listeplacering</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${candidate.personalVotes2022.toLocaleString('da-DK')}</span>
                <span class="modal-stat-label">Personlige stemmer 2022</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${candidate.incumbent ? 'Ja' : 'Nej'}</span>
                <span class="modal-stat-label">Siddende MF</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value ${changeClass}">${change !== null ? (change > 0 ? '+' + change : change) + ' pp' : '–'}</span>
                <span class="modal-stat-label">Udvikling siden jan.</span>
            </div>
        </div>

        <div class="modal-chart-section">
            <h3>Sandsynlighed over tid</h3>
            <p class="chart-subtitle">Udvikling baseret på skiftende meningsmålinger</p>
            ${chartSvg || '<p class="no-data">Ikke nok data til at vise trend</p>'}
        </div>

        <div class="modal-party-section">
            <h3>Partiets situation</h3>
            <div class="modal-party-stats">
                <span>${PARTIES[candidate.party].name}: <strong>${modelResults.parties[candidate.party]?.pollPct.toFixed(1)}%</strong> i meningsmålinger</span>
                <span>Forventede mandater: <strong>${modelResults.parties[candidate.party]?.meanSeats}</strong> (${modelResults.parties[candidate.party]?.minSeats}–${modelResults.parties[candidate.party]?.maxSeats})</span>
                <span>2022-resultat: <strong>${ELECTION_2022[candidate.party]?.seats || 0} mandater</strong> (${ELECTION_2022[candidate.party]?.pct || 0}%)</span>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('candidate-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---- Utilities ----
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function getStatusColor(status) {
    return { safe: '#27ae60', likely: '#2980b9', tossup: '#f39c12', unlikely: '#e74c3c' }[status] || '#999';
}

function statusLabel(status) {
    return { safe: 'Sikker', likely: 'Sandsynlig', tossup: 'Usikker', unlikely: 'Usandsynlig' }[status] || status;
}
