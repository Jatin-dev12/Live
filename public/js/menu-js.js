const DEFAULT_PAGES = [
  'Data Safety & Cyber Security',
  'Travel Publications and Blogs',
  'AI Resources Collection',
  'YouTube Videos & Blogs',
  'Travel Publication & Blogs',
  'News & Updates',
  'News – OpenAI ChatGPT',
  'Additional Reading – 2nd half',
];

const pagesListEl = document.getElementById('pagesList');
const addToMenuBtn = document.getElementById('addToMenuBtn');
const selectAllBtn = document.getElementById('selectAll');
const menuListEl = document.getElementById('menuList');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// Exit early if required elements don't exist (not on menu management page)
if (!pagesListEl || !addToMenuBtn || !selectAllBtn || !menuListEl || !saveBtn || !resetBtn) {
  // Not on menu management page, skip initialization
  return;
}

let menuTree = [];

function renderPages() {
  pagesListEl.innerHTML = '';
  DEFAULT_PAGES.forEach((title, idx) => {
    const item = document.createElement('label');
    item.className = 'list-group-item d-flex align-items-center';
    item.innerHTML = `
      <input class="form-check-input me-2" type="checkbox" value="${idx}">
      <span>${title}</span>
    `;
    pagesListEl.appendChild(item);
  });
}

function createMenuItemNode(node) {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-item';
  wrapper.dataset.id = node.id;

  wrapper.innerHTML = `
    <span class="handle" title="Drag">≡</span>
    <input class="form-control form-control-sm" value="${node.title}" />
    <div class="btn-group btn-group-sm custom-structure-widget" role="group">
      <button class="btn btn-outline-secondary indent d-none" title="Indent">→</button>
      <button class="btn btn-outline-secondary outdent d-none" title="Outdent">←</button>
      <button class="btn btn-outline-danger remove" title="Remove">Remove</button>
    </div>
  `;

  const childrenContainer = document.createElement('div');
  childrenContainer.className = 'menu-children';
  wrapper.appendChild(childrenContainer);

  if (node.children && node.children.length) {
    node.children.forEach(child => {
      childrenContainer.appendChild(createMenuItemNode(child));
    });
  }
  return wrapper;
}

function renderMenu() {
  menuListEl.innerHTML = '';
  menuTree.forEach(node => menuListEl.appendChild(createMenuItemNode(node)));
  hookItemEvents();
  setupSortables();
}

function hookItemEvents() {
  menuListEl.querySelectorAll('.menu-item').forEach(el => {
    el.querySelector('input').addEventListener('input', e => {
      const id = el.dataset.id;
      const item = findNodeById(menuTree, id);
      if (item) item.title = e.target.value;
      persist();
    });
    el.querySelector('.remove').addEventListener('click', () => removeItem(el.dataset.id));
    el.querySelector('.indent').addEventListener('click', () => indentItem(el.dataset.id));
    el.querySelector('.outdent').addEventListener('click', () => outdentItem(el.dataset.id));
  });
}

function setupSortables() {
  // destroy previous instances by re-creating containers; Sortable handles re-init safely
  const recurse = container => {
    Sortable.create(container, {
      group: 'menus',
      handle: '.handle',
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onEnd: syncFromDom
    });
    container.querySelectorAll(':scope > .menu-item > .menu-children').forEach(recurse);
  };
  recurse(menuListEl);
}

function collectTreeFromDom(container) {
  const nodes = [];
  container.querySelectorAll(':scope > .menu-item').forEach(itemEl => {
    const id = itemEl.dataset.id;
    const title = itemEl.querySelector('input').value;
    const children = collectTreeFromDom(itemEl.querySelector(':scope > .menu-children'));
    nodes.push({ id, title, children });
  });
  return nodes;
}

function syncFromDom() {
  menuTree = collectTreeFromDom(menuListEl);
  persist();
}

function findNodeById(list, id, parent = null) {
  for (const node of list) {
    if (node.id === id) return node;
    const inChild = findNodeById(node.children || [], id, node);
    if (inChild) return inChild;
  }
  return null;
}

function findParentOfId(list, id, parent = null) {
  for (const node of list) {
    if (node.id === id) return parent;
    const p = findParentOfId(node.children || [], id, node);
    if (p) return p;
  }
  return null;
}

function removeItem(id) {
  const removeRec = (arr, id) => {
    const idx = arr.findIndex(x => x.id === id);
    if (idx !== -1) {
      arr.splice(idx, 1);
      return true;
    }
    for (const n of arr) if (removeRec(n.children || [], id)) return true;
    return false;
  };
  removeRec(menuTree, id);
  renderMenu();
  persist();
}

function indentItem(id) {
  // make this item a child of its previous sibling
  const path = getPath(menuTree, id);
  if (!path) return;
  const { arr, index } = path;
  if (index <= 0) return; // nothing to indent under
  const [node] = arr.splice(index, 1);
  const prev = arr[index - 1];
  prev.children = prev.children || [];
  prev.children.push(node);
  renderMenu();
  persist();
}

function outdentItem(id) {
  // move this item to be a sibling after its parent
  const parent = findParentOfId(menuTree, id);
  if (!parent) return; // already root
  const idx = parent.children.findIndex(x => x.id === id);
  const [node] = parent.children.splice(idx, 1);
  const grandParentPath = getPath(menuTree, parent.id);
  if (grandParentPath) {
    const { arr, index } = grandParentPath;
    arr.splice(index + 1, 0, node);
  } else {
    // parent is root
    const parentIndex = menuTree.findIndex(x => x.id === parent.id);
    menuTree.splice(parentIndex + 1, 0, node);
  }
  renderMenu();
  persist();
}

function getPath(list, id, acc = []) {
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.id === id) return { arr: list, index: i };
    const child = getPath(node.children || [], id, acc.concat(node));
    if (child) return child;
  }
  return null;
}

function persist() {
  localStorage.setItem('menuTree', JSON.stringify(menuTree));
}

function restore() {
  const raw = localStorage.getItem('menuTree');
  if (raw) {
    try { menuTree = JSON.parse(raw) || []; }
    catch { menuTree = []; }
  }
}

if (addToMenuBtn) {
addToMenuBtn.addEventListener('click', () => {
  const checked = pagesListEl.querySelectorAll('input[type="checkbox"]:checked');
  checked.forEach(cb => {
    const title = DEFAULT_PAGES[parseInt(cb.value, 10)];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    menuTree.push({ id, title, children: [] });
    cb.checked = false;
  });
  renderMenu();
  persist();
});
}

if (selectAllBtn) {
selectAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const inputs = pagesListEl.querySelectorAll('input[type="checkbox"]');
  const allChecked = Array.from(inputs).every(i => i.checked);
  inputs.forEach(i => i.checked = !allChecked);
});
}

if (saveBtn) {
saveBtn.addEventListener('click', () => {
  persist();
  alert('Menu saved locally (localStorage). Integrate with backend as needed.');
});
}

if (resetBtn) {
resetBtn.addEventListener('click', () => {
  if (confirm('Clear the menu?')) {
    menuTree = [];
    persist();
    renderMenu();
  }
});
}

// Init only if on menu management page
if (pagesListEl && menuListEl) {
  renderPages();
  restore();
  renderMenu();
}


