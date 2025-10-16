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

// Fetch media from API
async function fetchMedia() {
  try {
    showLoading(true);
    
    const params = new URLSearchParams();
    if (state.type !== 'all') params.append('type', state.type);
    if (state.date !== 'all') params.append('date', state.date);
    if (state.search) params.append('search', state.search);
    
    const response = await fetch(`/api/media/list?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      MEDIA_ITEMS = result.data.map(item => ({
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

function matchesFilters(item){
  const matchesText = state.search === '' || item.name.toLowerCase().includes(state.search);
  const matchesType = state.type === 'all' || item.type === state.type;
  
  let matchesDate = true;
  if (state.date !== 'all') {
    const itemDate = new Date(item.date);
    const [year, month] = state.date.split('-');
    matchesDate = itemDate.getFullYear() === parseInt(year) && 
                  (itemDate.getMonth() + 1) === parseInt(month);
  }
  
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
  
  if (items.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No media found. Upload some files to get started!</p></div>';
    return;
  }
  
  grid.innerHTML = items.map(item => `
    <div class="col">
      <div class="media-card ${state.selected.has(item.id)?'selected':''}" data-id="${item.id}">
        <div class="check-wrap form-check ${state.bulk? '':'d-none'}">
          <input class="form-check-input select-item" type="checkbox" ${state.selected.has(item.id)?'checked':''}>
        </div>
        <div class="thumb">${renderThumb(item)}</div>
        <div class="caption" title="${item.name}">${item.name}</div>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.media-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.select-item')) return;
      openPreview(card.dataset.id);
    });
  });

  grid.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.closest('.media-card').dataset.id;
      toggleSelected(id, e.target.checked);
    });
  });
}

function renderThumb(item){
  if (item.type === 'image') return `<img src="${item.src}" alt="${item.name}">`;
  if (item.type === 'video') return `<i class="bi bi-camera-video fs-1 text-secondary"></i>`;
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

function openPreview(id){
  const item = MEDIA_ITEMS.find(i => i.id === id);
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
  document.getElementById('metaDims').textContent = item.dimensions && item.dimensions.width ? 
    `${item.dimensions.width} × ${item.dimensions.height}` : '—';
  document.getElementById('metaUploaded').textContent = `Uploaded on: ${formatDate(item.date)}`;
  document.getElementById('metaUploadedBy').textContent = item.uploadedBy ? 
    `Uploaded by: ${item.uploadedBy.name || item.uploadedBy.email}` : 'Uploaded by: —';

  // Fields
  document.getElementById('fieldTitle').value = item.title;
  document.getElementById('fieldAlt').value = item.alt;
  document.getElementById('fieldCaption').value = item.caption;
  document.getElementById('fieldDesc').value = item.description;
  
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
}

async function saveMetadata(id) {
  try {
    const data = {
      title: document.getElementById('fieldTitle').value,
      alt: document.getElementById('fieldAlt').value,
      caption: document.getElementById('fieldCaption').value,
      description: document.getElementById('fieldDesc').value
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
        item.caption = data.caption;
        item.description = data.description;
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
    render();
  });
  
  document.getElementById('btnBulkDelete').addEventListener('click', bulkDelete);
  
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
    fetchMedia();
  });
  
  document.getElementById('filterDate').addEventListener('change', (e)=>{ 
    state.date = e.target.value; 
    fetchMedia();
  });
  
  // Search with debounce
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', (e)=>{ 
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim().toLowerCase(); 
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
  window.addEventListener('focus', () => {
    if (document.hidden === false) {
      fetchMedia();
    }
  });
});
