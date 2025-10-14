// User Management JavaScript

// Add User Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const addUserForm = document.getElementById('addUserForm');
    
    if (addUserForm) {
        // Auto-select all module permissions when any permission in that module is checked
        setupModulePermissionHandlers(addUserForm);
        
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearFormErrors(addUserForm);
            
            // Get form data
            const formData = new FormData(addUserForm);
            const userData = Object.fromEntries(formData.entries());
            
            // Get custom permissions (checkboxes)
            const customPermissions = [];
            const permissionCheckboxes = addUserForm.querySelectorAll('input[name="customPermissions[]"]:checked');
            permissionCheckboxes.forEach(checkbox => {
                customPermissions.push(checkbox.value);
            });
            
            // Add custom permissions to userData
            if (customPermissions.length > 0) {
                userData.customPermissions = customPermissions;
            }
            
            // Client-side validation
            if (!validateUserForm(userData)) {
                return;
            }
            
            // Show loading state
            const submitBtn = addUserForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            
            submitBtn.disabled = true;
            btnText.classList.add('d-none');
            btnSpinner.classList.remove('d-none');
            
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Show success message
                    showNotification('Success', result.message || 'User created successfully!', 'success');
                    
                    // Reset form
                    addUserForm.reset();
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = '/roles/roles-management';
                    }, 2000);
                } else {
                    // Handle validation errors
                    if (result.errors && Array.isArray(result.errors)) {
                        displayValidationErrors(addUserForm, result.errors);
                    } else {
                        showNotification('Error', result.message || 'Failed to create user', 'error');
                    }
                    
                    // Reset button state
                    submitBtn.disabled = false;
                    btnText.classList.remove('d-none');
                    btnSpinner.classList.add('d-none');
                }
            } catch (error) {
                console.error('Error creating user:', error);
                showNotification('Error', 'An error occurred while creating the user', 'error');
                
                // Reset button state
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnSpinner.classList.add('d-none');
            }
        });
    }
});

// Validate user form
function validateUserForm(data) {
    let isValid = true;
    
    // Full name validation
    if (!data.fullName || data.fullName.trim().length < 2) {
        showFieldError('fullName', 'Full name must be at least 2 characters');
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!data.password || data.password.length < 8) {
        showFieldError('password', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!passwordRegex.test(data.password)) {
        showFieldError('password', 'Password must contain uppercase, lowercase, number, and special character');
        isValid = false;
    }
    
    // Confirm password validation
    if (data.password !== data.confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    // Role validation
    if (!data.role) {
        showFieldError('role', 'Please select a role');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.classList.add('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        }
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
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
        }).showToast();
    } else {
        // Fallback to alert
        alert(`${title}: ${message}`);
    }
}

// Delete user
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Success', result.message || 'User deleted successfully', 'success');
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Error', result.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error', 'An error occurred while deleting the user', 'error');
    }
}

// Toggle user status
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/toggle-status`, {
            method: 'PATCH'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Success', result.message, 'success');
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Error', result.message || 'Failed to update user status', 'error');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showNotification('Error', 'An error occurred while updating user status', 'error');
    }
}

// Load users list
async function loadUsersList() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    try {
        const response = await fetch('/api/users?limit=100');
        const result = await response.json();
        
        if (response.ok && result.success) {
            renderUsersTable(result.data);
        } else {
            console.error('Failed to load users:', result.message);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Render users table
function renderUsersTable(users) {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        return;
    }
    
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.profileImage || '/images/default-avatar.png'}" alt="${user.fullName}" class="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden">
                    <div class="flex-grow-1">
                        <h6 class="text-md mb-0 fw-medium">${user.fullName}</h6>
                        <span class="text-sm text-secondary-light fw-medium">${user.email}</span>
                    </div>
                </div>
            </td>
            <td>${user.role?.name || 'N/A'}</td>
            <td>${user.department || 'N/A'}</td>
            <td>${user.designation || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <span class="badge ${user.isActive ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-24 py-4 rounded-pill fw-medium text-sm">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center gap-10">
                    <button type="button" class="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="window.location.href='/users/view-profile?id=${user._id}'">
                        <iconify-icon icon="majesticons:eye-line" class="icon text-xl"></iconify-icon>
                    </button>
                    <button type="button" class="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="window.location.href='/users/add-user?edit=${user._id}'">
                        <iconify-icon icon="lucide:edit" class="menu-icon"></iconify-icon>
                    </button>
                    <button type="button" class="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="deleteUser('${user._id}', '${user.fullName}')">
                        <iconify-icon icon="mingcute:delete-2-line" class="menu-icon"></iconify-icon>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup module permission handlers - when any permission in a module is checked/unchecked, 
// check/uncheck ALL permissions for that module (simple CRUD logic)
function setupModulePermissionHandlers(form) {
    const permissionCheckboxes = form.querySelectorAll('input[name="customPermissions[]"]');
    
    // Group checkboxes by module
    const moduleGroups = {};
    permissionCheckboxes.forEach(checkbox => {
        const value = checkbox.value;
        // Extract module from permission slug (e.g., "cms-create" -> "cms")
        const module = value.split('-')[0];
        
        if (!moduleGroups[module]) {
            moduleGroups[module] = [];
        }
        moduleGroups[module].push(checkbox);
    });
    
    // Add change event listeners
    permissionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Get the module from this checkbox
            const value = this.value;
            const module = value.split('-')[0];
            
            if (this.checked) {
                // If ANY checkbox is checked, check ALL checkboxes for this module
                if (moduleGroups[module]) {
                    moduleGroups[module].forEach(cb => {
                        cb.checked = true;
                    });
                }
            } else {
                // If ANY checkbox is unchecked, uncheck ALL checkboxes for this module
                if (moduleGroups[module]) {
                    moduleGroups[module].forEach(cb => {
                        cb.checked = false;
                    });
                }
            }
        });
    });
}
