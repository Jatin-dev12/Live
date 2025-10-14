/**
 * Universal Toast Notification System
 * Usage: showToast('Your message here', 'success|error|warning|info')
 */

function showToast(message, type = 'info') {
    // Remove any existing toasts first
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    // Set icon and colors based on type
    let icon = '';
    let bgColor = '';
    let borderColor = '';
    let textColor = '';
    
    switch(type) {
        case 'success':
            icon = '✅';
            bgColor = '#d4edda';
            borderColor = '#28a745';
            textColor = '#155724';
            break;
        case 'error':
            icon = '❌';
            bgColor = '#f8d7da';
            borderColor = '#dc3545';
            textColor = '#721c24';
            break;
        case 'warning':
            icon = '⚠️';
            bgColor = '#fff3cd';
            borderColor = '#ffc107';
            textColor = '#856404';
            break;
        case 'info':
        default:
            icon = 'ℹ️';
            bgColor = '#d1ecf1';
            borderColor = '#17a2b8';
            textColor = '#0c5460';
            break;
    }
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 999999;
        min-width: 300px;
        max-width: 500px;
        background-color: ${bgColor};
        color: ${textColor};
        border: 2px solid ${borderColor};
        border-radius: 12px;
        padding: 16px 20px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        opacity: 0;
    `;
    
    // Create content
    toast.innerHTML = `
        <span style="font-size: 24px;">${icon}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: ${textColor}; padding: 0; margin-left: 10px; line-height: 1;">×</button>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 4000);
}

// Example usage:
// showToast('Operation successful!', 'success');
// showToast('Something went wrong!', 'error');
// showToast('Please be careful!', 'warning');
// showToast('This is some information', 'info');
