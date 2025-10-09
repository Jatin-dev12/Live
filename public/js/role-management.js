// Role Management JavaScript

// Add Role Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const addRoleForm = document.getElementById('addRoleForm');
    
    if (addRoleForm) {
        addRoleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearFormErrors(addRoleForm);
            
            // Get form data
            const formData = new FormData(addRoleForm);
            
            // Get selected permissions
            const permissions = [];
            const permissionCheckboxes = addRoleForm.querySelectorAll('input[name="permissions[]"]:checked');
            permissionCheckboxes.forEach(checkbox => {
                permissions.push(checkbox.value);
            });
            
            const roleData = {
                name: formData.get('name'),
                description: formData.get('description'),
                permissions: permissions,
                level: parseInt(formData.get('level')) || 3
            };
            
            // Client-side validation
            if (!validateRoleForm(roleData)) {
                return;
            }
            
            // Show loading state
            const submitBtn = addRoleForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            
            submitBtn.disabled = true;
            if (btnText !== submitBtn) {
                btnText.classList.add('d-none');
                if (btnSpinner) btnSpinner.classList.remove('d-none');
            } else {
                submitBtn.textContent = 'Creating...';
            }
            
            try {
                const response = await fetch('/api/roles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(roleData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Show success message
                    showNotification('Success', result.message || 'Role created successfully', 'success');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = '/roles/roles-management';
                    }, 1500);
                } else {
                    // Handle validation errors
                    if (result.errors && Array.isArray(result.errors)) {
                        displayValidationErrors(addRoleForm, result.errors);
                    } else {
                        showNotification('Error', result.message || 'Failed to create role', 'error');
                    }
                    
                    // Reset button state
                    submitBtn.disabled = false;
                    if (btnText !== submitBtn) {
                        btnText.classList.remove('d-none');
                        if (btnSpinner) btnSpinner.classList.add('d-none');
                    } else {
                        submitBtn.textContent = 'Submit';
                    }
                }
            } catch (error) {
                console.error('Error creating role:', error);
                showNotification('Error', 'An error occurred while creating the role', 'error');
                
                // Reset button state
                submitBtn.disabled = false;
                if (btnText !== submitBtn) {
                    btnText.classList.remove('d-none');
                    if (btnSpinner) btnSpinner.classList.add('d-none');
                } else {
                    submitBtn.textContent = 'Submit';
                }
            }
        });
    }
    
    // Edit Role Form
    const editRoleForm = document.getElementById('editRoleForm');
    if (editRoleForm) {
        editRoleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const roleId = editRoleForm.dataset.roleId;
            if (!roleId) {
                showNotification('Error', 'Role ID not found', 'error');
                return;
            }
            
            // Get form data
            const formData = new FormData(editRoleForm);
            
            // Get selected permissions
            const permissions = [];
            const permissionCheckboxes = editRoleForm.querySelectorAll('input[name="permissions[]"]:checked');
            permissionCheckboxes.forEach(checkbox => {
                permissions.push(checkbox.value);
            });
            
            const roleData = {
                name: formData.get('name'),
                description: formData.get('description'),
                permissions: permissions,
                level: parseInt(formData.get('level')) || 3,
                isActive: formData.get('isActive') === 'true'
            };
            
            try {
                const response = await fetch(`/api/roles/${roleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(roleData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showNotification('Success', result.message || 'Role updated successfully', 'success');
                    setTimeout(() => {
                        window.location.href = '/roles/roles-management';
                    }, 1500);
                } else {
                    showNotification('Error', result.message || 'Failed to update role', 'error');
                }
            } catch (error) {
                console.error('Error updating role:', error);
                showNotification('Error', 'An error occurred while updating the role', 'error');
            }
        });
    }
});

// Validate role form
function validateRoleForm(data) {
    let isValid = true;
    
    // Name validation
    if (!data.name || data.name.trim().length < 3) {
        showFieldError('name', 'Role name must be at least 3 characters');
        isValid = false;
    }
    
    // Permissions validation (optional but recommended)
    if (data.permissions.length === 0) {
        showNotification('Warning', 'No permissions selected. Role will have no access rights.', 'warning');
    }
    
    return isValid;
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('is-invalid');
        let feedback = field.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentNode.insertBefore(feedback, field.nextSibling);
        }
        feedback.textContent = message;
        feedback.style.display = 'block';
    }
}

// Clear form errors
function clearFormErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    const feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(feedback => {
        feedback.textContent = '';
        feedback.style.display = 'none';
    });
}

// Display validation errors from server
function displayValidationErrors(form, errors) {
    errors.forEach(error => {
        showFieldError(error.field, error.message);
    });
}

// Show notification
function showNotification(title, message, type = 'info') {
    // Check if toast library is available
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: `${title}: ${message}`,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8',
        }).showToast();
    } else {
        // Fallback to alert
        alert(`${title}: ${message}`);
    }
}

// Delete role
async function deleteRole(roleId, roleName) {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/roles/${roleId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Success', result.message || 'Role deleted successfully', 'success');
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Error', result.message || 'Failed to delete role', 'error');
        }
    } catch (error) {
        console.error('Error deleting role:', error);
        showNotification('Error', 'An error occurred while deleting the role', 'error');
    }
}

// Load roles list
async function loadRolesList() {
    const rolesTableBody = document.getElementById('rolesTableBody');
    if (!rolesTableBody) return;
    
    try {
        const response = await fetch('/api/roles?limit=100');
        const result = await response.json();
        
        if (response.ok && result.success) {
            renderRolesTable(result.data);
        } else {
            console.error('Failed to load roles:', result.message);
        }
    } catch (error) {
        console.error('Error loading roles:', error);
    }
}

// Render roles table
function renderRolesTable(roles) {
    const rolesTableBody = document.getElementById('rolesTableBody');
    if (!rolesTableBody) return;
    
    if (roles.length === 0) {
        rolesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No roles found</td></tr>';
        return;
    }
    
    rolesTableBody.innerHTML = roles.map(role => `
        <tr>
            <td>
                <h6 class="text-md mb-0 fw-medium">${role.name}</h6>
            </td>
            <td>${role.description || 'N/A'}</td>
            <td>
                <span class="badge bg-primary-focus text-primary-main px-24 py-4 rounded-pill fw-medium text-sm">
                    ${role.permissions?.length || 0} Permissions
                </span>
            </td>
            <td>Level ${role.level}</td>
            <td>
                <span class="badge ${role.isActive ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-24 py-4 rounded-pill fw-medium text-sm">
                    ${role.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center gap-10">
                    <button type="button" class="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="window.location.href='/roles/edit-roles/${role._id}'" ${role.isSystemRole ? 'disabled' : ''}>
                        <iconify-icon icon="lucide:edit" class="menu-icon"></iconify-icon>
                    </button>
                    <button type="button" class="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="deleteRole('${role._id}', '${role.name}')" ${role.isSystemRole ? 'disabled' : ''}>
                        <iconify-icon icon="mingcute:delete-2-line" class="menu-icon"></iconify-icon>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Select/Deselect all permissions in a module
function toggleModulePermissions(moduleCheckbox) {
    const module = moduleCheckbox.dataset.module;
    const isChecked = moduleCheckbox.checked;
    
    const modulePermissions = document.querySelectorAll(`input[data-module="${module}"][name="permissions[]"]`);
    modulePermissions.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// Select all permissions
function selectAllPermissions() {
    const allCheckboxes = document.querySelectorAll('input[name="permissions[]"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Also check module headers if they exist
    const moduleCheckboxes = document.querySelectorAll('input[data-module]');
    moduleCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

// Deselect all permissions
function deselectAllPermissions() {
    const allCheckboxes = document.querySelectorAll('input[name="permissions[]"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Also uncheck module headers if they exist
    const moduleCheckboxes = document.querySelectorAll('input[data-module]');
    moduleCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
