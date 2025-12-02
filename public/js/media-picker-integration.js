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
        
        // Check if already initialized
        const existingPicker = this.pickers.get(inputSelector);
        if (existingPicker) {
            console.log('Media picker already initialized for:', inputSelector);
            return existingPicker;
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
        } else {
            // Clean up existing events if wrapper exists
            this.cleanupEvents(wrapper);
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
        // Check if events are already bound to prevent duplicates
        if (wrapper.dataset.eventsBound === 'true') {
            return;
        }
        
        const ui = wrapper.querySelector('.media-picker-ui');
        const emptyState = ui.querySelector('.empty-state');
        const previewState = ui.querySelector('.media-preview');
        
        // Define event handlers as named functions so they can be removed if needed
        const emptyStateClickHandler = () => {
            console.log("emptyState clicked");
            picker.open();
        };
        
        const changeMediaClickHandler = () => {
            console.log("change-media clicked");            
            picker.open();
        };
        
        const removeMediaClickHandler = () => {
            console.log("remove-media clicked");
            this.clearMedia(wrapper, input, config);
        };
        
        const dragOverHandler = (e) => {
            e.preventDefault();
            inputWrapper.classList.add('dragover');
        };
        
        const dragLeaveHandler = (e) => {
            e.preventDefault();
            inputWrapper.classList.remove('dragover');
        };
        
        const dropHandler = (e) => {
            e.preventDefault();
            inputWrapper.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                // For now, just open the picker and switch to upload tab
                picker.open();
                // TODO: Auto-upload dropped files
            }
        };
        
        // Click to open picker
        emptyState.addEventListener('click', emptyStateClickHandler);
        
        // Change media
        ui.querySelector('.change-media').addEventListener('click', changeMediaClickHandler);
        
        // Remove media
        ui.querySelector('.remove-media').addEventListener('click', removeMediaClickHandler);
        
        // Drag and drop support
        const inputWrapper = ui.querySelector('.media-input-wrapper');
        
        inputWrapper.addEventListener('dragover', dragOverHandler);
        inputWrapper.addEventListener('dragleave', dragLeaveHandler);
        inputWrapper.addEventListener('drop', dropHandler);
        
        // Store event handlers for potential cleanup
        wrapper._eventHandlers = {
            emptyStateClickHandler,
            changeMediaClickHandler,
            removeMediaClickHandler,
            dragOverHandler,
            dragLeaveHandler,
            dropHandler
        };
        
        // Mark as bound to prevent duplicate binding
        wrapper.dataset.eventsBound = 'true';
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
     * Clean up event listeners for a wrapper
     */
    cleanupEvents(wrapper) {
        if (wrapper._eventHandlers) {
            const ui = wrapper.querySelector('.media-picker-ui');
            const emptyState = ui.querySelector('.empty-state');
            const inputWrapper = ui.querySelector('.media-input-wrapper');
            
            // Remove event listeners
            emptyState.removeEventListener('click', wrapper._eventHandlers.emptyStateClickHandler);
            ui.querySelector('.change-media').removeEventListener('click', wrapper._eventHandlers.changeMediaClickHandler);
            ui.querySelector('.remove-media').removeEventListener('click', wrapper._eventHandlers.removeMediaClickHandler);
            
            inputWrapper.removeEventListener('dragover', wrapper._eventHandlers.dragOverHandler);
            inputWrapper.removeEventListener('dragleave', wrapper._eventHandlers.dragLeaveHandler);
            inputWrapper.removeEventListener('drop', wrapper._eventHandlers.dropHandler);
            
            // Clear stored handlers
            delete wrapper._eventHandlers;
            delete wrapper.dataset.eventsBound;
        }
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
                // Clean up event listeners first
                this.cleanupEvents(wrapper);
                
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