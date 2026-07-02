/* ============================================
   You should not need to edit this file.
   To add pages, edit pages.json and drop a .md
   file in the /pages folder. See README.md.
   ============================================ */

let allPages = [];
let itemsData = null; // cached contents of items.json, loaded on first visit to the Item Database page
let mapsData = null; // cached contents of maps.json, loaded on first visit to the Maps page

async function init() {
  const res = await fetch('pages.json');
  allPages = await res.json();
  buildSidebar(allPages);

  // Load a page based on the URL (e.g. index.html#stone-golem), or the first page by default
  const requested = location.hash.replace('#', '');
  const startPage = allPages.find(p => p.file === requested) || allPages[0];
  if (startPage) loadPage(startPage.file);

  document.getElementById('search-box').addEventListener('input', onSearch);
  window.addEventListener('hashchange', () => {
    const file = location.hash.replace('#', '');
    const page = allPages.find(p => p.file === file);
    if (page) loadPage(page.file);
  });
}

function buildSidebar(pages) {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '';

  if (pages.length === 0) {
    sidebar.innerHTML = '<p class="sidebar-empty">No pages yet.</p>';
    return;
  }

  // Group pages by category so the sidebar stays organized as the wiki grows
  const categories = {};
  for (const page of pages) {
    const cat = page.category || 'Pages';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(page);
  }

  for (const cat of Object.keys(categories)) {
    const heading = document.createElement('div');
    heading.className = 'sidebar-category';
    heading.textContent = cat;
    sidebar.appendChild(heading);

    for (const page of categories[cat]) {
      const link = document.createElement('a');
      link.href = '#' + page.file;
      link.className = 'sidebar-link';
      link.textContent = page.title;
      link.dataset.file = page.file;
      link.addEventListener('click', () => loadPage(page.file));
      sidebar.appendChild(link);
    }
  }
}

async function loadPage(file) {
  const contentInner = document.getElementById('content-inner');
  contentInner.innerHTML = '<p>Loading...</p>';
  const page = allPages.find(p => p.file === file);

  // Data-driven pages (Item Database, Maps) use the full content width instead
  // of the narrower reading width used for prose pages.
  contentInner.classList.toggle('content-wide', !!(page && (page.type === 'items' || page.type === 'maps')));

  try {
    if (page && page.type === 'items') {
      await renderItemsPage(contentInner);
    } else if (page && page.type === 'maps') {
      await renderMapsPage(contentInner);
    } else {
      const res = await fetch('pages/' + file);
      if (!res.ok) throw new Error('Page not found');
      const markdown = await res.text();
      contentInner.innerHTML = marked.parse(markdown);
    }
  } catch (err) {
    contentInner.innerHTML = '<h1>Page not found</h1><p>That page could not be loaded.</p>';
  }

  // Highlight the active link in the sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.file === file);
  });

  window.scrollTo(0, 0);
}

function onSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    buildSidebar(allPages);
    return;
  }
  const filtered = allPages.filter(p => p.title.toLowerCase().includes(query));
  buildSidebar(filtered);
}

/* ============================================
   Item Database
   Data lives in items.json. To add a new item,
   add an object to that file — no code changes
   needed. Stats/slots/classes/types shown in the
   filter dropdowns are read straight from the data.
   ============================================ */

const ITEM_STAT_ORDER = ['STR', 'STA', 'AGI', 'DEX', 'WIS', 'INT', 'CHA', 'HP', 'MANA'];
const ITEM_RESIST_ORDER = ['FIRE', 'COLD', 'MAGIC', 'POISON', 'DISEASE', 'CORRUPTION'];

function itemRatio(item) {
  if (item.damage == null || !item.delay) return null;
  return item.damage / item.delay;
}

function formatStats(item) {
  const parts = ITEM_STAT_ORDER
    .filter(stat => item.stats && item.stats[stat])
    .map(stat => `${stat} +${item.stats[stat]}`);
  const resistParts = ITEM_RESIST_ORDER
    .filter(res => item.resists && item.resists[res])
    .map(res => `SV ${res} +${item.resists[res]}`);
  const all = [...parts, ...resistParts];
  return all.length ? all.join(', ') : '—';
}

function formatSlot(item) {
  return item.twoHanded ? `${item.slot} (2H)` : item.slot;
}

function formatList(values) {
  if (!values || !values.length) return '—';
  if (values.includes('ALL')) return 'All';
  return values.join(', ');
}

function itemSearchHaystack(item) {
  const ratio = itemRatio(item);
  return [
    item.name,
    item.type,
    formatSlot(item),
    item.twoHanded ? 'two handed' : '',
    item.skill,
    formatStats(item),
    formatList(item.classes),
    formatList(item.race),
    item.ac != null ? `AC ${item.ac}` : '',
    item.damage != null ? `DMG ${item.damage}` : '',
    item.delay != null ? `DELAY ${item.delay}` : '',
    ratio != null ? `RATIO ${ratio.toFixed(2)}` : '',
    (item.tags || []).join(' '),
    item.description || '',
    item.effect || ''
  ].join(' ').toLowerCase();
}

async function renderItemsPage(container) {
  if (!itemsData) {
    const res = await fetch('items.json');
    if (!res.ok) throw new Error('Could not load items.json');
    itemsData = await res.json();
  }

  const slots = [...new Set(itemsData.map(i => i.slot))].sort();
  const types = [...new Set(itemsData.map(i => i.type))].sort();
  const classes = [...new Set(itemsData.flatMap(i => i.classes).filter(c => c !== 'ALL'))].sort();
  const races = [...new Set(itemsData.flatMap(i => i.race).filter(r => r !== 'ALL'))].sort();
  const tags = [...new Set(itemsData.flatMap(i => i.tags || []))].sort();

  container.innerHTML = `
    <h1>Item Database</h1>
    <p>Browse, search, filter, and sort every item on the wiki. Hover an item's name to see a screenshot.</p>
    <div class="items-toolbar">
      <input type="search" id="items-search" class="items-search" placeholder="Search name, stat, class..." autocomplete="off">
      <select id="items-filter-type" class="items-select">
        <option value="">All types</option>
        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select id="items-filter-slot" class="items-select">
        <option value="">All slots</option>
        ${slots.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="items-filter-class" class="items-select">
        <option value="">All classes</option>
        ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="items-filter-race" class="items-select">
        <option value="">All races</option>
        ${races.map(r => `<option value="${r}">${r}</option>`).join('')}
      </select>
      <select id="items-filter-tag" class="items-select">
        <option value="">All tags</option>
        ${tags.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select id="items-sort" class="items-select">
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="ac-desc">AC (High-Low)</option>
        <option value="ratio-desc">Ratio (High-Low)</option>
        <option value="ratio-asc">Ratio (Low-High)</option>
      </select>
    </div>
    <p class="items-count" id="items-count"></p>
    <div class="items-table-wrap">
      <table class="items-table">
        <colgroup>
          <col class="col-name">
          <col class="col-type">
          <col class="col-slot">
          <col class="col-ac">
          <col class="col-stats">
          <col class="col-dmg">
          <col class="col-weight">
          <col class="col-classes">
          <col class="col-race">
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Slot</th>
            <th>AC</th>
            <th>Stats</th>
            <th>Dmg / Delay / Ratio</th>
            <th>Weight / Size</th>
            <th>Classes</th>
            <th>Race</th>
          </tr>
        </thead>
        <tbody id="items-tbody"></tbody>
      </table>
    </div>
  `;

  setupItemTooltip(container.querySelector('#items-tbody'));

  const searchBox = container.querySelector('#items-search');
  const typeFilter = container.querySelector('#items-filter-type');
  const slotFilter = container.querySelector('#items-filter-slot');
  const classFilter = container.querySelector('#items-filter-class');
  const raceFilter = container.querySelector('#items-filter-race');
  const tagFilter = container.querySelector('#items-filter-tag');
  const sortSelect = container.querySelector('#items-sort');

  function update() {
    const query = searchBox.value.toLowerCase().trim();
    const type = typeFilter.value;
    const slot = slotFilter.value;
    const cls = classFilter.value;
    const race = raceFilter.value;
    const tag = tagFilter.value;

    let filtered = itemsData.filter(item => {
      if (type && item.type !== type) return false;
      if (slot && item.slot !== slot) return false;
      if (cls && !item.classes.includes('ALL') && !item.classes.includes(cls)) return false;
      if (race && !item.race.includes('ALL') && !item.race.includes(race)) return false;
      if (tag && !(item.tags || []).includes(tag)) return false;
      if (query && !itemSearchHaystack(item).includes(query)) return false;
      return true;
    });

    const [sortKey, sortDir] = sortSelect.value.split('-');
    filtered.sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (sortKey === 'ac') { av = a.ac ?? -Infinity; bv = b.ac ?? -Infinity; }
      else { av = itemRatio(a) ?? -Infinity; bv = itemRatio(b) ?? -Infinity; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    renderItemRows(container.querySelector('#items-tbody'), filtered);
    container.querySelector('#items-count').textContent =
      `Showing ${filtered.length} of ${itemsData.length} items`;
  }

  [searchBox].forEach(el => el.addEventListener('input', update));
  [typeFilter, slotFilter, classFilter, raceFilter, tagFilter, sortSelect].forEach(el => el.addEventListener('change', update));

  update();
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderItemRows(tbody, items) {
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="items-empty">No items match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const ratio = itemRatio(item);
    const dmgCell = item.damage != null
      ? `${item.damage} / ${item.delay}${ratio != null ? ` = ${ratio.toFixed(2)}` : ''}`
      : '—';
    const flavorText = [item.effect, item.description].filter(Boolean).join('\n\n');
    const titleAttr = flavorText ? ` title="${escapeAttr(flavorText)}"` : '';

    return `
      <tr>
        <td>
          <span class="item-name-hover" data-img="${item.image}" data-alt="${item.name}"${titleAttr}>${(item.tags || []).map(t => `<span class="badge-tag">${t}</span> `).join('')}${item.name}</span>
        </td>
        <td>${item.type}</td>
        <td>${formatSlot(item)}</td>
        <td>${item.ac != null ? item.ac : '—'}</td>
        <td>${formatStats(item)}</td>
        <td>${dmgCell}</td>
        <td>${item.weight} / ${item.size}</td>
        <td>${formatList(item.classes)}</td>
        <td>${formatList(item.race)}</td>
      </tr>
    `;
  }).join('');
}

// A single floating preview image, shared by every row, positioned in the
// viewport on hover so it's never clipped by the table's scroll container.
function setupItemTooltip(tbody) {
  let tooltip = document.getElementById('item-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('img');
    tooltip.id = 'item-tooltip';
    document.body.appendChild(tooltip);
  }

  tbody.addEventListener('mouseover', e => {
    const span = e.target.closest('.item-name-hover');
    if (!span) return;
    const rect = span.getBoundingClientRect();
    tooltip.src = span.dataset.img;
    tooltip.alt = span.dataset.alt;
    tooltip.style.display = 'block';

    const left = Math.min(rect.left, window.innerWidth - 296);
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 220 && rect.top > spaceBelow) {
      tooltip.style.top = '';
      tooltip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    } else {
      tooltip.style.bottom = '';
      tooltip.style.top = (rect.bottom + 8) + 'px';
    }
    tooltip.style.left = Math.max(left, 8) + 'px';
  });

  tbody.addEventListener('mouseout', e => {
    const span = e.target.closest('.item-name-hover');
    if (!span) return;
    if (span.contains(e.relatedTarget)) return;
    tooltip.style.display = 'none';
  });
}

/* ============================================
   Maps
   Data lives in maps.json (array of {name, slug, image}).
   To add a map, add an entry there and drop the full-size
   image in images/Maps/ — no code changes needed.
   ============================================ */

async function renderMapsPage(container) {
  if (!mapsData) {
    const res = await fetch('maps.json');
    if (!res.ok) throw new Error('Could not load maps.json');
    mapsData = await res.json();
  }

  const sorted = [...mapsData].sort((a, b) => a.name.localeCompare(b.name));

  if (!sorted.length) {
    container.innerHTML = '<h1>Maps</h1><p>No maps yet.</p>';
    return;
  }

  container.innerHTML = `
    <h1>Maps</h1>
    <p>Click a map to view it full size. Scroll to zoom, click and drag to pan.</p>
    <div class="maps-grid">
      ${sorted.map(m => `
        <div class="map-card" data-img="${m.image}" data-name="${m.name}">
          <img class="map-card-thumb" src="${m.image}" alt="${m.name}" loading="lazy">
          <div class="map-card-name">${m.name}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => openMapViewer(card.dataset.img, card.dataset.name));
  });
}

// Full-size map viewer with scroll-to-zoom and click-and-drag panning.
// A single overlay is created once and reused for every map.
let mapViewerScale = 1;
let mapViewerX = 0;
let mapViewerY = 0;
let mapViewerDragging = false;
let mapViewerMoved = false;
let mapViewerStartX = 0;
let mapViewerStartY = 0;

function applyMapViewerTransform() {
  const img = document.getElementById('map-viewer-img');
  img.style.transform = `translate(${mapViewerX}px, ${mapViewerY}px) scale(${mapViewerScale})`;
}

function setupMapViewer() {
  if (document.getElementById('map-viewer')) return;

  const viewer = document.createElement('div');
  viewer.id = 'map-viewer';
  viewer.innerHTML = `
    <button id="map-viewer-close" aria-label="Close">&times;</button>
    <img id="map-viewer-img" alt="">
    <div id="map-viewer-hint">Scroll to zoom &middot; drag to pan</div>
  `;
  document.body.appendChild(viewer);

  const img = viewer.querySelector('#map-viewer-img');

  viewer.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    mapViewerScale = Math.min(6, Math.max(0.5, mapViewerScale * factor));
    applyMapViewerTransform();
  }, { passive: false });

  img.addEventListener('mousedown', e => {
    e.preventDefault();
    mapViewerDragging = true;
    mapViewerMoved = false;
    mapViewerStartX = e.clientX - mapViewerX;
    mapViewerStartY = e.clientY - mapViewerY;
    img.classList.add('dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!mapViewerDragging) return;
    mapViewerMoved = true;
    mapViewerX = e.clientX - mapViewerStartX;
    mapViewerY = e.clientY - mapViewerStartY;
    applyMapViewerTransform();
  });

  window.addEventListener('mouseup', () => {
    mapViewerDragging = false;
    img.classList.remove('dragging');
  });

  // Click outside the image closes the viewer, but not right after a drag.
  viewer.addEventListener('click', e => {
    if (mapViewerMoved) { mapViewerMoved = false; return; }
    if (e.target === viewer) closeMapViewer();
  });

  viewer.querySelector('#map-viewer-close').addEventListener('click', closeMapViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMapViewer();
  });
}

function openMapViewer(src, name) {
  setupMapViewer();
  const viewer = document.getElementById('map-viewer');
  const img = document.getElementById('map-viewer-img');
  img.src = src;
  img.alt = name;
  mapViewerScale = 1;
  mapViewerX = 0;
  mapViewerY = 0;
  applyMapViewerTransform();
  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMapViewer() {
  const viewer = document.getElementById('map-viewer');
  if (!viewer) return;
  viewer.classList.remove('open');
  document.body.style.overflow = '';
}

init();
