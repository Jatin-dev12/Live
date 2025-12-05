// Dynamic Media Library with Database Integration
let MEDIA_ITEMS = [];

const state = {
  view: 'grid',
  bulk: false,
  search: '',
  type: 'all',
  date: 'all',
  selected: new Set(),
  loading: false
};

function formatBytes(bytes){
  if (bytes === 0) return '0 B';
  const k = 1024; const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(k));
  return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+' '+sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

function populateDateFilter() {
  const filterDate = document.getElementById('filterDate');
  const currentValue = state.date;
  
  // Get unique year-month combinations from ALL media items with counts
  const dateMap = new Map();
  
  ALL_MEDIA_ITEMS.forEach(item => {
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${getMonthName(month)} ${year}`;
    
    if (!dateMap.has(key)) {
      dateMap.set(key, { key, label, year, month, count: 0 });
    }
    dateMap.get(key).count++;
  });
  
  // Sort by year and month (newest first)
  const sortedDates = Array.from(dateMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  // Clear existing options except "All dates"
  const totalCount = ALL_MEDIA_ITEMS.length;
  filterDate.innerHTML = `<option value="all">All dates (${totalCount})</option>`;
  
  // Add sorted date options with counts
  sortedDates.forEach(dateInfo => {
    const option = document.createElement('option');
    option.value = dateInfo.key;
    option.textContent = `${dateInfo.label} (${dateInfo.count})`;
    if (dateInfo.key === currentValue) {
      option.selected = true;
    }
    filterDate.appendChild(option);
  });
}

function showToast(message, type = 'success') {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
}

function showLoading(show = true) {
  state.loading = show;
  const grid = document.getElementById('mediaGrid');
  const list = document.getElementById('mediaList');
  
  if (show) {
    const loadingHtml = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    grid.innerHTML = loadingHtml;
  }
}

// Store all media items (unfiltered)
let ALL_MEDIA_ITEMS = [];

// Fetch media from API
async function fetchMedia() {
  try {
    showLoading(true);
    
    // Fetch all media without server-side filtering
    const response = await fetch('/api/media/list');
    const result = await response.json();
    
    if (result.success) {
      // Store all media items
      ALL_MEDIA_ITEMS = result.data.map(item => ({
        id: item._id,
        name: item.originalName,
        type: item.type,
        src: item.url,
        date: item.createdAt,
        size: item.size,
        mimeType: item.mimeType,
        alt: item.alt || '',
        title: item.title || item.originalName,
        caption: item.caption || '',
        description: item.description || '',
        uploadedBy: item.uploadedBy,
        dimensions: item.dimensions
      }));
      
      // Apply client-side filtering
      applyFilters();
      
      // Populate date filter with all available dates
      populateDateFilter();
      
      render();
    } else {
      showToast('Error loading media', 'error');
    }
  } catch (error) {
    console.error('Fetch media error:', error);
    showToast('Error loading media', 'error');
  } finally {
    showLoading(false);
  }
}

// Apply client-side filters
function applyFilters() {
  MEDIA_ITEMS = ALL_MEDIA_ITEMS.filter(item => {
    // Type filter
    const matchesType = state.type === 'all' || item.type === state.type;
    
    // Date filter
    let matchesDate = true;
    if (state.date !== 'all') {
      const itemDate = new Date(item.date);
      const [year, month] = state.date.split('-');
      matchesDate = itemDate.getFullYear() === parseInt(year) && 
                    (itemDate.getMonth() + 1) === parseInt(month);
    }
    
    // Search filter
    const matchesSearch = state.search === '' || 
                         item.name.toLowerCase().includes(state.search.toLowerCase());
    
    return matchesType && matchesDate && matchesSearch;
  });
}

function matchesFilters(item){
  // Since we're now pre-filtering in applyFilters, 
  // this function is mainly used for search filtering in render
  const matchesText = state.search === '' || item.name.toLowerCase().includes(state.search.toLowerCase());
  return matchesText;
}

function render(){
  const items = MEDIA_ITEMS.filter(matchesFilters);
  renderGrid(items);
  renderList(items);
  document.getElementById('mediaGrid').classList.toggle('d-none', state.view !== 'grid');
  document.getElementById('mediaList').classList.toggle('d-none', state.view !== 'list');
  
  // Add bulk mode class to widget
  const widget = document.querySelector('.custom-library-widget');
  widget.classList.toggle('bulk-mode', state.bulk);
  
  // Toolbar bulk UI
  const count = state.selected.size;
  const bulkCountEl = document.getElementById('bulkCount');
  const bulkDelEl = document.getElementById('btnBulkDelete');
  const selectAllEl = document.getElementById('btnSelectAll');
  
  bulkCountEl.classList.toggle('d-none', !state.bulk);
  bulkDelEl.classList.toggle('d-none', !state.bulk || count === 0);
  selectAllEl.classList.toggle('d-none', !state.bulk);
  
  bulkCountEl.textContent = `Selected: ${count}`;
  
  // Update select all button text
  const allSelected = items.length > 0 && items.every(item => state.selected.has(item.id));
  selectAllEl.textContent = allSelected ? 'Deselect all' : 'Select all';
  
  // Update list view select all checkbox
  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = count > 0 && !allSelected;
  }
}

function renderGrid(items){
  const grid = document.getElementById('mediaGrid');
  
  if (items.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No media found. Upload some files to get started!</p></div>';
    return;
  }
  
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
      if (e.target.closest('.video-play-overlay')) return;
      
      if (state.bulk) {
        // In bulk mode, clicking the card toggles selection
        const checkbox = card.querySelector('.select-item');
        checkbox.checked = !checkbox.checked;
        const id = card.dataset.id;
        toggleSelected(id, checkbox.checked);
      } else {
        // Normal mode, open preview
        openPreview(card.dataset.id);
      }
    });
  });

  grid.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.closest('.media-card').dataset.id;
      toggleSelected(id, e.target.checked);
    });
  });
  
  // Add click handlers for video play overlays
  grid.querySelectorAll('.video-play-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.target.closest('.media-card').dataset.id;
      openPreview(id);
    });
  });
}

function renderThumb(item){
  if (item.type === 'image') {
    return `<img src="${item.src}" alt="${item.name}">`;
  }
  if (item.type === 'video') {
    return `<div class="video-thumbnail-container position-relative w-100 h-100">
              <video class="video-thumbnail" muted preload="metadata" style="pointer-events: none;">
                <source src="${item.src}#t=1" type="${item.mimeType}">
              </video>
              <div class="video-play-overlay position-absolute top-50 start-50 translate-middle" style="cursor: pointer; z-index: 2;">
                <iconify-icon icon="bi:play-circle-fill" style="font-size: 3rem; color: white; text-shadow: 0 0 10px rgba(0,0,0,0.7);"></iconify-icon>
              </div>
            </div>`;
  }
  if (item.type === 'pdf') return `<i class="bi bi-file-earmark-pdf fs-1 text-danger"></i>`;
  if (item.type === 'doc') return `<i class="bi bi-file-earmark-word fs-1 text-primary"></i>`;
  if (item.type === 'audio') return `<i class="bi bi-file-earmark-music fs-1 text-info"></i>`;
  return `<i class="bi bi-file-earmark fs-1 text-secondary"></i>`;
}

function renderList(items){
  const body = document.getElementById('mediaListBody');
  
  if (items.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No media found. Upload some files to get started!</td></tr>';
    return;
  }
  
  body.innerHTML = items.map(item => `
    <tr data-id="${item.id}">
      <td><input class="form-check-input select-item" type="checkbox" ${state.selected.has(item.id)?'checked':''}></td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="list-thumb">${renderThumb(item)}</div>
          <div>
            <div class="fw-semibold">${item.name}</div>
            <div class="text-muted small">${formatDate(item.date)}</div>
          </div>
        </div>
      </td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis badge-type">${item.type}</span></td>
      <td>${formatDate(item.date)}</td>
      <td>${formatBytes(item.size)}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-primary action-preview">Preview</button></td>
    </tr>`).join('');

  body.querySelectorAll('.action-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('tr').dataset.id;
      openPreview(id);
    });
  });
  
  body.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.closest('tr').dataset.id;
      toggleSelected(id, e.target.checked);
    });
  });
}

function toggleSelected(id, isSelected){
  if (isSelected) state.selected.add(id); else state.selected.delete(id);
  render();
}

/* function openPreview(id){
  const item = MEDIA_ITEMS.find(i => i.id === id);
  console.log("item",item);
  console.log("item.dimensions",item.dimensions);
  
  if (!item) return;
  
  document.getElementById('previewTitle').textContent = 'Attachment details';
  const canvas = document.getElementById('attachmentPreview');
  
  if (item.type === 'image') {
    canvas.innerHTML = `<img src="${item.src}" alt="${item.name}" style="max-width:100%;height:auto">`;
  } else if (item.type === 'video') {
    canvas.innerHTML = `<video controls style="max-width:100%" src="${item.src}"></video>`;
  } else if (item.type === 'audio') {
    canvas.innerHTML = `<audio controls style="width:100%" src="${item.src}"></audio>`;
  } else if (item.type === 'pdf') {
    canvas.innerHTML = `<embed src="${item.src}" type="application/pdf" width="100%" height="500px">`;
  } else {
    canvas.innerHTML = `<div class="text-center py-5"><i class="bi bi-file-earmark fs-1"></i><p class="mt-3">Preview not available</p></div>`;
  }

  // Sidebar metadata
  document.getElementById('metaFilename').textContent = item.name;
  document.getElementById('metaType').textContent = item.mimeType;
  document.getElementById('metaSize').textContent = formatBytes(item.size);
  //document.getElementById('metaDims').textContent = item.dimensions && item.dimensions.width ? 
    //`${item.dimensions.width} × ${item.dimensions.height}` : '—';
  document.getElementById('metaDims').textContent = item.dimensions?.width && item.dimensions?.height ? 
    `${item.dimensions.width} × ${item.dimensions.height}` : '—';
  document.getElementById('metaUploaded').textContent = `Uploaded on: ${formatDate(item.date)}`;
  document.getElementById('metaUploadedBy').textContent = item.uploadedBy ? 
    `Uploaded by: ${item.uploadedBy.name || item.uploadedBy.email}` : 'Uploaded by: —';

  // Fields
  document.getElementById('fieldTitle').value = item.title;
  document.getElementById('fieldAlt').value = item.alt;
  // document.getElementById('fieldCaption').value = item.caption;
  // document.getElementById('fieldDesc').value = item.description;
  
  const fileUrl = window.location.origin + item.src;
  document.getElementById('fieldUrl').value = fileUrl;
  
  const view = document.getElementById('linkViewFile'); 
  view.href = item.src;
  view.target = '_blank';
  
  const dl = document.getElementById('linkDownload'); 
  dl.href = item.src; 
  dl.download = item.name;

  // Save metadata button
  const saveBtn = document.querySelector('#previewModal .btn-primary');
  saveBtn.textContent = 'Save Changes';
  saveBtn.onclick = () => saveMetadata(item.id);

  // Copy URL
  document.getElementById('btnCopyUrl').onclick = () => {
    navigator.clipboard.writeText(fileUrl);
    const btn = document.getElementById('btnCopyUrl');
    const original = btn.textContent; 
    btn.textContent = 'Copied!';
    setTimeout(()=> btn.textContent = original, 1200);
  };
  
  // Delete button
  const deleteLink = document.querySelector('#previewModal .text-danger');
  deleteLink.onclick = (e) => {
    e.preventDefault();
    deleteSingleMedia(item.id);
  };
  
  const modal = new bootstrap.Modal(document.getElementById('previewModal'));
  modal.show();
} */
function openPreview(id) {
  const item = MEDIA_ITEMS.find(i => i.id === id);
  if (!item) return;

  document.getElementById('previewTitle').textContent = 'Attachment details';
  const canvas = document.getElementById('attachmentPreview');

  // Preview by type
  switch(item.type) {
    case 'image':
      canvas.innerHTML = `<img src="${item.src}" alt="${item.name}" style="max-width:100%;height:auto">`;
      break;
    case 'video':
      canvas.innerHTML = `<video controls style="max-width:100%" src="${item.src}"></video>`;
      break;
    case 'audio':
      canvas.innerHTML = `<audio controls style="width:100%" src="${item.src}"></audio>`;
      break;
    case 'pdf':
      canvas.innerHTML = `<embed src="${item.src}" type="application/pdf" width="100%" height="500px">`;
      break;
    default:
      canvas.innerHTML = `<div class="text-center py-5">
                            <i class="bi bi-file-earmark fs-1"></i>
                            <p class="mt-3">Preview not available</p>
                          </div>`;
  }

  // Sidebar metadata
  document.getElementById('metaFilename').textContent = item.name || '—';
  document.getElementById('metaType').textContent = item.mimeType || '—';
  document.getElementById('metaSize').textContent = formatBytes(item.size);
  document.getElementById('metaUploaded').textContent = `Uploaded on: ${formatDate(item.date)}`;
  document.getElementById('metaUploadedBy').textContent =
    item.uploadedBy?.name || item.uploadedBy?.email
      ? `Uploaded by: ${item.uploadedBy.name || item.uploadedBy.email}`
      : 'Uploaded by: —';

  // Handle dimensions
  const dimsEl = document.getElementById('metaDims');
  if (item.dimensions?.width && item.dimensions?.height) {
    dimsEl.textContent = `${item.dimensions.width} × ${item.dimensions.height}`;
  } else if (item.type === 'image') {
    // Auto-calculate image dimensions
    const img = new Image();
    img.src = item.src;
    img.onload = () => {
      dimsEl.textContent = `${img.width} × ${img.height}`;
    };
    img.onerror = () => {
      dimsEl.textContent = '—';
    };
  } else {
    dimsEl.textContent = '—';
  }

  // Fields
  document.getElementById('fieldTitle').value = item.title || '';
  document.getElementById('fieldAlt').value = item.alt || '';
  const fileUrl = window.location.origin + item.src;
  document.getElementById('fieldUrl').value = fileUrl;

  // Links
  const view = document.getElementById('linkViewFile');
  view.href = item.src;
  view.target = '_blank';

  const dl = document.getElementById('linkDownload');
  dl.href = item.src;
  dl.download = item.name;

  // Save metadata button
  const saveBtn = document.querySelector('#previewModal .btn-primary');
  saveBtn.textContent = 'Save Changes';
  saveBtn.onclick = () => saveMetadata(item.id);

  // Copy URL
  document.getElementById('btnCopyUrl').onclick = () => {
    navigator.clipboard.writeText(fileUrl);
    const btn = document.getElementById('btnCopyUrl');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = original), 1200);
  };

  // Delete button
  const deleteLink = document.querySelector('#previewModal .text-danger');
  deleteLink.onclick = (e) => {
    e.preventDefault();
    deleteSingleMedia(item.id);
  };

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('previewModal'));
  modal.show();
}

async function saveMetadata(id) {
  try {
    const data = {
      title: document.getElementById('fieldTitle').value,
      alt: document.getElementById('fieldAlt').value,
      // caption: document.getElementById('fieldCaption').value,
      // description: document.getElementById('fieldDesc').value
    };
    
    const response = await fetch(`/api/media/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('Media updated successfully', 'success');
      
      // Update local data
      const item = MEDIA_ITEMS.find(i => i.id === id);
      if (item) {
        item.title = data.title;
        item.alt = data.alt;
        // item.caption = data.caption;
        // item.description = data.description;
      }
      
      render();
    } else {
      showToast(result.message || 'Error updating media', 'error');
    }
  } catch (error) {
    console.error('Save metadata error:', error);
    showToast('Error updating media', 'error');
  }
}

async function deleteSingleMedia(id) {
  const result = await Swal.fire({
    title: 'Delete Media?',
    text: 'Delete permanently 1 item(s)? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });

  if (!result.isConfirmed) return;
  
  try {
    const response = await fetch(`/api/media/${id}`, {
      method: 'DELETE'
    });
    
    const apiResult = await response.json();
    
    if (apiResult.success) {
      showToast('Media deleted successfully', 'success');
      
      // Remove from local array
      const index = MEDIA_ITEMS.findIndex(i => i.id === id);
      if (index !== -1) {
        MEDIA_ITEMS.splice(index, 1);
      }
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('previewModal'));
      if (modal) modal.hide();
      
      render();
    } else {
      showToast(apiResult.message || 'Error deleting media', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting media', 'error');
  }
}

async function bulkDelete() {
  if (state.selected.size === 0) return;
  
  const result = await Swal.fire({
    title: 'Delete Media?',
    text: `Delete permanently ${state.selected.size} item(s)? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });

  if (!result.isConfirmed) return;
  
  try {
    const ids = Array.from(state.selected);
    
    const response = await fetch('/api/media/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });
    
    const apiResult = await response.json();
    
    if (apiResult.success) {
      showToast(apiResult.message, 'success');
      
      // Remove from local array
      for (const id of ids) {
        const index = MEDIA_ITEMS.findIndex(i => i.id === id);
        if (index !== -1) {
          MEDIA_ITEMS.splice(index, 1);
        }
      }
      
      state.selected.clear();
      render();
    } else {
      showToast(apiResult.message || 'Error deleting media', 'error');
    }
  } catch (error) {
    console.error('Bulk delete error:', error);
    showToast('Error deleting media', 'error');
  }
}

function initControls(){
  // View toggle
  document.getElementById('viewGrid').addEventListener('change', () => { 
    state.view = 'grid'; 
    render(); 
  });
  
  document.getElementById('viewList').addEventListener('change', () => { 
    state.view = 'list'; 
    render(); 
  });

  // Bulk select toggle
  document.getElementById('btnBulk').addEventListener('click', () => {
    state.bulk = !state.bulk;
    if (!state.bulk) state.selected.clear();
    
    // Update button text
    const btnBulk = document.getElementById('btnBulk');
    btnBulk.textContent = state.bulk ? 'Cancel bulk select' : 'Bulk select';
    btnBulk.classList.toggle('active', state.bulk);
    
    render();
  });
  
  document.getElementById('btnBulkDelete').addEventListener('click', bulkDelete);
  
  // Select all button for grid view
  document.getElementById('btnSelectAll').addEventListener('click', () => {
    const items = MEDIA_ITEMS.filter(matchesFilters);
    const allSelected = items.length > 0 && items.every(item => state.selected.has(item.id));
    
    if (allSelected) {
      // Deselect all
      items.forEach(i => state.selected.delete(i.id));
    } else {
      // Select all
      items.forEach(i => state.selected.add(i.id));
    }
    render();
  });
  
  // Select all checkbox for list view
  document.getElementById('selectAll').addEventListener('change', (e) => {
    const items = MEDIA_ITEMS.filter(matchesFilters);
    if (e.target.checked) {
      items.forEach(i => state.selected.add(i.id));
    } else {
      items.forEach(i => state.selected.delete(i.id));
    }
    render();
  });

  // Filters
  document.getElementById('filterType').addEventListener('change', (e)=>{ 
    state.type = e.target.value; 
    applyFilters();
    render();
  });
  
  document.getElementById('filterDate').addEventListener('change', (e)=>{ 
    state.date = e.target.value; 
    applyFilters();
    render();
  });
  
  // Search with debounce
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', (e)=>{ 
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim(); 
      applyFilters();
      render();
    }, 300);
  });
  
  // Add media button (if exists)
  const btnAddMedia = document.getElementById('btnAddMedia');
  if (btnAddMedia) {
    btnAddMedia.addEventListener('click', () => {
      window.location.href = '/media/add-file';
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initControls();
  fetchMedia();
  
  // Refresh media list when returning from upload page
  /* window.addEventListener('focus', () => {
    if (document.hidden === false) {
      fetchMedia();
    }
  }); */
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + A to select all in bulk mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && state.bulk) {
      e.preventDefault();
      const selectAllBtn = document.getElementById('btnSelectAll');
      if (selectAllBtn && !selectAllBtn.classList.contains('d-none')) {
        selectAllBtn.click();
      }
    }
    
    // Escape to exit bulk mode
    if (e.key === 'Escape' && state.bulk) {
      document.getElementById('btnBulk').click();
    }
  });
});
