let currentMenuSlug = null;
let menuItems = [];
let isSelectAllActive = false;

document.addEventListener('DOMContentLoaded', function () {
    initializeMenuManagement();
    // Auto-load header menu by default
    setTimeout(() => {
        document.getElementById('menuSelect').value = 'header-menu';
        loadMenu();
    }, 100);
});

function initializeMenuManagement() {
    document.getElementById('selectMenuBtn')?.addEventListener('click', loadMenu);
    document.getElementById('selectAllBtn')?.addEventListener('click', toggleSelectAll);
    document.getElementById('addToMenuBtn')?.addEventListener('click', addSelectedPages);
    document.getElementById('saveBtn')?.addEventListener('click', () => saveMenu(true));
    document.getElementById('resetBtn')?.addEventListener('click', resetMenu);
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.page-checkbox');
    isSelectAllActive = !isSelectAllActive;
    checkboxes.forEach(cb => cb.checked = isSelectAllActive);
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
            menuItems = data.menu.items || [];
            const menuName = menuSlug === 'header-menu' ? 'Header Menu' : 'Footer Menu';
            document.getElementById('currentMenuName').textContent = `${menuName}`;
            document.getElementById('menuStructurePanel').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';
            renderMenuItems();
            showNotification('Menu loaded successfully', 'success');
        } else {
            await createDefaultMenu(menuSlug);
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        await createDefaultMenu(menuSlug);
    }
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
                isActive: true
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
        // showNotification(`${addedCount} item(s) added and saved to menu`, 'success');
    }
}

function renderMenuItems() {
    const menuList = document.getElementById('menuList');

    if (menuItems.length === 0) {
        menuList.innerHTML = '<p class="text-muted text-center py-4">No menu items yet. Add pages from the left panel.</p>';
        return;
    }

    menuList.innerHTML = menuItems.map((item, index) => `
        <div class="menu-item-row d-flex align-items-center justify-content-between" data-index="${index}" draggable="true">
            <div class="d-flex align-items-center gap-2">
                <iconify-icon icon="material-symbols:drag-indicator"></iconify-icon>
                <span>${escapeHtml(item.title)}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">Remove</button>
        </div>
    `).join('');

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeMenuItem(parseInt(this.dataset.index));
        });
    });

    makeItemsDraggable();
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
        item.addEventListener('dragstart', function () {
            draggedItem = this;
            this.style.opacity = '0.5';
        });

        item.addEventListener('dragend', function () {
            this.style.opacity = '1';
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        item.addEventListener('drop', async function (e) {
            e.preventDefault();
            if (draggedItem !== this) {
                const draggedIndex = parseInt(draggedItem.dataset.index);
                const targetIndex = parseInt(this.dataset.index);
                const temp = menuItems[draggedIndex];
                menuItems[draggedIndex] = menuItems[targetIndex];
                menuItems[targetIndex] = temp;
                renderMenuItems();

                // Auto-save after reordering
                await saveMenu();
                showNotification('Menu order updated', 'success');
            }
        });
    });
}

async function removeMenuItem(index) {
    const result = await Swal.fire({
        title: 'Remove Menu Item?',
        text: 'Are you sure you want to remove this menu item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        menuItems.splice(index, 1);
        renderMenuItems();

        // Auto-save to database
        await saveMenu();

        // Swal.fire({
        //     title: 'Removed!',
        //     text: 'Menu item has been removed.',
        //     icon: 'success',
        //     timer: 1500,
        //     showConfirmButton: false,
        //     showClass: {
        //         popup: 'swal2-noanimation'
        //     }
        // });
    }
}

async function saveMenu(showNotif = false) {
    if (!currentMenuSlug) {
        if (showNotif) showNotification('Please select a menu first', 'warning');
        return;
    }

    try {
        const getResponse = await fetch(`/api/menus/${currentMenuSlug}`);
        const getData = await getResponse.json();

        if (!getData.success || !getData.menu) {
            if (showNotif) showNotification('Menu not found', 'error');
            return;
        }

        const response = await fetch(`/api/menus/${getData.menu._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: menuItems })
        });

        const data = await response.json();
        if (data.success) {
            if (showNotif) showNotification('Menu saved successfully', 'success');
            return true;
        } else {
            if (showNotif) showNotification(data.message || 'Error saving menu', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error saving menu:', error);
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

function showNotification(message, type = 'info') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        showClass: {
            popup: 'swal2-noanimation'
        },
        hideClass: {
            popup: ''
        },
         customClass: {
                title: 'swal-toast-small'
            },
    });

    Toast.fire({
        icon: type === 'error' ? 'error' : type,
        title: message
    });
}
