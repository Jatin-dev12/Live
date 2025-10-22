// Session Monitor - Checks if session is still valid
(function() {
    let checkInterval = null;
    const CHECK_INTERVAL = 30000; // Check every 30 seconds

    function checkSessionValidity() {
        fetch('/api/auth/session-check', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success && data.sessionInvalid) {
                // Session is invalid, show message and redirect
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Session Expired',
                        text: data.message || 'Your session has expired. Please login again.',
                        icon: 'warning',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonText: 'Login',
                        confirmButtonColor: '#dc3545'
                    }).then(() => {
                        window.location.href = '/authentication/sign-in';
                    });
                } else {
                    alert(data.message || 'Your session has expired. Please login again.');
                    window.location.href = '/authentication/sign-in';
                }
                
                // Stop checking
                if (checkInterval) {
                    clearInterval(checkInterval);
                }
            }
        })
        .catch(error => {
            console.error('Session check error:', error);
        });
    }

    // Start monitoring when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Initial check after 5 seconds
            setTimeout(checkSessionValidity, 5000);
            // Then check every 30 seconds
            checkInterval = setInterval(checkSessionValidity, CHECK_INTERVAL);
        });
    } else {
        // DOM already loaded
        setTimeout(checkSessionValidity, 5000);
        checkInterval = setInterval(checkSessionValidity, CHECK_INTERVAL);
    }

    // Also check on page visibility change (when user switches back to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkSessionValidity();
        }
    });
})();
