let currentMenuSlug = null;
let menuItems = [];
let isSelectAllActive = false;
let availablePages = [];

document.addEventListener('DOMContentLoaded', function () {
    initializeMenuManagement();
    loadAvailablePages();
    // Auto-load header menu by default
    document.getElementById('menuSelect').value = 'header-menu';
    loadMenu();
});

function initializeMenuManagement() {
    document.getElementById('selectMenuBtn')?.addEventListener('click', loadMenu);
    document.getElementById('selectAllBtn')?.addEventListener('click', toggleSelectAll);
    document.getElementById('addToMenuBtn')?.addEventListener('click', addSelectedPages);
    document.getElementById('saveBtn')?.addEventListener('click', () => saveMenu(true));
    document.getElementById('resetBtn')?.addEventListener('click', resetMenu);
}

async function loadAvailablePages() {
    try {
        const checkboxes = document.querySelectorAll('.page-checkbox');
        availablePages = Array.from(checkboxes).map(cb => ({
            title: cb.dataset.title,
            url: cb.dataset.url
        }));
    } catch (error) {
        console.error('Error loading pages:', error);
    }
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.page-checkbox');
    isSelectAllActive = !isSelectAllActive;
    checkboxes.forEach(cb => {
        const parentDiv = cb.closest('.form-check');
        if (parentDiv.style.display !== 'none') {
            cb.checked = isSelectAllActive;
        }
    });
    document.getElementById('selectAllBtn').textContent = isSelectAllActive ? 'Deselect All' : 'Select All';
}

async function loadMenu() {
    const menuSlug = document.getElementById('menuSelect').value;
    if (!menuSlug) {
        showNotification('Please select a menu', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/menus/${menuSlug}`);
        const data = await response.json();

        if (data.success && data.menu) {
            currentMenuSlug = menuSlug;
            console.log('Raw menu data from API:', data.menu.items);
            menuItems = flattenMenuItems(data.menu.items || []);
            console.log('Flattened menu items:', menuItems);
            const menuName = menuSlug === 'header-menu' ? 'Header Menu' : 'Footer Menu';
            document.getElementById('currentMenuName').textContent = `${menuName}`;
            document.getElementById('menuStructurePanel').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';
            renderMenuItems();
            showPageList();
            showNotification('Menu loaded successfully', 'success');
        } else {
            await createDefaultMenu(menuSlug);
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        await createDefaultMenu(menuSlug);
    }
}

// Flatten hierarchical menu structure for editing
function flattenMenuItems(items, parentId = null) {
    let flattened = [];
    items.forEach(item => {
        const flatItem = {
            _id: item._id || item.title, // Use _id if available, fallback to title
            title: item.title,
            url: item.url,
            target: item.target || '_self',
            order: item.order || 0,
            isActive: item.isActive !== false,
            parentId: item.parentId || parentId // Preserve existing parentId or use passed one
        };
        flattened.push(flatItem);
        
        if (item.children && item.children.length > 0) {
            flattened = flattened.concat(flattenMenuItems(item.children, item._id || item.title));
        }
    });
    return flattened;
}

function showPageList() {
    const loader = document.getElementById('pageListLoader');
    const content = document.getElementById('pageListContent');
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';
}

async function createDefaultMenu(slug) {
    const name = slug === 'header-menu' ? 'Header Menu' : 'Footer Menu';
    const location = slug === 'header-menu' ? 'header' : 'footer';

    try {
        const response = await fetch('/api/menus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, slug, location, items: [] })
        });

        const data = await response.json();
        if (data.success) {
            currentMenuSlug = slug;
            menuItems = [];
            document.getElementById('currentMenuName').textContent = `(${name})`;
            document.getElementById('menuStructurePanel').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';
            renderMenuItems();
            showPageList();
            showNotification(`${name} created successfully`, 'success');
        }
    } catch (error) {
        console.error('Error creating menu:', error);
        showNotification('Error creating menu', 'error');
    }
}

async function addSelectedPages() {
    const checkboxes = document.querySelectorAll('.page-checkbox:checked');

    if (checkboxes.length === 0) {
        showNotification('Please select at least one page', 'warning');
        return;
    }

    if (!currentMenuSlug) {
        showNotification('Please select a menu first', 'warning');
        return;
    }

    let addedCount = 0;
    checkboxes.forEach(checkbox => {
        const title = checkbox.dataset.title;
        const url = checkbox.dataset.url;

        if (!menuItems.some(item => item.url === url)) {
            menuItems.push({
                title,
                url,
                target: '_self',
                order: menuItems.length,
                isActive: true,
                parentId: null
            });
            addedCount++;
        }
        checkbox.checked = false;
    });

    isSelectAllActive = false;
    document.getElementById('selectAllBtn').textContent = 'Select All';
    renderMenuItems();

    // Auto-save to database
    if (addedCount > 0) {
        await saveMenu();
    }
}

function renderMenuItems() {
    const menuList = document.getElementById('menuList');

    if (menuItems.length === 0) {
        menuList.innerHTML = '<p class="text-muted text-center py-4">No menu items yet. Add pages from the left panel.</p>';
        updateAvailablePages();
        return;
    }

    // Build hierarchical structure for display
    const hierarchy = buildHierarchy(menuItems);
    console.log('Built hierarchy for display:', hierarchy);
    menuList.innerHTML = renderHierarchy(hierarchy);

    // Attach event listeners
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeMenuItem(this.dataset.id);
        });
    });

    document.querySelectorAll('.add-submenu-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            showSubmenuPageList(this.dataset.id);
        });
    });

    document.querySelectorAll('.toggle-children-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            toggleChildren(this.dataset.id);
        });
    });

    makeItemsDraggable();
    updateAvailablePages();
}

function buildHierarchy(items) {
    const itemMap = {};
    const rootItems = [];
    
    // First pass: create map of all items using MongoDB _id
    items.forEach(item => {
        const itemId = item._id ? item._id.toString() : item.title;
        itemMap[itemId] = { ...item, children: [] };
    });
    
    // Second pass: build parent-child relationships
    items.forEach(item => {
        const itemId = item._id ? item._id.toString() : item.title;
        const parentId = item.parentId ? item.parentId.toString() : null;
        
        if (parentId && itemMap[parentId]) {
            itemMap[parentId].children.push(itemMap[itemId]);
        } else {
            rootItems.push(itemMap[itemId]);
        }
    });
    
    return rootItems;
}

function renderHierarchy(items, level = 0) {
    return items.map(item => {
        const itemId = item._id || item.title;
        const hasChildren = item.children && item.children.length > 0;
        const indent = level * 30;
        
        return `
            <div class="menu-item-wrapper" data-id="${itemId}">
                <div class="menu-item-row" data-id="${itemId}" data-level="${level}" style="margin-left: ${indent}px;">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2 flex-grow-1">
                            <iconify-icon icon="material-symbols:drag-indicator" class="drag-handle" style="cursor: move;"></iconify-icon>
                            ${level > 0 ? '<iconify-icon icon="material-symbols:subdirectory-arrow-right" style="color: #999;"></iconify-icon>' : ''}
                            <span class="fw-${level === 0 ? 'semibold' : 'normal'}">${escapeHtml(item.title)}</span>
                            ${hasChildren ? `
                                <button class="btn btn-sm btn-link p-0 toggle-children-btn" data-id="${itemId}" title="Toggle Children">
                                    <iconify-icon icon="material-symbols:expand-more" class="toggle-icon-${itemId}"></iconify-icon>
                                </button>
                                <span class="badge bg-secondary">${item.children.length}</span>
                            ` : ''}
                        </div>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-outline-primary add-submenu-btn" data-id="${itemId}" title="Add Submenu">
                                <iconify-icon icon="material-symbols:add"></iconify-icon>
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-item-btn" data-id="${itemId}">
                                <iconify-icon icon="material-symbols:delete-outline"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </div>
                ${hasChildren ? `<div class="children-container" data-parent="${itemId}" style="display: block;">${renderHierarchy(item.children, level + 1)}</div>` : ''}
            </div>
        `;
    }).join('');
}

function toggleChildren(itemId) {
    const container = document.querySelector(`.children-container[data-parent="${itemId}"]`);
    const icon = document.querySelector(`.toggle-icon-${itemId}`);
    
    if (container) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            icon.setAttribute('icon', 'material-symbols:expand-more');
        } else {
            container.style.display = 'none';
            icon.setAttribute('icon', 'material-symbols:chevron-right');
        }
    }
}

function showSubmenuPageList(parentId) {
    const pageListHtml = availablePages.map((page, index) => `
        <div class="page-item">
            <input type="checkbox" class="submenu-page-checkbox" id="page-check-${index}"
                   data-title="${escapeHtml(page.title)}" 
                   data-url="${escapeHtml(page.url)}">
            <label for="page-check-${index}">${escapeHtml(page.title)}</label>
        </div>
    `).join('');
    
    Swal.fire({
        title: 'Add Submenu',
        html: `
            <style>
                .submenu-modal-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e0e0e0;
                }
                .submenu-modal-tab {
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                }
                .submenu-modal-tab.active {
                    color: #0d6efd;
                    border-bottom-color: #0d6efd;
                }
                .submenu-modal-content {
                    display: none;
                    text-align: left;
                }
                .submenu-modal-content.active {
                    display: block;
                }
                .page-list {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    padding: 10px;
                }
                .page-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 12px;
                    border-radius: 6px;
                    margin-bottom: 6px;
                    border: 1px solid #e0e0e0;
                    transition: all 0.2s;
                    background: white;
                }
                .page-item:hover {
                    background: #f8f9fa;
                    border-color: #0d6efd;
                }
                .page-item input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    min-width: 18px;
                    min-height: 18px;
                    margin: 0;
                    margin-right: 12px;
                    cursor: pointer;
                    accent-color: #0d6efd;
                    -webkit-appearance: checkbox;
                    appearance: checkbox;
                }
                .page-item label {
                    font-size: 14px;
                    color: #212529;
                    font-weight: 500;
                    cursor: pointer;
                    margin: 0;
                    flex: 1;
                }
                .custom-form {
                    text-align: left;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    font-size: 14px;
                }
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #0d6efd;
                }
                .select-all-btn {
                    background: #f0f0f0;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    margin-bottom: 10px;
                }
                .select-all-btn:hover {
                    background: #e0e0e0;
                }
            </style>
            
            <div class="submenu-modal-tabs">
                <button class="submenu-modal-tab active" data-tab="pages">Select Pages</button>
                <button class="submenu-modal-tab" data-tab="custom">Custom Link</button>
            </div>
            
            <div id="pages-content" class="submenu-modal-content active">
                <button class="select-all-btn" id="selectAllBtn">Select All</button>
                <div class="page-list">
                    ${pageListHtml}
                </div>
            </div>
            
            <div id="custom-content" class="submenu-modal-content">
                <div class="custom-form">
                    <div class="form-group">
                        <label>Menu Title *</label>
                        <input type="text" id="customTitle" placeholder="Enter menu title">
                    </div>
                    <div class="form-group">
                        <label>URL *</label>
                        <input type="text" id="customUrl" placeholder="https://example.com or /page">
                    </div>
                    <div class="form-group">
                        <label>Open In</label>
                        <select id="customTarget">
                            <option value="_self">Same Window</option>
                            <option value="_blank">New Window</option>
                        </select>
                    </div>
                </div>
            </div>
        `,
        width: '500px',
        showCancelButton: true,
        confirmButtonText: 'Add',
        cancelButtonText: 'Cancel',
        didOpen: () => {
            // Tab switching
            document.querySelectorAll('.submenu-modal-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.submenu-modal-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.submenu-modal-content').forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    const tabName = this.dataset.tab;
                    document.getElementById(tabName + '-content').classList.add('active');
                });
            });
            
            // Select all functionality
            let selectAllState = false;
            document.getElementById('selectAllBtn').addEventListener('click', function() {
                selectAllState = !selectAllState;
                document.querySelectorAll('.submenu-page-checkbox').forEach(cb => {
                    cb.checked = selectAllState;
                });
                this.textContent = selectAllState ? 'Deselect All' : 'Select All';
            });
        },
        preConfirm: () => {
            const activeContent = document.querySelector('.submenu-modal-content.active').id;
            
            if (activeContent === 'pages-content') {
                const selected = document.querySelectorAll('.submenu-page-checkbox:checked');
                if (selected.length === 0) {
                    Swal.showValidationMessage('Please select at least one page');
                    return false;
                }
                
                return {
                    type: 'pages',
                    items: Array.from(selected).map(cb => ({
                        title: cb.dataset.title,
                        url: cb.dataset.url,
                        target: '_self'
                    }))
                };
            } else {
                const title = document.getElementById('customTitle').value.trim();
                const url = document.getElementById('customUrl').value.trim();
                const target = document.getElementById('customTarget').value;
                
                if (!title) {
                    Swal.showValidationMessage('Please enter a menu title');
                    return false;
                }
                if (!url) {
                    Swal.showValidationMessage('Please enter a URL');
                    return false;
                }
                
                return {
                    type: 'custom',
                    items: [{
                        title: title,
                        url: url,
                        target: target
                    }]
                };
            }
        }
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            // Find the parent item to get its MongoDB _id
            const parentItem = menuItems.find(item => (item._id && item._id.toString() === parentId) || item.title === parentId);
            const actualParentId = parentItem && parentItem._id ? parentItem._id.toString() : parentId;
            
            console.log('Adding submenu with parentId:', actualParentId);
            
            result.value.items.forEach(item => {
                menuItems.push({
                    title: item.title,
                    url: item.url,
                    target: item.target,
                    order: menuItems.length,
                    isActive: true,
                    parentId: actualParentId
                });
            });
            
            const saved = await saveMenu(true);
            if (saved) {
                // Reload menu to get proper MongoDB _id values and show hierarchy
                await loadMenu();
                showNotification(`${result.value.items.length} submenu item(s) added successfully`, 'success');
            } else {
                renderMenuItems();
            }
        }
    });
}

function updateAvailablePages() {
    const checkboxes = document.querySelectorAll('.page-checkbox');
    const menuUrls = menuItems.map(item => item.url);
    let visibleCount = 0;
    
    checkboxes.forEach(checkbox => {
        const pageUrl = checkbox.dataset.url;
        const parentDiv = checkbox.closest('.form-check');
        
        if (menuUrls.includes(pageUrl)) {
            parentDiv.style.setProperty('display', 'none', 'important');
            checkbox.checked = false;
        } else {
            parentDiv.style.removeProperty('display');
            visibleCount++;
        }
    });
    
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        if (visibleCount === 0) {
            selectAllBtn.style.display = 'none';
        } else {
            selectAllBtn.style.display = 'block';
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function makeItemsDraggable() {
    const items = document.querySelectorAll('.menu-item-row');
    let draggedItem = null;

    items.forEach(item => {
        const dragHandle = item.querySelector('.drag-handle');
        
        dragHandle.addEventListener('mousedown', function() {
            item.setAttribute('draggable', 'true');
        });
        
        item.addEventListener('dragstart', function () {
            draggedItem = this;
            this.style.opacity = '0.5';
        });

        item.addEventListener('dragend', function () {
            this.style.opacity = '1';
            this.setAttribute('draggable', 'false');
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        item.addEventListener('drop', async function (e) {
            e.preventDefault();
            if (draggedItem !== this) {
                const draggedId = draggedItem.dataset.id;
                const targetId = this.dataset.id;
                
                const draggedIndex = menuItems.findIndex(item => (item._id || item.title) === draggedId);
                const targetIndex = menuItems.findIndex(item => (item._id || item.title) === targetId);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const temp = menuItems[draggedIndex];
                    menuItems.splice(draggedIndex, 1);
                    menuItems.splice(targetIndex, 0, temp);
                    renderMenuItems();
                    await saveMenu();
                    showNotification('Menu order updated', 'success');
                }
            }
        });
    });
}

async function removeMenuItem(itemId) {
    const result = await Swal.fire({
        title: 'Remove Menu Item?',
        text: 'This will also remove submenu items. Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        // Remove item and all its children
        const removeItemAndChildren = (id) => {
            const children = menuItems.filter(item => item.parentId === id);
            children.forEach(child => removeItemAndChildren(child._id || child.title));
            menuItems = menuItems.filter(item => (item._id || item.title) !== id);
        };
        
        removeItemAndChildren(itemId);
        renderMenuItems();
        showNotification('Please click "Save Menu" to save changes', 'info', 2000);
    }
}

async function saveMenu(showNotif = false) {
    if (!currentMenuSlug) {
        if (showNotif) showNotification('Please select a menu first', 'warning');
        return;
    }

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';

    try {
        const getResponse = await fetch(`/api/menus/${currentMenuSlug}`);
        const getData = await getResponse.json();

        if (!getData.success || !getData.menu) {
            if (showNotif) showNotification('Menu not found', 'error');
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
            return;
        }

        // Clean up items before saving
        const cleanedItems = menuItems.map(item => ({
            title: item.title,
            url: item.url,
            target: item.target || '_self',
            order: item.order || 0,
            isActive: item.isActive !== false,
            parentId: item.parentId || null
        }));

        console.log('=== SAVING MENU ===');
        console.log('Cleaned items being sent to API:', JSON.stringify(cleanedItems, null, 2));
        console.log('==================');

        const response = await fetch(`/api/menus/${getData.menu._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cleanedItems })
        });

        const data = await response.json();
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        
        if (data.success) {
            if (showNotif) showNotification('Menu saved successfully', 'success');
            return true;
        } else {
            if (showNotif) showNotification(data.message || 'Error saving menu', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error saving menu:', error);
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        if (showNotif) showNotification('Error saving menu', 'error');
        return false;
    }
}

async function resetMenu() {
    const result = await Swal.fire({
        title: 'Reset Menu?',
        text: 'Are you sure you want to reset the menu? All unsaved changes will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, reset it',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        loadMenu();
        Swal.fire({
            title: 'Reset!',
            text: 'Menu has been reset.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            showClass: {
                popup: 'swal2-noanimation'
            }
        });
    }
}

function showNotification(message, type = 'info', timer = 500) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        showClass: {
            popup: 'swal2-noanimation'
        },
        hideClass: {
            popup: ''
        },
        customClass: {
            title: 'swal-toast-small',
            popup: 'swal-toast-small-popup'
        },
    });

    Toast.fire({
        icon: type === 'error' ? 'error' : type,
        title: message
    });
}
