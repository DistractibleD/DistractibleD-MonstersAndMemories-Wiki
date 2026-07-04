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

// Set by the header search box when jumping straight to a specific item or
// crafting recipe, then consumed (and cleared) by the corresponding render
// function so the user lands directly on what they searched for.
let pendingItemQuery = null;
let pendingCraftingTradeskill = null;
// Set when jumping to an item from a recipe's component list, so the Item
// Database can show a "back to that recipe" link. Same consume-once pattern.
let pendingReturnToRecipe = null;
// Set by goToRecipe so the recipe just navigated to (e.g. via an item's
// "Crafted via"/"Used to craft" links) flashes once its card renders, making
// it easy to spot among the rest of that tradeskill's recipe grid.
let pendingHighlightRecipe = null;
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

async function init() {
  const res = await fetch('pages.json');
  allPages = await res.json();
  buildSidebar(allPages);

  // Load a page based on the URL (e.g. index.html#stone-golem), or the first page by default
  const requested = location.hash.replace('#', '');
  const startPage = allPages.find(p => p.file === requested) || allPages[0];
  if (startPage) loadPage(startPage.file);

  // Pre-fetch item/crafting data in the background so the header search box
  // can search them right away, without waiting for the user to first visit
  // the Item Database or Crafting page.
  ensureItemsData().catch(() => {});
  ensureCraftingData().catch(() => {});

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

  // Data-driven pages (Item Database, Maps, Crafting) use the full content
  // width instead of the narrower reading width used for prose pages.
  contentInner.classList.toggle('content-wide', !!(page && (page.type === 'items' || page.type === 'maps' || page.type === 'crafting')));

  try {
    if (page && page.type === 'items') {
      await renderItemsPage(contentInner);
    } else if (page && page.type === 'maps') {
      await renderMapsPage(contentInner);
    } else if (page && page.type === 'crafting') {
      await renderCraftingPage(contentInner);
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
  const matchedItems = (itemsData || [])
    .filter(item => itemSearchHaystack(item).includes(query))
    .slice(0, 8);
  const matchedRecipes = (craftingData || [])
    .filter(r => `${r.name} ${r.tradeskill}`.toLowerCase().includes(query))
    .slice(0, 8);

  if (!matchedPages.length && !matchedItems.length && !matchedRecipes.length) {
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

  openSearchResults();
}

function goToItem(item, returnToRecipe) {
  pendingItemQuery = item.name;
  pendingReturnToRecipe = returnToRecipe || null;
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
   Original outline icons (not copied from any reference), one per weapon/
   armor/jewelry sub-type plus one per tradeskill for crafting materials.
   Each entry is the inner markup for a 0 0 24 24 viewBox <svg>.
   ============================================ */
const ICON_DEFS = {
  sword: `<path d="M11 15 L11 5 L12 2 L13 5 L13 15"/><line x1="8.5" y1="15" x2="15.5" y2="15"/><line x1="12" y1="15" x2="12" y2="20" stroke-width="2"/><circle cx="12" cy="21" r="1.1"/>`,
  sword2h: `<path d="M10.3 13 L10.3 4 L12 1 L13.7 4 L13.7 13"/><line x1="12" y1="4" x2="12" y2="12" stroke-width="0.9"/><path d="M7 13 L17 13 M7 13 L5.5 11.5 M17 13 L18.5 11.5"/><line x1="12" y1="13" x2="12" y2="21" stroke-width="2"/><circle cx="12" cy="22" r="1.3"/>`,
  dagger: `<path d="M11.3 14 L11.3 8 L12 6 L12.7 8 L12.7 14"/><line x1="10" y1="14" x2="14" y2="14"/><line x1="12" y1="14" x2="12" y2="17.5" stroke-width="1.8"/><circle cx="12" cy="18.5" r="0.9"/>`,
  axe: `<line x1="12" y1="3" x2="12" y2="21" stroke-width="1.8"/><path d="M12 5 C7.5 4.3 5 8 6.8 12 C9.3 10.5 11.5 7 12 5 Z"/>`,
  axe2h: `<line x1="12" y1="2" x2="12" y2="22" stroke-width="2"/><path d="M12 4 C5.5 3 2 8.5 4.5 14 C8.5 12 11.5 6.5 12 4 Z"/>`,
  mace: `<line x1="12" y1="10" x2="12" y2="21" stroke-width="1.8"/><circle cx="12" cy="6.3" r="3.3"/><path class="ic-fill" d="M12 1 L13 3.1 L11 3.1 Z"/><path class="ic-fill" d="M17.3 6.3 L15.2 7.3 L15.2 5.3 Z"/><path class="ic-fill" d="M6.7 6.3 L8.8 5.3 L8.8 7.3 Z"/>`,
  hammer: `<line x1="12" y1="8" x2="12" y2="21" stroke-width="1.8"/><path d="M6 4.3 L6 7.3 L11.3 7.3 L11.3 4.3 Z"/><path d="M12.7 4.3 L12.7 7.3 L18 5.8 Z"/>`,
  maul2h: `<line x1="12" y1="9" x2="12" y2="22" stroke-width="2.2"/><path d="M5 2.5 L5 9 L19 9 L19 2.5 Z"/>`,
  spear: `<line x1="12" y1="9" x2="12" y2="22" stroke-width="1.6"/><path d="M12 1 L14.3 8.8 L12 7 L9.7 8.8 Z"/><line x1="9" y1="9" x2="15" y2="9" stroke-width="1.2"/>`,
  scythe: `<line x1="12.5" y1="9" x2="17" y2="22" stroke-width="1.8"/><path transform="translate(2,-1) scale(0.66)" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
  bow: `<path d="M7.5 2 C2.5 7 2.5 17 7.5 22" stroke-width="1.8"/><line x1="7.7" y1="2.5" x2="7.7" y2="21.5" stroke-width="1"/>`,
  throwing: `<path d="M6 18 L10 14" stroke-width="1.4"/><path class="ic-fill" d="M10 14 L11.6 12.2 L10.4 14.6 Z"/><path d="M9 19.5 L13.5 15" stroke-width="1.4"/><path class="ic-fill" d="M13.5 15 L15 13 L13.9 15.5 Z"/><path d="M12.5 20.5 L17 16" stroke-width="1.4"/><path class="ic-fill" d="M17 16 L18.5 14 L17.4 16.5 Z"/>`,
  shield: `<path d="M12 2.5 L18.5 5 L18.5 11.5 C18.5 16.5 15.5 19.5 12 21.5 C8.5 19.5 5.5 16.5 5.5 11.5 L5.5 5 Z"/><circle class="ic-fill" cx="12" cy="10.5" r="1.6"/><line x1="12" y1="6" x2="12" y2="15" stroke-width="0.8"/><line x1="8" y1="10.5" x2="16" y2="10.5" stroke-width="0.8"/>`,
  plate: `<path d="M12 3 C9.3 3 7.3 4.5 7 6.3 L6.3 9.5 C5.9 13.5 6.4 17 7.8 19.6 C9 21.2 10.4 22 12 22 C13.6 22 15 21.2 16.2 19.6 C17.6 17 18.1 13.5 17.7 9.5 L17 6.3 C16.7 4.5 14.7 3 12 3 Z"/><line x1="12" y1="6.5" x2="12" y2="18" stroke-width="0.9"/><path d="M9.2 8 C8.5 10.5 8.5 13 9.2 15.5" stroke-width="0.9"/><path d="M14.8 8 C15.5 10.5 15.5 13 14.8 15.5" stroke-width="0.9"/>`,
  chain: `<path d="M8 5 L16 5 L18 7.5 L16 8.8 L16 22 L8 22 L8 8.8 L6 7.5 Z"/><circle cx="9.5" cy="11" r="1" stroke-width="0.8"/><circle cx="12.5" cy="11" r="1" stroke-width="0.8"/><circle cx="10.8" cy="14" r="1" stroke-width="0.8"/><circle cx="13.8" cy="14" r="1" stroke-width="0.8"/><circle cx="9.5" cy="17" r="1" stroke-width="0.8"/><circle cx="12.5" cy="17" r="1" stroke-width="0.8"/>`,
  leather: `<path d="M8 5 L16 5 L17.2 9.5 L15.5 22 L8.5 22 L6.8 9.5 Z"/><path d="M10.3 9 L13.7 11 M13.7 9 L10.3 11" stroke-width="0.9"/><path d="M10 13.5 L14 15.5 M14 13.5 L10 15.5" stroke-width="0.9"/><path d="M9.8 18 L14.2 20 M14.2 18 L9.8 20" stroke-width="0.9"/>`,
  cloth: `<path d="M9.5 3 L14.5 3 L17 7 L18.5 21 L14.5 21 L14 10 L10 10 L9.5 21 L5.5 21 Z"/><path d="M9.5 3 C10 4.5 11 5 12 5 C13 5 14 4.5 14.5 3" stroke-width="1"/>`,
  armor: `<path d="M8 5 L16 5 L17.2 9.5 L15.5 22 L8.5 22 L6.8 9.5 Z"/>`,
  ring: `<circle cx="12" cy="15" r="5.3" stroke-width="2"/><path class="ic-fill" d="M12 5 L14.5 8.5 L12 11.5 L9.5 8.5 Z"/>`,
  earring: `<path d="M10 3 C10 5.5 12 5.5 12 8" stroke-width="1.6"/><path class="ic-fill" d="M12 8 L14.3 12 L12 16 L9.7 12 Z"/>`,
  necklace: `<path d="M4 4 C4 12 8 15 12 15 C16 15 20 12 20 4" stroke-width="1.4"/><path class="ic-fill" d="M12 14 L14.5 18 L12 22 L9.5 18 Z"/>`,
  food: `<path d="M12 9 C7.5 9 5.5 12 5.5 15 C5.5 18.5 8.5 21.5 12 21.5 C15.5 21.5 18.5 18.5 18.5 15 C18.5 12 16.5 9 12 9 Z"/><path d="M12 9 C12 6.5 10.7 5 9.3 4.3" stroke-width="1.2"/><path class="ic-fill" d="M12.2 5.2 C13.8 4 15.6 4.6 15.6 6.4 C13.9 7 12.7 6.4 12.2 5.2 Z"/>`,
  drink: `<path d="M6 6 L17 6 L17 20 C17 21.1 16.1 22 15 22 L8 22 C6.9 22 6 21.1 6 20 Z"/><path d="M17 9.5 C20.5 9.5 20.5 15.5 17 15.5"/><line x1="7" y1="9.8" x2="16" y2="9.8" stroke-width="1.2"/>`,
  container: `<path d="M9 4.5 C9 6.5 10.3 8 12 8 C13.7 8 15 6.5 15 4.5" stroke-width="1.4"/><path d="M8 9 L16 9 L17.5 21 C17.6 21.6 17.1 22 16.5 22 L7.5 22 C6.9 22 6.4 21.6 6.5 21 Z"/><path d="M8.5 9 L15.5 9 L14.5 12.3 L9.5 12.3 Z"/>`,
  blacksmithing: `<path d="M5 9 L17 9 L22 10.5 L17 12 L5 12 Z"/><path d="M9.5 12 L9.5 15 L14.5 15 L14.5 12"/><path d="M7.5 15 L16.5 15 L18 20 L6 20 Z"/>`,
  tailoring: `<line x1="12" y1="6" x2="12" y2="18" stroke-width="1.6"/><path class="ic-fill" d="M12 18 L13.2 20.5 L10.8 20.5 Z"/><ellipse cx="12" cy="4.3" rx="1.2" ry="1.7" stroke-width="1.2"/><path d="M13 4.8 C16.5 3.8 18.5 7 15.7 8.8 C13.3 10.4 14.7 12.7 12.4 14" stroke-width="1"/>`,
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
  spear: 'Spear', scythe: 'Scythe', bow: 'Bow', throwing: 'Throwing Weapon',
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

function itemRatio(item) {
  if (item.damage == null || !item.delay) return null;
  return item.damage / item.delay;
}

// Shared by formatStats() (comma text, used in the table + search) and the
// item card's stat chips (see renderItemCardHTML) so the "which stats/
// resists/haste does this item have" logic only lives in one place.
function statEntries(item) {
  const entries = [];
  ITEM_STAT_ORDER.forEach(stat => {
    if (item.stats && item.stats[stat]) entries.push({ label: stat, value: `+${item.stats[stat]}` });
  });
  ITEM_RESIST_ORDER.forEach(res => {
    if (item.resists && item.resists[res]) entries.push({ label: `SV ${res}`, value: `+${item.resists[res]}` });
  });
  if (item.haste) entries.push({ label: 'Haste', value: `+${item.haste}%` });
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

  // Landed here from a recipe's component list — remember which recipe so
  // we can show a link back to it, instead of leaving the user stranded.
  const returnToRecipe = pendingReturnToRecipe;
  pendingReturnToRecipe = null;

  const slots = [...new Set(itemsData.map(i => i.slot))].filter(Boolean).sort();
  const types = [...new Set(itemsData.map(i => i.type))].sort();
  const classes = [...new Set(itemsData.flatMap(i => i.classes || []).filter(c => c !== 'ALL'))].sort();
  const races = [...new Set(itemsData.flatMap(i => i.race || []).filter(r => r !== 'ALL'))].sort();
  const tags = [...new Set(itemsData.flatMap(i => i.tags || []))].sort();
  const maxSizes = [...new Set(itemsData.map(i => i.maxSize).filter(Boolean))].sort();

  container.innerHTML = `
    ${returnToRecipe ? `<p class="items-back-link"><a href="#" id="items-back-to-recipe">&larr; Back to ${escapeAttr(returnToRecipe.name)}</a></p>` : ''}
    <h1>Item Database</h1>
    <p>Browse, search, filter, and sort every item on the wiki. Hover an item's name to see its full card.</p>
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
      <select id="items-filter-maxsize" class="items-select">
        <option value="">All max sizes</option>
        ${maxSizes.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="items-sort" class="items-select">
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="ac-desc">AC (High-Low)</option>
        <option value="ratio-desc">Ratio (High-Low)</option>
        <option value="ratio-asc">Ratio (Low-High)</option>
        <option value="capacity-desc">Capacity (High-Low)</option>
        <option value="capacity-asc">Capacity (Low-High)</option>
      </select>
      <button type="button" id="items-clear-filters" class="items-clear-btn">Clear filters</button>
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
          <col class="col-capacity">
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
            <th>Capacity / Max Size</th>
            <th>Classes</th>
            <th>Race</th>
          </tr>
        </thead>
        <tbody id="items-tbody"></tbody>
      </table>
    </div>
  `;

  setupItemTooltip(container.querySelector('#items-tbody'));
  setupItemClickToView(container.querySelector('#items-tbody'));

  const searchBox = container.querySelector('#items-search');
  const typeFilter = container.querySelector('#items-filter-type');
  const slotFilter = container.querySelector('#items-filter-slot');
  const classFilter = container.querySelector('#items-filter-class');
  const raceFilter = container.querySelector('#items-filter-race');
  const tagFilter = container.querySelector('#items-filter-tag');
  const maxSizeFilter = container.querySelector('#items-filter-maxsize');
  const sortSelect = container.querySelector('#items-sort');

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

  function update() {
    const query = searchBox.value.toLowerCase().trim();
    const type = typeFilter.value;
    const slot = slotFilter.value;
    const cls = classFilter.value;
    const race = raceFilter.value;
    const tag = tagFilter.value;
    const maxSize = maxSizeFilter.value;

    let filtered = itemsData.filter(item => {
      if (type && item.type !== type) return false;
      if (slot && item.slot !== slot) return false;
      if (cls && !(item.classes || []).includes('ALL') && !(item.classes || []).includes(cls)) return false;
      if (race && !(item.race || []).includes('ALL') && !(item.race || []).includes(race)) return false;
      if (tag && !(item.tags || []).includes(tag)) return false;
      if (maxSize && item.maxSize !== maxSize) return false;
      if (query && !itemSearchHaystack(item).includes(query)) return false;
      return true;
    });

    const [sortKey, sortDir] = sortSelect.value.split('-');
    filtered.sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (sortKey === 'ac') { av = a.ac ?? -Infinity; bv = b.ac ?? -Infinity; }
      else if (sortKey === 'capacity') { av = a.capacity ?? -Infinity; bv = b.capacity ?? -Infinity; }
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
  [typeFilter, slotFilter, classFilter, raceFilter, tagFilter, maxSizeFilter, sortSelect].forEach(el => el.addEventListener('change', update));

  container.querySelector('#items-clear-filters').addEventListener('click', () => {
    searchBox.value = '';
    [typeFilter, slotFilter, classFilter, raceFilter, tagFilter, maxSizeFilter].forEach(el => el.value = '');
    update();
  });

  update();
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderItemRows(tbody, items) {
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="items-empty">No items match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const ratio = itemRatio(item);
    const dmgCell = item.damage != null
      ? `${item.damage} / ${item.delay}${ratio != null ? ` = ${ratio.toFixed(2)}` : ''}`
      : '—';

    return `
      <tr>
        <td>
          <span class="item-name-hover" data-alt="${item.name}">${(item.tags || []).map(t => `<span class="badge-tag">${t}</span> `).join('')}${item.name}</span>
        </td>
        <td>${item.type}</td>
        <td>${formatSlot(item)}</td>
        <td>${item.ac != null ? item.ac : '—'}</td>
        <td>${formatStats(item)}</td>
        <td>${dmgCell}</td>
        <td>${item.weight} / ${item.size}</td>
        <td>${formatCapacity(item)}</td>
        <td>${formatList(item.classes)}</td>
        <td>${formatList(item.race)}</td>
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
    renderCraftingRecipes(container, target);
    return;
  }

  renderCraftingCategories(container);
}

function renderCraftingCategories(container) {
  const sorted = [...tradeskillsData].sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = `
    <h1>Crafting</h1>
    <p>Browse recipes by tradeskill. "Planned" tradeskills exist in the game's design but
    aren't usable yet.</p>
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

  return `
    <div class="item-card item-card-recipe" data-recipe-slug="${escapeAttr(recipe.slug)}">
      <div class="item-card-header">
        <div class="item-card-icon item-card-icon-recipe">${TRADESKILL_ICON[recipe.tradeskill] ? svgIcon(TRADESKILL_ICON[recipe.tradeskill]) : (recipe.tradeskill || '?').charAt(0)}</div>
        <div class="item-card-name item-card-name-recipe">${nameHtml}</div>
        <div class="item-card-badges"><span class="badge-tag badge-tag-craft">${escapeAttr(recipe.tradeskill)}</span></div>
      </div>
      <div class="item-card-body">
        ${fields.length ? `<div class="item-card-grid">${fields.map(f => `<div class="item-card-field"><span class="item-card-field-label">${f.label}</span><span>${f.value}</span></div>`).join('')}</div>` : ''}
        ${componentsHtml}
      </div>
    </div>
  `;
}

function renderCraftingRecipes(container, tradeskillName) {
  const tradeskill = tradeskillsData.find(ts => ts.name === tradeskillName);
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

init();
