/* ============================================
   You should not need to edit this file.
   To add pages, edit pages.json and drop a .md
   file in the /pages folder. See README.md.
   ============================================ */

let allPages = [];
let itemsData = null; // cached contents of items.json
let mapsData = null; // cached contents of maps.json, loaded on first visit to the Maps page
let craftingData = null; // cached contents of crafting.json
let tradeskillsData = null; // cached contents of tradeskills.json
let gemstonesData = null; // cached contents of gemstones.json
let monstersData = null; // cached contents of monsters.json

// Set by the header search box when jumping straight to a specific item or
// crafting recipe, then consumed (and cleared) by the corresponding render
// function so the user lands directly on what they searched for.
let pendingItemQuery = null;
let pendingCraftingTradeskill = null;
// Set alongside pendingItemQuery (by goToItem) so the Item Database opens
// directly on that item's category list instead of the category grid —
// same idea as pendingCraftingTradeskill jumping past the tradeskill grid.
let pendingItemCategory = null;
// Set when jumping to an item from a recipe's component list, so the Item
// Database can show a "back to that recipe" link. Same consume-once pattern.
let pendingReturnToRecipe = null;
// Same idea as pendingReturnToRecipe, but for jumping to an item from a
// monster's drop table instead of a recipe's component list.
let pendingReturnToMonster = null;
// Set by the header search box (or the Monsters page's own quick search) when
// jumping straight to a specific monster, then consumed by renderMonstersPage
// so its search box is pre-filled — same pattern as pendingItemQuery.
let pendingMonsterQuery = null;
// Set by goToRecipe so the recipe just navigated to (e.g. via an item's
// "Crafted via"/"Used to craft" links) flashes once its card renders, making
// it easy to spot among the rest of that tradeskill's recipe grid.
let pendingHighlightRecipe = null;
// Same idea as pendingHighlightRecipe, but for a specific item's row in the
// Item Database table — set by goToItem so a search-result click flashes the
// row once it renders, instead of just silently scrolling the page.
let pendingHighlightItem = null;
// Same idea again, for a monster's row on the Monsters page — set by
// goToMonster so a header/quick-search result flashes the right row.
let pendingHighlightMonster = null;
// Set by renderCraftingRecipes when it scrolls to a highlighted recipe, so
// loadPage's normal "reset scroll to top on navigation" doesn't immediately
// cancel that scroll.
let suppressScrollReset = false;

async function ensureItemsData() {
  if (!itemsData) {
    const res = await fetch('items.json');
    if (!res.ok) throw new Error('Could not load items.json');
    itemsData = await res.json();
  }
  return itemsData;
}

async function ensureCraftingData() {
  if (!tradeskillsData) {
    const res = await fetch('tradeskills.json');
    if (!res.ok) throw new Error('Could not load tradeskills.json');
    tradeskillsData = await res.json();
  }
  if (!craftingData) {
    const res = await fetch('crafting.json');
    if (!res.ok) throw new Error('Could not load crafting.json');
    craftingData = await res.json();
  }
  return craftingData;
}

async function ensureGemstonesData() {
  if (!gemstonesData) {
    const res = await fetch('gemstones.json');
    if (!res.ok) throw new Error('Could not load gemstones.json');
    gemstonesData = await res.json();
  }
  return gemstonesData;
}

async function ensureMonstersData() {
  if (!monstersData) {
    const res = await fetch('monsters.json');
    if (!res.ok) throw new Error('Could not load monsters.json');
    monstersData = await res.json();
  }
  return monstersData;
}

async function init() {
  const res = await fetch('pages.json');
  allPages = await res.json();
  buildSidebar(allPages);

  // Load a page based on the URL (e.g. index.html#stone-golem), or the first page by default
  const requested = location.hash.replace('#', '');
  const startPage = allPages.find(p => p.file === requested) || allPages[0];
  if (startPage) loadPage(startPage.file);

  // Pre-fetch item/crafting/monster data in the background so the header
  // search box can search them right away, without waiting for the user to
  // first visit the Item Database, Crafting, or Monsters page.
  ensureItemsData().catch(() => {});
  ensureCraftingData().catch(() => {});
  ensureMonstersData().catch(() => {});

  const searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', onSearch);
  searchBox.addEventListener('focus', () => {
    if (searchBox.value.trim()) openSearchResults();
  });
  window.addEventListener('hashchange', () => {
    const file = location.hash.replace('#', '');
    const page = allPages.find(p => p.file === file);
    if (page) loadPage(page.file);
  });

  // Clicking anywhere outside the search box/dropdown closes the dropdown.
  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search')) closeSearchResults();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearchResults();
  });

  document.getElementById('site-title').addEventListener('click', e => {
    e.preventDefault();
    if (!allPages[0]) return;
    clearSearch();
    const alreadyHome = location.hash.replace('#', '') === allPages[0].file;
    location.hash = allPages[0].file;
    if (alreadyHome) loadPage(allPages[0].file);
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

  // Data-driven pages (Item Database, Maps, Crafting, Monsters) use the full
  // content width instead of the narrower reading width used for prose pages.
  contentInner.classList.toggle('content-wide', !!(page && (page.type === 'items' || page.type === 'maps' || page.type === 'crafting' || page.type === 'monsters')));

  try {
    if (page && page.type === 'items') {
      await renderItemsPage(contentInner);
    } else if (page && page.type === 'maps') {
      await renderMapsPage(contentInner);
    } else if (page && page.type === 'crafting') {
      await renderCraftingPage(contentInner);
    } else if (page && page.type === 'monsters') {
      await renderMonstersPage(contentInner);
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

  if (suppressScrollReset) {
    suppressScrollReset = false;
  } else {
    window.scrollTo(0, 0);
  }
}

function onSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    closeSearchResults();
    return;
  }
  renderSearchResults(query);
}

function openSearchResults() {
  document.getElementById('search-results').classList.add('open');
}

function closeSearchResults() {
  document.getElementById('search-results').classList.remove('open');
}

function clearSearch() {
  document.getElementById('search-box').value = '';
  closeSearchResults();
}

// The header search box searches across everything on the wiki — pages,
// items, and crafting recipes — not just page titles, so someone searching
// for e.g. an item or material name ends up in the right place instead of
// just seeing an empty page list. Results render into a dropdown under the
// search box (#search-results) rather than replacing the sidebar, so the
// normal page navigation stays visible/usable while searching.
function renderSearchResults(query) {
  const results = document.getElementById('search-results');
  results.innerHTML = '';

  const matchedPages = allPages.filter(p => p.title.toLowerCase().includes(query));

  // Categories (item-type categories like "Jewelry" and crafting tradeskills
  // like "Jewelcrafting") surface above individual name matches — landing on
  // the category itself is more useful than scrolling past a pile of
  // individually-named items/recipes to find it. Combined and sorted
  // alphabetically together so e.g. "Jewelcrafting" and "Jewelry" both
  // appear at the top for a "jewel" search.
  const itemTypes = itemsData ? [...new Set(itemsData.map(i => i.type))] : [];
  const matchedItemCategories = itemTypes
    .filter(type => (ITEM_TYPE_LABELS[type] || type).toLowerCase().includes(query))
    .map(type => ({ kind: 'item', type, label: ITEM_TYPE_LABELS[type] || type }));
  const matchedCraftCategories = (tradeskillsData || [])
    .filter(ts => ts.name.toLowerCase().includes(query))
    .map(ts => ({ kind: 'craft', tradeskill: ts.name, label: ts.name }));
  const matchedCategories = [...matchedItemCategories, ...matchedCraftCategories]
    .sort((a, b) => a.label.localeCompare(b.label));

  // Individual name matches sort alphabetically (rather than data-file
  // order) now that they're a secondary section below categories.
  const matchedItems = (itemsData || [])
    .filter(item => itemSearchHaystack(item).includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8);
  const matchedRecipes = (craftingData || [])
    .filter(r => `${r.name} ${r.tradeskill}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8);
  const matchedMonsters = (monstersData || [])
    .filter(m => monsterSearchHaystack(m).includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8);

  if (!matchedCategories.length && !matchedPages.length && !matchedItems.length && !matchedRecipes.length && !matchedMonsters.length) {
    results.innerHTML = '<p class="search-results-empty">No results found.</p>';
    openSearchResults();
    return;
  }

  function addSection(label, entries, makeLink) {
    if (!entries.length) return;
    const heading = document.createElement('div');
    heading.className = 'search-result-category';
    heading.textContent = label;
    results.appendChild(heading);
    entries.forEach(entry => results.appendChild(makeLink(entry)));
  }

  addSection('Categories', matchedCategories, category => {
    const link = document.createElement('a');
    link.href = category.kind === 'item' ? '#items' : '#crafting';
    link.className = 'search-result-link';
    link.textContent = category.kind === 'item' ? category.label : `${category.label} (Crafting)`;
    link.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      if (category.kind === 'item') goToItemCategory(category.type);
      else goToCraftingCategory(category.tradeskill);
    });
    return link;
  });

  addSection('Pages', matchedPages, page => {
    const link = document.createElement('a');
    link.href = '#' + page.file;
    link.className = 'search-result-link';
    link.textContent = page.title;
    link.addEventListener('click', () => {
      clearSearch();
      loadPage(page.file);
    });
    return link;
  });

  addSection('Items', matchedItems, item => {
    const link = document.createElement('a');
    link.href = '#items';
    link.className = 'search-result-link';
    link.textContent = item.name;
    link.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      goToItem(item);
    });
    return link;
  });

  addSection('Crafting', matchedRecipes, recipe => {
    const link = document.createElement('a');
    link.href = '#crafting';
    link.className = 'search-result-link';
    link.textContent = `${recipe.name} (${recipe.tradeskill})`;
    link.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      goToRecipe(recipe);
    });
    return link;
  });

  addSection('Monsters', matchedMonsters, monster => {
    const link = document.createElement('a');
    link.href = '#monsters';
    link.className = 'search-result-link';
    link.textContent = monster.name;
    link.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      goToMonster(monster);
    });
    return link;
  });

  openSearchResults();
}

// `returnTo` is either a recipe object (from a recipe's own component list —
// the existing case) or `{ kind: 'monster', name, slug }` (from a monster's
// drop table) — distinguished by the `kind` tag so the two "back to X" links
// on the Item Database don't collide. Recipe callers predate the `kind` tag
// and don't set it, so the absence of `kind` still means "recipe".
function goToItem(item, returnTo) {
  pendingItemQuery = item.name;
  pendingItemCategory = item.type;
  pendingHighlightItem = item.slug;
  if (returnTo && returnTo.kind === 'monster') {
    pendingReturnToRecipe = null;
    pendingReturnToMonster = returnTo;
  } else {
    pendingReturnToRecipe = returnTo || null;
    pendingReturnToMonster = null;
  }
  const alreadyThere = location.hash.replace('#', '') === 'items';
  location.hash = 'items';
  if (alreadyThere) loadPage('items');
}

// Jumps straight to a whole item-type category's list (e.g. from a "Jewelry"
// category search result) rather than a single item — no query to pre-fill
// and nothing to flash, since the destination *is* the whole list.
function goToItemCategory(type) {
  pendingItemQuery = null;
  pendingItemCategory = type;
  pendingReturnToRecipe = null;
  pendingReturnToMonster = null;
  pendingHighlightItem = null;
  const alreadyThere = location.hash.replace('#', '') === 'items';
  location.hash = 'items';
  if (alreadyThere) loadPage('items');
}

function goToRecipe(recipe) {
  pendingCraftingTradeskill = recipe.tradeskill;
  pendingHighlightRecipe = recipe.slug;
  const alreadyThere = location.hash.replace('#', '') === 'crafting';
  location.hash = 'crafting';
  if (alreadyThere) loadPage('crafting');
}

// Same idea as goToItemCategory but for a whole tradeskill (e.g. from a
// "Jewelcrafting" category search result) — no specific recipe to highlight.
function goToCraftingCategory(tradeskillName) {
  pendingCraftingTradeskill = tradeskillName;
  pendingHighlightRecipe = null;
  const alreadyThere = location.hash.replace('#', '') === 'crafting';
  location.hash = 'crafting';
  if (alreadyThere) loadPage('crafting');
}

// Jumps to the Monsters page and flashes one monster's row — from a header
// search result, the Monsters page's own quick search, or an item's "Back to
// <Monster>" link (see pendingReturnToMonster). Works with either a full
// monster object or the minimal `{ name, slug }` shape goToItem stores for
// the return-to case, since only those two fields are needed here.
function goToMonster(monster) {
  pendingMonsterQuery = monster.name;
  pendingHighlightMonster = monster.slug;
  const alreadyThere = location.hash.replace('#', '') === 'monsters';
  location.hash = 'monsters';
  if (alreadyThere) loadPage('monsters');
}

// Case-insensitive lookup used to decide whether a recipe component name
// (e.g. "Rawhide Scraps") has a matching entry in the Item Database yet —
// most raw crafting materials don't, until someone adds a card for them.
function findItemByName(name) {
  return (itemsData || []).find(i => i.name.toLowerCase() === name.toLowerCase());
}

// Reverse lookups used by the item viewer's "Crafting" section: is this item
// the result of a recipe, and/or a component in other recipes.
function findRecipeForItem(itemName) {
  return (craftingData || []).find(r => r.name.toLowerCase() === itemName.toLowerCase());
}

function findRecipesUsingItem(itemName) {
  return (craftingData || []).filter(r =>
    (r.components || []).some(c => c.item.toLowerCase() === itemName.toLowerCase())
  );
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

/* ============================================
   Item type icons
   Shown in the item card header instead of a plain type-initial letter.
   Solid gold silhouettes (2026-07-06), redrawn from a reference sheet of the
   game's own equipment icons the user provided — not copied pixel-for-pixel
   (that sheet's icons are its own asset), but shape/proportions matched to
   it. Replaced an earlier outline/stroke style the user was never fully
   happy with. Every shape here is closed and relies on the parent
   `.type-icon` SVG having `fill: currentColor` (see style.css) — no per-path
   fill/stroke attributes needed, so a card's icon always matches its card's
   accent color (gold on item cards, teal on recipe cards) automatically.
   Each entry is the inner markup for a 0 0 24 24 viewBox <svg>.
   ============================================ */
const ICON_DEFS = {
  sword: `<path d="M12 1 L13.3 5 L12.6 15.5 L11.4 15.5 L10.7 5 Z"/><rect x="7" y="15.5" width="10" height="1.6"/><rect x="11" y="17.1" width="2" height="4"/><circle cx="12" cy="22" r="1.4"/>`,
  sword2h: `<path d="M12 1 L13.6 4 L12.8 14 L11.2 14 L10.4 4 Z"/><rect x="6" y="14" width="12" height="1.8"/><rect x="10.8" y="15.8" width="2.4" height="6"/><circle cx="12" cy="22.5" r="1.5"/>`,
  dagger: `<path d="M12 6 L13 8.5 L12.5 15 L11.5 15 L11 8.5 Z"/><rect x="9.5" y="15" width="5" height="1.2"/><rect x="11" y="16.2" width="2" height="2.8"/><circle cx="12" cy="19.5" r="1"/>`,
  axe: `<rect x="11.3" y="2" width="1.4" height="20"/><path d="M12 5 C7 4 4.5 8 6.5 12.5 C9.2 11 11.5 7 12 5 Z"/>`,
  axe2h: `<rect x="11.2" y="1.5" width="1.6" height="21"/><path d="M12.3 3.5 C5.5 2.3 2 8.5 5 14.5 C9 12 11.7 6 12.3 3.5 Z"/>`,
  mace: `<rect x="11.2" y="9" width="1.6" height="13"/><circle cx="12" cy="6" r="3.6"/><path d="M12 0.8 L13.1 3.2 L10.9 3.2 Z"/><path d="M17.6 6 L15.2 7.1 L15.2 4.9 Z"/><path d="M6.4 6 L8.8 4.9 L8.8 7.1 Z"/><path d="M14.5 2.3 L13.9 4.5 L12.4 3 Z"/><path d="M9.5 2.3 L11.6 3 L10.1 4.5 Z"/>`,
  hammer: `<rect x="11.2" y="8" width="1.6" height="14"/><rect x="5.5" y="3.5" width="13" height="5" rx="1"/>`,
  maul2h: `<rect x="11.1" y="9" width="1.8" height="13"/><rect x="4.5" y="2.5" width="15" height="7" rx="1.2"/>`,
  spear: `<rect x="11.3" y="8" width="1.4" height="14"/><path d="M12 1 L14.3 8.5 L9.7 8.5 Z"/>`,
  scythe: `<rect x="11.6" y="7" width="1.3" height="15" transform="rotate(8 12 14)"/><path d="M17.5 4 C21 6 20 11 15.5 11.5 C12.5 11.8 10.5 10 10.8 8 C13 8.7 16 7 17.5 4 Z"/>`,
  bow: `<path d="M7.5 2 C1 7.5 1 16.5 7.5 22 C5 16.5 5.4 7.5 7.5 2 Z"/><rect x="7.1" y="2.5" width="0.6" height="19"/>`,
  ammo: `<path d="M6 20 L17 9 L18.4 10.4 L7.4 21.4 Z"/><path d="M15.5 6.5 L21 4 L18.5 9.5 Z"/><path d="M6 20 L4.5 15.5 L9 17 Z"/>`,
  throwing: `<path d="M5.5 18 L9 14.5 L9.8 15.3 L6.3 18.8 Z"/><path d="M9 14.5 L10.6 12.7 L10 14.9 Z"/><path d="M8.5 19.5 L12.5 15.5 L13.3 16.3 L9.3 20.3 Z"/><path d="M12.5 15.5 L14 13.8 L13.5 15.9 Z"/><path d="M12 21 L16 17 L16.8 17.8 L12.8 21.8 Z"/><path d="M16 17 L17.5 15.2 L17 17.4 Z"/>`,
  shield: `<path d="M12 2.2 L19 4.8 L19 11.5 C19 17 15.5 20.3 12 21.8 C8.5 20.3 5 17 5 11.5 L5 4.8 Z"/>`,
  plate: `<path d="M8 4.5 L10.3 4.5 L12 7.3 L13.7 4.5 L16 4.5 L17.3 9.5 L16.6 13.2 L7.4 13.2 L6.7 9.5 Z"/><path d="M7.6 14.4 L16.4 14.4 L15.7 21 L8.3 21 Z"/>`,
  chain: `<path d="M9.5 3 L14.5 3 L15.3 5.8 L18 7 L16.8 9.5 L15.6 8.5 L15.8 18 L14.6 18 L14.6 19.6 L13.4 18 L13.4 19.6 L12.2 18 L12.2 19.6 L11 18 L11 19.6 L9.8 18 L9.8 19.6 L8.6 18 L8.8 8.5 L7.6 9.5 L6.4 7 L9.1 5.8 Z"/>`,
  leather: `<path d="M9.5 3 L14.5 3 L15.5 6 L18 7.5 L16.7 10 L15.5 8.8 L15.7 21 L8.3 21 L8.5 8.8 L7.3 10 L6 7.5 L8.5 6 Z"/>`,
  cloth: `<path d="M9.3 3 C9.6 4.7 10.6 5.6 12 5.6 C13.4 5.6 14.4 4.7 14.7 3 L17.5 7.5 L18.6 21 L5.4 21 L6.5 7.5 Z"/>`,
  armor: `<path d="M8.2 4.5 C8.6 6.3 10.1 7.2 12 7.2 C13.9 7.2 15.4 6.3 15.8 4.5 L17.3 9 L16.6 21 L7.4 21 L6.7 9 Z"/>`,
  ring: `<path fill-rule="evenodd" d="M6.5 15 A5.5 5.5 0 1 0 17.5 15 A5.5 5.5 0 1 0 6.5 15 Z M9 15 A3 3 0 1 1 15 15 A3 3 0 1 1 9 15 Z"/><path d="M12 5 L14.4 8.6 L12 12.2 L9.6 8.6 Z"/>`,
  earring: `<path fill-rule="evenodd" d="M10 4 A2 2 0 1 0 14 4 A2 2 0 1 0 10 4 Z M11 4 A1 1 0 1 1 13 4 A1 1 0 1 1 11 4 Z"/><path d="M12 6.5 L14.3 11 L12 15.5 L9.7 11 Z"/>`,
  necklace: `<path fill-rule="evenodd" d="M12 2 C6.5 2 4.3 6 4.3 10.2 L6.7 10.2 C6.7 6.9 8.5 4.3 12 4.3 C15.5 4.3 17.3 6.9 17.3 10.2 L19.7 10.2 C19.7 6 17.5 2 12 2 Z"/><path d="M12 12 L14.6 16.8 L12 21.5 L9.4 16.8 Z"/>`,
  food: `<path d="M12 9 C7.5 9 5.5 12 5.5 15.3 C5.5 18.7 8.3 21.5 12 21.5 C15.7 21.5 18.5 18.7 18.5 15.3 C18.5 12 16.5 9 12 9 Z"/><path d="M12 9 C12 6.3 10.6 4.8 9.1 4.1 C8.7 5.9 9.6 7.6 12 9 Z"/>`,
  drink: `<path d="M6 6 L16.5 6 L16.5 20 C16.5 21.1 15.6 22 14.5 22 L8 22 C6.9 22 6 21.1 6 20 Z"/><path fill-rule="evenodd" d="M16.5 8.5 C20.5 8.5 20.5 15.5 16.5 15.5 L16.5 13.3 C18.3 13.3 18.3 10.7 16.5 10.7 Z"/>`,
  container: `<path d="M9 4.5 C9 6.7 10.3 8.3 12 8.3 C13.7 8.3 15 6.7 15 4.5 L15 3.3 L9 3.3 Z"/><path d="M7.5 9 L16.5 9 L18 21.3 C18.1 21.7 17.8 22 17.4 22 L6.6 22 C6.2 22 5.9 21.7 6 21.3 Z"/><path d="M9.3 11 L14.7 11 L13.8 15.3 L10.2 15.3 Z"/>`,
  blacksmithing: `<path d="M4 11 L15 11 L19.5 9 L19.5 12.5 L15 13.3 L15 15.5 L9.5 15.5 L9.5 13.3 L4 13.3 Z"/><path d="M10.5 15.5 L14.5 15.5 L15.5 21 L9.5 21 Z"/>`,
  tailoring: `<path fill-rule="evenodd" d="M12 2.5 C13.1 2.5 14 3.5 14 4.8 C14 6.1 13.1 7.1 12 7.1 C10.9 7.1 10 6.1 10 4.8 C10 3.5 10.9 2.5 12 2.5 Z M12 3.7 C12.5 3.7 12.9 4.2 12.9 4.8 C12.9 5.4 12.5 5.9 12 5.9 C11.5 5.9 11.1 5.4 11.1 4.8 C11.1 4.2 11.5 3.7 12 3.7 Z"/><path d="M11.4 7 L12.6 7 L13.4 20.5 L12 22 L10.6 20.5 Z"/><path d="M8.5 9 C10.3 9 10.6 11 8.8 11.4 C10.8 11.6 11 13.6 9.2 14 L8.9 12.9 C9.8 12.7 9.7 11.9 8.6 11.9 L8.9 10.8 C10 10.6 9.9 9.9 8.8 10 Z"/>`,
  material: `<path d="M6 14 L9 6 L15 5 L19 11 L17 19 L8 20 Z"/>`,
};

// Maps a tradeskill name to one of the icons above, for crafting-material
// items and recipe cards. Only tradeskills with a material actually linked
// as a crafting.json component (or their own recipe) need an entry — every
// other tradeskill falls back to the generic "material" icon (items) or its
// own initial letter (recipes) until one of its materials shows up, same
// extend-as-needed pattern as tags/sizes elsewhere in this file.
const TRADESKILL_ICON = {
  Blacksmithing: 'blacksmithing',
  Tailoring: 'tailoring',
};

function svgIcon(key) {
  return `<svg viewBox="0 0 24 24" class="type-icon">${ICON_DEFS[key] || ICON_DEFS.material}</svg>`;
}

// Weapon sub-type is derived from the existing skill/twoHanded/name fields —
// no separate schema field to keep in sync. Falls back to a plain sword for
// anything that doesn't match a known pattern.
function weaponIconKey(item) {
  const name = (item.name || '').toLowerCase();
  // Ammo (Arrow, Stonehead Arrow, ...) shares the Archery skill with actual
  // bows in the data, but it's a consumable projectile, not the bow itself —
  // same idea as Throwing weapons already getting their own category rather
  // than being lumped in with melee weapons of the same skill.
  if (item.slot === 'Ammo') return 'ammo';
  if (item.skill === 'Archery') return 'bow';
  if (item.skill === 'Throwing') return 'throwing';
  if (item.skill === 'Stabbing') return name.includes('dagger') ? 'dagger' : 'spear';
  if (item.skill === 'Slashing') {
    if (name.includes('axe')) return item.twoHanded ? 'axe2h' : 'axe';
    if (name.includes('scythe')) return 'scythe';
    return item.twoHanded ? 'sword2h' : 'sword';
  }
  if (item.skill === 'Blunt') {
    if (item.twoHanded) return 'maul2h';
    return name.includes('hammer') ? 'hammer' : 'mace';
  }
  return 'sword';
}

// Armor material is guessed from the item name (Plate/Chain/Rawhide-Leather/
// Cloth), same as the game's own naming convention for crafted armor lines.
// Shields are checked first since they're their own category, not a
// material tier. Anything that doesn't match a known material falls back to
// a plain armor icon rather than guessing wrong.
function armorIconKey(item) {
  const name = (item.name || '').toLowerCase();
  if (item.slot === 'Secondary' || name.includes('shield') || name.includes('buckler')) return 'shield';
  if (name.includes('plate')) return 'plate';
  if (name.includes('chain')) return 'chain';
  if (name.includes('rawhide') || name.includes('hide') || name.includes('leather')) return 'leather';
  if (name.includes('cloth')) return 'cloth';
  return 'armor';
}

function jewelryIconKey(item) {
  if (item.slot === 'Ear') return 'earring';
  if (item.slot === 'Neck') return 'necklace';
  return 'ring';
}

// A crafting material can belong to more than one tradeskill (crafted by
// one, consumed as a component by another) — collect every tradeskill it
// touches via crafting.json and show one icon per tradeskill, in the order
// first seen. Falls back to a generic raw-material icon if it isn't linked
// to any recipe yet.
function craftingIconKeys(item) {
  const tradeskills = [];
  const ownRecipe = findRecipeForItem(item.name);
  if (ownRecipe) tradeskills.push(ownRecipe.tradeskill);
  findRecipesUsingItem(item.name).forEach(r => {
    if (!tradeskills.includes(r.tradeskill)) tradeskills.push(r.tradeskill);
  });
  if (!tradeskills.length) return ['material'];
  return tradeskills.map(ts => TRADESKILL_ICON[ts] || 'material');
}

// Human-readable label per icon key, shown as a small category line under
// the item name on its card (see renderItemCardHTML). Kept in one place so
// it never drifts out of sync with ICON_DEFS.
const ICON_LABELS = {
  sword: 'Sword', sword2h: 'Two-Handed Sword', dagger: 'Dagger', axe: 'Axe',
  axe2h: 'Greataxe', mace: 'Mace', hammer: 'Hammer', maul2h: 'Maul',
  spear: 'Spear', scythe: 'Scythe', bow: 'Bow', ammo: 'Ammo', throwing: 'Throwing Weapon',
  shield: 'Shield', plate: 'Plate Armor', chain: 'Chain Armor',
  leather: 'Leather Armor', cloth: 'Cloth Armor', armor: 'Armor',
  ring: 'Ring', earring: 'Earring', necklace: 'Necklace', food: 'Food',
  drink: 'Drink', container: 'Container', blacksmithing: 'Blacksmithing Material',
  tailoring: 'Tailoring Material', material: 'Crafting Material',
};

// The icon key(s) for an item's card header — usually one, but a Misc
// crafting material can have several (one per tradeskill it's part of).
// Shared by itemIconHTML (the icon glyphs) and itemCategoryLabel (the text
// under the item's name) so the two never disagree with each other.
function itemIconKeys(item) {
  if (item.type === 'Weapon') return [weaponIconKey(item)];
  if (item.type === 'Armor') return [armorIconKey(item)];
  if (item.type === 'Jewelry') return [jewelryIconKey(item)];
  if (item.type === 'Food') return ['food'];
  if (item.type === 'Drink') return ['drink'];
  if (item.type === 'Container') return ['container'];
  if (item.type === 'Misc') return craftingIconKeys(item);
  return ['material'];
}

function itemIconHTML(item) {
  return itemIconKeys(item).map(svgIcon).join('');
}

function itemCategoryLabel(item) {
  return itemIconKeys(item).map(k => ICON_LABELS[k] || 'Item').join(', ');
}

// Generic icon + plural display label per item.type, used one level up from
// the per-item sub-type icons above (itemIconKeys) — the Item Database's
// category grid (see renderItemsCategories) just needs "this card is
// Weapons", not "this card is a Two-Handed Sword".
const ITEM_TYPE_ICON = {
  Weapon: 'sword', Armor: 'armor', Jewelry: 'ring', Container: 'container',
  Food: 'food', Drink: 'drink', Misc: 'material',
};
const ITEM_TYPE_LABELS = {
  Weapon: 'Weapons', Armor: 'Armor', Jewelry: 'Jewelry', Container: 'Containers',
  Food: 'Food', Drink: 'Drinks', Misc: 'Misc',
};

// Armor gets one extra level of browsing (material, then slot) before
// landing on the actual item table — see renderArmorMaterials/renderArmorSlots.
// Reuses armorIconKey's existing material guess (already used for the item
// card icon) rather than a separate schema field. Fixed display order (light
// to heavy, Shields/Other last) rather than alphabetical, and only materials
// that actually have an item show up (same "derive from data" rule as every
// other filter/dropdown in this file).
const ARMOR_MATERIAL_ORDER = ['cloth', 'leather', 'chain', 'plate', 'shield', 'armor'];
const ARMOR_MATERIAL_LABELS = {
  cloth: 'Cloth', leather: 'Leather', chain: 'Chain', plate: 'Plate',
  shield: 'Shields', armor: 'Other',
};

function itemRatio(item) {
  if (item.damage == null || !item.delay) return null;
  return item.damage / item.delay;
}

// Shared by formatStats() (comma text, used in the table + search) and the
// item card's stat chips (see renderItemCardHTML) so the "which stats/
// resists/haste does this item have" logic only lives in one place.
// Most stat/resist bonuses are positive, but a resist can be negative (e.g.
// a corruption-themed item with "SV Corruption: -5") — only prepend "+" when
// the number itself doesn't already carry a "-" sign.
function formatSigned(n) {
  return n < 0 ? `${n}` : `+${n}`;
}

function statEntries(item) {
  const entries = [];
  ITEM_STAT_ORDER.forEach(stat => {
    if (item.stats && item.stats[stat]) entries.push({ label: stat, value: formatSigned(item.stats[stat]) });
  });
  ITEM_RESIST_ORDER.forEach(res => {
    if (item.resists && item.resists[res]) entries.push({ label: `SV ${res}`, value: formatSigned(item.resists[res]) });
  });
  if (item.haste) entries.push({ label: 'Haste', value: `${formatSigned(item.haste)}%` });
  return entries;
}

function formatStats(item) {
  const entries = statEntries(item);
  return entries.length ? entries.map(e => `${e.label} ${e.value}`).join(', ') : '—';
}

function formatCapacity(item) {
  return item.capacity != null ? `${item.capacity} / ${item.maxSize}` : '—';
}

function formatSlot(item) {
  if (!item.slot) return '—';
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
    item.effect || '',
    item.capacity != null ? `CAPACITY ${item.capacity}` : '',
    item.maxSize ? `MAX SIZE ${item.maxSize}` : ''
  ].join(' ').toLowerCase();
}

async function renderItemsPage(container) {
  await ensureItemsData();

  // Landed here from a header search result for a specific item — jump
  // straight to that item's category instead of the category grid (same
  // pattern as pendingCraftingTradeskill on the Crafting page).
  if (pendingItemCategory) {
    const category = pendingItemCategory;
    pendingItemCategory = null;
    // A category-only jump (e.g. clicking "Armor" as a search result, with
    // no specific item) still goes through Armor's material grid, same as
    // clicking the category card directly. A specific-item jump (pendingItemQuery
    // set alongside) skips straight to the flat, unscoped list instead — the
    // point there is to find one item wherever it lives, not to pick a material.
    if (category === 'Armor' && !pendingItemQuery) {
      renderArmorMaterials(container);
      return;
    }
    renderItemsList(container, category);
    return;
  }

  renderItemsCategories(container);
}

// Top-level Item Database view: one card per item.type (Weapon, Armor,
// Jewelry, Container, Food, Drink, Misc) with its item count, mirroring the
// Crafting page's tradeskill grid (see renderCraftingCategories). Clicking a
// card drills into renderItemsList, which holds the actual search/filter/
// sort table, scoped to just that category — except Armor, which drills into
// renderArmorMaterials first (material, then slot) since it has enough items
// to be worth splitting further; every other category goes straight to the
// table same as before.
function renderItemsCategories(container) {
  const types = [...new Set(itemsData.map(i => i.type))].sort();

  container.innerHTML = `
    <h1>Item Database</h1>
    <p>Browse items by category, or search below to jump straight to a specific item.</p>
    <div class="items-quick-search">
      <input type="search" id="items-quick-search-box" class="items-search items-quick-search-box" placeholder="Search all items by name, stat, class..." autocomplete="off">
      <div id="items-quick-search-results" class="items-quick-search-results"></div>
    </div>
    <div class="items-category-grid">
      ${types.map(type => {
        const count = itemsData.filter(i => i.type === type).length;
        const icon = ITEM_TYPE_ICON[type] || 'material';
        const label = ITEM_TYPE_LABELS[type] || type;
        return `
          <div class="items-category-card" data-type="${escapeAttr(type)}">
            <div class="items-category-card-icon">${svgIcon(icon)}</div>
            <div class="items-category-card-body">
              <div class="items-category-card-name">${escapeAttr(label)}</div>
              <div class="items-category-card-count">${count} item${count === 1 ? '' : 's'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.items-category-card').forEach(card => {
    if (card.dataset.type === 'Armor') {
      card.addEventListener('click', () => renderArmorMaterials(container));
    } else {
      card.addEventListener('click', () => renderItemsList(container, card.dataset.type));
    }
  });

  // A shortcut past the whole category → (material →) slot drill-down for
  // anyone who already knows what they're looking for. Scoped to items.json
  // only (unlike the header search box, which also covers pages/recipes) so
  // results stay relevant to this page. Clicking a result reuses goToItem —
  // same category-jump + row-flash behavior as a header search result.
  const quickSearchBox = container.querySelector('#items-quick-search-box');
  const quickSearchResults = container.querySelector('#items-quick-search-results');

  quickSearchBox.addEventListener('input', () => {
    const query = quickSearchBox.value.toLowerCase().trim();
    if (!query) {
      quickSearchResults.classList.remove('open');
      quickSearchResults.innerHTML = '';
      return;
    }

    const matches = itemsData
      .filter(item => itemSearchHaystack(item).includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20);

    quickSearchResults.innerHTML = matches.length
      ? matches.map(item => `
          <a href="#" class="search-result-link items-quick-search-result" data-slug="${escapeAttr(item.slug)}">
            ${escapeAttr(item.name)}
            <span class="items-quick-search-type">${escapeAttr(ITEM_TYPE_LABELS[item.type] || item.type)}</span>
          </a>
        `).join('')
      : '<p class="search-results-empty">No items match.</p>';
    quickSearchResults.classList.add('open');

    quickSearchResults.querySelectorAll('.items-quick-search-result').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const item = itemsData.find(i => i.slug === link.dataset.slug);
        if (item) goToItem(item);
      });
    });
  });
}

// Armor's first drill-down level: one card per material (Cloth/Leather/
// Chain/Plate/Shields/Other — see ARMOR_MATERIAL_ORDER), each showing how
// many armor items use that material. Clicking one drills into
// renderArmorSlots for that material's slot breakdown.
function renderArmorMaterials(container) {
  const armorItems = itemsData.filter(i => i.type === 'Armor');
  const materials = ARMOR_MATERIAL_ORDER.filter(m => armorItems.some(i => armorIconKey(i) === m));

  container.innerHTML = `
    <p class="items-back-link"><a href="#" id="items-back-to-categories">&larr; All categories</a></p>
    <h1>Armor</h1>
    <p>Browse armor by material. Click a material to see its item slots.</p>
    <div class="items-category-grid">
      ${materials.map(material => {
        const count = armorItems.filter(i => armorIconKey(i) === material).length;
        const label = ARMOR_MATERIAL_LABELS[material] || material;
        return `
          <div class="items-category-card" data-material="${escapeAttr(material)}">
            <div class="items-category-card-icon">${svgIcon(material)}</div>
            <div class="items-category-card-body">
              <div class="items-category-card-name">${escapeAttr(label)}</div>
              <div class="items-category-card-count">${count} item${count === 1 ? '' : 's'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelector('#items-back-to-categories').addEventListener('click', e => {
    e.preventDefault();
    renderItemsCategories(container);
  });

  container.querySelectorAll('.items-category-card').forEach(card => {
    card.addEventListener('click', () => renderArmorSlots(container, card.dataset.material));
  });
}

// Armor's second drill-down level: one card per item.slot within the chosen
// material (Chest/Legs/Head/...), derived from the data same as every other
// slot list in this file. Clicking one finally opens the real item table
// (renderItemsList), scoped to both the material and the slot.
function renderArmorSlots(container, material) {
  const materialItems = itemsData.filter(i => i.type === 'Armor' && armorIconKey(i) === material);
  const materialLabel = ARMOR_MATERIAL_LABELS[material] || material;
  const slots = [...new Set(materialItems.map(i => i.slot))].filter(Boolean).sort();

  container.innerHTML = `
    <p class="items-back-link"><a href="#" id="items-back-to-materials">&larr; All armor materials</a></p>
    <h1>${escapeAttr(materialLabel)} Armor</h1>
    <p>Browse ${escapeAttr(materialLabel.toLowerCase())} armor by slot.</p>
    <div class="items-category-grid">
      ${slots.map(slot => {
        const count = materialItems.filter(i => i.slot === slot).length;
        return `
          <div class="items-category-card" data-slot="${escapeAttr(slot)}">
            <div class="items-category-card-body">
              <div class="items-category-card-name">${escapeAttr(slot)}</div>
              <div class="items-category-card-count">${count} item${count === 1 ? '' : 's'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelector('#items-back-to-materials').addEventListener('click', e => {
    e.preventDefault();
    renderArmorMaterials(container);
  });

  container.querySelectorAll('.items-category-card').forEach(card => {
    card.addEventListener('click', () => renderItemsList(container, 'Armor', { material, slot: card.dataset.slot }));
  });
}

// One category's full item table — search box, slot/class/race/tag/max-size
// filters (options scoped to just this category, so e.g. Weapons doesn't
// show Jewelry's classes in its dropdown), click-to-sort columns, and the
// existing hover/click card behavior. The "Type" column/filter from the old
// flat table is gone since it's now implied by which category you're in.
// `scope` (optional) further narrows an Armor list down to one material/slot
// combination, set when arriving via renderArmorSlots — every other category,
// and any Armor list reached via search (see renderItemsPage), leaves it unset
// and shows the full, unscoped category same as before.
function renderItemsList(container, category, scope) {
  const categoryItems = itemsData.filter(i => {
    if (i.type !== category) return false;
    if (scope) {
      if (armorIconKey(i) !== scope.material) return false;
      if (i.slot !== scope.slot) return false;
    }
    return true;
  });
  const categoryLabel = ITEM_TYPE_LABELS[category] || category;

  // Scoped Armor lists (material + slot) get their own heading/subtitle and
  // a back link that returns to the slot grid instead of the top category
  // grid — the unscoped case (every other category, plus an Armor list
  // reached via search) keeps the original heading/back-link wording.
  const materialLabel = scope ? (ARMOR_MATERIAL_LABELS[scope.material] || scope.material) : null;
  const heading = scope ? `${materialLabel} Armor — ${scope.slot}` : categoryLabel;
  const subtitleLabel = scope ? `${materialLabel.toLowerCase()} ${scope.slot.toLowerCase()}` : categoryLabel.toLowerCase();
  const backLabel = scope ? `All ${materialLabel} armor slots` : 'All categories';

  // Landed here from a recipe's component list — remember which recipe so
  // we can show a link back to it, instead of leaving the user stranded.
  const returnToRecipe = pendingReturnToRecipe;
  pendingReturnToRecipe = null;

  // Same idea, but for a monster's drop table.
  const returnToMonster = pendingReturnToMonster;
  pendingReturnToMonster = null;

  // Landed here from a search result for one specific item — flash its row
  // once the table renders, same idea as pendingHighlightRecipe on the
  // Crafting page.
  const highlightSlug = pendingHighlightItem;
  pendingHighlightItem = null;

  const slots = [...new Set(categoryItems.map(i => i.slot))].filter(Boolean).sort();
  const classes = [...new Set(categoryItems.flatMap(i => i.classes || []).filter(c => c !== 'ALL'))].sort();
  const races = [...new Set(categoryItems.flatMap(i => i.race || []).filter(r => r !== 'ALL'))].sort();
  const tags = [...new Set(categoryItems.flatMap(i => i.tags || []))].sort();
  const maxSizes = [...new Set(categoryItems.map(i => i.maxSize).filter(Boolean))].sort();

  container.innerHTML = `
    ${returnToRecipe ? `<p class="items-back-link"><a href="#" id="items-back-to-recipe">&larr; Back to ${escapeAttr(returnToRecipe.name)}</a></p>` : ''}
    ${returnToMonster ? `<p class="items-back-link"><a href="#" id="items-back-to-monster">&larr; Back to ${escapeAttr(returnToMonster.name)}</a></p>` : ''}
    <p class="items-back-link"><a href="#" id="items-back-to-categories">&larr; ${escapeAttr(backLabel)}</a></p>
    <h1>${escapeAttr(heading)}</h1>
    <p>Browse, search, filter, and sort ${escapeAttr(subtitleLabel)} items. Hover an item's name to see its full card.</p>
    <div class="items-toolbar">
      <input type="search" id="items-search" class="items-search" placeholder="Search name, stat, class..." autocomplete="off">
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
      <select id="items-filter-maxsize" class="items-select">
        <option value="">All max sizes</option>
        ${maxSizes.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <button type="button" id="items-clear-filters" class="items-clear-btn">Clear filters</button>
    </div>
    <p class="items-count" id="items-count"></p>
    <div class="items-table-wrap">
      <table class="items-table">
        <colgroup>
          <col class="col-name">
          <col class="col-slot">
          <col class="col-ac">
          <col class="col-stats">
          <col class="col-dmg">
          <col class="col-weight">
          <col class="col-capacity">
          <col class="col-classes">
          <col class="col-race">
        </colgroup>
        <thead>
          <tr>
            <th data-sort-key="name" class="sortable">Name</th>
            <th data-sort-key="slot" class="sortable">Slot</th>
            <th data-sort-key="ac" class="sortable">AC</th>
            <th data-sort-key="stats" class="sortable">Stats</th>
            <th data-sort-key="ratio" class="sortable">Dmg / Delay / Ratio</th>
            <th data-sort-key="weight" class="sortable">Weight / Size</th>
            <th data-sort-key="capacity" class="sortable">Capacity / Max Size</th>
            <th data-sort-key="classes" class="sortable">Classes</th>
            <th data-sort-key="race" class="sortable">Race</th>
          </tr>
        </thead>
        <tbody id="items-tbody"></tbody>
      </table>
    </div>
  `;

  setupItemTooltip(container.querySelector('#items-tbody'));
  setupItemClickToView(container.querySelector('#items-tbody'));

  const searchBox = container.querySelector('#items-search');
  const slotFilter = container.querySelector('#items-filter-slot');
  const classFilter = container.querySelector('#items-filter-class');
  const raceFilter = container.querySelector('#items-filter-race');
  const tagFilter = container.querySelector('#items-filter-tag');
  const maxSizeFilter = container.querySelector('#items-filter-maxsize');
  const sortHeaders = [...container.querySelectorAll('th[data-sort-key]')];

  // Landed here from a header search result — pre-fill the search box with
  // that item's name so the table filters straight down to it.
  if (pendingItemQuery) {
    searchBox.value = pendingItemQuery;
    pendingItemQuery = null;
  }

  if (returnToRecipe) {
    container.querySelector('#items-back-to-recipe').addEventListener('click', e => {
      e.preventDefault();
      goToRecipe(returnToRecipe);
    });
  }

  if (returnToMonster) {
    container.querySelector('#items-back-to-monster').addEventListener('click', e => {
      e.preventDefault();
      goToMonster(returnToMonster);
    });
  }

  container.querySelector('#items-back-to-categories').addEventListener('click', e => {
    e.preventDefault();
    if (scope) renderArmorSlots(container, scope.material);
    else renderItemsCategories(container);
  });

  // Column headers sort by click — see itemSortValue for what each key reads
  // and ITEM_SORT_NUMERIC for which keys default to highest-first (numeric
  // columns) vs. A-Z-first (label columns) on their first click. Clicking
  // the already-active column flips direction instead of picking a new one.
  let sortKey = 'name';
  let sortDir = 'asc';

  function updateSortIndicators() {
    sortHeaders.forEach(th => {
      th.classList.toggle('sorted-asc', th.dataset.sortKey === sortKey && sortDir === 'asc');
      th.classList.toggle('sorted-desc', th.dataset.sortKey === sortKey && sortDir === 'desc');
    });
  }

  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortKey;
      if (key === sortKey) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = ITEM_SORT_NUMERIC.includes(key) ? 'desc' : 'asc';
      }
      update();
    });
  });

  function update() {
    const query = searchBox.value.toLowerCase().trim();
    const slot = slotFilter.value;
    const cls = classFilter.value;
    const race = raceFilter.value;
    const tag = tagFilter.value;
    const maxSize = maxSizeFilter.value;

    let filtered = categoryItems.filter(item => {
      if (slot && item.slot !== slot) return false;
      if (cls && !(item.classes || []).includes('ALL') && !(item.classes || []).includes(cls)) return false;
      if (race && !(item.race || []).includes('ALL') && !(item.race || []).includes(race)) return false;
      if (tag && !(item.tags || []).includes(tag)) return false;
      if (maxSize && item.maxSize !== maxSize) return false;
      if (query && !itemSearchHaystack(item).includes(query)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const av = itemSortValue(a, sortKey);
      const bv = itemSortValue(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    updateSortIndicators();
    renderItemRows(container.querySelector('#items-tbody'), filtered);
    container.querySelector('#items-count').textContent =
      `Showing ${filtered.length} of ${categoryItems.length} items`;
  }

  [searchBox].forEach(el => el.addEventListener('input', update));
  [slotFilter, classFilter, raceFilter, tagFilter, maxSizeFilter].forEach(el => el.addEventListener('change', update));

  container.querySelector('#items-clear-filters').addEventListener('click', () => {
    searchBox.value = '';
    [slotFilter, classFilter, raceFilter, tagFilter, maxSizeFilter].forEach(el => el.value = '');
    update();
  });

  update();

  if (highlightSlug) {
    const row = container.querySelector(`#items-tbody tr[data-slug="${CSS.escape(highlightSlug)}"]`);
    if (row) {
      suppressScrollReset = true;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('row-flash');
      row.addEventListener('animationend', () => row.classList.remove('row-flash'), { once: true });
    }
  }
}

// One value per sortable column in the Item Database table — numeric for
// AC/Ratio/Weight/Capacity (so click-to-sort can put highest first), string
// for everything else (so it sorts A-Z first). Missing values sort last
// regardless of direction, handled by the caller in renderItemsPage.
const ITEM_SORT_NUMERIC = ['ac', 'ratio', 'weight', 'capacity'];
function itemSortValue(item, key) {
  switch (key) {
    case 'name': return item.name.toLowerCase();
    case 'slot': return (item.slot || '').toLowerCase();
    case 'ac': return item.ac != null ? item.ac : null;
    case 'stats': return formatStats(item).toLowerCase();
    case 'ratio': return itemRatio(item);
    case 'weight': return item.weight != null ? item.weight : null;
    case 'capacity': return item.capacity != null ? item.capacity : null;
    case 'classes': return formatList(item.classes).toLowerCase();
    case 'race': return formatList(item.race).toLowerCase();
    default: return '';
  }
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderItemRows(tbody, items) {
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="items-empty">No items match your filters.</td></tr>';
    return;
  }

  // data-label mirrors each column's header text — read by the narrow-screen
  // stacked-card layout in style.css (each <td> becomes its own labeled row
  // via a ::before). cell-empty marks placeholder "—" cells so that view can
  // hide them instead of showing a label next to nothing.
  tbody.innerHTML = items.map(item => {
    const ratio = itemRatio(item);
    const dmgCell = item.damage != null
      ? `${item.damage} / ${item.delay}${ratio != null ? ` = ${ratio.toFixed(2)}` : ''}`
      : '—';
    const acCell = item.ac != null ? item.ac : '—';
    const capacityCell = formatCapacity(item);

    return `
      <tr data-slug="${escapeAttr(item.slug || '')}">
        <td data-label="Name">
          <span class="item-name-hover" data-alt="${item.name}">${(item.tags || []).map(t => `<span class="badge-tag">${t}</span> `).join('')}${item.name}</span>
        </td>
        <td data-label="Slot"${formatSlot(item) === '—' ? ' class="cell-empty"' : ''}>${formatSlot(item)}</td>
        <td data-label="AC"${acCell === '—' ? ' class="cell-empty"' : ''}>${acCell}</td>
        <td data-label="Stats"${formatStats(item) === '—' ? ' class="cell-empty"' : ''}>${formatStats(item)}</td>
        <td data-label="Dmg / Delay / Ratio"${dmgCell === '—' ? ' class="cell-empty"' : ''}>${dmgCell}</td>
        <td data-label="Weight / Size">${item.weight} / ${item.size}</td>
        <td data-label="Capacity / Max Size"${capacityCell === '—' ? ' class="cell-empty"' : ''}>${capacityCell}</td>
        <td data-label="Classes"${formatList(item.classes) === '—' ? ' class="cell-empty"' : ''}>${formatList(item.classes)}</td>
        <td data-label="Race"${formatList(item.race) === '—' ? ' class="cell-empty"' : ''}>${formatList(item.race)}</td>
      </tr>
    `;
  }).join('');
}

// Renders an item's full card — an original layout (not a screenshot, and
// deliberately not modeled on any other site's item popup) built entirely
// from items.json fields, used by both the hover preview and the item
// viewer modal. A gold accent + type icon (weapon/armor sub-type, jewelry
// slot, or tradeskill for materials — see itemIconHTML) marks it as an ITEM
// card, as opposed to the teal recipe cards below.
function renderItemCardHTML(item) {
  const iconHtml = itemIconHTML(item);
  const categoryLabel = itemCategoryLabel(item);
  const badges = (item.tags || []).map(t => `<span class="badge-tag">${t}</span>`).join('')
    + (item.tradeskillContainer ? '<span class="badge-tag">TRADESKILL</span>' : '');

  const fields = [];
  if (item.slot) fields.push({ label: 'Slot', value: formatSlot(item) });
  if (item.ac != null) fields.push({ label: 'AC', value: item.ac });
  if (item.damage != null) {
    fields.push({ label: 'Dmg', value: item.damage });
    fields.push({ label: 'Delay', value: item.delay });
    const ratio = itemRatio(item);
    if (ratio != null) fields.push({ label: 'Ratio', value: ratio.toFixed(2) });
    if (item.skill) fields.push({ label: 'Skill', value: item.skill });
  }
  if (item.capacity != null) {
    fields.push({ label: 'Capacity', value: item.capacity });
    fields.push({ label: 'Max size', value: item.maxSize });
  }
  fields.push({ label: 'Weight', value: item.weight });
  fields.push({ label: 'Size', value: item.size });

  const chips = statEntries(item)
    .map(e => `<span class="item-card-chip">${e.label} <span class="item-card-chip-value">${e.value}</span></span>`)
    .join('');

  const flavor = [item.effect, item.description].filter(Boolean);

  return `
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-card-icon">${iconHtml}</div>
        <div class="item-card-titles">
          <div class="item-card-name">${escapeAttr(item.name)}</div>
          <div class="item-card-category">${escapeAttr(categoryLabel)}</div>
        </div>
        ${badges ? `<div class="item-card-badges">${badges}</div>` : ''}
      </div>
      <div class="item-card-body">
        <div class="item-card-grid">
          ${fields.map(f => `<div class="item-card-field"><span class="item-card-field-label">${f.label}</span><span>${f.value}</span></div>`).join('')}
        </div>
        ${chips ? `<div class="item-card-chips">${chips}</div>` : ''}
        ${flavor.length ? `<div class="item-card-section item-card-section-flavor">${flavor.map(escapeAttr).join('<br><br>')}</div>` : ''}
        ${(item.classes || item.race) ? `
        <div class="item-card-section">
          Class: ${escapeAttr(formatList(item.classes))}<br>
          Race: ${escapeAttr(formatList(item.race))}
        </div>` : ''}
        <div class="item-card-section${item.foundAt ? '' : ' item-card-muted'}">
          Found at &middot; ${item.foundAt ? escapeAttr(item.foundAt) : 'not yet known'}
        </div>
        ${item.rumor ? `<div class="item-card-section item-card-section-rumor">Rumor (unverified) &middot; ${escapeAttr(item.rumor)}</div>` : ''}
      </div>
    </div>
  `;
}

// A single floating preview card, shared by every hoverable name on the
// site (item rows, recipe names, recipe components), positioned in the
// viewport on hover so it's never clipped by a scroll container. Looks up
// the full item by name and renders its card fresh on every hover rather
// than caching anything, since items.json is the only source of truth here.
function setupItemTooltip(container) {
  let tooltip = document.getElementById('item-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'item-tooltip';
    document.body.appendChild(tooltip);
  }

  container.addEventListener('mouseover', e => {
    const span = e.target.closest('.item-name-hover');
    if (!span) return;
    const item = findItemByName(span.dataset.alt);
    if (!item) return;
    const rect = span.getBoundingClientRect();
    tooltip.innerHTML = renderItemCardHTML(item);
    tooltip.style.display = 'block';

    const left = Math.min(rect.left, window.innerWidth - 336);
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 260 && rect.top > spaceBelow) {
      tooltip.style.top = '';
      tooltip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    } else {
      tooltip.style.bottom = '';
      tooltip.style.top = (rect.bottom + 8) + 'px';
    }
    tooltip.style.left = Math.max(left, 8) + 'px';
  });

  container.addEventListener('mouseout', e => {
    const span = e.target.closest('.item-name-hover');
    if (!span) return;
    if (span.contains(e.relatedTarget)) return;
    tooltip.style.display = 'none';
  });
}

// Clicking an item's name in the Item Database table opens the full item
// viewer (see below) — the same card as the hover preview, just bigger and
// with crafting links attached, in a modal instead of a floating tooltip.
function setupItemClickToView(tbody) {
  tbody.addEventListener('click', e => {
    const span = e.target.closest('.item-name-hover');
    if (!span) return;
    const item = findItemByName(span.dataset.alt);
    if (item) openItemViewer(item);
  });
}

// Full item-card viewer. Since the card is rendered from data (not a
// screenshot), it's never too tall to fit — no scroll-within-the-card
// trick needed here, just a simple max-height safety net on the whole
// panel. The close button sits on the overlay itself (like the Maps
// viewer's), since the card no longer has a dedicated header bar to put it in.
function setupItemViewer() {
  if (document.getElementById('item-viewer')) return;

  const viewer = document.createElement('div');
  viewer.id = 'item-viewer';
  viewer.innerHTML = `
    <button id="item-viewer-close" aria-label="Close">&times;</button>
    <div id="item-viewer-panel">
      <div id="item-viewer-card"></div>
      <div id="item-viewer-info"></div>
    </div>
  `;
  document.body.appendChild(viewer);

  viewer.addEventListener('click', e => {
    if (e.target === viewer) {
      closeItemViewer();
      return;
    }
    const link = e.target.closest('.item-viewer-recipe-link');
    if (link) {
      e.preventDefault();
      const recipe = (craftingData || []).find(r => r.name === link.dataset.recipe && r.tradeskill === link.dataset.tradeskill);
      if (recipe) {
        closeItemViewer();
        goToRecipe(recipe);
      }
    }
  });

  viewer.querySelector('#item-viewer-close').addEventListener('click', closeItemViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeItemViewer();
  });
}

async function openItemViewer(item) {
  await ensureCraftingData();
  setupItemViewer();

  const viewer = document.getElementById('item-viewer');
  viewer.querySelector('#item-viewer-card').innerHTML = renderItemCardHTML(item);

  const resultRecipe = findRecipeForItem(item.name);
  const usedIn = findRecipesUsingItem(item.name);

  let html = '';
  if (resultRecipe) {
    html += `<p><strong>Crafted via:</strong> <a href="#" class="item-viewer-recipe-link" data-recipe="${escapeAttr(resultRecipe.name)}" data-tradeskill="${escapeAttr(resultRecipe.tradeskill)}">${resultRecipe.name}</a> (${resultRecipe.tradeskill})</p>`;
  }
  if (usedIn.length) {
    html += `<p><strong>Used to craft:</strong></p><ul>${usedIn.map(r =>
      `<li><a href="#" class="item-viewer-recipe-link" data-recipe="${escapeAttr(r.name)}" data-tradeskill="${escapeAttr(r.tradeskill)}">${r.name}</a> (${r.tradeskill})</li>`
    ).join('')}</ul>`;
  }

  const info = viewer.querySelector('#item-viewer-info');
  info.innerHTML = html;
  info.style.display = html ? '' : 'none';

  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeItemViewer() {
  const viewer = document.getElementById('item-viewer');
  if (!viewer) return;
  viewer.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================
   Maps
   Data lives in maps.json (array of {name, slug, image, thumbnail}).
   "image" is the full-size map opened in the zoom/pan viewer;
   "thumbnail" is a small pre-generated JPEG shown in the grid so the
   page doesn't have to download every full-size map just to list them
   (source maps can be tens of MB each). To add a map, add an entry,
   drop the full-size image in images/Maps/, and generate a thumbnail
   (see CLAUDE.md) — no code changes needed.
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
        <div class="map-card" data-img="${m.image}" data-thumb="${m.thumbnail || m.image}" data-name="${m.name}">
          <img class="map-card-thumb" src="${m.thumbnail || m.image}" alt="${m.name}" loading="lazy">
          <div class="map-card-name">${m.name}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => openMapViewer(card.dataset.img, card.dataset.name, card.dataset.thumb));
  });
}

// Full-size map viewer with scroll-to-zoom and click-and-drag panning.
// A single overlay is created once and reused for every map. Source map
// images vary wildly in native pixel size (some are 9000px+ wide), so the
// zoomed-out floor and the starting view are computed per image instead of
// being fixed values — otherwise a large map would open already too
// "zoomed in" with no way to scroll out far enough to see the whole thing.
let mapViewerScale = 1;
let mapViewerMinScale = 0.1;
let mapViewerMaxScale = 6;
let mapViewerX = 0;
let mapViewerY = 0;
let mapViewerDragging = false;
let mapViewerMoved = false;
let mapViewerStartX = 0;
let mapViewerStartY = 0;

// The scale at which the image's natural size exactly fits inside the
// viewer (minus a small margin) — used as both the initial view and the
// floor for zooming out, so every map opens fully visible and can always
// be zoomed back out to fully visible.
function computeMapViewerFitScale(img) {
  const naturalW = img.naturalWidth || 1;
  const naturalH = img.naturalHeight || 1;
  const availW = window.innerWidth * 0.94;
  const availH = window.innerHeight * 0.9;
  return Math.min(availW / naturalW, availH / naturalH);
}

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
    mapViewerScale = Math.min(mapViewerMaxScale, Math.max(mapViewerMinScale, mapViewerScale * factor));
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

function openMapViewer(fullSrc, name, thumbSrc) {
  setupMapViewer();
  const viewer = document.getElementById('map-viewer');
  const img = document.getElementById('map-viewer-img');
  img.alt = name;
  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';

  const fitToViewer = () => {
    const fitScale = computeMapViewerFitScale(img);
    mapViewerMinScale = fitScale;
    mapViewerMaxScale = Math.max(6, fitScale * 6);
    mapViewerScale = fitScale;
    mapViewerX = 0;
    mapViewerY = 0;
    applyMapViewerTransform();
  };

  const showAndFit = src => {
    img.onload = fitToViewer;
    img.src = src;
    // If this exact image is already loaded/cached, "load" won't fire again — handle directly.
    if (img.complete && img.naturalWidth) fitToViewer();
  };

  // Full-size maps can be tens of MB, so <img> keeps showing whatever was
  // previously open until the new one finishes downloading. Show the
  // (already-cached) small thumbnail immediately so the correct map
  // appears right away, then swap in the full-quality image once it's
  // done loading in the background.
  const hasThumb = thumbSrc && thumbSrc !== fullSrc;
  showAndFit(hasThumb ? thumbSrc : fullSrc);

  if (hasThumb) {
    const fullImg = new Image();
    fullImg.onload = () => showAndFit(fullSrc);
    fullImg.src = fullSrc;
  }
}

function closeMapViewer() {
  const viewer = document.getElementById('map-viewer');
  if (!viewer) return;
  viewer.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================
   Crafting
   Categories live in tradeskills.json (a fixed list —
   edit it directly to rename/add/remove a tradeskill).
   Recipes live in crafting.json, each tagged with a
   "tradeskill" matching one of those category names.
   Recipes render as cards via renderRecipeCardHTML, the
   same card system as the Item Database (see above) —
   see CLAUDE.md for the full schema.
   ============================================ */

async function renderCraftingPage(container) {
  await ensureCraftingData();

  // Landed here from a header search result for a specific recipe — jump
  // straight to that recipe's tradeskill instead of the category grid.
  if (pendingCraftingTradeskill) {
    const target = pendingCraftingTradeskill;
    pendingCraftingTradeskill = null;
    await renderCraftingRecipes(container, target);
    return;
  }

  renderCraftingCategories(container);
}

function renderCraftingCategories(container) {
  const sorted = [...tradeskillsData].sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = `
    <h1>Crafting</h1>
    <p>Browse recipes by tradeskill, or search below to jump straight to a specific recipe.
    "Planned" tradeskills exist in the game's design but aren't usable yet.</p>
    <div class="items-quick-search">
      <input type="search" id="craft-quick-search-box" class="items-search items-quick-search-box" placeholder="Search all recipes by name or tradeskill..." autocomplete="off">
      <div id="craft-quick-search-results" class="items-quick-search-results"></div>
    </div>
    <div class="craft-grid">
      ${sorted.map(ts => {
        const count = craftingData.filter(r => r.tradeskill === ts.name).length;
        return `
          <div class="craft-card" data-tradeskill="${ts.name}">
            <div class="craft-card-name">
              ${ts.name}
              ${ts.status === 'planned' ? '<span class="badge-planned">Planned</span>' : ''}
            </div>
            <div class="craft-card-count">${count} recipe${count === 1 ? '' : 's'}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.craft-card').forEach(card => {
    card.addEventListener('click', () => renderCraftingRecipes(container, card.dataset.tradeskill));
  });

  // A shortcut past the tradeskill grid for anyone who already knows which
  // recipe they want — same pattern as the Item Database's quick search
  // (renderItemsCategories): scoped to crafting.json only, clicking a result
  // reuses goToRecipe for the same tradeskill-jump + card-flash behavior as
  // a header search result.
  const quickSearchBox = container.querySelector('#craft-quick-search-box');
  const quickSearchResults = container.querySelector('#craft-quick-search-results');

  quickSearchBox.addEventListener('input', () => {
    const query = quickSearchBox.value.toLowerCase().trim();
    if (!query) {
      quickSearchResults.classList.remove('open');
      quickSearchResults.innerHTML = '';
      return;
    }

    const matches = craftingData
      .filter(r => `${r.name} ${r.tradeskill}`.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20);

    quickSearchResults.innerHTML = matches.length
      ? matches.map(recipe => `
          <a href="#" class="search-result-link items-quick-search-result" data-slug="${escapeAttr(recipe.slug)}">
            ${escapeAttr(recipe.name)}
            <span class="items-quick-search-type">${escapeAttr(recipe.tradeskill)}</span>
          </a>
        `).join('')
      : '<p class="search-results-empty">No recipes match.</p>';
    quickSearchResults.classList.add('open');

    quickSearchResults.querySelectorAll('.items-quick-search-result').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const recipe = craftingData.find(r => r.slug === link.dataset.slug);
        if (recipe) goToRecipe(recipe);
      });
    });
  });
}

// Renders a recipe's card — same structural language as renderItemCardHTML
// (icon square, header badges, body sections) but in the teal "craft" accent
// with the tradeskill name as its badge, so a recipe is never mistaken for
// an item card at a glance even though both use the same card system.
// The recipe's own name links to the Item Database (like a component does)
// if a matching item exists there yet, with a hover preview of that item's
// own card — the recipe card itself only shows what the recipe card shows
// (weight/size/components), not the crafted result's full stats.
function renderRecipeCardHTML(recipe) {
  const matched = findItemByName(recipe.name);
  const nameHtml = matched
    ? `<a href="#" class="craft-result-link item-name-hover" data-alt="${escapeAttr(matched.name)}" data-recipe="${escapeAttr(recipe.name)}">${escapeAttr(recipe.name)}</a>`
    : escapeAttr(recipe.name);

  const fields = [];
  if (recipe.weight != null) {
    fields.push({ label: 'Weight', value: recipe.weight });
    fields.push({ label: 'Size', value: recipe.size });
  }
  // Most recipes produce exactly one of `name` — Tanning is the first
  // exception (a single pelt processed in a vat yields a stack of scrap
  // material), so only show a "Yields" field when it's set instead of
  // assuming every recipe's quantity is 1.
  if (recipe.resultQuantity != null) {
    fields.push({ label: 'Yields', value: `${recipe.resultQuantity}x` });
  }

  const componentsHtml = (recipe.components && recipe.components.length) ? `
    <div class="item-card-section">
      Components:
      <ul class="item-card-components">
        ${recipe.components.map(c => {
          const m = findItemByName(c.item);
          const label = `${c.quantity}&times; ${escapeAttr(c.item)}`;
          return m
            ? `<li><a href="#" class="craft-component-link item-name-hover" data-alt="${escapeAttr(m.name)}" data-recipe="${escapeAttr(recipe.name)}" data-item="${escapeAttr(m.name)}">${label}</a></li>`
            : `<li>${label}</li>`;
        }).join('')}
      </ul>
    </div>
  ` : '';

  // Alchemy consumables (potions/serums/tinctures) are the first recipes
  // whose result has its own flavor text and use-effect, same idea as an
  // item's description/effect — recipes don't have a matching items.json
  // entry to show that on, so it lives on the recipe card itself instead.
  const flavor = [recipe.effect, recipe.description].filter(Boolean);

  return `
    <div class="item-card item-card-recipe" data-recipe-slug="${escapeAttr(recipe.slug)}">
      <div class="item-card-header">
        <div class="item-card-icon item-card-icon-recipe">${TRADESKILL_ICON[recipe.tradeskill] ? svgIcon(TRADESKILL_ICON[recipe.tradeskill]) : (recipe.tradeskill || '?').charAt(0)}</div>
        <div class="item-card-name item-card-name-recipe">${nameHtml}</div>
        <div class="item-card-badges"><span class="badge-tag badge-tag-craft">${escapeAttr(recipe.tradeskill)}</span></div>
      </div>
      <div class="item-card-body">
        ${fields.length ? `<div class="item-card-grid">${fields.map(f => `<div class="item-card-field"><span class="item-card-field-label">${f.label}</span><span>${f.value}</span></div>`).join('')}</div>` : ''}
        ${flavor.length ? `<div class="item-card-section item-card-section-flavor">${flavor.map(escapeAttr).join('<br><br>')}</div>` : ''}
        ${componentsHtml}
      </div>
    </div>
  `;
}

// Gemstone reference tables (gemstones.json) are general Jewelcrafting
// knowledge — which gem gives which stat bonus when socketed — not tied to
// any one recipe, so they render as their own section above the recipe grid
// rather than living inside a recipe card. Extend to other tradeskills the
// same way if a similar reference chart ever comes in for one of them.
function renderGemstoneTablesHTML(tradeskillName) {
  if (tradeskillName !== 'Jewelcrafting' || !gemstonesData) return '';
  const categories = [...new Set(gemstonesData.map(g => g.category))];
  return `
    <div class="gem-reference">
      <h2>Gemstone Stat Bonuses</h2>
      <p class="gem-reference-note">Which stats each gem grants when socketed into a ring or earring — general
      Jewelcrafting knowledge, not tied to any specific recipe below.</p>
      <div class="gem-reference-tables">
        ${categories.map(cat => `
          <table class="gem-table">
            <thead><tr><th colspan="2">${escapeAttr(cat)}</th></tr></thead>
            <tbody>
              ${gemstonesData.filter(g => g.category === cat).map(g => `
                <tr>
                  <td>${escapeAttr(g.gem)}${g.wyrmsbaneTurnIn ? ' *' : ''}</td>
                  <td>${g.stats.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      </div>
      ${gemstonesData.some(g => g.wyrmsbaneTurnIn) ? '<p class="gem-reference-footnote">* = Wyrmsbane Turn-In Gem</p>' : ''}
    </div>
  `;
}

async function renderCraftingRecipes(container, tradeskillName) {
  const tradeskill = tradeskillsData.find(ts => ts.name === tradeskillName);
  if (tradeskillName === 'Jewelcrafting') await ensureGemstonesData();
  // Sorted by the recipe's real skill requirement (lowest first), matching the
  // order the game's own crafting window lists them in — not alphabetically.
  // Recipes without a known listOrder yet (no crafting-window screenshot seen
  // for them) sort after all known ones, alphabetically among themselves.
  const recipes = craftingData
    .filter(r => r.tradeskill === tradeskillName)
    .sort((a, b) => {
      const ao = a.listOrder ?? Infinity;
      const bo = b.listOrder ?? Infinity;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name);
    });

  container.innerHTML = `
    <p><a href="#" id="craft-back-link">&larr; All tradeskills</a></p>
    <h1>
      ${tradeskillName}
      ${tradeskill && tradeskill.status === 'planned' ? '<span class="badge-planned">Planned</span>' : ''}
    </h1>
    ${tradeskill && tradeskill.note ? `<p class="craft-tradeskill-note">${escapeAttr(tradeskill.note)}</p>` : ''}
    ${renderGemstoneTablesHTML(tradeskillName)}
    ${
      tradeskill && tradeskill.status === 'planned'
        ? '<p>This tradeskill hasn\'t been implemented in the game yet.</p>'
        : recipes.length
          ? `<div class="craft-recipe-grid">${recipes.map(renderRecipeCardHTML).join('')}</div>`
          : '<p>No recipes yet for this tradeskill.</p>'
    }
  `;

  if (recipes.length) {
    setupItemTooltip(container.querySelector('.craft-recipe-grid'));
  }

  if (pendingHighlightRecipe) {
    const slug = pendingHighlightRecipe;
    pendingHighlightRecipe = null;
    const card = container.querySelector(`.item-card-recipe[data-recipe-slug="${CSS.escape(slug)}"]`);
    if (card) {
      suppressScrollReset = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('recipe-flash');
      card.addEventListener('animationend', () => card.classList.remove('recipe-flash'), { once: true });
    }
  }

  container.querySelectorAll('.craft-result-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const item = findItemByName(link.dataset.recipe);
      if (item) goToItem(item, { tradeskill: tradeskillName, name: link.dataset.recipe });
    });
  });

  container.querySelectorAll('.craft-component-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const item = findItemByName(link.dataset.item);
      if (item) goToItem(item, { tradeskill: tradeskillName, name: link.dataset.recipe });
    });
  });

  container.querySelector('#craft-back-link').addEventListener('click', e => {
    e.preventDefault();
    renderCraftingCategories(container);
  });
}

/* ============================================
   Monsters
   Data lives in monsters.json. To add a new monster, add an object with a
   name/slug/image (dropped into images/Monsters/, see that folder's
   README.txt) plus whatever of maps/levelRange/drops the screenshot shows —
   no code changes needed, same "derive filters from data" pattern as the
   Item Database's slot/class/race dropdowns. A single sortable/filterable
   table is enough for now rather than a category-grid-first layout like
   Items — there's only one meaningful browsing dimension (map) instead of
   Items' several, so a dropdown filter covers it without needing a whole
   extra drill-down level.
   ============================================ */

function monsterSearchHaystack(monster) {
  return [
    monster.name,
    (monster.maps || []).join(' '),
    monster.levelRange || '',
    (monster.drops || []).map(d => d.item).join(' ')
  ].join(' ').toLowerCase();
}

function formatMonsterMaps(monster) {
  return (monster.maps && monster.maps.length) ? monster.maps.join(', ') : '—';
}

async function renderMonstersPage(container) {
  await ensureMonstersData();

  const maps = [...new Set(monstersData.flatMap(m => m.maps || []))].sort();

  container.innerHTML = `
    <h1>Monsters</h1>
    <p>Browse monsters alphabetically, or filter by map. Click a monster's name to see its
    picture and drop table.</p>
    <div class="items-toolbar">
      <input type="search" id="monsters-search" class="items-search" placeholder="Search name, map, drop..." autocomplete="off">
      <select id="monsters-filter-map" class="items-select">
        <option value="">All maps</option>
        ${maps.map(m => `<option value="${escapeAttr(m)}">${escapeAttr(m)}</option>`).join('')}
      </select>
      <button type="button" id="monsters-clear-filters" class="items-clear-btn">Clear filters</button>
    </div>
    <p class="items-count" id="monsters-count"></p>
    <div class="items-table-wrap">
      <table class="items-table">
        <colgroup>
          <col class="col-monster-name">
          <col class="col-monster-map">
        </colgroup>
        <thead>
          <tr>
            <th data-sort-key="name" class="sortable">Name</th>
            <th data-sort-key="maps" class="sortable">Map</th>
          </tr>
        </thead>
        <tbody id="monsters-tbody"></tbody>
      </table>
    </div>
  `;

  const searchBox = container.querySelector('#monsters-search');
  const mapFilter = container.querySelector('#monsters-filter-map');
  const sortHeaders = [...container.querySelectorAll('th[data-sort-key]')];

  // Landed here from a header search result — pre-fill the search box with
  // that monster's name so the table filters straight down to it.
  if (pendingMonsterQuery) {
    searchBox.value = pendingMonsterQuery;
    pendingMonsterQuery = null;
  }

  let sortKey = 'name';
  let sortDir = 'asc';

  function updateSortIndicators() {
    sortHeaders.forEach(th => {
      th.classList.toggle('sorted-asc', th.dataset.sortKey === sortKey && sortDir === 'asc');
      th.classList.toggle('sorted-desc', th.dataset.sortKey === sortKey && sortDir === 'desc');
    });
  }

  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortKey;
      if (key === sortKey) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = 'asc';
      }
      update();
    });
  });

  function monsterSortValue(monster, key) {
    switch (key) {
      case 'name': return monster.name.toLowerCase();
      case 'maps': return (monster.maps && monster.maps[0] || '').toLowerCase();
      default: return '';
    }
  }

  function update() {
    const query = searchBox.value.toLowerCase().trim();
    const map = mapFilter.value;

    let filtered = monstersData.filter(monster => {
      if (map && !(monster.maps || []).includes(map)) return false;
      if (query && !monsterSearchHaystack(monster).includes(query)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const av = monsterSortValue(a, sortKey);
      const bv = monsterSortValue(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    updateSortIndicators();
    renderMonsterRows(container.querySelector('#monsters-tbody'), filtered);
    container.querySelector('#monsters-count').textContent =
      `Showing ${filtered.length} of ${monstersData.length} monsters`;
  }

  searchBox.addEventListener('input', update);
  mapFilter.addEventListener('change', update);

  container.querySelector('#monsters-clear-filters').addEventListener('click', () => {
    searchBox.value = '';
    mapFilter.value = '';
    update();
  });

  update();
  setupMonsterClickToView(container.querySelector('#monsters-tbody'));

  if (pendingHighlightMonster) {
    const slug = pendingHighlightMonster;
    pendingHighlightMonster = null;
    const row = container.querySelector(`#monsters-tbody tr[data-slug="${CSS.escape(slug)}"]`);
    if (row) {
      suppressScrollReset = true;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('row-flash');
      row.addEventListener('animationend', () => row.classList.remove('row-flash'), { once: true });
    }
  }
}

function renderMonsterRows(tbody, monsters) {
  if (!monsters.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="items-empty">${monstersData.length ? 'No monsters match your filters.' : 'No monsters yet.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = monsters.map(monster => `
    <tr data-slug="${escapeAttr(monster.slug)}">
      <td data-label="Name"><span class="item-name-hover monster-name-hover" data-slug="${escapeAttr(monster.slug)}">${escapeAttr(monster.name)}</span></td>
      <td data-label="Map"${formatMonsterMaps(monster) === '—' ? ' class="cell-empty"' : ''}>${escapeAttr(formatMonsterMaps(monster))}</td>
    </tr>
  `).join('');
}

function findMonsterBySlug(slug) {
  return (monstersData || []).find(m => m.slug === slug);
}

function setupMonsterClickToView(tbody) {
  tbody.addEventListener('click', e => {
    const span = e.target.closest('.monster-name-hover');
    if (!span) return;
    const monster = findMonsterBySlug(span.dataset.slug);
    if (monster) openMonsterViewer(monster);
  });
}

// Full monster viewer modal — picture, map(s), level range, and a drop table
// whose items link to the Item Database when a matching item exists yet
// (same findItemByName/goToItem dynamic-linking pattern as a recipe's
// component list), same modal shell as the item viewer (#item-viewer).
function setupMonsterViewer() {
  if (document.getElementById('monster-viewer')) return;

  const viewer = document.createElement('div');
  viewer.id = 'monster-viewer';
  viewer.innerHTML = `
    <button id="monster-viewer-close" aria-label="Close">&times;</button>
    <div id="monster-viewer-panel">
      <div id="monster-viewer-card"></div>
    </div>
  `;
  document.body.appendChild(viewer);

  viewer.addEventListener('click', e => {
    if (e.target === viewer) {
      closeMonsterViewer();
      return;
    }
    const link = e.target.closest('.monster-drop-link');
    if (link) {
      e.preventDefault();
      const item = findItemByName(link.dataset.item);
      const monster = findMonsterBySlug(link.dataset.monster);
      if (item && monster) {
        closeMonsterViewer();
        goToItem(item, { kind: 'monster', name: monster.name, slug: monster.slug });
      }
      return;
    }
    const relatedLink = e.target.closest('.monster-related-link');
    if (relatedLink) {
      e.preventDefault();
      const related = findMonsterBySlug(relatedLink.dataset.slug);
      if (related) {
        closeMonsterViewer();
        openMonsterViewer(related);
      }
    }
  });

  viewer.querySelector('#monster-viewer-close').addEventListener('click', closeMonsterViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMonsterViewer();
  });
}

function openMonsterViewer(monster) {
  setupMonsterViewer();

  const viewer = document.getElementById('monster-viewer');
  const drops = monster.drops || [];
  const related = monster.relatedMonsters || [];

  viewer.querySelector('#monster-viewer-card').innerHTML = `
    <div class="monster-card">
      ${monster.image ? `<img class="monster-card-image" src="${escapeAttr(monster.image)}" alt="${escapeAttr(monster.name)}">` : ''}
      <div class="monster-card-body">
        <h2 class="monster-card-name">${escapeAttr(monster.name)}</h2>
        <div class="monster-card-field"><span class="item-card-field-label">Map</span><span>${escapeAttr(formatMonsterMaps(monster))}</span></div>
        ${related.length ? `
        <div class="monster-card-field">
          <span class="item-card-field-label">Place Holder</span>
          <span>${related.map(r => {
            const m = findMonsterBySlug(r.slug);
            return m
              ? `<a href="#" class="monster-related-link" data-slug="${escapeAttr(m.slug)}">${escapeAttr(r.label)}</a>`
              : escapeAttr(r.label);
          }).join(', ')}</span>
        </div>` : ''}
        <div class="item-card-section">
          Drops:
          ${drops.length ? `
            <ul class="item-card-components">
              ${drops.map(d => {
                const item = findItemByName(d.item);
                return item
                  ? `<li><a href="#" class="monster-drop-link item-name-hover" data-alt="${escapeAttr(item.name)}" data-item="${escapeAttr(item.name)}" data-monster="${escapeAttr(monster.slug)}">${escapeAttr(d.item)}</a></li>`
                  : `<li>${escapeAttr(d.item)}</li>`;
              }).join('')}
            </ul>
          ` : '<p class="monster-card-no-drops">No known drops yet.</p>'}
        </div>
        ${monster.rumor ? `<div class="item-card-section item-card-section-rumor">Rumor (unverified) &middot; ${escapeAttr(monster.rumor)}</div>` : ''}
      </div>
    </div>
  `;

  setupItemTooltip(viewer.querySelector('#monster-viewer-card'));

  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMonsterViewer() {
  const viewer = document.getElementById('monster-viewer');
  if (!viewer) return;
  viewer.classList.remove('open');
  document.body.style.overflow = '';
}

init();
