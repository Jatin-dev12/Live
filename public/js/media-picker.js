/**
 * WordPress-style Media Picker Component
 * Allows users to upload new files or select from existing media library
 */

class MediaPicker {
    constructor(options = {}) {
        this.options = {
            multiple: false,
            allowedTypes: ['image'],
            onSelect: null,
            onUpload: null,
            title: 'Select or Upload Media',
            buttonText: 'Select Media',
            ...options
        };
        
        this.selectedItems = new Set();
        this.mediaItems = [];
        this.currentView = 'grid';
        this.currentTab = 'library'; // 'library' or 'upload'
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.bindEvents();
    }
    
    createModal() {
        const modalId = 'mediaPickerModal_' + Math.random().toString(36).substr(2, 9);
        this.modalId = modalId;
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl pagemaster-media-popup">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.options.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Tabs -->
                            <div class="custm-media-tabs">
                                <ul class="nav nav-tabs border-0" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="library-tab" data-bs-toggle="tab" data-bs-target="#library-panel" type="button" role="tab">
                                            <i class="bi bi-grid-3x3-gap me-2"></i>Media Library
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="upload-tab" data-bs-toggle="tab" data-bs-target="#upload-panel" type="button" role="tab">
                                            <i class="bi bi-cloud-upload me-2"></i>Upload Files
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="tab-content">
                                <!-- Media Library Tab -->
                                <div class="tab-pane show active p-4" id="library-panel" role="tabpanel">
                                    <!-- Toolbar -->
                                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                                        <div class="btn-group btn-group-sm custom-switch-btn" role="group">
                                            <input type="radio" class="btn-check" name="viewToggle_${modalId}" id="viewGrid_${modalId}" autocomplete="off" checked>
                                            <label class="btn btn-outline-secondary" for="viewGrid_${modalId}" title="Grid view">
                                                <i class="bi bi-grid-3x3-gap"></i>
                                            </label>
                                            <input type="radio" class="btn-check" name="viewToggle_${modalId}" id="viewList_${modalId}" autocomplete="off">
                                            <label class="btn btn-outline-secondary" for="viewList_${modalId}" title="List view">
                                                <i class="bi bi-list"></i>
                                            </label>
                                        </div>
                                        
                                        <select class="form-select form-select-sm w-auto" id="filterType_${modalId}">
                                            <option value="all">All media items</option>
                                            <option value="image">Images</option>
                                            <option value="video">Videos</option>
                                            <option value="audio">Audio</option>
                                            <option value="pdf">PDF</option>
                                            <option value="doc">Documents</option>
                                        </select>
                                        
                                        <div class="ms-auto">
                                            <div class="input-group input-group-sm custom-media-search">
                                                <input type="search" class="form-control" id="searchInput_${modalId}" placeholder="Search media">
                                                <span class="input-group-text"><iconify-icon icon="weui:search-outlined" width="24" height="24"></iconify-icon></span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Loading -->
                                    <div class="text-center py-5 d-none" id="loading_${modalId}">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Media Grid -->
                                    <div class="media-picker-grid row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3" id="mediaGrid_${modalId}"></div>
                                    
                                    <!-- Media List -->
                                    <div class="media-picker-list table-responsive d-none" id="mediaList_${modalId}">
                                        <table class="table table-hover align-middle">
                                            <thead class="table-light">
                                                <tr>
                                                    <th width="50"></th>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Size</th>
                                                </tr>
                                            </thead>
                                            <tbody id="mediaListBody_${modalId}"></tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- Empty State -->
                                    <div class="text-center py-5 d-none" id="emptyState_${modalId}">
                                        <i class="bi bi-folder2-open text-muted" style="font-size: 3rem;"></i>
                                        <p class="text-muted mt-3">No media found. Upload some files to get started!</p>
                                    </div>
                                </div>
                                
                                <!-- Upload Tab -->
                                <div class="tab-pane  p-4" id="upload-panel" role="tabpanel">
                                    <div class="upload-area border-2 border-dashed rounded p-5 text-center" id="uploadArea_${modalId}" style="border-color: #dee2e6; min-height: 300px; display: flex; flex-direction: column; justify-content: center;">
                                        <div class="upload-icon mb-3">
                                            <i class="bi bi-cloud-upload text-primary" style="font-size: 3rem;"></i>
                                        </div>
                                        <h5 class="mb-2">Drop files here or click to browse</h5>
                                        <p class="text-muted mb-3">Maximum file size: 50MB</p>
                                        <button type="button" class="btn btn-primary" id="browseBtn_${modalId}">
                                            <i class="bi bi-folder2-open me-2"></i>Browse Files
                                        </button>
                                        <input type="file" class="d-none" id="fileInput_${modalId}" multiple accept="image/*">
                                    </div>
                                    
                                    <!-- Upload Progress -->
                                    <div class="mt-4 d-none" id="uploadProgress_${modalId}">
                                        <h6>Uploading Files...</h6>
                                        <div class="upload-files-list"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="me-auto">
                                <span class="text-muted small" id="selectionInfo_${modalId}">No items selected</span>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-sm btn-primary" id="selectBtn_${modalId}" disabled>${this.options.buttonText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById(modalId);
        this.bsModal = new bootstrap.Modal(this.modal);
    }
    
    bindEvents() {
        const modalId = this.modalId;
        
        // Tab switching
        document.getElementById('library-tab').addEventListener('click', () => {
            this.currentTab = 'library';
            this.loadMediaLibrary();
        });
        
        document.getElementById('upload-tab').addEventListener('click', () => {
            this.currentTab = 'upload';
        });
        
        // View toggle
        document.getElementById(`viewGrid_${modalId}`).addEventListener('change', () => {
            this.currentView = 'grid';
            this.renderMedia();
        });
        
        document.getElementById(`viewList_${modalId}`).addEventListener('change', () => {
            this.currentView = 'list';
            this.renderMedia();
        });
        
        // Filters
        document.getElementById(`filterType_${modalId}`).addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.renderMedia();
        });
        
        // Search
        let searchTimeout;
        document.getElementById(`searchInput_${modalId}`).addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderMedia();
            }, 300);
        });
        
        // Upload events
        const uploadArea = document.getElementById(`uploadArea_${modalId}`);
        const fileInput = document.getElementById(`fileInput_${modalId}`);
        const browseBtn = document.getElementById(`browseBtn_${modalId}`);
        
        browseBtn.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#0d6efd';
            uploadArea.style.backgroundColor = '#f8f9ff';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#dee2e6';
            uploadArea.style.backgroundColor = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#dee2e6';
            uploadArea.style.backgroundColor = 'transparent';
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
        });
        
        // Select button
        document.getElementById(`selectBtn_${modalId}`).addEventListener('click', () => {
            this.handleSelection();
        });
        
        // Modal events
        this.modal.addEventListener('shown.bs.modal', () => {
            this.loadMediaLibrary();
        });
        
        this.modal.addEventListener('hidden.bs.modal', () => {
            this.cleanup();
        });
    }
    
    async loadMediaLibrary() {
        const modalId = this.modalId;
        const loading = document.getElementById(`loading_${modalId}`);
        const grid = document.getElementById(`mediaGrid_${modalId}`);
        const list = document.getElementById(`mediaList_${modalId}`);
        const emptyState = document.getElementById(`emptyState_${modalId}`);
        
        loading.classList.remove('d-none');
        grid.innerHTML = '';
        
        try {
            const response = await fetch('/api/media/list');
            const result = await response.json();
            
            if (result.success) {
                this.mediaItems = result.data.map(item => ({
                    id: item._id,
                    name: item.originalName,
                    type: item.type,
                    src: item.url,
                    date: item.createdAt,
                    size: item.size,
                    mimeType: item.mimeType,
                    alt: item.alt || '',
                    title: item.title || item.originalName
                }));
                
                this.renderMedia();
            } else {
                this.showError('Error loading media library');
            }
        } catch (error) {
            console.error('Load media error:', error);
            this.showError('Error loading media library');
        } finally {
            loading.classList.add('d-none');
        }
    }
    
    renderMedia() {
        const modalId = this.modalId;
        const filteredItems = this.getFilteredItems();
        
        if (this.currentView === 'grid') {
            this.renderGrid(filteredItems);
            document.getElementById(`mediaGrid_${modalId}`).classList.remove('d-none');
            document.getElementById(`mediaList_${modalId}`).classList.add('d-none');
        } else {
            this.renderList(filteredItems);
            document.getElementById(`mediaGrid_${modalId}`).classList.add('d-none');
            document.getElementById(`mediaList_${modalId}`).classList.remove('d-none');
        }
        
        // Show/hide empty state
        const emptyState = document.getElementById(`emptyState_${modalId}`);
        if (filteredItems.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            emptyState.classList.add('d-none');
        }
        
        this.updateSelectionInfo();
    }
    
    getFilteredItems() {
        let items = this.mediaItems;
        
        // Filter by type
        if (this.filterType && this.filterType !== 'all') {
            items = items.filter(item => item.type === this.filterType);
        }
        
        // Filter by allowed types
        items = items.filter(item => this.options.allowedTypes.includes(item.type));
        
        // Filter by search term
        if (this.searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm) ||
                item.title.toLowerCase().includes(this.searchTerm)
            );
        }
        
        return items;
    }
    
    renderGrid(items) {
        const modalId = this.modalId;
        const grid = document.getElementById(`mediaGrid_${modalId}`);
        
        grid.innerHTML = items.map(item => `
            <div class="col">
                <div class="media-picker-item card h-100 ${this.selectedItems.has(item.id) ? 'border-primary' : ''}" 
                     data-id="${item.id}" style="cursor: pointer;">
                    <div class="position-relative">
                        ${this.renderThumbnail(item)}
                        ${this.selectedItems.has(item.id) ? 
                            '<div class="position-absolute top-0 end-0 m-2"><i class="bi bi-check-circle-fill text-primary fs-5"></i></div>' : 
                            ''
                        }
                    </div>
                    <div class="card-body media-card-body">
                        <div class="small text-truncate" title="${item.name}">${item.name}</div>
                        <div class="text-muted small">${this.formatFileSize(item.size)}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Bind click events
        grid.querySelectorAll('.media-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                this.toggleSelection(item.dataset.id);
            });
        });
    }
    
    renderList(items) {
        const modalId = this.modalId;
        const tbody = document.getElementById(`mediaListBody_${modalId}`);
        
        tbody.innerHTML = items.map(item => `
            <tr class="media-picker-item ${this.selectedItems.has(item.id) ? 'table-primary' : ''}" 
                data-id="${item.id}" style="cursor: pointer;">
                <td>
                    <div style="width: 40px; height: 40px; overflow: hidden; border-radius: 4px;">
                        ${this.renderThumbnail(item, 'small')}
                    </div>
                </td>
                <td>
                    <div class="fw-medium">${item.name}</div>
                    <div class="text-muted small">${item.title}</div>
                </td>
                <td><span class="badge bg-secondary">${item.type}</span></td>
                <td class="text-muted small">${this.formatDate(item.date)}</td>
                <td class="text-muted small">${this.formatFileSize(item.size)}</td>
            </tr>
        `).join('');
        
        // Bind click events
        tbody.querySelectorAll('.media-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                this.toggleSelection(item.dataset.id);
            });
        });
    }
    
    renderThumbnail(item, size = 'normal') {
        const className = size === 'small' ? 'w-100 h-100' : 'card-img-top';
        const style = size === 'small' ? 'object-fit: cover;' : 'height: 120px; object-fit: cover;';
        
        if (item.type === 'image') {
            return `<img src="${item.src}" class="${className}" style="${style}" alt="${item.name}">`;
        }
        
        const iconMap = {
            video: 'bi-camera-video-fill text-info',
            audio: 'bi-music-note-beamed text-success',
            pdf: 'bi-file-earmark-pdf-fill text-danger',
            doc: 'bi-file-earmark-word-fill text-primary'
        };
        
        const iconClass = iconMap[item.type] || 'bi-file-earmark text-secondary';
        const iconSize = size === 'small' ? 'fs-6' : 'fs-1';
        
        return `<div class="d-flex align-items-center justify-content-center bg-light ${className}" style="${style}">
                    <i class="bi ${iconClass} ${iconSize}"></i>
                </div>`;
    }
    
    toggleSelection(itemId) {
        if (!this.options.multiple) {
            this.selectedItems.clear();
        }
        
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }
        
        this.renderMedia();
        this.updateSelectButton();
    }
    
    updateSelectionInfo() {
        const modalId = this.modalId;
        const info = document.getElementById(`selectionInfo_${modalId}`);
        const count = this.selectedItems.size;
        
        if (count === 0) {
            info.textContent = 'No items selected';
        } else if (count === 1) {
            info.textContent = '1 item selected';
        } else {
            info.textContent = `${count} items selected`;
        }
    }
    
    updateSelectButton() {
        const modalId = this.modalId;
        const btn = document.getElementById(`selectBtn_${modalId}`);
        btn.disabled = this.selectedItems.size === 0;
    }
    
    async handleFileUpload(files) {
        const modalId = this.modalId;
        const progressContainer = document.getElementById(`uploadProgress_${modalId}`);
        const filesList = progressContainer.querySelector('.upload-files-list');
        
        progressContainer.classList.remove('d-none');
        filesList.innerHTML = '';
        
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        // Create progress items
        files.forEach((file, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'mb-2';
            progressItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small">${file.name}</span>
                    <span class="small text-muted">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="progress" style="height: 4px;">
                    <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
            `;
            filesList.appendChild(progressItem);
        });
        
        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    filesList.querySelectorAll('.progress-bar').forEach(bar => {
                        bar.style.width = percentComplete + '%';
                    });
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    if (result.success) {
                        this.showSuccess(`${files.length} file(s) uploaded successfully`);
                        
                        // Switch to library tab and refresh
                        document.getElementById('library-tab').click();
                        this.loadMediaLibrary();
                        
                        // Call upload callback
                        if (this.options.onUpload) {
                            this.options.onUpload(result.data);
                        }
                    } else {
                        this.showError(result.message || 'Upload failed');
                    }
                } else {
                    this.showError('Upload failed');
                }
                
                progressContainer.classList.add('d-none');
            });
            
            xhr.addEventListener('error', () => {
                this.showError('Upload failed');
                progressContainer.classList.add('d-none');
            });
            
            xhr.open('POST', '/api/media/upload');
            xhr.send(formData);
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError('Upload failed');
            progressContainer.classList.add('d-none');
        }
    }
    
    handleSelection() {
        const selectedItems = Array.from(this.selectedItems).map(id => 
            this.mediaItems.find(item => item.id === id)
        ).filter(Boolean);
        
        if (this.options.onSelect) {
            this.options.onSelect(this.options.multiple ? selectedItems : selectedItems[0]);
        }
        
        this.close();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
    
    open() {
        this.bsModal.show();
    }
    
    close() {
        this.bsModal.hide();
    }
    
    cleanup() {
        this.selectedItems.clear();
        this.mediaItems = [];
    }
}

// Global function to create media picker
window.createMediaPicker = function(options) {
    return new MediaPicker(options);
};