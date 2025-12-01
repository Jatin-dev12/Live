/**
 * Media Picker Integration Helper
 * Easy integration of WordPress-style media picker into forms
 */

class MediaPickerIntegration {
    constructor() {
        this.pickers = new Map();
    }
    
    /**
     * Initialize media picker for an input field
     * @param {string} inputSelector - CSS selector for the input field
     * @param {Object} options - Configuration options
     */
    init(inputSelector, options = {}) {
        const input = document.querySelector(inputSelector);
        if (!input) {
            console.error('Media picker input not found:', inputSelector);
            return;
        }
        
        const config = {
            multiple: false,
            allowedTypes: ['image'],
            title: 'Select or Upload Media',
            buttonText: 'Select Media',
            showPreview: true,
            previewContainer: null,
            ...options
        };
        
        // Create wrapper if it doesn't exist
        let wrapper = input.closest('.media-picker-wrapper');
        if (!wrapper) {
            wrapper = this.createWrapper(input, config);
        }
        
        // Create media picker instance
        const picker = new MediaPicker({
            ...config,
            onSelect: (selectedMedia) => {
                this.handleMediaSelection(input, selectedMedia, config);
            },
            onUpload: (uploadedMedia) => {
                if (config.onUpload) {
                    config.onUpload(uploadedMedia);
                }
            }
        });
        
        this.pickers.set(inputSelector, picker);
        
        // Bind events
        this.bindEvents(wrapper, picker, input, config);
        
        // Initialize preview if there's existing value
        if (input.value) {
            this.updatePreview(wrapper, input.value, config);
        }
        
        return picker;
    }
    
    createWrapper(input, config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'media-picker-wrapper';
        
        // Hide original input
        input.style.display = 'none';
        
        // Insert wrapper after input
        input.parentNode.insertBefore(wrapper, input.nextSibling);
        wrapper.appendChild(input);
        
        // Create UI elements
        const ui = this.createUI(config);
        wrapper.appendChild(ui);
        
        return wrapper;
    }
    
    createUI(config) {
        const ui = document.createElement('div');
        ui.className = 'media-picker-ui';
        
        ui.innerHTML = `
            <div class="media-input-wrapper" data-state="empty">
                <div class="empty-state">
                    <div class="media-icon">
                        <i class="bi bi-image"></i>
                    </div>
                    <div class="media-text">
                        <strong>Click to browse or drag and drop</strong>
                        <br>
                        <small class="text-muted">Choose from media library or upload new files</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary">
                        <i class="bi bi-folder2-open me-2"></i>Choose Media
                    </button>
                </div>
                
                <div class="media-preview d-none">
                    <div class="preview-content"></div>
                    <div class="preview-actions mt-3">
                        <button type="button" class="btn btn-sm btn-outline-primary change-media">
                            <i class="bi bi-arrow-repeat me-1"></i>Change
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-media">
                            <iconify-icon icon="si:close-line" width="20" height="20"></iconify-icon>
                        </button>
                    </div>
                    <div class="preview-info filemane">
                        <small class="text-muted preview-filename"></small>
                    </div>
                </div>
            </div>
        `;
        
        return ui;
    }
    
    bindEvents(wrapper, picker, input, config) {
        const ui = wrapper.querySelector('.media-picker-ui');
        const emptyState = ui.querySelector('.empty-state');
        const previewState = ui.querySelector('.media-preview');
        
        // Click to open picker
        emptyState.addEventListener('click', () => {
            console.log("emptyState clicked");
            picker.open();
        });
        /* let empty = ui.querySelector('.empty-state');

        // Reset old listeners
        const newEmpty = empty.cloneNode(true);
        empty.parentNode.replaceChild(newEmpty, empty);

        // Fresh listener
        newEmpty.addEventListener('click', () => {
            console.log("emptyState clicked");
            picker.open();
        }); */
        
        ui.querySelector('.change-media').addEventListener('click', () => {
            console.log("change-media clicked");            
            picker.open();
        });
        /* const changeBtn = ui.querySelector('.change-media');
        changeBtn.replaceWith(changeBtn.cloneNode(true));
        const newChangeBtn = ui.querySelector('.change-media');
        // Add fresh listener
        newChangeBtn.addEventListener('click', () => {
            console.log("change-media clicked");
            picker.open();
        }); */
        
        // Remove media
        ui.querySelector('.remove-media').addEventListener('click', () => {
            console.log("remove-media clicked");
            this.clearMedia(wrapper, input, config);
        });
        /* let removeBtn = ui.querySelector('.remove-media');
        // Reset all old listeners
        const clonedRemoveBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(clonedRemoveBtn, removeBtn);
        // Now add event listener to the new clone
        clonedRemoveBtn.addEventListener('click', () => {
            console.log("remove-media clicked");
            this.clearMedia(wrapper, input, config);
        }); */
        
        // Drag and drop support
        const inputWrapper = ui.querySelector('.media-input-wrapper');
        
        inputWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            inputWrapper.classList.add('dragover');
        });
        
        inputWrapper.addEventListener('dragleave', (e) => {
            e.preventDefault();
            inputWrapper.classList.remove('dragover');
        });
        
        inputWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            inputWrapper.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                // For now, just open the picker and switch to upload tab
                picker.open();
                // TODO: Auto-upload dropped files
            }
        });
    }
    
    handleMediaSelection(input, selectedMedia, config) {
        const wrapper = input.closest('.media-picker-wrapper');
        
        if (config.multiple) {
            // Handle multiple selection
            const urls = selectedMedia.map(item => item.src);
            input.value = JSON.stringify(urls);
            this.updatePreview(wrapper, urls, config);
        } else {
            // Handle single selection
            input.value = selectedMedia.src;
            this.updatePreview(wrapper, selectedMedia.src, config, selectedMedia);
        }
        
        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Call custom callback
        if (config.onSelect) {
            config.onSelect(selectedMedia, input);
        }
    }
    
    updatePreview(wrapper, value, config, mediaData = null) {
        const ui = wrapper.querySelector('.media-picker-ui');
        const inputWrapper = ui.querySelector('.media-input-wrapper');
        const emptyState = ui.querySelector('.empty-state');
        const previewState = ui.querySelector('.media-preview');
        const previewContent = ui.querySelector('.preview-content');
        const previewFilename = ui.querySelector('.preview-filename');
        
        if (!value || (Array.isArray(value) && value.length === 0)) {
            // Show empty state
            inputWrapper.setAttribute('data-state', 'empty');
            emptyState.classList.remove('d-none');
            previewState.classList.add('d-none');
            inputWrapper.classList.remove('has-media');
        } else {
            // Show preview state
            inputWrapper.setAttribute('data-state', 'has-media');
            emptyState.classList.add('d-none');
            previewState.classList.remove('d-none');
            inputWrapper.classList.add('has-media');
            
            if (config.multiple && Array.isArray(value)) {
                // Multiple files preview
                previewContent.innerHTML = value.map(url => 
                    `<img src="${url}" class="img-thumbnail me-2 mb-2" style="max-width: 100px; max-height: 100px;">`
                ).join('');
                previewFilename.textContent = `${value.length} file(s) selected`;
            } else {
                // Single file preview
                const url = Array.isArray(value) ? value[0] : value;
                
                if (this.isImage(url)) {
                    previewContent.innerHTML = `
                        <img src="${url}" class="img-thumbnail" style="max-width: 200px; max-height: 150px; object-fit: cover;">
                    `;
                } else {
                    previewContent.innerHTML = `
                        <div class="d-flex align-items-center p-3 border rounded">
                            <i class="bi bi-file-earmark fs-3 me-3 text-muted"></i>
                            <div>
                                <div class="fw-medium">Media File</div>
                                <small class="text-muted">Click change to select different file</small>
                            </div>
                        </div>
                    `;
                }
                
                if (mediaData && mediaData.name) {
                    previewFilename.textContent = mediaData.name;
                } else {
                    const filename = url.split('/').pop();
                    previewFilename.textContent = filename;
                }
            }
        }
    }
    
    clearMedia(wrapper, input, config) {
        input.value = '';
        this.updatePreview(wrapper, '', config);
        
        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Call custom callback
        if (config.onClear) {
            config.onClear(input);
        }
    }
    
    isImage(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
        return imageExtensions.includes(extension);
    }
    
    /**
     * Get picker instance by input selector
     */
    getPicker(inputSelector) {
        return this.pickers.get(inputSelector);
    }
    
    /**
     * Destroy picker instance
     */
    destroy(inputSelector) {
        const picker = this.pickers.get(inputSelector);
        if (picker) {
            picker.cleanup();
            this.pickers.delete(inputSelector);
        }
        
        const input = document.querySelector(inputSelector);
        if (input) {
            const wrapper = input.closest('.media-picker-wrapper');
            if (wrapper) {
                // Restore original input
                input.style.display = '';
                wrapper.parentNode.insertBefore(input, wrapper);
                wrapper.remove();
            }
        }
    }
    
    /**
     * Destroy all picker instances
     */
    destroyAll() {
        for (const [selector, picker] of this.pickers) {
            this.destroy(selector);
        }
    }
}

// Create global instance
window.mediaPickerIntegration = new MediaPickerIntegration();

// Convenience function
window.initMediaPicker = function(inputSelector, options = {}) {
    return window.mediaPickerIntegration.init(inputSelector, options);
};

// Auto-initialize media pickers with data attributes
document.addEventListener('DOMContentLoaded', function() {
    // Look for inputs with data-media-picker attribute
    document.querySelectorAll('input[data-media-picker]').forEach(input => {
        const options = {};
        
        // Parse data attributes
        if (input.dataset.mediaPickerMultiple === 'true') {
            options.multiple = true;
        }
        
        if (input.dataset.mediaPickerTypes) {
            options.allowedTypes = input.dataset.mediaPickerTypes.split(',');
        }
        
        if (input.dataset.mediaPickerTitle) {
            options.title = input.dataset.mediaPickerTitle;
        }
        
        if (input.dataset.mediaPickerButton) {
            options.buttonText = input.dataset.mediaPickerButton;
        }
        
        // Initialize picker
        const selector = input.id ? `#${input.id}` : `input[name="${input.name}"]`;
        window.mediaPickerIntegration.init(selector, options);
    });
});