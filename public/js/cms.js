(function ($) {
    $(sectionsContainer).on('click', '.add-column-btn', function() {
        var container = $(this).siblings('.column-container');
        var columnCount = container.find('.column-item').length + 1;
        var columnHtml = `
        <div class="column-item border border-neutral-200 radius-8 p-3 mb-2 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold text-sm">Card ${columnCount}</span>
            <button type="button" class="btn btn-sm btn-danger-600 remove-column-btn">
                <iconify-icon icon="mdi:delete"></iconify-icon>
            </button>
            </div>
            <!-- Add your input fields for title, description, etc. here -->
        </div>
        `;
        container.append(columnHtml);
    });
})(jQuery);
