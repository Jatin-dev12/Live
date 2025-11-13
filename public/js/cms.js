// Template-based CMS - sections are now managed through templates
// This file is deprecated as sections are no longer dynamically added
(function ($) {
    // Check if sectionsContainer exists before binding events
    const sectionsContainer = document.getElementById('sectionsContainer');
    if (sectionsContainer) {
        $(sectionsContainer).on('click', '.add-column-btn', function() {
            // This functionality is now disabled for template-based pages
            if (typeof showToast === 'function') {
                showToast('Buttons are managed through page templates. Edit the template in Page Master to modify structure.', 'warning');
            } else {
                alert('Buttons are managed through page templates. Edit the template in Page Master to modify structure.');
            }
        });
    }
})(jQuery);
