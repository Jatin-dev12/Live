// Sample media data (you can replace with your own later)
const MEDIA_ITEMS = [
  { id: 1, name: 'ElementsKit.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-09-10', size: 154322 },
  { id: 2, name: 'Sofa.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-08-24', size: 245333 },
  { id: 3, name: 'Icon-support.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-09-18', size: 53211 },
  { id: 4, name: 'Clients-video.jpg', type: 'image', src: '/images/placeholder.jpg', date: '2025-07-11', size: 18543222 },
  { id: 6, name: 'Choose-video.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-08-04', size: 12854322 },
  { id: 7, name: 'Trendmicro.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-06-30', size: 123443 },
  { id: 8, name: 'AWS-logo.png', type: 'image', src: '/images/placeholder.jpg', date: '2025-08-17', size: 98343 },
];

const state = {
  view: 'grid',
  bulk: false,
  search: '',
  type: 'all',
  date: 'all',
  selected: new Set(),
};

function formatBytes(bytes){
  if (bytes === 0) return '0 B';
  const k = 1024; const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(k));
  return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+' '+sizes[i];
}

function matchesFilters(item){
  const matchesText = state.search === '' || item.name.toLowerCase().includes(state.search);
  const matchesType = state.type === 'all' || item.type === state.type;
  const matchesDate = state.date === 'all' || item.date.startsWith(state.date);
  return matchesText && matchesType && matchesDate;
}

function render(){
  const items = MEDIA_ITEMS.filter(matchesFilters);
  renderGrid(items);
  renderList(items);
  document.getElementById('mediaGrid').classList.toggle('d-none', state.view !== 'grid');
  document.getElementById('mediaList').classList.toggle('d-none', state.view !== 'list');
  // Toolbar bulk UI
  const count = state.selected.size;
  const bulkCountEl = document.getElementById('bulkCount');
  const bulkDelEl = document.getElementById('btnBulkDelete');
  bulkCountEl.classList.toggle('d-none', !state.bulk);
  bulkDelEl.classList.toggle('d-none', !state.bulk || count === 0);
  bulkCountEl.textContent = `Selected: ${count}`;
}

function renderGrid(items){
  const grid = document.getElementById('mediaGrid');
  grid.innerHTML = items.map(item => `
    <div class="col">
      <div class="media-card ${state.selected.has(item.id)?'selected':''}" data-id="${item.id}">
        <div class="check-wrap form-check media-input-bg ${state.bulk? '':'d-none'}">
          <input class="form-check-input select-item" type="checkbox" ${state.selected.has(item.id)?'checked':''}>
        </div>
        <div class="thumb">${renderThumb(item)}</div>
        <div class="caption" title="${item.name}">${item.name}</div>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.media-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.select-item')) return;
      openPreview(+card.dataset.id);
    });
  });

  grid.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = +e.target.closest('.media-card').dataset.id;
      toggleSelected(id, e.target.checked);
    });
  });
}

function renderThumb(item){
  if (item.type === 'image') return `<img src="${item.src}" alt="${item.name}">`;
  if (item.type === 'video') return `<i class="bi bi-camera-video fs-1 text-secondary"></i>`;
  if (item.type === 'pdf') return `<i class="bi bi-file-earmark-pdf fs-1 text-danger"></i>`;
  return `<i class="bi bi-file-earmark fs-1 text-secondary"></i>`;
}

function renderList(items){
  const body = document.getElementById('mediaListBody');
  body.innerHTML = items.map(item => `
    <tr data-id="${item.id}">
      <td><input class="form-check-input select-item" type="checkbox" ${state.selected.has(item.id)?'checked':''}></td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="list-thumb">${renderThumb(item)}</div>
          <div>
            <div class="fw-semibold">${item.name}</div>
            <div class="text-muted small">${item.date}</div>
          </div>
        </div>
      </td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis badge-type">${item.type}</span></td>
      <td>${item.date}</td>
      <td>${formatBytes(item.size)}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-primary action-preview">Preview</button></td>
    </tr>`).join('');

  body.querySelectorAll('.action-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = +e.target.closest('tr').dataset.id;
      openPreview(id);
    });
  });
  body.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = +e.target.closest('tr').dataset.id;
      toggleSelected(id, e.target.checked);
    });
  });
}

function toggleSelected(id, isSelected){
  if (isSelected) state.selected.add(id); else state.selected.delete(id);
  render();
}

function openPreview(id){
  const item = MEDIA_ITEMS.find(i => i.id === id);
  if (!item) return;
  document.getElementById('previewTitle').textContent = 'Attachment details';
  const canvas = document.getElementById('attachmentPreview');
  canvas.innerHTML = item.type === 'image'
    ? `<img src="${item.src}" alt="${item.name}" style="max-width:100%;height:auto">`
    : item.type === 'video'
      ? `<video controls style="max-width:100%" src="${item.src}"></video>`
      : `<i class="bi bi-file-earmark fs-1"></i>`;

  // Sidebar metadata
  document.getElementById('metaFilename').textContent = item.name;
  document.getElementById('metaType').textContent = item.type === 'image' ? 'image/*' : item.type;
  document.getElementById('metaSize').textContent = formatBytes(item.size);
  document.getElementById('metaDims').textContent = item.type === 'image' ? '—' : '—';
  document.getElementById('metaUploaded').textContent = `Uploaded on: ${item.date}`;
  document.getElementById('metaUploadedBy').textContent = 'Uploaded by: admin';

  // Fields
  document.getElementById('fieldTitle').value = item.name;
  document.getElementById('fieldAlt').value = '';
  document.getElementById('fieldCaption').value = '';
  document.getElementById('fieldDesc').value = '';
  const fileUrl = item.src;
  document.getElementById('fieldUrl').value = fileUrl;
  const view = document.getElementById('linkViewFile'); view.href = fileUrl;
  const dl = document.getElementById('linkDownload'); dl.href = fileUrl; dl.download = item.name;

  // Copy
  document.getElementById('btnCopyUrl').onclick = () => {
    navigator.clipboard.writeText(fileUrl);
    const btn = document.getElementById('btnCopyUrl');
    const original = btn.textContent; btn.textContent = 'Copied!';
    setTimeout(()=> btn.textContent = original, 1200);
  };
  const modal = new bootstrap.Modal(document.getElementById('previewModal'));
  modal.show();
}

function initControls(){
  // View toggle
  document.getElementById('viewGrid').addEventListener('change', () => { state.view = 'grid'; render(); });
  document.getElementById('viewList').addEventListener('change', () => { state.view = 'list'; render(); });

  // Bulk select toggle
  document.getElementById('btnBulk').addEventListener('click', () => {
    state.bulk = !state.bulk;
    if (!state.bulk) state.selected.clear();
    render();
  });
  document.getElementById('btnBulkDelete').addEventListener('click', () => {
    if (state.selected.size === 0) return;
    if (!confirm(`Delete permanently ${state.selected.size} item(s)? This action cannot be undone.`)) return;
    // Remove from MEDIA_ITEMS (mutate array)
    for (const id of Array.from(state.selected)){
      const idx = MEDIA_ITEMS.findIndex(i => i.id === id);
      if (idx !== -1) MEDIA_ITEMS.splice(idx,1);
    }
    state.selected.clear();
    render();
  });
  document.getElementById('selectAll').addEventListener('change', (e) => {
    const items = MEDIA_ITEMS.filter(matchesFilters);
    if (e.target.checked) items.forEach(i => state.selected.add(i.id));
    else items.forEach(i => state.selected.delete(i.id));
    render();
  });

  // Filters
  document.getElementById('filterType').addEventListener('change', (e)=>{ state.type = e.target.value; render(); });
  document.getElementById('filterDate').addEventListener('change', (e)=>{ state.date = e.target.value; render(); });
  document.getElementById('searchInput').addEventListener('input', (e)=>{ state.search = e.target.value.trim().toLowerCase(); render(); });
}

document.addEventListener('DOMContentLoaded', () => {
  initControls();
  render();
});


